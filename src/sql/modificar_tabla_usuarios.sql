-- Script para modificar la tabla usuarios existente sin eliminarla
-- Este script agrega las columnas necesarias para la autenticación dual

-- Verificar y agregar las columnas necesarias
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  -- Verificar y agregar la columna documento
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'usuarios' 
    AND column_name = 'documento'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE public.usuarios ADD COLUMN documento TEXT UNIQUE;
    RAISE NOTICE 'Columna documento agregada a la tabla usuarios';
  ELSE
    RAISE NOTICE 'La columna documento ya existe en la tabla usuarios';
  END IF;
  
  -- Verificar y agregar la columna nombre
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'usuarios' 
    AND column_name = 'nombre'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE public.usuarios ADD COLUMN nombre TEXT;
    RAISE NOTICE 'Columna nombre agregada a la tabla usuarios';
  ELSE
    RAISE NOTICE 'La columna nombre ya existe en la tabla usuarios';
  END IF;
  
  -- Verificar y agregar la columna apellido
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'usuarios' 
    AND column_name = 'apellido'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE public.usuarios ADD COLUMN apellido TEXT;
    RAISE NOTICE 'Columna apellido agregada a la tabla usuarios';
  ELSE
    RAISE NOTICE 'La columna apellido ya existe en la tabla usuarios';
  END IF;
  
  -- Verificar y agregar la columna rol
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'usuarios' 
    AND column_name = 'rol'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE public.usuarios ADD COLUMN rol TEXT CHECK (rol IN ('estudiante', 'psicologo', 'administrador'));
    RAISE NOTICE 'Columna rol agregada a la tabla usuarios';
  ELSE
    RAISE NOTICE 'La columna rol ya existe en la tabla usuarios';
  END IF;
  
  -- Verificar y agregar la columna created_at
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'usuarios' 
    AND column_name = 'created_at'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE public.usuarios ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    RAISE NOTICE 'Columna created_at agregada a la tabla usuarios';
  ELSE
    RAISE NOTICE 'La columna created_at ya existe en la tabla usuarios';
  END IF;
  
  -- Verificar y agregar la columna updated_at
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'usuarios' 
    AND column_name = 'updated_at'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE public.usuarios ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    RAISE NOTICE 'Columna updated_at agregada a la tabla usuarios';
  ELSE
    RAISE NOTICE 'La columna updated_at ya existe en la tabla usuarios';
  END IF;
END $$;

-- Actualizar los valores de rol basados en tipo_usuario
UPDATE public.usuarios
SET rol = CASE 
  WHEN tipo_usuario = 'admin' THEN 'administrador'
  WHEN tipo_usuario = 'professional' THEN 'psicologo'
  ELSE 'estudiante'
END
WHERE rol IS NULL;

-- Actualizar los nombres y apellidos basados en los metadatos de auth.users
UPDATE public.usuarios u
SET 
  nombre = COALESCE(au.raw_user_meta_data->>'name', 'Usuario'),
  apellido = COALESCE(au.raw_user_meta_data->>'last_name', '')
FROM 
  auth.users au
WHERE 
  u.id = au.id
  AND (u.nombre IS NULL OR u.apellido IS NULL);

-- Verificar si la función get_user_by_documento existe y crearla si no
DO $$
DECLARE
  function_exists BOOLEAN;
BEGIN
  -- Verificar si la función existe
  SELECT EXISTS (
    SELECT FROM pg_proc
    WHERE proname = 'get_user_by_documento'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) INTO function_exists;
  
  -- Si la función no existe, crearla
  IF NOT function_exists THEN
    -- Crear la función para buscar un usuario por documento
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
    GRANT EXECUTE ON FUNCTION public.get_user_by_documento TO anon, authenticated, service_role;
    
    RAISE NOTICE 'Función get_user_by_documento creada correctamente';
  ELSE
    -- Actualizar la función existente
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
    GRANT EXECUTE ON FUNCTION public.get_user_by_documento TO anon, authenticated, service_role;
    
    RAISE NOTICE 'Función get_user_by_documento actualizada correctamente';
  END IF;
END $$;

-- Verificar si la función update_ultimo_acceso existe y crearla si no
DO $$
DECLARE
  function_exists BOOLEAN;
BEGIN
  -- Verificar si la función existe
  SELECT EXISTS (
    SELECT FROM pg_proc
    WHERE proname = 'update_ultimo_acceso'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) INTO function_exists;
  
  -- Si la función no existe, crearla
  IF NOT function_exists THEN
    -- Crear la función para actualizar el último acceso
    CREATE OR REPLACE FUNCTION public.update_ultimo_acceso(user_id UUID)
    RETURNS VOID AS $$
    BEGIN
      UPDATE public.usuarios
      SET ultimo_acceso = now()
      WHERE id = user_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Otorgar permisos para ejecutar la función
    GRANT EXECUTE ON FUNCTION public.update_ultimo_acceso TO authenticated, service_role;
    
    RAISE NOTICE 'Función update_ultimo_acceso creada correctamente';
  ELSE
    RAISE NOTICE 'La función update_ultimo_acceso ya existe';
  END IF;
END $$;

-- Verificar si el trigger handle_updated_at existe y crearlo si no
DO $$
DECLARE
  trigger_exists BOOLEAN;
  function_exists BOOLEAN;
BEGIN
  -- Verificar si la función existe
  SELECT EXISTS (
    SELECT FROM pg_proc
    WHERE proname = 'handle_updated_at'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) INTO function_exists;
  
  -- Si la función no existe, crearla
  IF NOT function_exists THEN
    -- Crear la función para el trigger
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    RAISE NOTICE 'Función handle_updated_at creada correctamente';
  ELSE
    RAISE NOTICE 'La función handle_updated_at ya existe';
  END IF;
  
  -- Verificar si el trigger existe
  SELECT EXISTS (
    SELECT FROM pg_trigger
    WHERE tgname = 'on_usuarios_update'
    AND tgrelid = 'public.usuarios'::regclass
  ) INTO trigger_exists;
  
  -- Si el trigger no existe, crearlo
  IF NOT trigger_exists THEN
    -- Crear el trigger
    CREATE TRIGGER on_usuarios_update
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
    
    RAISE NOTICE 'Trigger on_usuarios_update creado correctamente';
  ELSE
    RAISE NOTICE 'El trigger on_usuarios_update ya existe';
  END IF;
END $$;

-- Verificar si las políticas RLS existen y crearlas si no
DO $$
DECLARE
  policy_exists BOOLEAN;
BEGIN
  -- Verificar si la política "Permitir lectura del propio perfil" existe
  SELECT EXISTS (
    SELECT FROM pg_policies
    WHERE policyname = 'Permitir lectura del propio perfil'
    AND tablename = 'usuarios'
    AND schemaname = 'public'
  ) INTO policy_exists;
  
  -- Si la política no existe, crearla
  IF NOT policy_exists THEN
    -- Crear la política
    CREATE POLICY "Permitir lectura del propio perfil" ON public.usuarios
    FOR SELECT USING (auth.uid() = id);
    
    RAISE NOTICE 'Política "Permitir lectura del propio perfil" creada correctamente';
  ELSE
    RAISE NOTICE 'La política "Permitir lectura del propio perfil" ya existe';
  END IF;
  
  -- Verificar si la política "Permitir actualización del propio perfil" existe
  SELECT EXISTS (
    SELECT FROM pg_policies
    WHERE policyname = 'Permitir actualización del propio perfil'
    AND tablename = 'usuarios'
    AND schemaname = 'public'
  ) INTO policy_exists;
  
  -- Si la política no existe, crearla
  IF NOT policy_exists THEN
    -- Crear la política
    CREATE POLICY "Permitir actualización del propio perfil" ON public.usuarios
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    
    RAISE NOTICE 'Política "Permitir actualización del propio perfil" creada correctamente';
  ELSE
    RAISE NOTICE 'La política "Permitir actualización del propio perfil" ya existe';
  END IF;
END $$;
