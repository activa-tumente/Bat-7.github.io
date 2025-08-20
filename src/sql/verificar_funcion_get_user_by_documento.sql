-- Script para verificar si la función get_user_by_documento existe y funciona correctamente

-- Verificar si la función existe
SELECT EXISTS (
  SELECT FROM pg_proc
  WHERE proname = 'get_user_by_documento'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
) AS funcion_existe;

-- Obtener el código fuente de la función
SELECT 
  proname, 
  prosrc
FROM 
  pg_proc
WHERE 
  proname = 'get_user_by_documento'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Probar la función con un documento de prueba
-- Nota: Esto solo funcionará si hay usuarios en la tabla usuarios con documentos
SELECT * FROM public.get_user_by_documento('ADMIN001');
SELECT * FROM public.get_user_by_documento('PSICO001');
SELECT * FROM public.get_user_by_documento('ESTUD001');
