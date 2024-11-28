<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "../config/database.php";
require_once "../auth/auth.php";
require_once "ClienteModel.php";

try {
    // Verifica autenticação
    Auth::verificarAuth();
    
    // Pega o JSON do body
    $dados = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($dados['id']) || empty($dados['id'])) {
        throw new Exception("ID do cliente não fornecido");
    }
    
    $id = (int)$dados['id'];
    
    // Instancia o modelo
    $clienteModel = new ClienteModel();
    
    // Verifica se pode excluir
    if (!$clienteModel->podeExcluir($id)) {
        throw new Exception("Cliente não pode ser excluído pois possui registros vinculados");
    }
    
    // Exclui o cliente
    if (!$clienteModel->excluir($id)) {
        throw new Exception("Erro ao excluir cliente");
    }
    
    // Retorna sucesso
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Cliente excluído com sucesso"
    ]);

} catch(Exception $e) {
    error_log('Erro ao excluir cliente: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}