-- Script para crear la función execute_sql en Supabase
-- Esta función permite ejecutar consultas SQL dinámicas desde el cliente

-- Verificar si la función ya existe
DO $$
DECLARE
  function_exists BOOLEAN;
BEGIN
  -- Verificar si la función existe
  SELECT EXISTS (
    SELECT FROM pg_proc
    WHERE proname = 'execute_sql'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) INTO function_exists;

  -- Si la función no existe, crearla
  IF NOT function_exists THEN
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

    RAISE NOTICE 'Función execute_sql creada correctamente';
  ELSE
    RAISE NOTICE 'La función execute_sql ya existe';
  END IF;
END $$;
