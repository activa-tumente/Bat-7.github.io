-- Script para corregir las políticas RLS de la tabla usuarios
-- Este script elimina las políticas existentes y crea nuevas políticas que permiten el acceso adecuado

-- Asegurarse de que RLS está habilitado
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Permitir lectura del propio perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir actualización del propio perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir lectura a admins" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir actualización a admins" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir inserción a admins" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir eliminación a admins" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir lectura a usuarios autenticados" ON public.usuarios;
DROP POLICY IF EXISTS "Admin full access to usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Admin SELECT access to usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Admin INSERT access to usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Admin UPDATE access to usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Admin DELETE access to usuarios" ON public.usuarios;

-- Política para permitir a todos los usuarios autenticados leer cualquier perfil
-- Esto es necesario para que funcione la consulta en AuthContext.jsx
CREATE POLICY "Permitir lectura a usuarios autenticados" ON public.usuarios
FOR SELECT
TO authenticated
USING (true);

-- Política para permitir a los usuarios actualizar su propio perfil
CREATE POLICY "Permitir actualización del propio perfil" ON public.usuarios
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política para permitir a los administradores insertar nuevos perfiles
CREATE POLICY "Permitir inserción a admins" ON public.usuarios
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.usuarios WHERE rol = 'administrador' OR tipo_usuario = 'Administrador'
  )
  OR
  NOT EXISTS (SELECT 1 FROM public.usuarios WHERE rol = 'administrador' OR tipo_usuario = 'Administrador')
);

-- Política para permitir a los administradores eliminar perfiles
CREATE POLICY "Permitir eliminación a admins" ON public.usuarios
FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.usuarios WHERE rol = 'administrador' OR tipo_usuario = 'Administrador'
  )
);

-- Verificar las políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM 
  pg_policies
WHERE 
  tablename = 'usuarios'
  AND schemaname = 'public';
