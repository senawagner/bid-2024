<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../utils/Logger.php';
require_once "auth.php";

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::debug("Recebida requisição OPTIONS preflight");
    http_response_code(200);
    exit;
}

try {
    Logger::info("=== Iniciando verificação de token ===");
    Logger::debug("Headers recebidos", getallheaders());
    
    // Verifica autenticação
    Auth::verificarAuth();
    
    Logger::info("Token verificado com sucesso");
    
    // Retorna sucesso
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Token válido"
    ]);

} catch(Exception $e) {
    Logger::error("Erro na verificação do token", [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
