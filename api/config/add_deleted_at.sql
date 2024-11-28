-- Adiciona coluna deleted_at em todas as tabelas necessárias
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE contratos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL;

-- Adiciona índices para melhorar performance
ALTER TABLE clientes ADD INDEX idx_deleted_at (deleted_at);
ALTER TABLE contratos ADD INDEX idx_deleted_at (deleted_at);
ALTER TABLE ordens_servico ADD INDEX idx_deleted_at (deleted_at);

-- Atualiza registros existentes
UPDATE clientes SET deleted_at = NULL WHERE deleted_at IS NOT NULL;
UPDATE contratos SET deleted_at = NULL WHERE deleted_at IS NOT NULL;
UPDATE ordens_servico SET deleted_at = NULL WHERE deleted_at IS NOT NULL;
