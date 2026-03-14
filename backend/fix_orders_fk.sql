-- Script de correção da FK conflituosa na tabela orders
-- Executar com: sudo mysql ecommerce < fix_orders_fk.sql

-- 1. Remover a FK antiga que impede a modificação da coluna
ALTER TABLE orders DROP FOREIGN KEY orders_ibfk_1;

-- 2. Modificar a coluna para aceitar NULL (necessário para ON DELETE SET NULL)
ALTER TABLE orders MODIFY COLUMN user_id INT NULL;

-- 3. Verificar resultado
SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'ecommerce'
  AND TABLE_NAME = 'orders'
  AND COLUMN_NAME = 'user_id';
