-- Script para actualizar los documentos de los usuarios de prueba
-- Este script asigna documentos a los usuarios de prueba para que puedan iniciar sesión con documento

-- Actualizar el documento del usuario administrador
UPDATE public.usuarios
SET documento = 'ADMIN001'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin.test.bat7@gmail.com'
)
AND (documento IS NULL OR documento = '');

-- Actualizar el documento del usuario profesional/psicólogo
UPDATE public.usuarios
SET documento = 'PSICO001'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'profesional.test.bat7@gmail.com'
)
AND (documento IS NULL OR documento = '');

-- Actualizar el documento del usuario estudiante
UPDATE public.usuarios
SET documento = 'ESTUD001'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'estudiante.test.bat7@gmail.com'
)
AND (documento IS NULL OR documento = '');

-- Verificar los documentos actualizados
SELECT 
  u.id, 
  u.documento, 
  u.nombre, 
  u.apellido, 
  u.rol, 
  u.tipo_usuario, 
  au.email
FROM 
  public.usuarios u
  JOIN auth.users au ON u.id = au.id
WHERE 
  au.email IN (
    'admin.test.bat7@gmail.com',
    'profesional.test.bat7@gmail.com',
    'estudiante.test.bat7@gmail.com'
  );
