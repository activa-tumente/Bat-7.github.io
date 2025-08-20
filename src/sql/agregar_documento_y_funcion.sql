-- Script simplificado para agregar la columna documento y la función get_user_by_documento

-- Verificar y agregar la columna documento si no existe
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

-- Actualizar documentos de usuarios de prueba
UPDATE public.usuarios
SET documento = 'ADMIN001'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin.test.bat7@gmail.com'
)
AND (documento IS NULL OR documento = '');

UPDATE public.usuarios
SET documento = 'PSICO001'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'profesional.test.bat7@gmail.com'
)
AND (documento IS NULL OR documento = '');

UPDATE public.usuarios
SET documento = 'ESTUD001'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'estudiante.test.bat7@gmail.com'
)
AND (documento IS NULL OR documento = '');
