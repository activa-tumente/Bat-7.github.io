-- Script para eliminar y recrear completamente la tabla usuarios
-- Este script elimina la tabla existente y crea una nueva con todos los campos necesarios

-- Eliminar la función get_user_by_documento si existe
DROP FUNCTION IF EXISTS public.get_user_by_documento(TEXT);

-- Eliminar la tabla usuarios si existe
DROP TABLE IF EXISTS public.usuarios;

-- Crear la tabla usuarios con todos los campos necesarios
CREATE TABLE public.usuarios (
  -- Columna que referencia al usuario en auth.users. Es la PRIMARY KEY.
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Columna para el número de documento. Debe ser único.
  documento TEXT UNIQUE,
  
  -- Datos personales
  nombre TEXT,
  apellido TEXT,
  
  -- Rol del usuario
  rol TEXT CHECK (rol IN ('estudiante', 'psicologo', 'administrador')),
  
  -- Campos de la tabla original
  tipo_usuario TEXT,
  activo BOOLEAN DEFAULT true,
  
  -- Timestamps
  fecha_creacion TIMESTAMPTZ DEFAULT now(),
  ultimo_acceso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comentarios para claridad
COMMENT ON TABLE public.usuarios IS 'Tabla de perfiles de usuario, complementa auth.users.';
COMMENT ON COLUMN public.usuarios.id IS 'Referencia al ID del usuario en la tabla auth.users.';
COMMENT ON COLUMN public.usuarios.documento IS 'Número de documento único del usuario, usado para login alternativo.';
COMMENT ON COLUMN public.usuarios.rol IS 'Rol del usuario dentro del sistema (estudiante, psicologo, administrador).';
COMMENT ON COLUMN public.usuarios.tipo_usuario IS 'Tipo de usuario (campo de la tabla original).';
COMMENT ON COLUMN public.usuarios.activo IS 'Indica si el usuario está activo en el sistema.';
COMMENT ON COLUMN public.usuarios.fecha_creacion IS 'Fecha de creación del usuario (campo de la tabla original).';
COMMENT ON COLUMN public.usuarios.ultimo_acceso IS 'Fecha del último acceso del usuario (campo de la tabla original).';
COMMENT ON COLUMN public.usuarios.created_at IS 'Fecha de creación del registro.';
COMMENT ON COLUMN public.usuarios.updated_at IS 'Fecha de última actualización del registro.';

-- HABILITAR Row Level Security
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
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

-- Trigger para actualizar 'updated_at' automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger en la tabla
CREATE TRIGGER on_usuarios_update
BEFORE UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

-- Función para buscar un usuario por documento
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

-- Función para actualizar el último acceso de un usuario
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
