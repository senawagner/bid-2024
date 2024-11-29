<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "../config/database.php";
require_once "../auth/auth.php";
require_once "ClienteModel.php";
require_once "../config/log.php";

try {
    SystemLogger::info("Iniciando listagem de clientes");
    
    // Verifica autenticação
    Auth::verificarAuth();
    SystemLogger::debug("Autenticação verificada com sucesso");
    
    // Instancia o modelo
    $clienteModel = new ClienteModel();
    
    // Busca os clientes
    $clientes = $clienteModel->listar();
    SystemLogger::debug("Clientes recuperados do banco", ['count' => count($clientes)]);
    
    // Formata os dados
    $dados = [];
    foreach ($clientes as $cliente) {
        $dados[] = $clienteModel->formatarDados($cliente);
    }
    SystemLogger::debug("Dados formatados com sucesso", ['count' => count($dados)]);
    
    // Retorna sucesso
    http_response_code(200);
    $response = [
        "success" => true,
        "message" => "Clientes listados com sucesso",
        "data" => $dados
    ];
    SystemLogger::info("Listagem concluída com sucesso", ['response' => $response]);
    echo json_encode($response);

} catch(Exception $e) {
    SystemLogger::error("Erro ao listar clientes", [
        'message' => $e->getMessage(),
        'code' => $e->getCode(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    
    // Retorna erro
    http_response_code(500);
    $response = [
        "success" => false,
        "message" => "Erro ao listar clientes: " . $e->getMessage(),
        "data" => []
    ];
    echo json_encode($response);
}