-- Script para corregir los permisos de la función get_user_by_documento

-- Recrear la función con los permisos correctos
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
REVOKE ALL ON FUNCTION public.get_user_by_documento(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_by_documento(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_by_documento(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_by_documento(TEXT) TO service_role;
