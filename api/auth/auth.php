<?php
class Auth {
    /**
     * Verifica se o usuário está autenticado via token
     * @return bool
     */
    public static function verificarAuth() {
        // Pega o token do header Authorization
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Token não fornecido'
            ]);
            exit;
        }

        $token = $matches[1];
        
        try {
            // Decodifica o token (base64)
            $payload = json_decode(base64_decode($token), true);
            
            if (!$payload) {
                throw new Exception('Token inválido');
            }
            
            // Verifica se o token expirou
            if (!isset($payload['exp']) || $payload['exp'] < time()) {
                throw new Exception('Token expirado');
            }
            
            // Guarda os dados do usuário para uso posterior
            self::$usuario = [
                'id' => $payload['id'] ?? null,
                'username' => $payload['username'] ?? null,
                'nivel' => $payload['nivel'] ?? null
            ];
            
            return true;
            
        } catch (Exception $e) {
            error_log('Erro na verificação do token: ' . $e->getMessage());
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
            exit;
        }
    }

    private static $usuario = null;

    /**
     * Retorna o ID do usuário logado
     * @return int|null
     */
    public static function getUsuarioId() {
        return self::$usuario['id'] ?? null;
    }

    /**
     * Retorna os dados do usuário logado
     * @return array|null
     */
    public static function getUsuario() {
        return self::$usuario;
    }
} 