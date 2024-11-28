<?php
require_once 'config/api.php';
require_once 'config/database.php';
require_once 'config/auth.php';

header('Content-Type: application/json');

// Validar versão da API
$version = getApiVersion();
validateApiVersion($version);

// Extrair endpoint da URL
$path = $_SERVER['REQUEST_URI'];
$endpoint = preg_replace('/^\/api\/v\d+\//', '', $path);

// Rotear para o endpoint correto
$file = __DIR__ . "/$version/$endpoint";

if (file_exists($file)) {
    require $file;
} else {
    echo apiResponse([
        'mensagem' => 'Endpoint não encontrado'
    ], false, 404);
} 