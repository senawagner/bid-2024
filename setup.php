<?php

// Define o diretório raiz do projeto
$rootDir = __DIR__;

// Define os diretórios que precisam ser criados
$directories = [
    $rootDir . '/logs',
    $rootDir . '/logs/auth',
    $rootDir . '/logs/error',
    $rootDir . '/logs/debug',
    $rootDir . '/logs/info'
];

// Cria os diretórios
foreach ($directories as $dir) {
    if (!file_exists($dir)) {
        if (mkdir($dir, 0777, true)) {
            echo "✅ Diretório criado com sucesso: " . $dir . "\n";
        } else {
            echo "❌ Erro ao criar diretório: " . $dir . "\n";
        }
    } else {
        echo "ℹ️ Diretório já existe: " . $dir . "\n";
    }
}

// Cria arquivo .htaccess para proteger a pasta logs
$htaccess = $rootDir . '/logs/.htaccess';
$htaccessContent = "Deny from all";

if (file_put_contents($htaccess, $htaccessContent)) {
    echo "✅ Arquivo .htaccess criado com sucesso\n";
} else {
    echo "❌ Erro ao criar arquivo .htaccess\n";
}

echo "\n📁 Estrutura de diretórios criada:\n";
echo "
bid/
├── logs/
│   ├── .htaccess
│   ├── auth/
│   ├── error/
│   ├── debug/
│   └── info/
"; 