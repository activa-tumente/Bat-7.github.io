-- Script para agregar la columna telefono a la tabla pacientes
-- Este script verifica si la columna existe antes de agregarla

DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  -- Verificar si la columna telefono existe en la tabla pacientes
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'pacientes' 
    AND column_name = 'telefono'
  ) INTO column_exists;
  
  -- Si la columna no existe, agregarla
  IF NOT column_exists THEN
    ALTER TABLE public.pacientes ADD COLUMN telefono TEXT;
    RAISE NOTICE 'Columna telefono agregada a la tabla pacientes';
  ELSE
    RAISE NOTICE 'La columna telefono ya existe en la tabla pacientes';
  END IF;
END $$;

-- Verificar la estructura actual de la tabla pacientes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public' 
  AND table_name = 'pacientes'
ORDER BY 
  ordinal_position;