-- Script para crear la función get_user_by_documento necesaria para la autenticación por documento

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
