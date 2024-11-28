<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'UsuarioModel.php';

try {
    if (!isset($_GET['id'])) {
        throw new Exception("ID não informado");
    }
    
    $model = new UsuarioModel();
    $usuario = $model->buscar($_GET['id']);
    
    if (!$usuario) {
        throw new Exception("Usuário não encontrado");
    }
    
    echo json_encode([
        "success" => true,
        "data" => $usuario[0]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
