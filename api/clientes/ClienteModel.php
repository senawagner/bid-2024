<?php
declare(strict_types=1);

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . '/../config/log.php';

class ClienteModel {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Lista todos os clientes ativos
     */
    public function listar() {
        try {
            SystemLogger::info("Iniciando listagem de clientes");
            
            $sql = "SELECT * FROM clientes 
                    WHERE ativo = 1 
                    ORDER BY razao_social ASC";
            
            SystemLogger::debug("Executando query", ['sql' => $sql]);
            
            $db = Database::getInstance();
            $stmt = $db->prepare($sql);
            $stmt->execute();
            
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            SystemLogger::info("Clientes listados com sucesso", ['count' => count($result)]);
            
            return $result;
            
        } catch (Exception $e) {
            SystemLogger::error("Erro ao listar clientes", [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            throw new Exception("Erro ao listar clientes: " . $e->getMessage());
        }
    }
    
    /**
     * Busca um cliente específico
     */
    public function buscar(int $id) {
        try {
            error_log("=== INÍCIO BUSCA ===");
            error_log("Buscando cliente ID: " . $id);
            
            $sql = "SELECT * FROM clientes 
                    WHERE id = :id 
                    AND ativo = 1";
            
            error_log("SQL: " . $sql);
            error_log("Parâmetros: " . json_encode(['id' => $id]));
            
            $result = $this->db->query($sql, ['id' => $id]);
            error_log("Registro encontrado: " . ($result ? json_encode($result[0]) : 'null'));
            error_log("=== FIM BUSCA ===");
            
            return $result[0] ?? null;
            
        } catch (Exception $e) {
            error_log("=== ERRO NA BUSCA ===");
            error_log("Erro: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception("Erro ao buscar cliente: " . $e->getMessage());
        }
    }
    
    /**
     * Exclui um cliente (soft delete)
     */
    public function excluir(int $id): bool {
        try {
            error_log("=== INÍCIO DA EXCLUSÃO ===");
            error_log("Tentando excluir cliente ID: " . $id);
            
            // Primeiro verifica se o cliente existe e está ativo
            $cliente = $this->buscar($id);
            error_log("Resultado da busca do cliente: " . ($cliente ? json_encode($cliente) : 'null'));
            
            if (!$cliente) {
                throw new Exception("Cliente não encontrado ou já excluído");
            }
            
            // Verifica se pode excluir
            $podeExcluir = $this->podeExcluir($id);
            error_log("Pode excluir? " . ($podeExcluir ? 'Sim' : 'Não'));
            
            if (!$podeExcluir) {
                throw new Exception("Cliente não pode ser excluído pois possui registros vinculados");
            }
            
            // Atualiza o registro marcando como inativo
            $sql = "UPDATE clientes 
                    SET ativo = 0,
                        atualizado_em = CURRENT_TIMESTAMP 
                    WHERE id = :id 
                    AND ativo = 1";
            
            error_log("SQL de exclusão: " . $sql);
            error_log("Parâmetros: " . json_encode(['id' => $id]));
            
            $result = $this->db->execute($sql, ['id' => $id]);
            error_log("Resultado da exclusão: " . ($result ? 'true' : 'false'));
            error_log("=== FIM DA EXCLUSÃO ===");
            
            return $result;
            
        } catch (Exception $e) {
            error_log("=== ERRO NA EXCLUSÃO ===");
            error_log("Mensagem de erro: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception("Erro ao excluir cliente: " . $e->getMessage());
        }
    }
    
    /**
     * Verifica se cliente pode ser excluído
     */
    public function podeExcluir(int $id): bool {
        try {
            error_log("=== INÍCIO VERIFICAÇÃO PODE EXCLUIR ===");
            error_log("Verificando se cliente ID {$id} pode ser excluído");
            
            $sql = "SELECT 
                (SELECT COUNT(*) FROM contratos 
                 WHERE cliente_id = :id1 
                 AND status NOT IN ('rejeitado', 'cancelado')) +
                (SELECT COUNT(*) FROM ordens_servico 
                 WHERE cliente_id = :id2 
                 AND status NOT IN ('cancelada')
                 AND deleted_at IS NULL) +
                (SELECT COUNT(*) FROM faturas 
                 WHERE cliente_id = :id3 
                 AND status NOT IN ('cancelada')
                 AND deleted_at IS NULL) as total";
            
            error_log("SQL: " . $sql);
            error_log("Parâmetros: " . json_encode(['id1' => $id, 'id2' => $id, 'id3' => $id]));
            
            $result = $this->db->query($sql, [
                'id1' => $id,
                'id2' => $id,
                'id3' => $id
            ]);
            $total = (int)($result[0]['total'] ?? 0);
            
            error_log("Total de registros vinculados: " . $total);
            error_log("=== FIM VERIFICAÇÃO PODE EXCLUIR ===");
            
            return $total === 0;
            
        } catch (Exception $e) {
            error_log("=== ERRO AO VERIFICAR SE PODE EXCLUIR ===");
            error_log("Erro: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception("Erro ao verificar se cliente pode ser excluído: " . $e->getMessage());
        }
    }
    
    /**
     * Verifica se CNPJ já existe
     */
    public function cnpjExiste(string $cnpj, ?int $id = null) {
        $sql = "SELECT id FROM clientes 
                WHERE cnpj = :cnpj 
                AND ativo = 1
                AND deleted_at IS NULL";
                  
        if ($id) {
            $sql .= " AND id != :id";
        }
        
        $params = ['cnpj' => preg_replace('/\D/', '', $cnpj)];
        if ($id) {
            $params['id'] = $id;
        }
        
        $result = $this->db->query($sql, $params);
        return !empty($result);
    }
    
    /**
     * Formata dados do cliente para exibição
     */
    public function formatarDados($cliente) {
        return [
            'id' => $cliente['id'],
            'razao_social' => $cliente['razao_social'],
            'nome_fantasia' => $cliente['nome_fantasia'],
            'cnpj' => $cliente['cnpj'],
            'inscricao_estadual' => $cliente['inscricao_estadual'],
            'email' => $cliente['email'],
            'telefone' => $cliente['telefone'],
            'celular' => $cliente['celular'],
            'endereco' => $cliente['endereco'],
            'numero' => $cliente['numero'],
            'complemento' => $cliente['complemento'],
            'bairro' => $cliente['bairro'],
            'cidade' => $cliente['cidade'],
            'estado' => $cliente['estado'],
            'cep' => $cliente['cep'],
            'observacoes' => $cliente['observacoes'],
            'ativo' => (bool)$cliente['ativo']
        ];
    }
    
    /**
     * Salva ou atualiza um cliente
     * @param array $dados Dados do cliente
     * @return int ID do cliente
     */
    public function salvar(array $dados): int {
        SystemLogger::info("Iniciando processo de salvamento", ['dados' => $dados]);
        
        try {
            $db = Database::getInstance();
            
            // Lista de campos permitidos
            $campos_permitidos = [
                'razao_social', 'nome_fantasia', 'cnpj', 'inscricao_estadual',
                'telefone', 'celular', 'email', 'endereco', 'numero', 'complemento',
                'bairro', 'cidade', 'estado', 'cep', 'observacoes'
            ];
            
            // Filtra apenas os campos permitidos
            $params = array_intersect_key($dados, array_flip($campos_permitidos));
            
            // Verifica se é uma atualização ou inserção
            if (isset($dados['id']) && !empty($dados['id'])) {
                SystemLogger::debug("Atualizando cliente existente", ['id' => $dados['id']]);
                
                $sql = "UPDATE clientes SET 
                    razao_social = :razao_social,
                    nome_fantasia = :nome_fantasia,
                    cnpj = :cnpj,
                    inscricao_estadual = :inscricao_estadual,
                    telefone = :telefone,
                    celular = :celular,
                    email = :email,
                    endereco = :endereco,
                    numero = :numero,
                    complemento = :complemento,
                    bairro = :bairro,
                    cidade = :cidade,
                    estado = :estado,
                    cep = :cep,
                    observacoes = :observacoes,
                    atualizado_em = CURRENT_TIMESTAMP
                WHERE id = :id 
                AND ativo = 1";
                
                // Adiciona o ID aos parâmetros para a cláusula WHERE
                $params['id'] = $dados['id'];
                
            } else {
                SystemLogger::debug("Inserindo novo cliente");
                
                $sql = "INSERT INTO clientes (
                    razao_social, nome_fantasia, cnpj, inscricao_estadual,
                    telefone, celular, email, endereco, numero, complemento,
                    bairro, cidade, estado, cep, observacoes, criado_em, atualizado_em
                ) VALUES (
                    :razao_social, :nome_fantasia, :cnpj, :inscricao_estadual,
                    :telefone, :celular, :email, :endereco, :numero, :complemento,
                    :bairro, :cidade, :estado, :cep, :observacoes, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )";
            }
            
            // Sanitiza os dados antes de inserir
            foreach ($params as $key => $value) {
                if ($value === '') {
                    $params[$key] = null;
                }
                if ($key === 'cnpj') {
                    $params[$key] = preg_replace('/\D/', '', $value);
                }
            }
            
            SystemLogger::debug("Executando query", ['sql' => $sql, 'params' => $params]);
            
            $stmt = $db->prepare($sql);
            $result = $stmt->execute($params);
            
            if (!$result) {
                SystemLogger::error("Erro ao executar query", [
                    'error_info' => $stmt->errorInfo(),
                    'sql' => $sql,
                    'params' => $params
                ]);
                throw new Exception("Erro ao salvar cliente: " . implode(" - ", $stmt->errorInfo()));
            }
            
            $id = isset($dados['id']) ? $dados['id'] : $db->lastInsertId();
            SystemLogger::info("Cliente salvo com sucesso", ['id' => $id]);
            
            return (int)$id;
            
        } catch (Exception $e) {
            SystemLogger::error("Exceção ao salvar cliente", [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
} 