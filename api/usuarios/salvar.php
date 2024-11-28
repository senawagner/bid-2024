<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'UsuarioModel.php';

try {
    $dados = json_decode(file_get_contents("php://input"), true);
    
    if (!$dados) {
        throw new Exception("Dados inválidos");
    }
    
    $model = new UsuarioModel();
    $resultado = $model->salvar($dados);
    
    echo json_encode([
        "success" => true,
        "message" => "Usuário salvo com sucesso",
        "data" => $resultado
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
