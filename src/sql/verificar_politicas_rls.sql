-- Script para verificar las políticas RLS actuales de la tabla usuarios

-- Verificar si la tabla tiene RLS habilitado
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'usuarios'
AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Listar todas las políticas RLS de la tabla usuarios
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
