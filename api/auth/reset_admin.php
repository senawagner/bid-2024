<?php
require_once '../config/database.php';

try {
    $db = Database::getInstance();
    
    // Senha padrão: senha123
    $senha = password_hash('senha123', PASSWORD_DEFAULT);
    
    $sql = "UPDATE usuarios 
            SET senha = :senha 
            WHERE username = 'admin'";
            
    $params = [':senha' => $senha];
    
    $db->execute($sql, $params);
    
    echo "Senha do admin resetada com sucesso!";
    
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage();
} 