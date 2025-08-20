-- Script para habilitar RLS en la tabla usuarios

-- Habilitar RLS en la tabla usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Verificar si RLS está habilitado
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'usuarios'
AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
