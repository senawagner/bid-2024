<?php
require_once 'utils/Logger.php';
require_once 'config/api.php';
require_once 'config/database.php';
require_once 'config/auth.php';

// Inicializa o logger
Logger::initialize();
Logger::debug("API Request: " . $_SERVER['REQUEST_URI']);

// Configura headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Validar versão da API
    $version = getApiVersion();
    validateApiVersion($version);

    // Extrai o caminho da URL
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $path = str_replace('/api/v' . $version . '/', '', $path);
    
    // Remove qualquer "../" do path por segurança
    $path = str_replace('../', '', $path);
    
    // Constrói o caminho do arquivo
    $file = __DIR__ . "/$version/$path";
    
    Logger::debug("Tentando acessar arquivo: " . $file);
    
    if (file_exists($file)) {
        // Inclui o arquivo da API
        require $file;
    } else {
        Logger::error("Endpoint não encontrado: " . $path);
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint não encontrado'
        ]);
    }
    
} catch (Exception $e) {
    Logger::error("Erro na API: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor',
        'error' => $e->getMessage()
    ]);
}