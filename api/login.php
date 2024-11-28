<?php
// Configura o fuso horário para Brasília
date_default_timezone_set('America/Sao_Paulo');

require_once 'config/database.php';

// Configuração de logs
$logDir = __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'logs';
$logFile = $logDir . DIRECTORY_SEPARATOR . 'login.log';

// Debug inicial
error_log("Tentando acessar diretório de logs: " . $logDir);
error_log("Arquivo de log será criado em: " . $logFile);

// Cria o diretório de logs se não existir
if (!is_dir($logDir)) {
    error_log("Criando diretório de logs: " . $logDir);
    if (!mkdir($logDir, 0777, true)) {
        error_log("ERRO: Não foi possível criar o diretório de logs: " . $logDir);
        error_log("Erro: " . error_get_last()['message'] ?? 'Desconhecido');
        die("Erro: Não foi possível criar o diretório de logs");
    }
    chmod($logDir, 0777);
    error_log("Diretório de logs criado com sucesso: " . $logDir);
}

// Verifica permissões do diretório
if (!is_writable($logDir)) {
    error_log("ERRO: Diretório de logs sem permissão de escrita: " . $logDir);
    chmod($logDir, 0777);
    if (!is_writable($logDir)) {
        die("Erro: Diretório de logs sem permissão de escrita");
    }
}

// Tenta criar o arquivo de log se não existir
if (!file_exists($logFile)) {
    $testContent = "=== Log de Login Iniciado em " . date('Y-m-d H:i:s') . " ===\n";
    $testContent .= "Sistema: " . PHP_OS . "\n";
    $testContent .= "PHP Version: " . PHP_VERSION . "\n";
    $testContent .= "Log File: " . $logFile . "\n\n";
    
    if (file_put_contents($logFile, $testContent) === false) {
        error_log("ERRO: Não foi possível criar arquivo de log: " . $logFile);
        error_log("Erro: " . error_get_last()['message'] ?? 'Desconhecido');
        die("Erro: Não foi possível criar arquivo de log");
    }
    chmod($logFile, 0666);
    error_log("Arquivo de log criado com sucesso: " . $logFile);
}

// Função para log
function logLogin($message, $data = null) {
    global $logFile;
    
    try {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[{$timestamp}] - {$message}\n";
        if ($data !== null) {
            if (is_array($data) || is_object($data)) {
                $logMessage .= "Data: " . print_r($data, true) . "\n";
            } else {
                $logMessage .= "Data: {$data}\n";
            }
        }
        $logMessage .= str_repeat('-', 80) . "\n";

        // Debug do conteúdo
        error_log("Tentando escrever no log: " . substr($logMessage, 0, 100) . "...");
        
        // Tenta escrever no arquivo
        $result = file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
        
        if ($result === false) {
            error_log("ERRO: Falha ao escrever no arquivo de log: " . $logFile);
            error_log("Erro: " . error_get_last()['message'] ?? 'Desconhecido');
            throw new Exception("Falha ao escrever no arquivo de log");
        }
        
        // Sempre loga no error_log do PHP também
        error_log($message);
        if ($data !== null) {
            error_log(print_r($data, true));
        }
    } catch (Exception $e) {
        error_log("ERRO ao tentar escrever log: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
    }
}

// Habilita exibição de erros para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Habilita CORS para desenvolvimento
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Log inicial da requisição
try {
    logLogin("=== Nova Requisição de Login ===", [
        'method' => $_SERVER['REQUEST_METHOD'] ?? 'N/A',
        'uri' => $_SERVER['REQUEST_URI'] ?? 'N/A',
        'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? 'N/A',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'N/A',
        'log_file' => $logFile,
        'php_version' => PHP_VERSION,
        'os' => PHP_OS
    ]);
} catch (Exception $e) {
    error_log("ERRO fatal no sistema de logs: " . $e->getMessage());
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json; charset=UTF-8');

try {
    logLogin("=== Nova tentativa de login ===");
    
    // Log do método HTTP e headers
    logLogin("Método HTTP", $_SERVER['REQUEST_METHOD']);
    $headers = getallheaders();
    logLogin("Headers recebidos", $headers);
    
    // Log dos dados brutos recebidos
    $rawData = file_get_contents('php://input');
    logLogin("Dados brutos recebidos", $rawData);
    
    $dados = json_decode($rawData, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Erro ao decodificar JSON: ' . json_last_error_msg());
    }
    
    logLogin("Dados decodificados", $dados);
    
    if (!isset($dados['username']) || !isset($dados['password'])) {
        throw new Exception('Usuário e senha são obrigatórios');
    }

    $db = Database::getInstance();
    logLogin("Conexão com banco estabelecida");
    
    $sql = "SELECT id, nome, username, email, senha, nivel 
            FROM usuarios 
            WHERE username = :username 
            AND deleted_at IS NULL";
            
    $result = $db->query($sql, [':username' => $dados['username']]);
    logLogin("Resultado da consulta", ['encontrado' => !empty($result)]);
    
    if (empty($result)) {
        throw new Exception('Usuário ou senha inválidos');
    }

    $usuario = $result[0];
    logLogin("Verificando senha para usuário", ['username' => $usuario['username']]);
    
    // Verifica a senha
    $senhaValida = password_verify($dados['password'], $usuario['senha']);
    logLogin("Resultado da verificação de senha", ['válida' => $senhaValida]);
    
    if (!$senhaValida) {
        throw new Exception('Usuário ou senha inválidos');
    }

    // Remove a senha dos dados retornados
    unset($usuario['senha']);
    
    // Gera token com validade de 24 horas
    $token = gerarToken($usuario);
    
    $response = [
        'sucesso' => true,
        'usuario' => $usuario,
        'token' => $token
    ];
    
    logLogin("Login realizado com sucesso", [
        'usuario_id' => $usuario['id'],
        'username' => $usuario['username']
    ]);

    echo json_encode($response);
    
} catch(Exception $e) {
    logLogin("ERRO no processo de login", [
        'mensagem' => $e->getMessage(),
        'arquivo' => $e->getFile(),
        'linha' => $e->getLine()
    ]);
    
    http_response_code(400);
    echo json_encode([
        'sucesso' => false,
        'mensagem' => $e->getMessage()
    ]);
}

function gerarToken($usuario) {
    $payload = [
        'id' => $usuario['id'],
        'username' => $usuario['username'],
        'nivel' => $usuario['nivel'],
        'exp' => time() + (60 * 60 * 24) // 24 horas
    ];
    
    return base64_encode(json_encode($payload));
}