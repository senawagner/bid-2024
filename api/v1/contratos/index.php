<?php
require_once '../../config/database.php';
require_once '../../utils/Logger.php';
require_once '../../auth/auth.php';

// Configura headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Se for uma requisição OPTIONS, retorna apenas os headers
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Inicializa o logger e registra o início
Logger::debug("Iniciando contratos/index.php");

// Verifica autenticação
Auth::verificarAuth();

try {
    $db = Database::getInstance();
    $conn = $db->connect();
    
    // Define a resposta padrão
    $response = [
        'success' => false,
        'data' => null,
        'message' => '',
        'error' => null
    ];

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Verifica se é uma busca por ID ou listagem
            if (isset($_GET['id'])) {
                // Busca contrato específico
                $stmt = $conn->prepare("
                    SELECT c.*, cl.razao_social as cliente_nome 
                    FROM contratos c
                    LEFT JOIN clientes cl ON c.cliente_id = cl.id
                    WHERE c.id = ? AND c.deleted_at IS NULL
                ");
                $stmt->execute([$_GET['id']]);
                $contrato = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($contrato) {
                    $response['success'] = true;
                    $response['data'] = $contrato;
                } else {
                    http_response_code(404);
                    $response['message'] = 'Contrato não encontrado';
                }
            } else {
                // Lista contratos com paginação e filtros
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
                $offset = ($page - 1) * $limit;
                
                // Monta a query base
                $query = "
                    FROM contratos c
                    LEFT JOIN clientes cl ON c.cliente_id = cl.id
                    WHERE c.deleted_at IS NULL
                ";
                $params = [];
                
                // Aplica filtros se existirem
                if (isset($_GET['cliente_id'])) {
                    $query .= " AND c.cliente_id = ?";
                    $params[] = $_GET['cliente_id'];
                }
                if (isset($_GET['tipo_contrato'])) {
                    $query .= " AND c.tipo_contrato = ?";
                    $params[] = $_GET['tipo_contrato'];
                }
                if (isset($_GET['status'])) {
                    $query .= " AND c.status = ?";
                    $params[] = $_GET['status'];
                }
                
                // Conta total de registros
                $stmtCount = $conn->prepare("SELECT COUNT(*) " . $query);
                $stmtCount->execute($params);
                $totalRegistros = $stmtCount->fetchColumn();
                
                // Busca os registros da página
                $query = "
                    SELECT c.*, cl.razao_social as cliente_nome " . $query . "
                    ORDER BY c.id DESC LIMIT ? OFFSET ?
                ";
                $params[] = $limit;
                $params[] = $offset;
                
                $stmt = $conn->prepare($query);
                $stmt->execute($params);
                $contratos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $response['success'] = true;
                $response['data'] = [
                    'items' => $contratos,
                    'total' => $totalRegistros,
                    'page' => $page,
                    'limit' => $limit,
                    'totalPages' => ceil($totalRegistros / $limit)
                ];
            }
            break;
            
        case 'POST':
            // Recebe os dados do contrato
            $dados = json_decode(file_get_contents('php://input'), true);
            
            // Validações básicas
            if (!isset($dados['cliente_id']) || !isset($dados['tipo_contrato']) || 
                !isset($dados['numero_contrato']) || !isset($dados['valor']) || 
                !isset($dados['data_inicio'])) {
                http_response_code(400);
                $response['message'] = 'Dados obrigatórios não fornecidos';
                break;
            }
            
            // Valida cliente
            $stmtCliente = $conn->prepare("SELECT id FROM clientes WHERE id = ? AND ativo = 1 AND deleted_at IS NULL");
            $stmtCliente->execute([$dados['cliente_id']]);
            if (!$stmtCliente->fetch()) {
                http_response_code(400);
                $response['message'] = 'Cliente inválido ou inativo';
                break;
            }
            
            // Valida número do contrato
            $stmtNumero = $conn->prepare("SELECT id FROM contratos WHERE numero_contrato = ? AND deleted_at IS NULL");
            $stmtNumero->execute([$dados['numero_contrato']]);
            if ($stmtNumero->fetch()) {
                http_response_code(400);
                $response['message'] = 'Número do contrato já existe';
                break;
            }
            
            // Insere o contrato
            $stmt = $conn->prepare("
                INSERT INTO contratos (
                    cliente_id, tipo_contrato, numero_contrato, descricao,
                    frequencia, valor, data_inicio, data_fim, status,
                    observacoes, criado_por
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
            ");
            
            $stmt->execute([
                $dados['cliente_id'],
                $dados['tipo_contrato'],
                $dados['numero_contrato'],
                $dados['descricao'] ?? null,
                $dados['frequencia'] ?? null,
                $dados['valor'],
                $dados['data_inicio'],
                $dados['data_fim'] ?? null,
                $dados['status'] ?? 'pendente',
                $dados['observacoes'] ?? null,
                Auth::getUserId()
            ]);
            
            $contratoId = $conn->lastInsertId();
            
            $response['success'] = true;
            $response['data'] = ['id' => $contratoId];
            $response['message'] = 'Contrato criado com sucesso';
            break;
            
        case 'PUT':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                $response['message'] = 'ID do contrato não fornecido';
                break;
            }
            
            $dados = json_decode(file_get_contents('php://input'), true);
            
            // Verifica se o contrato existe
            $stmtCheck = $conn->prepare("SELECT id FROM contratos WHERE id = ? AND deleted_at IS NULL");
            $stmtCheck->execute([$_GET['id']]);
            if (!$stmtCheck->fetch()) {
                http_response_code(404);
                $response['message'] = 'Contrato não encontrado';
                break;
            }
            
            // Se houver alteração no número do contrato, valida duplicidade
            if (isset($dados['numero_contrato'])) {
                $stmtNumero = $conn->prepare("
                    SELECT id FROM contratos 
                    WHERE numero_contrato = ? AND id != ? AND deleted_at IS NULL
                ");
                $stmtNumero->execute([$dados['numero_contrato'], $_GET['id']]);
                if ($stmtNumero->fetch()) {
                    http_response_code(400);
                    $response['message'] = 'Número do contrato já existe';
                    break;
                }
            }
            
            // Monta a query de atualização
            $campos = [];
            $valores = [];
            
            foreach ($dados as $campo => $valor) {
                if (in_array($campo, [
                    'cliente_id', 'tipo_contrato', 'numero_contrato', 'descricao',
                    'frequencia', 'valor', 'data_inicio', 'data_fim', 'status',
                    'observacoes'
                ])) {
                    $campos[] = "$campo = ?";
                    $valores[] = $valor;
                }
            }
            
            if (empty($campos)) {
                http_response_code(400);
                $response['message'] = 'Nenhum campo válido para atualização';
                break;
            }
            
            $campos[] = "atualizado_por = ?";
            $valores[] = Auth::getUserId();
            
            $valores[] = $_GET['id'];
            
            $stmt = $conn->prepare("
                UPDATE contratos 
                SET " . implode(', ', $campos) . "
                WHERE id = ?
            ");
            
            $stmt->execute($valores);
            
            $response['success'] = true;
            $response['message'] = 'Contrato atualizado com sucesso';
            break;
            
        case 'DELETE':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                $response['message'] = 'ID do contrato não fornecido';
                break;
            }
            
            // Verifica se o contrato existe
            $stmtCheck = $conn->prepare("SELECT id FROM contratos WHERE id = ? AND deleted_at IS NULL");
            $stmtCheck->execute([$_GET['id']]);
            if (!$stmtCheck->fetch()) {
                http_response_code(404);
                $response['message'] = 'Contrato não encontrado';
                break;
            }
            
            // Soft delete
            $stmt = $conn->prepare("
                UPDATE contratos 
                SET deleted_at = NOW(), atualizado_por = ?
                WHERE id = ?
            ");
            
            $stmt->execute([Auth::getUserId(), $_GET['id']]);
            
            $response['success'] = true;
            $response['message'] = 'Contrato excluído com sucesso';
            break;
            
        default:
            http_response_code(405);
            $response['message'] = 'Método não permitido';
    }
} catch (Exception $e) {
    Logger::error('Erro em contratos/index.php: ' . $e->getMessage());
    http_response_code(500);
    $response['message'] = 'Erro interno do servidor';
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
