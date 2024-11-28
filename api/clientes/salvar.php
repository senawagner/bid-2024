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

    // Recebe e decodifica os dados
    $dados = json_decode(file_get_contents("php://input"), true);
    
    // Validações básicas
    if (empty($dados['razao_social'])) {
        throw new Exception("Razão Social é obrigatória");
    }
    
    $clienteModel = new ClienteModel();
    
    if (!empty($dados['cnpj'])) {
        if ($clienteModel->cnpjExiste($dados['cnpj'], $dados['id'] ?? null)) {
            throw new Exception("CNPJ já cadastrado");
        }
    }
    
    // Salva o cliente
    $id = $clienteModel->salvar($dados);
    
    // Busca o cliente atualizado
    $cliente = $clienteModel->buscar($dados['id'] ?? $id);
    
    echo json_encode([
        "success" => true,
        "message" => isset($dados['id']) ? "Cliente atualizado com sucesso" : "Cliente cadastrado com sucesso",
        "cliente" => $clienteModel->formatarDados($cliente)
    ]);

} catch(Exception $e) {
    error_log('Erro ao salvar cliente: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}