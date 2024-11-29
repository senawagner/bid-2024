-- Adiciona a coluna tipo_cliente se ela não existir
SET @exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'clientes'
    AND COLUMN_NAME = 'tipo_cliente'
);

SET @query := IF(
    @exists = 0,
    'ALTER TABLE clientes ADD COLUMN tipo_cliente ENUM("fisica", "juridica") NOT NULL DEFAULT "juridica" AFTER id',
    'SELECT "Column tipo_cliente already exists"'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
