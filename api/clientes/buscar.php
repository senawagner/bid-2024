<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once "ClienteModel.php";

try {
    // Valida ID
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        throw new Exception("ID inválido");
    }

    $id = (int)$_GET['id'];
    $clienteModel = new ClienteModel();
    $cliente = $clienteModel->buscar($id);
    
    if (!$cliente) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Cliente não encontrado"
        ]);
        exit;
    }
    
    echo json_encode([
        "success" => true,
        "cliente" => $clienteModel->formatarDados($cliente)
    ]);

} catch(Exception $e) {
    error_log('Erro ao buscar cliente: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erro ao buscar cliente"
    ]);
} 