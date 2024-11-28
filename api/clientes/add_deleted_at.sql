-- Adiciona coluna deleted_at na tabela clientes
ALTER TABLE clientes ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
