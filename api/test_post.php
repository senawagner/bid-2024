<?php
// Configuração de logs
$logFile = __DIR__ . '/test_post.log';

// Função para log
function logTest($message, $data = null) {
    global $logFile;
    $log = date('Y-m-d H:i:s') . " - " . $message;
    if ($data) {
        $log .= " - Data: " . print_r($data, true);
    }
    $log .= "\n";
    file_put_contents($logFile, $log, FILE_APPEND);
}

// Headers
header('Content-Type: application/json; charset=UTF-8');

// Log inicial
logTest("=== Novo teste de POST ===");

// Log dos dados recebidos
$rawData = file_get_contents('php://input');
logTest("Dados brutos recebidos", $rawData);

// Log do método da requisição
logTest("Método HTTP", $_SERVER['REQUEST_METHOD']);

// Log dos headers
logTest("Headers", getallheaders());

// Resposta
echo json_encode([
    'sucesso' => true,
    'mensagem' => 'Teste realizado com sucesso',
    'dados_recebidos' => json_decode($rawData, true)
]); 