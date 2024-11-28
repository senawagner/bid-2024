<?php
require_once __DIR__ . '/../config/database.php';

class UsuarioModel {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function listar() {
        $sql = "SELECT id, username, nome, email, nivel, ativo, criado_em, atualizado_em 
                FROM usuarios 
                WHERE deleted_at IS NULL";
        return $this->db->query($sql);
    }
    
    public function buscar($id) {
        $sql = "SELECT id, username, nome, email, nivel, ativo, criado_em, atualizado_em 
                FROM usuarios 
                WHERE id = :id AND deleted_at IS NULL";
        $params = [':id' => $id];
        return $this->db->query($sql, $params);
    }
    
    public function salvar($dados) {
        // Ajuste nos níveis permitidos
        $niveisPermitidos = ['admin', 'usuario'];
        $dados['nivel'] = in_array($dados['nivel'], $niveisPermitidos) ? $dados['nivel'] : 'usuario';
        
        // Validações básicas
        if (empty($dados['nome']) || empty($dados['username']) || empty($dados['email'])) {
            throw new Exception("Campos obrigatórios não preenchidos");
        }
        
        // Verifica se username já existe
        $checkSql = "SELECT id FROM usuarios WHERE username = :username AND id != :id AND deleted_at IS NULL";
        $checkParams = [
            ':username' => $dados['username'],
            ':id' => $dados['id'] ?? 0
        ];
        $exists = $this->db->query($checkSql, $checkParams);
        if ($exists) {
            throw new Exception("Username já está em uso");
        }
        
        if (isset($dados['id'])) {
            // Update
            $sql = "UPDATE usuarios SET 
                    nome = :nome,
                    username = :username,
                    email = :email,
                    nivel = :nivel,
                    ativo = :ativo,
                    atualizado_em = NOW()
                    WHERE id = :id";
            
            $params = [
                ':id' => $dados['id'],
                ':nome' => $dados['nome'],
                ':username' => $dados['username'],
                ':email' => $dados['email'],
                ':nivel' => $dados['nivel'] ?? 'usuario',
                ':ativo' => $dados['ativo'] ?? 1
            ];
            
            if (!empty($dados['senha'])) {
                $sql = "UPDATE usuarios SET 
                        nome = :nome,
                        username = :username,
                        email = :email,
                        nivel = :nivel,
                        ativo = :ativo,
                        senha = :senha,
                        atualizado_em = NOW()
                        WHERE id = :id";
                $params[':senha'] = password_hash($dados['senha'], PASSWORD_DEFAULT);
            }
            
        } else {
            // Insert
            if (empty($dados['senha'])) {
                throw new Exception("Senha é obrigatória para novo usuário");
            }
            
            $sql = "INSERT INTO usuarios 
                    (username, nome, email, senha, nivel, ativo, criado_em) 
                    VALUES 
                    (:username, :nome, :email, :senha, :nivel, :ativo, NOW())";
            
            $params = [
                ':nome' => $dados['nome'],
                ':username' => $dados['username'],
                ':email' => $dados['email'],
                ':senha' => password_hash($dados['senha'], PASSWORD_DEFAULT),
                ':nivel' => $dados['nivel'] ?? 'usuario',
                ':ativo' => $dados['ativo'] ?? 1
            ];
        }
        
        return $this->db->execute($sql, $params);
    }
    
    public function excluir($id) {
        $sql = "UPDATE usuarios SET deleted_at = NOW() WHERE id = :id";
        return $this->db->execute($sql, [':id' => $id]);
    }
}
