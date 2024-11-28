<?php
declare(strict_types=1);

// Configura o fuso horário para Brasília
date_default_timezone_set('America/Sao_Paulo');

class Database {
    private static $instance = null;
    private $pdo;
    
    private function __construct() {
        try {
            // Configurações do banco
            $host = '186.209.113.109';
            $port = '3306';
            $dbname = 'coddarco_bid';
            $username = 'coddarco_developer';
            $password = 'J4&Gdy*-Xxqn';
            $charset = 'utf8mb4';
            
            $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset={$charset}";
            
            // Log da tentativa de conexão
            error_log("Tentando conectar ao banco: {$host}:{$port}/{$dbname}");
            
            $this->pdo = new PDO(
                $dsn,
                $username,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => true,
                    PDO::ATTR_TIMEOUT => 30, // Aumentado para 30 segundos
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                ]
            );
            
            // Configura o timezone do MySQL
            $this->pdo->exec("SET time_zone = '-03:00'");
            $this->pdo->exec("SET NAMES utf8mb4");
            
            error_log("Conexão estabelecida com sucesso");
            
        } catch (PDOException $e) {
            error_log("Erro PDO: " . $e->getMessage());
            throw new Exception("Erro de conexão com o banco de dados: " . $e->getMessage());
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
                } else {
                    $stmt->bindValue(":{$param}", $value, PDO::PARAM_STR);
                    error_log("Bind STR - :{$param} = {$value}");
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
            return $result;
            
        } catch (PDOException $e) {
            error_log("=== ERRO NA QUERY ===");
            error_log("Código do erro: " . $e->getCode());
            error_log("Mensagem: " . $e->getMessage());
            error_log("SQL State: " . $e->errorInfo[0] ?? 'N/A');
            error_log("Stack trace: " . $e->getTraceAsString());
            
            throw new Exception("Erro ao executar consulta: " . $e->getMessage());
        }
    }
    
    public function execute($sql, $params = []) {
        try {
            error_log("=== INÍCIO DO EXECUTE ===");
            $stmt = $this->pdo->prepare($sql);
            error_log("SQL preparado: " . $sql);
            error_log("Parâmetros: " . json_encode($params));
            
            // Tenta executar
            $result = $stmt->execute($params);
            error_log("Comando executado: " . ($result ? 'Sucesso' : 'Falha'));
            
            if (!$result) {
                error_log("Erro PDO: " . json_encode($stmt->errorInfo()));
            }
            
            error_log("=== FIM DO EXECUTE ===");
            return $result;
            
        } catch (PDOException $e) {
            error_log("=== ERRO NO EXECUTE ===");
            error_log("Código do erro: " . $e->getCode());
            error_log("Mensagem: " . $e->getMessage());
            error_log("SQL State: " . $e->errorInfo[0]);
            
            if ($e->getCode() == 23000) {
                throw new Exception("Registro duplicado. Verifique o CNPJ informado.");
            }
            throw new Exception("Erro ao executar comando: " . $e->getMessage());
        }
    }
    
    public function prepare($sql) {
        try {
            error_log("=== INÍCIO DO PREPARE ===");
            error_log("SQL a ser preparado: " . $sql);
            
            $stmt = $this->pdo->prepare($sql);
            
            if (!$stmt) {
                error_log("Erro ao preparar SQL: " . json_encode($this->pdo->errorInfo()));
                throw new Exception("Erro ao preparar consulta SQL");
            }
            
            error_log("=== FIM DO PREPARE ===");
            return $stmt;
            
        } catch (PDOException $e) {
            error_log("=== ERRO NO PREPARE ===");
            error_log("Código do erro: " . $e->getCode());
            error_log("Mensagem: " . $e->getMessage());
            error_log("SQL State: " . $e->errorInfo[0] ?? 'N/A');
            
            throw new Exception("Erro ao preparar consulta: " . $e->getMessage());
        }
    }
    
    public function lastInsertId() {
        try {
            error_log("=== INÍCIO DO LAST INSERT ID ===");
            $id = $this->pdo->lastInsertId();
            error_log("ID recuperado: " . $id);
            error_log("=== FIM DO LAST INSERT ID ===");
            return (int)$id;
            
        } catch (PDOException $e) {
            error_log("=== ERRO AO RECUPERAR LAST INSERT ID ===");
            error_log("Código do erro: " . $e->getCode());
            error_log("Mensagem: " . $e->getMessage());
            error_log("SQL State: " . $e->errorInfo[0] ?? 'N/A');
            
            throw new Exception("Erro ao recuperar ID do registro inserido: " . $e->getMessage());
        }
    }
}
