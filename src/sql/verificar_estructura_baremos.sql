-- Verificar la estructura de la tabla baremos
SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'baremos'
ORDER BY ordinal_position;

-- Verificar las restricciones de la tabla baremos
SELECT con.conname AS constraint_name,
       con.contype AS constraint_type,
       pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'baremos'
AND nsp.nspname = 'public';

-- Verificar si la tabla está vacía
SELECT COUNT(*) AS total_registros FROM baremos;
