<?php
declare(strict_types=1);

require_once __DIR__ . "/../config/database.php";

class ClienteModel {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Lista todos os clientes ativos e não excluídos
     */
    public function listar() {
        $sql = "SELECT * FROM clientes 
                WHERE deleted_at IS NULL 
                ORDER BY razao_social ASC";
                
        return $this->db->query($sql);
    }
    
    /**
     * Busca um cliente específico
     */
    public function buscar(int $id) {
        try {
            $sql = "SELECT * FROM clientes 
                    WHERE id = :id 
                    AND ativo = 1
                    AND deleted_at IS NULL";
                    
            $result = $this->db->query($sql, ['id' => $id]);
            return $result[0] ?? null;
            
        } catch (Exception $e) {
            error_log("Erro ao buscar cliente: " . $e->getMessage());
            throw new Exception("Erro ao buscar cliente");
        }
    }
    
    /**
     * Exclui um cliente (soft delete)
     */
    public function excluir(int $id): bool {
        try {
            error_log("=== INÍCIO DA EXCLUSÃO ===");
            error_log("Tentando excluir cliente ID: " . $id);
            
            // Primeiro verifica se o cliente existe e não está excluído
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
            
            // Atualiza o registro marcando como excluído
            $sql = "UPDATE clientes 
                    SET ativo = 0,
                        deleted_at = CURRENT_TIMESTAMP,
                        atualizado_em = CURRENT_TIMESTAMP 
                    WHERE id = :id 
                    AND deleted_at IS NULL";
            
            error_log("SQL de exclusão: " . $sql);
            error_log("Parâmetros: " . json_encode(['id' => $id]));
            // Tenta executar a query diretamente primeiro
            $testeSql = str_replace(':id', (string)$id, $sql);
            error_log("SQL para teste direto: " . $testeSql);
            
            $result = $this->db->execute($sql, ['id' => (string)$id]);
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
        $sql = "SELECT 
            (SELECT COUNT(*) FROM contratos WHERE cliente_id = :id AND deleted_at IS NULL) +
            (SELECT COUNT(*) FROM ordens_servico WHERE cliente_id = :id AND deleted_at IS NULL) +
            (SELECT COUNT(*) FROM faturas WHERE cliente_id = :id AND deleted_at IS NULL) as total";
                
        $result = $this->db->query($sql, ['id' => $id]);
        return (int)$result[0]['total'] === 0;
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
        try {
            // Se tem ID, atualiza
            if (!empty($dados['id'])) {
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
                        AND deleted_at IS NULL";
                        
                $this->db->execute($sql, $dados);
                return (int)$dados['id'];
                
            } else {
                // Se não tem ID, insere
                $sql = "INSERT INTO clientes (
                        razao_social, nome_fantasia, cnpj, inscricao_estadual,
                        telefone, celular, email, endereco, numero, complemento,
                        bairro, cidade, estado, cep, observacoes, criado_em, atualizado_em
                        ) VALUES (
                        :razao_social, :nome_fantasia, :cnpj, :inscricao_estadual,
                        :telefone, :celular, :email, :endereco, :numero, :complemento,
                        :bairro, :cidade, :estado, :cep, :observacoes, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                        )";
                        
                $this->db->execute($sql, $dados);
                return $this->db->lastInsertId();
            }
        } catch (Exception $e) {
            error_log("Erro ao salvar cliente: " . $e->getMessage());
            throw new Exception("Erro ao salvar cliente");
        }
    }
} 