<?php
require_once '../utils/Database.php';
require_once '../utils/Logger.php';
require_once '../utils/Auth.php';

// Configura headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Inicializa o logger
Logger::initialize();
Logger::debug("Iniciando stats.php");

// Verifica autenticação
Auth::verificarToken();

try {
    // Conecta ao banco de dados
    $db = new Database();
    $conn = $db->connect();
    
    // Busca as estatísticas
    $stats = [
        'totalClientes' => 0,
        'totalContratos' => 0,
        'totalOrdens' => 0,
        'totalFaturas' => 0
    ];
    
    try {
        // Clientes ativos
        $sql = "SELECT COUNT(*) as total FROM clientes WHERE deleted_at IS NULL";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats['totalClientes'] = intval($result['total']);
        
        // Contratos ativos
        $sql = "SELECT COUNT(*) as total FROM contratos WHERE status = 'ativo' AND deleted_at IS NULL";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats['totalContratos'] = intval($result['total']);
        
        // Ordens de serviço em aberto
        $sql = "SELECT COUNT(*) as total FROM ordens_servico WHERE status = 'aberto' AND deleted_at IS NULL";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats['totalOrdens'] = intval($result['total']);
        
        // Faturas pendentes
        $sql = "SELECT COUNT(*) as total FROM faturas WHERE status = 'pendente' AND deleted_at IS NULL";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats['totalFaturas'] = intval($result['total']);
        
        Logger::info("Estatísticas carregadas com sucesso");
        
    } catch (Exception $e) {
        Logger::error('Erro ao buscar estatísticas: ' . $e->getMessage());
        // Se houver erro em alguma query, mantém os valores zerados
    }
    
    // Retorna sucesso
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);
    exit;
    
} catch (Exception $e) {
    // Log do erro
    Logger::error("Erro ao carregar estatísticas: " . $e->getMessage());
    
    // Retorna erro
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao carregar estatísticas',
        'error' => $e->getMessage()
    ]);
    exit;
}