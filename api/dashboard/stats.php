<?php
require_once '../config/database.php';
require_once '../auth/auth.php';

header('Content-Type: application/json');

try {
    // Verifica autenticação
    Auth::verificarAuth();
    
    $db = Database::getInstance();
    
    // Busca as estatísticas
    $stats = [
        'clientes' => 0,
        'contratos' => 0,
        'ordens' => 0,
        'faturas' => 0
    ];
    
    try {
        // Clientes ativos
        $result = $db->query("SELECT COUNT(*) as total FROM clientes WHERE deleted_at IS NULL");
        $stats['clientes'] = $result[0]['total'];
        
        // Contratos ativos
        $result = $db->query("SELECT COUNT(*) as total FROM contratos WHERE status = 'ativo' AND deleted_at IS NULL");
        $stats['contratos'] = $result[0]['total'];
        
        // Ordens de serviço em aberto
        $result = $db->query("SELECT COUNT(*) as total FROM ordens_servico WHERE status = 'aberto' AND deleted_at IS NULL");
        $stats['ordens'] = $result[0]['total'];
        
        // Faturas pendentes
        $result = $db->query("SELECT COUNT(*) as total FROM faturas WHERE status = 'pendente' AND deleted_at IS NULL");
        $stats['faturas'] = $result[0]['total'];
        
    } catch (Exception $e) {
        error_log('Erro ao buscar estatísticas: ' . $e->getMessage());
        // Se houver erro em alguma query, mantém os valores zerados
    }
    
    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);
    
} catch (Exception $e) {
    error_log('Erro no dashboard/stats: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao carregar estatísticas'
    ]);
} 