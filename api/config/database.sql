-- Adiciona coluna deleted_at na tabela clientes
ALTER TABLE clientes ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

-- Adiciona índice para melhorar performance de consultas
ALTER TABLE clientes ADD INDEX idx_deleted_at (deleted_at);

-- Atualiza registros existentes
UPDATE clientes SET deleted_at = NULL WHERE deleted_at IS NOT NULL;
