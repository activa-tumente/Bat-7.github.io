-- Script para migrar datos de la tabla usuarios actual a la nueva estructura
-- Este script debe ejecutarse después de recrear_tabla_usuarios_completa.sql

-- Crear una tabla temporal para guardar los datos existentes
CREATE TEMP TABLE temp_usuarios AS
SELECT 
  id,
  tipo_usuario,
  fecha_creacion,
  ultimo_acceso,
  activo
FROM 
  public.usuarios;

-- Eliminar la tabla usuarios existente
DROP TABLE IF EXISTS public.usuarios;

-- Crear la nueva tabla usuarios
CREATE TABLE public.usuarios (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  documento TEXT UNIQUE,
  nombre TEXT,
  apellido TEXT,
  rol TEXT CHECK (rol IN ('estudiante', 'psicologo', 'administrador')),
  tipo_usuario TEXT,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMPTZ DEFAULT now(),
  ultimo_acceso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Migrar los datos de la tabla temporal a la nueva tabla
INSERT INTO public.usuarios (
  id,
  tipo_usuario,
  fecha_creacion,
  ultimo_acceso,
  activo,
  rol
)
SELECT 
  id,
  tipo_usuario,
  fecha_creacion,
  ultimo_acceso,
  activo,
  CASE 
    WHEN tipo_usuario = 'admin' THEN 'administrador'
    WHEN tipo_usuario = 'professional' THEN 'psicologo'
    ELSE 'estudiante'
  END as rol
FROM 
  temp_usuarios;

-- Eliminar la tabla temporal
DROP TABLE temp_usuarios;

-- Actualizar los nombres y apellidos basados en los metadatos de auth.users
UPDATE public.usuarios u
SET 
  nombre = COALESCE(au.raw_user_meta_data->>'name', 'Usuario'),
  apellido = COALESCE(au.raw_user_meta_data->>'last_name', '')
FROM 
  auth.users au
WHERE 
  u.id = au.id;

-- Crear las políticas RLS
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

-- Permitir a administradores insertar nuevos perfiles
CREATE POLICY "Permitir inserción a admins" ON public.usuarios
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND rol = 'administrador'
  )
);

-- Permitir a administradores eliminar perfiles
CREATE POLICY "Permitir eliminación a admins" ON public.usuarios
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND rol = 'administrador'
  )
);

-- Crear el trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_usuarios_update
BEFORE UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

-- Crear la función para buscar usuario por documento
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

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION public.get_user_by_documento TO anon, authenticated, service_role;
