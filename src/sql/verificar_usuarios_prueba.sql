-- Script para verificar los usuarios de prueba
-- Este script muestra información de los usuarios de prueba y verifica si tienen documento asignado

-- Verificar usuarios de prueba
SELECT 
  au.id, 
  au.email, 
  u.documento, 
  u.tipo_usuario, 
  au.raw_user_meta_data,
  u.activo
FROM 
  auth.users au
  JOIN public.usuarios u ON au.id = u.id
WHERE 
  au.email IN (
    'admin.test.bat7@gmail.com',
    'profesional.test.bat7@gmail.com',
    'estudiante.test.bat7@gmail.com'
  )
ORDER BY 
  au.email;

-- Verificar usuarios sin documento asignado
SELECT 
  au.id, 
  au.email, 
  u.tipo_usuario, 
  u.activo
FROM 
  auth.users au
  JOIN public.usuarios u ON au.id = u.id
WHERE 
  u.documento IS NULL OR u.documento = ''
ORDER BY 
  au.email;

-- Actualizar documentos de usuarios de prueba si no están asignados
UPDATE public.usuarios
SET documento = 'ADMIN001'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin.test.bat7@gmail.com'
)
AND (documento IS NULL OR documento = '');

UPDATE public.usuarios
SET documento = 'PSICO001'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'profesional.test.bat7@gmail.com'
)
AND (documento IS NULL OR documento = '');

UPDATE public.usuarios
SET documento = 'ESTUD001'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'estudiante.test.bat7@gmail.com'
)
AND (documento IS NULL OR documento = '');

-- Verificar usuarios de prueba después de la actualización
SELECT 
  au.id, 
  au.email, 
  u.documento, 
  u.tipo_usuario, 
  u.activo
FROM 
  auth.users au
  JOIN public.usuarios u ON au.id = u.id
WHERE 
  au.email IN (
    'admin.test.bat7@gmail.com',
    'profesional.test.bat7@gmail.com',
    'estudiante.test.bat7@gmail.com'
  )
ORDER BY 
  au.email;
