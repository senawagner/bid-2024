<?php
require_once __DIR__ . '/../utils/Logger.php';

class Auth {
    private static $usuario = null;
    
    /**
     * Verifica se o usuário está autenticado via token
     * @return bool
     */
    public static function verificarAuth() {
        Logger::info("=== Iniciando verificação de autenticação ===");
        
        // Pega o token do header Authorization
        $headers = getallheaders();
        Logger::debug("Headers recebidos", $headers);
        
        $authHeader = $headers['Authorization'] ?? '';
        Logger::debug("Header Authorization", ['header' => $authHeader]);
        
        if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            Logger::error("Token não fornecido ou formato inválido");
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Token não fornecido'
            ]);
            exit;
        }

        $token = $matches[1];
        Logger::debug("Token extraído", ['token' => $token]);
        
        try {
            // Decodifica o token (base64)
            $payload = json_decode(base64_decode($token), true);
            Logger::debug("Payload decodificado", $payload);
            
            if (!$payload) {
                Logger::error("Falha ao decodificar token");
                throw new Exception('Token inválido');
            }
            
            // Verifica se o token expirou
            if (!isset($payload['exp']) || $payload['exp'] < time()) {
                Logger::error("Token expirado", [
                    'expiration' => $payload['exp'] ?? 'não definido',
                    'current_time' => time(),
                    'diff' => isset($payload['exp']) ? ($payload['exp'] - time()) : 'N/A'
                ]);
                throw new Exception('Token expirado');
            }
            
            // Guarda os dados do usuário para uso posterior
            self::$usuario = [
                'id' => $payload['id'] ?? null,
                'username' => $payload['username'] ?? null,
                'nivel' => $payload['nivel'] ?? null
            ];
            
            Logger::info("Autenticação bem sucedida", ['usuario' => self::$usuario]);
            return true;
            
        } catch (Exception $e) {
            Logger::error("Erro na verificação do token", [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
            exit;
        }
    }
    
    /**
     * Retorna o ID do usuário logado
     * @return int|null
     */
    public static function getUsuarioId() {
        return self::$usuario['id'] ?? null;
    }

    /**
     * Retorna os dados do usuário autenticado
     */
    public static function getUsuario() {
        return self::$usuario;
    }
} 