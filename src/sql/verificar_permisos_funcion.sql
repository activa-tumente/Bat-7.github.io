-- Script para verificar los permisos de la función get_user_by_documento

-- Verificar los permisos de la función
SELECT 
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_catalog.pg_get_userbyid(p.proowner) AS function_owner,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security,
  pg_catalog.array_to_string(p.proacl, E'\n') AS access_privileges
FROM 
  pg_catalog.pg_proc p
  LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE 
  p.proname = 'get_user_by_documento'
  AND n.nspname = 'public';

-- Verificar los permisos de la tabla usuarios
SELECT 
  n.nspname AS schema_name,
  c.relname AS table_name,
  pg_catalog.pg_get_userbyid(c.relowner) AS table_owner,
  pg_catalog.array_to_string(c.relacl, E'\n') AS access_privileges
FROM 
  pg_catalog.pg_class c
  LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE 
  c.relname = 'usuarios'
  AND n.nspname = 'public';

-- Verificar las políticas RLS de la tabla usuarios
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
