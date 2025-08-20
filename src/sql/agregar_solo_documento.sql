-- Script para agregar solo la columna documento a la tabla usuarios

-- Verificar si la columna documento existe
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

-- Crear o reemplazar la función get_user_by_documento
CREATE OR REPLACE FUNCTION public.get_user_by_documento(documento_input TEXT)
RETURNS TABLE (
  user_id UUID,
  email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, au.email
  FROM public.usuarios u
  JOIN auth.users au ON u.id = au.id
  WHERE u.documento = documento_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION public.get_user_by_documento(TEXT) TO anon, authenticated, service_role;
