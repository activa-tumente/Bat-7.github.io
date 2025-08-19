-- Script para verificar si la función get_user_by_documento existe

-- Verificar si la función existe
SELECT EXISTS (
  SELECT FROM pg_proc
  WHERE proname = 'get_user_by_documento'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
) AS funcion_existe;

-- Obtener el código fuente de la función si existe
SELECT 
  proname, 
  prosrc
FROM 
  pg_proc
WHERE 
  proname = 'get_user_by_documento'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
