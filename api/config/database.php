<?php
declare(strict_types=1);

// Configura o fuso horário para Brasília
date_default_timezone_set('America/Sao_Paulo');

require_once __DIR__ . '/log.php';

class Database {
    private static $instance = null;
    private $pdo;
    
    private function __construct() {
        try {
            SystemLogger::info("Iniciando conexão com o banco de dados");
            // Configurações do banco
            $host = '186.209.113.109';
            $port = '3306';
            $dbname = 'coddarco_bid';
            $username = 'coddarco_developer';
            $password = 'J4&Gdy*-Xxqn';
            $charset = 'utf8mb4';
            
            $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset={$charset}";
            
            // Log da tentativa de conexão
            error_log("=== INÍCIO DA CONEXÃO COM O BANCO ===");
            error_log("Tentando conectar ao banco: Host={$host}, Port={$port}, Database={$dbname}");
            
            $this->pdo = new PDO(
                $dsn,
                $username,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
            
            // Configura o timezone do MySQL
            $this->pdo->exec("SET time_zone = '-03:00'");
            $this->pdo->exec("SET NAMES utf8mb4");
            
            // Log de sucesso
            error_log("Conexão bem sucedida com o banco de dados");
            error_log("=== FIM DA CONEXÃO COM O BANCO ===");
            SystemLogger::info("Conexão estabelecida com sucesso");
            
        } catch (PDOException $e) {
            error_log("=== ERRO NA CONEXÃO COM O BANCO ===");
            error_log("Código do erro: " . $e->getCode());
            error_log("Mensagem: " . $e->getMessage());
            error_log("SQL State: " . $e->errorInfo[0] ?? 'N/A');
            error_log("Stack trace: " . $e->getTraceAsString());
            SystemLogger::error("Erro na conexão com o banco de dados: " . $e->getMessage());
            throw new Exception("Erro ao conectar com o banco de dados: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function query($sql, $params = []) {
        try {
            SystemLogger::debug("Preparando query", ['query' => $sql, 'params' => $params]);
            error_log("=== INÍCIO DA QUERY ===");
            error_log("SQL Original: " . $sql);
            error_log("Parâmetros: " . json_encode($params));
            
            $stmt = $this->pdo->prepare($sql);
            
            // Bind dos parâmetros com tipo correto
            foreach ($params as $key => $value) {
                // Remove : do nome do parâmetro se existir
                $param = strpos($key, ':') === 0 ? substr($key, 1) : $key;
                
                if (is_int($value)) {
                    $stmt->bindValue(":{$param}", $value, PDO::PARAM_INT);
                    error_log("Bind INT - :{$param} = {$value}");
                    SystemLogger::debug("Binding parameter", ['key' => $key, 'value' => $value, 'type' => PDO::PARAM_INT]);
                } else {
                    $stmt->bindValue(":{$param}", $value, PDO::PARAM_STR);
                    error_log("Bind STR - :{$param} = {$value}");
                    SystemLogger::debug("Binding parameter", ['key' => $key, 'value' => $value, 'type' => PDO::PARAM_STR]);
                }
            }
            
            // Executa a query
            $success = $stmt->execute();
            
            if (!$success) {
                error_log("Erro na execução: " . json_encode($stmt->errorInfo()));
                throw new Exception("Erro ao executar query");
            }
            
            // Busca resultados
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("Registros encontrados: " . count($result));
            if (count($result) > 0) {
                error_log("Primeira linha: " . json_encode($result[0]));
            }
            
            error_log("=== FIM DA QUERY ===");
            SystemLogger::info("Query executada com sucesso");
            return $result;
            
        } catch (PDOException $e) {
            error_log("=== ERRO NA QUERY ===");
            error_log("Código do erro: " . $e->getCode());
            error_log("Mensagem: " . $e->getMessage());
            error_log("SQL State: " . $e->errorInfo[0] ?? 'N/A');
            error_log("Stack trace: " . $e->getTraceAsString());
            SystemLogger::error("Erro ao executar query: " . $e->getMessage(), [
                'query' => $sql,
                'params' => $params,
                'error_code' => $e->getCode()
            ]);
            throw new Exception("Erro ao executar consulta: " . $e->getMessage());
        }
    }
    
    public function execute($sql, $params = []) {
        try {
            SystemLogger::debug("Preparando query", ['query' => $sql, 'params' => $params]);
            error_log("=== INÍCIO DO EXECUTE ===");
            error_log("SQL Original: " . $sql);
            error_log("Parâmetros recebidos: " . print_r($params, true));
            
            $stmt = $this->pdo->prepare($sql);
            if (!$stmt) {
                error_log("Erro ao preparar SQL: " . print_r($this->pdo->errorInfo(), true));
                throw new Exception("Erro ao preparar consulta SQL");
            }
            
            // Bind dos parâmetros com tipo correto
            foreach ($params as $key => $value) {
                // Remove : do nome do parâmetro se existir
                $param = strpos($key, ':') === 0 ? substr($key, 1) : $key;
                
                if (is_int($value)) {
                    $stmt->bindValue(":{$param}", $value, PDO::PARAM_INT);
                    error_log("Bind INT - :{$param} = {$value}");
                    SystemLogger::debug("Binding parameter", ['key' => $key, 'value' => $value, 'type' => PDO::PARAM_INT]);
                } else if (is_null($value)) {
                    $stmt->bindValue(":{$param}", null, PDO::PARAM_NULL);
                    error_log("Bind NULL - :{$param} = null");
                    SystemLogger::debug("Binding parameter", ['key' => $key, 'value' => $value, 'type' => PDO::PARAM_NULL]);
                } else {
                    $stmt->bindValue(":{$param}", $value, PDO::PARAM_STR);
                    error_log("Bind STR - :{$param} = {$value}");
                    SystemLogger::debug("Binding parameter", ['key' => $key, 'value' => $value, 'type' => PDO::PARAM_STR]);
                }
            }
            
            // Tenta executar
            error_log("Executando query...");
            $result = $stmt->execute();
            
            if (!$result) {
                error_log("Erro na execução: " . print_r($stmt->errorInfo(), true));
                throw new Exception("Erro ao executar query: " . print_r($stmt->errorInfo(), true));
            }
            error_log("Query executada com sucesso");
            SystemLogger::info("Query executada com sucesso");
            
            error_log("=== FIM DO EXECUTE ===");
            return $result;
            
        } catch (PDOException $e) {
            error_log("=== ERRO NO EXECUTE ===");
            error_log("Código do erro: " . $e->getCode());
            error_log("Mensagem: " . $e->getMessage());
            error_log("SQL State: " . $e->errorInfo[0] ?? 'N/A');
            error_log("Stack trace: " . $e->getTraceAsString());
            SystemLogger::error("Erro ao executar comando: " . $e->getMessage(), [
                'query' => $sql,
                'params' => $params,
                'error_code' => $e->getCode()
            ]);
            if ($e->getCode() == 23000) {
                throw new Exception("Registro duplicado. Verifique o CNPJ informado.");
            }
            throw new Exception("Erro ao executar comando: " . $e->getMessage());
        }
    }
    
    public function prepare($sql) {
        try {
            SystemLogger::debug("Preparando query", ['query' => $sql]);
            error_log("=== INÍCIO DO PREPARE ===");
            error_log("SQL a ser preparado: " . $sql);
            
            $stmt = $this->pdo->prepare($sql);
            
            if (!$stmt) {
                error_log("Erro ao preparar SQL: " . json_encode($this->pdo->errorInfo()));
                throw new Exception("Erro ao preparar consulta SQL");
            }
            
            error_log("=== FIM DO PREPARE ===");
            SystemLogger::info("Query preparada com sucesso");
            return $stmt;
            
        } catch (PDOException $e) {
            error_log("=== ERRO NO PREPARE ===");
            error_log("Código do erro: " . $e->getCode());
            error_log("Mensagem: " . $e->getMessage());
            error_log("SQL State: " . $e->errorInfo[0] ?? 'N/A');
            
            SystemLogger::error("Erro ao preparar consulta: " . $e->getMessage(), [
                'query' => $sql,
                'error_code' => $e->getCode()
            ]);
            throw new Exception("Erro ao preparar consulta: " . $e->getMessage());
        }
    }
    
    public function lastInsertId() {
        try {
            SystemLogger::debug("Recuperando último ID inserido");
            error_log("=== INÍCIO DO LAST INSERT ID ===");
            $id = $this->pdo->lastInsertId();
            error_log("ID recuperado: " . $id);
            error_log("=== FIM DO LAST INSERT ID ===");
            SystemLogger::info("Último ID inserido recuperado com sucesso");
            return (int)$id;
            
        } catch (PDOException $e) {
            error_log("=== ERRO AO RECUPERAR LAST INSERT ID ===");
            error_log("Código do erro: " . $e->getCode());
            error_log("Mensagem: " . $e->getMessage());
            error_log("SQL State: " . $e->errorInfo[0] ?? 'N/A');
            
            SystemLogger::error("Erro ao recuperar ID do registro inserido: " . $e->getMessage(), [
                'error_code' => $e->getCode()
            ]);
            throw new Exception("Erro ao recuperar ID do registro inserido: " . $e->getMessage());
        }
    }
    
    public function connect() {
        return $this->pdo;
    }
}
