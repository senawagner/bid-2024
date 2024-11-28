<?php
require_once "../config/database.php";

try {
    $db = Database::getInstance();
    
    // Lê o arquivo SQL
    $sql = file_get_contents(__DIR__ . '/add_deleted_at.sql');
    
    // Executa o comando
    $db->execute($sql);
    echo "Coluna deleted_at adicionada com sucesso!\n";
    
} catch (Exception $e) {
    if (strpos($e->getMessage(), "Duplicate column name") !== false) {
        echo "A coluna deleted_at já existe.\n";
    } else {
        echo "Erro ao adicionar coluna: " . $e->getMessage() . "\n";
        exit(1);
    }
}
