-- Script para listar todos los usuarios del sistema
-- Este script muestra información de auth.users y public.usuarios

-- Listar usuarios de auth.users
SELECT 
  id, 
  email, 
  confirmed_at,
  created_at,
  last_sign_in_at,
  raw_user_meta_data
FROM 
  auth.users
ORDER BY 
  created_at DESC;

-- Listar usuarios de public.usuarios
SELECT 
  id, 
  tipo_usuario, 
  documento, 
  fecha_creacion, 
  ultimo_acceso, 
  activo
FROM 
  public.usuarios
ORDER BY 
  fecha_creacion DESC;

-- Listar información combinada de ambas tablas
SELECT 
  au.id, 
  au.email, 
  u.documento, 
  u.tipo_usuario, 
  au.raw_user_meta_data,
  u.activo,
  au.created_at,
  u.fecha_creacion,
  au.last_sign_in_at,
  u.ultimo_acceso
FROM 
  auth.users au
  JOIN public.usuarios u ON au.id = u.id
ORDER BY 
  au.created_at DESC;
