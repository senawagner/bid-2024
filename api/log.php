<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

class LogManager {
    private $baseDir;
    
    public function __construct() {
        $this->baseDir = __DIR__ . '/../logs';
        $this->ensureDirectories();
    }
    
    private function ensureDirectories() {
        $dirs = [
            'system',
            'access',
            'modules/usuarios',
            'modules/clientes',
            'audit/' . date('Y-m')
        ];
        
        foreach ($dirs as $dir) {
            $path = $this->baseDir . '/' . $dir;
            if (!file_exists($path)) {
                mkdir($path, 0777, true);
            }
        }
    }
    
    public function write($data) {
        // Define o diretório baseado no módulo
        $module = $data['module'] ?? 'system';
        $type = $data['type'] ?? 'INFO';
        
        // Define o caminho do arquivo
        $logFile = match($module) {
            'auth' => $this->baseDir . '/access/auth.log',
            'api' => $this->baseDir . '/access/api.log',
            'audit' => $this->baseDir . '/audit/' . date('Y-m') . '/' . date('d') . '.log',
            'system' => $this->baseDir . '/system/' . date('Y-m-d') . '.log',
            default => $this->baseDir . '/modules/' . $module . '/' . date('Y-m-d') . '.log'
        };
        
        // Se for ERROR, também salva no error.log
        if ($type === 'ERROR') {
            $errorLog = $this->baseDir . '/system/error.log';
            $this->writeToFile($errorLog, $data);
        }
        
        return $this->writeToFile($logFile, $data);
    }
    
    private function writeToFile($file, $data) {
        $logEntry = date('Y-m-d H:i:s') . ' - ' . 
                   json_encode($data, JSON_UNESCAPED_UNICODE) . 
                   PHP_EOL;
                   
        return file_put_contents($file, $logEntry, FILE_APPEND);
    }
}

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data) {
        throw new Exception("Dados inválidos");
    }

    $logger = new LogManager();
    $logger->write($data);

    echo json_encode([
        "success" => true,
        "message" => "Log salvo com sucesso"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
} 