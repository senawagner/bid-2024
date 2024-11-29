<?php
declare(strict_types=1);

class SystemLogger {
    private static $logFile;
    
    public static function init() {
        self::$logFile = __DIR__ . '/../../logs/log-' . date('Y-m-d') . '.txt';
        
        $logDir = dirname(self::$logFile);
        if (!file_exists($logDir)) {
            mkdir($logDir, 0777, true);
        }
        
        if (!file_exists(self::$logFile)) {
            touch(self::$logFile);
            chmod(self::$logFile, 0666);
        }
        
        ini_set('error_log', self::$logFile);
        ini_set('log_errors', '1');
        ini_set('display_errors', '0');
    }
    
    public static function log($level, $message, $context = []) {
        if (!isset(self::$logFile)) {
            self::init();
        }
        
        $date = date('Y-m-d H:i:s');
        $contextStr = !empty($context) ? " | Context: " . json_encode($context) : "";
        $logMessage = "[{$date}] [{$level}] {$message}{$contextStr}\n";
        error_log($logMessage, 3, self::$logFile);
    }
    
    public static function debug($message, $context = []) {
        self::log('DEBUG', $message, $context);
    }
    
    public static function info($message, $context = []) {
        self::log('INFO', $message, $context);
    }
    
    public static function error($message, $context = []) {
        self::log('ERROR', $message, $context);
    }
}

// Inicializa o logger
SystemLogger::init();
