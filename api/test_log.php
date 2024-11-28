<?php
// Define o caminho do log
$logPath = __DIR__ . '/error.log';

echo "Testando criação de logs...<br>";
echo "Caminho do log: " . $logPath . "<br>";

// Verifica se o diretório tem permissão de escrita
echo "Permissão de escrita no diretório: " . (is_writable(__DIR__) ? 'Sim' : 'Não') . "<br>";

// Tenta criar/escrever no arquivo de log
try {
    error_log("Teste de log - " . date('Y-m-d H:i:s'), 3, $logPath);
    echo "Log criado com sucesso!<br>";
    
    // Mostra o conteúdo do log
    if (file_exists($logPath)) {
        echo "Conteúdo do log:<br>";
        echo "<pre>" . file_get_contents($logPath) . "</pre>";
    }
} catch (Exception $e) {
    echo "Erro ao criar log: " . $e->getMessage() . "<br>";
}

// Mostra informações do PHP
echo "<br>Informações do PHP:<br>";
echo "error_reporting: " . error_reporting() . "<br>";
echo "display_errors: " . ini_get('display_errors') . "<br>";
echo "log_errors: " . ini_get('log_errors') . "<br>";
echo "error_log: " . ini_get('error_log') . "<br>";
?> 