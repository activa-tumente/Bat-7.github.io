-- Script para eliminar y recrear la tabla usuarios desde cero

-- Eliminar la función get_user_by_documento si existe
DROP FUNCTION IF EXISTS public.get_user_by_documento(TEXT);

-- Eliminar la tabla usuarios si existe
DROP TABLE IF EXISTS public.usuarios;

-- Crear la tabla usuarios
CREATE TABLE public.usuarios (
  -- Columna que referencia al usuario en auth.users. Es la PRIMARY KEY.
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Columna para el número de documento. Debe ser único si es un identificador primario.
  documento TEXT UNIQUE,
  
  -- Otras columnas que necesites
  nombre TEXT,
  apellido TEXT,
  rol TEXT CHECK (rol IN ('estudiante', 'psicologo', 'administrador')),
  
  -- Timestamps automáticos
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
GRANT EXECUTE ON FUNCTION public.get_user_by_documento TO anon, authenticated;
