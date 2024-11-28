<?php
class Logger {
    private static $logFile = null;
    private static $initialized = false;

    private static function initialize() {
        if (self::$initialized) return;

        // Cria o diretório de logs se não existir
        $logDir = __DIR__ . '/../../logs';
        if (!file_exists($logDir)) {
            mkdir($logDir, 0777, true);
        }

        // Define o arquivo de log do dia
        $date = date('Y-m-d');
        self::$logFile = $logDir . "/log-{$date}.txt";

        // Cria o arquivo se não existir
        if (!file_exists(self::$logFile)) {
            touch(self::$logFile);
            chmod(self::$logFile, 0666);
        }

        self::$initialized = true;
    }

    public static function log($message, $level = 'INFO', $context = []) {
        self::initialize();

        $timestamp = date('Y-m-d H:i:s');
        $contextStr = empty($context) ? '' : ' | Context: ' . json_encode($context);
        $logMessage = "[{$timestamp}] [{$level}] {$message}{$contextStr}\n";

        file_put_contents(self::$logFile, $logMessage, FILE_APPEND);
    }

    public static function info($message, $context = []) {
        self::log($message, 'INFO', $context);
    }

    public static function error($message, $context = []) {
        self::log($message, 'ERROR', $context);
    }

    public static function debug($message, $context = []) {
        self::log($message, 'DEBUG', $context);
    }

    public static function warning($message, $context = []) {
        self::log($message, 'WARNING', $context);
    }
}
