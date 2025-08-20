-- Script para corregir la tabla usuarios
-- Este script verifica si la tabla existe y agrega la columna documento si es necesario

-- Verificar si la tabla existe
DO $$
DECLARE
  table_exists BOOLEAN;
  column_exists BOOLEAN;
BEGIN
  -- Verificar si la tabla existe
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'usuarios'
  ) INTO table_exists;

  IF table_exists THEN
    -- Verificar si la columna documento existe
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'usuarios' 
      AND column_name = 'documento'
    ) INTO column_exists;

    -- Si la tabla existe pero la columna no, agregarla
    IF NOT column_exists THEN
      EXECUTE 'ALTER TABLE public.usuarios ADD COLUMN documento TEXT UNIQUE';
      RAISE NOTICE 'Columna documento agregada a la tabla usuarios';
    ELSE
      RAISE NOTICE 'La columna documento ya existe en la tabla usuarios';
    END IF;
  ELSE
    -- Si la tabla no existe, crearla completa
    CREATE TABLE public.usuarios (
      id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      documento TEXT UNIQUE,
      nombre TEXT,
      apellido TEXT,
      rol TEXT CHECK (rol IN ('estudiante', 'psicologo', 'administrador')),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Comentarios para claridad
    COMMENT ON TABLE public.usuarios IS 'Tabla de perfiles de usuario, complementa auth.users.';
    COMMENT ON COLUMN public.usuarios.id IS 'Referencia al ID del usuario en la tabla auth.users.';
    COMMENT ON COLUMN public.usuarios.documento IS 'Número de documento único del usuario, usado para login alternativo.';
    COMMENT ON COLUMN public.usuarios.rol IS 'Rol del usuario dentro del sistema.';

    -- HABILITAR Row Level Security
    ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

    RAISE NOTICE 'Tabla usuarios creada correctamente';
  END IF;
END $$;

-- Verificar si las políticas RLS existen y crearlas si no
DO $$
BEGIN
  -- Eliminar políticas existentes para evitar duplicados
  DROP POLICY IF EXISTS "Permitir lectura del propio perfil" ON public.usuarios;
  DROP POLICY IF EXISTS "Permitir actualización del propio perfil" ON public.usuarios;
  DROP POLICY IF EXISTS "Permitir lectura a admins" ON public.usuarios;
  DROP POLICY IF EXISTS "Permitir actualización a admins" ON public.usuarios;

  -- Crear políticas RLS
  -- Permitir a los usuarios leer su propio perfil
  CREATE POLICY "Permitir lectura del propio perfil" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

  -- Permitir a los usuarios actualizar su propio perfil
  CREATE POLICY "Permitir actualización del propio perfil" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

  -- Permitir a administradores leer todos los perfiles
  CREATE POLICY "Permitir lectura a admins" ON public.usuarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND rol = 'administrador'
    )
  );

  -- Permitir a administradores actualizar todos los perfiles
  CREATE POLICY "Permitir actualización a admins" ON public.usuarios
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND rol = 'administrador'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND rol = 'administrador'
    )
  );

  RAISE NOTICE 'Políticas RLS creadas correctamente';
END $$;

-- Verificar si el trigger existe y crearlo si no
DO $$
BEGIN
  -- Crear función para el trigger si no existe
  CREATE OR REPLACE FUNCTION public.handle_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Eliminar trigger si existe
  DROP TRIGGER IF EXISTS on_usuarios_update ON public.usuarios;

  -- Crear trigger
  CREATE TRIGGER on_usuarios_update
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

  RAISE NOTICE 'Trigger para actualizar updated_at creado correctamente';
END $$;

-- Verificar si la función get_user_by_documento existe y crearla si no
DO $$
BEGIN
  -- Eliminar función si existe
  DROP FUNCTION IF EXISTS public.get_user_by_documento(TEXT);

  -- Crear función
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
  GRANT EXECUTE ON FUNCTION public.get_user_by_documento TO anon, authenticated;

  RAISE NOTICE 'Función get_user_by_documento creada correctamente';
END $$;
