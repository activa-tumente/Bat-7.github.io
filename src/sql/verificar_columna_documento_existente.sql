-- Script para verificar si la columna documento existe en la tabla usuarios

-- Verificar si la columna documento existe
SELECT EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'usuarios' 
  AND column_name = 'documento'
) AS columna_documento_existe;

-- Obtener la estructura completa de la tabla
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
