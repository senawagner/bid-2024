<?php
declare(strict_types=1);

require_once __DIR__ . "/database.php";

try {
    $db = Database::getInstance();
    
    // Lê o arquivo SQL
    $sql = file_get_contents(__DIR__ . '/add_deleted_at.sql');
    
    // Divide em comandos individuais
    $commands = array_filter(
        array_map(
            'trim',
            explode(';', $sql)
        )
    );
    
    // Executa cada comando
    foreach ($commands as $command) {
        if (empty($command)) continue;
        
        try {
            $db->execute($command);
            echo "Comando executado com sucesso: " . substr($command, 0, 50) . "...\n";
        } catch (Exception $e) {
            // Se o erro for de coluna já existente, podemos ignorar
            if (strpos($e->getMessage(), "Duplicate column name") !== false ||
                strpos($e->getMessage(), "Duplicate key name") !== false) {
                echo "Aviso: Coluna ou índice já existe: " . $e->getMessage() . "\n";
                continue;
            }
            throw $e;
        }
    }
    
    echo "\nBanco de dados atualizado com sucesso!\n";
    
} catch (Exception $e) {
    echo "Erro ao atualizar banco de dados: " . $e->getMessage() . "\n";
    exit(1);
}
