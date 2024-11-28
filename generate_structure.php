<?php
// Salvar como: generate_structure.php

// Caminho do arquivo de saída
$outputFile = __DIR__ . '/docs/file_estrutura.md';
$docsDir = __DIR__ . '/docs';

// Cria o diretório docs se não existir
if (!file_exists($docsDir)) {
    mkdir($docsDir, 0777, true);
}

// Inicia o conteúdo do arquivo
$content = "# Estrutura de Arquivos do Projeto BID\n";
$content .= "Atualizado em: " . date('d/m/Y H:i:s') . "\n\n";
$content .= "```\n";

// Função recursiva para listar diretórios
function listDirectory($path, $baseDir, $level = 0) {
    $result = '';
    $items = scandir($path);
    
    foreach ($items as $item) {
        // Ignora diretórios especiais e arquivos/pastas ocultos
        if ($item === '.' || $item === '..' || 
            $item === 'node_modules' || 
            $item === '.git' || 
            strpos($item, '.') === 0) {
            continue;
        }

        $fullPath = $path . '/' . $item;
        $indent = str_repeat("  ", $level);
        
        if (is_dir($fullPath)) {
            $result .= "$indent- $item/\n";
            $result .= listDirectory($fullPath, $baseDir, $level + 1);
        } else {
            $result .= "$indent- $item\n";
        }
    }
    
    return $result;
}

// Lista todos os arquivos e diretórios
$content .= listDirectory(__DIR__, __DIR__);

// Fecha o bloco de código
$content .= "```\n";

// Salva o arquivo
file_put_contents($outputFile, $content);

echo "Arquivo gerado em: $outputFile\n";