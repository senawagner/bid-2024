<?php
require_once 'config/database.php';

try {
    // Testa a conexão
    $db = Database::getInstance();
    echo "✅ Conexão estabelecida com sucesso!<br>";
    
    // Testa uma query simples
    $result = $db->query("SELECT 1 as test");
    echo "✅ Query de teste executada com sucesso!<br>";
    
    // Testa uma query na tabela usuarios
    $users = $db->query("SELECT COUNT(*) as total FROM usuarios");
    echo "✅ Total de usuários: " . $users[0]['total'] . "<br>";
    
} catch(Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "<br>";
}

// Mostra o log
if (file_exists(__DIR__ . '/error.log')) {
    echo "<br>📝 Log:<br><pre>";
    echo file_get_contents(__DIR__ . '/error.log');
    echo "</pre>";
} 