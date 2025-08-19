-- Script para verificar la estructura de la tabla usuarios

-- Verificar si la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'usuarios'
) AS tabla_existe;

-- Obtener la estructura de la tabla
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public' 
  AND table_name = 'usuarios'
ORDER BY 
  ordinal_position;

-- Verificar las políticas RLS
SELECT 
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

-- Verificar los triggers
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement
FROM 
  information_schema.triggers
WHERE 
  event_object_schema = 'public'
  AND event_object_table = 'usuarios';

-- Verificar las funciones
SELECT 
  proname, 
  prosrc
FROM 
  pg_proc
WHERE 
  proname = 'get_user_by_documento'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
