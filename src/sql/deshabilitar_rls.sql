-- Script para deshabilitar temporalmente RLS en la tabla usuarios
-- ADVERTENCIA: Esto deshabilitará todas las políticas de seguridad de la tabla
-- Solo debe usarse para depuración y debe volver a habilitarse después

-- Deshabilitar RLS en la tabla usuarios
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;

-- Verificar si RLS está deshabilitado
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'usuarios'
AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
