<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once "../config/database.php";
require_once "../auth/auth.php";
require_once "ClienteModel.php";

try {
    // Verifica autenticação
    Auth::verificarAuth();
    
    // Instancia o modelo
    $clienteModel = new ClienteModel();
    
    // Busca os clientes
    $clientes = $clienteModel->listar();
    
    // Formata os dados
    $dados = [];
    foreach ($clientes as $cliente) {
        $dados[] = $clienteModel->formatarDados($cliente);
    }
    
    // Retorna sucesso
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Clientes listados com sucesso",
        "data" => $dados
    ]);

} catch(Exception $e) {
    // Log do erro no servidor
    error_log('Erro ao listar clientes: ' . $e->getMessage());
    
    // Retorna erro
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erro ao listar clientes: " . $e->getMessage(),
        "data" => []
    ]);
} 