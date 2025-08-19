-- Script para agregar la columna documento a la tabla usuarios si no existe

-- Verificar si la columna documento existe y agregarla si no
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  -- Verificar si la columna documento existe
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'usuarios' 
    AND column_name = 'documento'
  ) INTO column_exists;

  -- Si la columna no existe, agregarla
  IF NOT column_exists THEN
    ALTER TABLE public.usuarios ADD COLUMN documento TEXT UNIQUE;
    RAISE NOTICE 'Columna documento agregada a la tabla usuarios';
  ELSE
    RAISE NOTICE 'La columna documento ya existe en la tabla usuarios';
  END IF;
END $$;
