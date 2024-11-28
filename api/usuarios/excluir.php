<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'UsuarioModel.php';

try {
    $dados = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($dados['id'])) {
        throw new Exception("ID não informado");
    }
    
    $model = new UsuarioModel();
    $resultado = $model->excluir($dados['id']);
    
    echo json_encode([
        "success" => true,
        "message" => "Usuário excluído com sucesso"
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
