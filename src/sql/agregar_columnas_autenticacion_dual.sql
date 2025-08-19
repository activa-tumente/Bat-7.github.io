-- Script para agregar las columnas necesarias para la autenticación dual
-- Este script agrega las columnas documento, nombre, apellido y rol si no existen

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
    ALTER TABLE public.usuarios ADD COLUMN rol TEXT;
    RAISE NOTICE 'Columna rol agregada a la tabla usuarios';
  ELSE
    RAISE NOTICE 'La columna rol ya existe en la tabla usuarios';
  END IF;
END $$;

-- Intentar agregar la restricción CHECK a la columna rol si no existe
DO $$
BEGIN
  -- Verificar si la restricción ya existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'usuarios_rol_check' 
    AND conrelid = 'public.usuarios'::regclass
  ) THEN
    -- Agregar la restricción
    BEGIN
      ALTER TABLE public.usuarios 
      ADD CONSTRAINT usuarios_rol_check 
      CHECK (rol IN ('estudiante', 'psicologo', 'administrador'));
      
      RAISE NOTICE 'Restricción CHECK agregada a la columna rol';
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE 'No se pudo agregar la restricción CHECK a la columna rol: %', SQLERRM;
        
        -- Intentar agregar la restricción como NOT VALID
        BEGIN
          ALTER TABLE public.usuarios 
          ADD CONSTRAINT usuarios_rol_check 
          CHECK (rol IN ('estudiante', 'psicologo', 'administrador'))
          NOT VALID;
          
          RAISE NOTICE 'Restricción CHECK (NOT VALID) agregada a la columna rol';
        EXCEPTION
          WHEN others THEN
            RAISE NOTICE 'No se pudo agregar la restricción CHECK (NOT VALID) a la columna rol: %', SQLERRM;
        END;
    END;
  ELSE
    RAISE NOTICE 'La restricción CHECK ya existe en la columna rol';
  END IF;
END $$;

-- Actualizar los valores de rol basados en tipo_usuario si la columna tipo_usuario existe
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  -- Verificar si la columna tipo_usuario existe
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'usuarios' 
    AND column_name = 'tipo_usuario'
  ) INTO column_exists;
  
  IF column_exists THEN
    -- Actualizar los valores de rol basados en tipo_usuario
    UPDATE public.usuarios
    SET rol = CASE 
      WHEN tipo_usuario = 'admin' OR tipo_usuario = 'Administrador' THEN 'administrador'
      WHEN tipo_usuario = 'professional' OR tipo_usuario = 'Psicólogo' THEN 'psicologo'
      WHEN tipo_usuario = 'Candidato' THEN 'estudiante'
      ELSE 'estudiante'
    END
    WHERE rol IS NULL;
    
    RAISE NOTICE 'Valores de rol actualizados basados en tipo_usuario';
  ELSE
    RAISE NOTICE 'La columna tipo_usuario no existe en la tabla usuarios';
  END IF;
END $$;

-- Actualizar los nombres y apellidos basados en los metadatos de auth.users
UPDATE public.usuarios u
SET 
  nombre = COALESCE(au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'nombre', 'Usuario'),
  apellido = COALESCE(au.raw_user_meta_data->>'last_name', au.raw_user_meta_data->>'apellido', '')
FROM 
  auth.users au
WHERE 
  u.id = au.id
  AND (u.nombre IS NULL OR u.apellido IS NULL);
