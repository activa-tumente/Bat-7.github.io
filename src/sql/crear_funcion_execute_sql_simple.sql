-- Script para crear la función execute_sql en Supabase
-- Esta función permite ejecutar consultas SQL dinámicas desde el cliente

-- Crear la función execute_sql
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Ejecutar la consulta SQL y obtener el resultado como JSON
  EXECUTE 'WITH result AS (' || sql_query || ') SELECT COALESCE(jsonb_agg(r), ''[]''::jsonb) FROM result r' INTO result;
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE,
      'query', sql_query
    );
END;
$$;

-- Otorgar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION public.execute_sql TO authenticated;
