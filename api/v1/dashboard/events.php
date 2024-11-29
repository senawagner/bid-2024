<?php
require_once '../utils/Database.php';
require_once '../utils/Logger.php';
require_once '../utils/Auth.php';

// Configura headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Inicializa o logger
Logger::initialize();
Logger::debug("Iniciando events.php");

// Verifica autenticação
Auth::verificarToken();

try {
    // Conecta ao banco de dados
    $db = new Database();
    $conn = $db->connect();

    // Busca eventos do banco
    $sql = "SELECT * FROM eventos WHERE data >= CURRENT_DATE ORDER BY data ASC LIMIT 10";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formata eventos para o calendário
    $events = array_map(function($evento) {
        return [
            'id' => intval($evento['id']),
            'title' => $evento['titulo'],
            'start' => $evento['data'],
            'description' => $evento['descricao'],
            'className' => 'bg-info'
        ];
    }, $eventos);

    // Retorna sucesso
    Logger::info("Eventos carregados com sucesso");
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $events
    ]);
    exit;

} catch (Exception $e) {
    // Log do erro
    Logger::error("Erro ao carregar eventos: " . $e->getMessage());
    
    // Retorna erro
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao carregar eventos',
        'error' => $e->getMessage()
    ]);
    exit;
}
