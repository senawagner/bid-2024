<?php
require_once '../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Log para debug
    error_log('Iniciando processo de login');
    
    // Recebe os dados
    $json = file_get_contents('php://input');
    $dados = json_decode($json, true);
    
    error_log('Dados recebidos: ' . print_r($dados, true));

    if (!isset($dados['username']) || !isset($dados['password'])) {
        throw new Exception('Usuário e senha são obrigatórios');
    }

    $db = Database::getInstance();
    
    // Busca usuário
    $sql = "SELECT id, nome, username, email, senha, nivel, ativo 
            FROM usuarios 
            WHERE username = :username 
            AND ativo = 1
            AND deleted_at IS NULL";
            
    $stmt = $db->prepare($sql);
    $stmt->execute([':username' => $dados['username']]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    error_log('Usuário encontrado: ' . ($usuario ? 'sim' : 'não'));

    if (!$usuario) {
        throw new Exception('Usuário não encontrado');
    }

    // Verifica senha
    if (!password_verify($dados['password'], $usuario['senha'])) {
        error_log('Senha incorreta para usuário: ' . $dados['username']);
        throw new Exception('Senha incorreta');
    }

    // Remove senha dos dados retornados
    unset($usuario['senha']);
    
    // Registra tentativa de login bem-sucedida
    $sql = "INSERT INTO login_attempts (username, ip_address, created_at) 
            VALUES (:username, :ip, NOW())";
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':username' => $dados['username'],
        ':ip' => $_SERVER['REMOTE_ADDR']
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Login realizado com sucesso',
        'token' => base64_encode(json_encode([
            'id' => $usuario['id'],
            'username' => $usuario['username'],
            'exp' => time() + 3600
        ])),
        'usuario' => $usuario
    ]);

} catch (Exception $e) {
    error_log('Erro no login: ' . $e->getMessage());
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 