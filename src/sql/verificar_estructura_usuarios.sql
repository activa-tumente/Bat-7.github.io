-- Script para verificar la estructura completa de la tabla usuarios

-- Verificar si la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'usuarios'
) AS tabla_existe;

-- Obtener la estructura completa de la tabla
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public' 
  AND table_name = 'usuarios'
ORDER BY 
  ordinal_position;

-- Verificar las restricciones de la tabla
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM
  information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE
  tc.table_schema = 'public'
  AND tc.table_name = 'usuarios';

-- Verificar los índices de la tabla
SELECT
  indexname,
  indexdef
FROM
  pg_indexes
WHERE
  schemaname = 'public'
  AND tablename = 'usuarios';

-- Verificar si RLS está habilitado
SELECT 
  relname, 
  relrowsecurity
FROM 
  pg_class
WHERE 
  relname = 'usuarios'
  AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Verificar las políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM 
  pg_policies
WHERE 
  tablename = 'usuarios'
  AND schemaname = 'public';
