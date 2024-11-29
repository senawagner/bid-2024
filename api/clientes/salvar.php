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
require_once __DIR__ . '/../config/log.php';

try {
    // Verifica autenticação
    Auth::verificarAuth();

    // Recebe e decodifica os dados
    $jsonData = file_get_contents('php://input');
    Logger::debug("Dados recebidos", ['data' => $jsonData]);

    $dados = json_decode($jsonData, true);
    if ($dados === null) {
        Logger::error("Erro ao decodificar JSON", ['json_error' => json_last_error_msg()]);
        http_response_code(400);
        echo json_encode(['error' => 'Dados inválidos']);
        exit;
    }

    Logger::info("Iniciando salvamento do cliente", ['data' => $dados]);

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
    Logger::info("Cliente salvo com sucesso", ['id' => $id]);
    error_log("Cliente salvo com ID: " . $id);
    
    // Busca o cliente atualizado
    $cliente = $clienteModel->buscar($dados['id'] ?? $id);
    Logger::debug("Dados do cliente após salvar", ['cliente' => $cliente]);
    error_log("Cliente recuperado após salvar: " . print_r($cliente, true));
    
    $response = [
        "success" => true,
        "message" => isset($dados['id']) ? "Cliente atualizado com sucesso" : "Cliente cadastrado com sucesso",
        "cliente" => $clienteModel->formatarDados($cliente)
    ];
    Logger::debug("Resposta final", ['response' => $response]);
    error_log("Resposta final: " . json_encode($response));
    echo json_encode($response);

} catch(Exception $e) {
    Logger::error("Exceção ao salvar cliente", [
        'message' => $e->getMessage(),
        'code' => $e->getCode(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    error_log('Erro ao salvar cliente: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}