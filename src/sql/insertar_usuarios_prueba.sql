-- Script para insertar usuarios de prueba en la tabla usuarios
-- Estos usuarios deben existir previamente en auth.users

-- Función para insertar usuarios de prueba
CREATE OR REPLACE FUNCTION insertar_usuarios_prueba()
RETURNS void AS $$
DECLARE
  admin_id UUID;
  psicologo_id UUID;
  estudiante_id UUID;
BEGIN
  -- Obtener IDs de los usuarios de auth.users
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin.test.bat7@gmail.com';
  SELECT id INTO psicologo_id FROM auth.users WHERE email = 'profesional.test.bat7@gmail.com';
  SELECT id INTO estudiante_id FROM auth.users WHERE email = 'estudiante.test.bat7@gmail.com';
  
  -- Insertar usuario administrador
  IF admin_id IS NOT NULL THEN
    INSERT INTO public.usuarios (id, documento, nombre, apellido, rol)
    VALUES (
      admin_id,
      'ADMIN001',
      'Administrador',
      'Test',
      'administrador'
    )
    ON CONFLICT (id) DO UPDATE SET
      documento = EXCLUDED.documento,
      nombre = EXCLUDED.nombre,
      apellido = EXCLUDED.apellido,
      rol = EXCLUDED.rol,
      updated_at = now();
  END IF;
  
  -- Insertar usuario psicólogo
  IF psicologo_id IS NOT NULL THEN
    INSERT INTO public.usuarios (id, documento, nombre, apellido, rol)
    VALUES (
      psicologo_id,
      'PSICO001',
      'Psicólogo',
      'Test',
      'psicologo'
    )
    ON CONFLICT (id) DO UPDATE SET
      documento = EXCLUDED.documento,
      nombre = EXCLUDED.nombre,
      apellido = EXCLUDED.apellido,
      rol = EXCLUDED.rol,
      updated_at = now();
  END IF;
  
  -- Insertar usuario estudiante
  IF estudiante_id IS NOT NULL THEN
    INSERT INTO public.usuarios (id, documento, nombre, apellido, rol)
    VALUES (
      estudiante_id,
      'ESTUD001',
      'Estudiante',
      'Test',
      'estudiante'
    )
    ON CONFLICT (id) DO UPDATE SET
      documento = EXCLUDED.documento,
      nombre = EXCLUDED.nombre,
      apellido = EXCLUDED.apellido,
      rol = EXCLUDED.rol,
      updated_at = now();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la función
SELECT insertar_usuarios_prueba();

-- Eliminar la función después de usarla
DROP FUNCTION IF EXISTS insertar_usuarios_prueba();
