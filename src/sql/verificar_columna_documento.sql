-- Script para verificar si la tabla usuarios tiene la columna documento

-- Verificar si la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'usuarios'
) AS tabla_existe;

-- Verificar si la columna documento existe
SELECT EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'usuarios' 
  AND column_name = 'documento'
) AS columna_documento_existe;

-- Obtener la estructura de la tabla
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
