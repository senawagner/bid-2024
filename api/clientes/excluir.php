<?php
require_once '../config/database.php';
require_once '../auth/auth.php';
require_once 'ClienteModel.php';

header('Content-Type: application/json');

try {
    // Verifica autenticação
    Auth::verificarAuth();
    
    // Recebe e decodifica os dados
    $dados = json_decode(file_get_contents("php://input"), true);
    if (!isset($dados['id']) || empty($dados['id'])) {
        throw new Exception("ID do cliente não informado");
    }
    
    $clienteModel = new ClienteModel();
    $resultado = $clienteModel->excluir((int)$dados['id']);
    
    echo json_encode([
        'success' => true,
        'message' => 'Cliente excluído com sucesso'
    ]);
    
} catch (Exception $e) {
    error_log('Erro ao excluir cliente: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 