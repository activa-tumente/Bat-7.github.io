-- Funciones para saltarse las restricciones de RLS en Supabase
-- Estas funciones deben ejecutarse en la consola SQL de Supabase

-- Función para crear instituciones
CREATE OR REPLACE FUNCTION admin_create_institution(institution JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Esto hace que la función se ejecute con los permisos del creador
AS $$
DECLARE
  new_institution JSONB;
BEGIN
  INSERT INTO instituciones (nombre, direccion, telefono, created_at, updated_at)
  VALUES (
    institution->>'nombre',
    institution->>'direccion',
    institution->>'telefono',
    COALESCE((institution->>'created_at')::TIMESTAMP WITH TIME ZONE, NOW()),
    COALESCE((institution->>'updated_at')::TIMESTAMP WITH TIME ZONE, NOW())
  )
  RETURNING to_jsonb(instituciones.*) INTO new_institution;
  
  RETURN new_institution;
END;
$$;

-- Función para actualizar instituciones
CREATE OR REPLACE FUNCTION admin_update_institution(institution JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_institution JSONB;
BEGIN
  UPDATE instituciones
  SET 
    nombre = institution->>'nombre',
    direccion = institution->>'direccion',
    telefono = institution->>'telefono',
    updated_at = COALESCE((institution->>'updated_at')::TIMESTAMP WITH TIME ZONE, NOW())
  WHERE id = (institution->>'id')::UUID
  RETURNING to_jsonb(instituciones.*) INTO updated_institution;
  
  RETURN updated_institution;
END;
$$;

-- Función para eliminar instituciones
CREATE OR REPLACE FUNCTION admin_delete_institution(id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_institution JSONB;
BEGIN
  DELETE FROM instituciones
  WHERE instituciones.id = admin_delete_institution.id
  RETURNING to_jsonb(instituciones.*) INTO deleted_institution;
  
  RETURN deleted_institution;
END;
$$;

-- Función para obtener todas las instituciones
CREATE OR REPLACE FUNCTION admin_get_institutions()
RETURNS SETOF instituciones
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM instituciones;
$$;

-- Función para crear psicólogos
CREATE OR REPLACE FUNCTION admin_create_psychologist(psychologist JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_psychologist JSONB;
BEGIN
  INSERT INTO psicologos (
    profile_id,
    nombre,
    apellidos,
    email,
    documento_identidad,
    telefono,
    institucion_id,
    created_at,
    updated_at
  )
  VALUES (
    (psychologist->>'profile_id')::UUID,
    psychologist->>'nombre',
    psychologist->>'apellidos',
    psychologist->>'email',
    psychologist->>'documento_identidad',
    psychologist->>'telefono',
    (psychologist->>'institucion_id')::UUID,
    COALESCE((psychologist->>'created_at')::TIMESTAMP WITH TIME ZONE, NOW()),
    COALESCE((psychologist->>'updated_at')::TIMESTAMP WITH TIME ZONE, NOW())
  )
  RETURNING to_jsonb(psicologos.*) INTO new_psychologist;
  
  RETURN new_psychologist;
END;
$$;

-- Función para actualizar psicólogos
CREATE OR REPLACE FUNCTION admin_update_psychologist(psychologist JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_psychologist JSONB;
BEGIN
  UPDATE psicologos
  SET 
    nombre = psychologist->>'nombre',
    apellidos = psychologist->>'apellidos',
    email = psychologist->>'email',
    documento_identidad = psychologist->>'documento_identidad',
    telefono = psychologist->>'telefono',
    institucion_id = (psychologist->>'institucion_id')::UUID,
    updated_at = COALESCE((psychologist->>'updated_at')::TIMESTAMP WITH TIME ZONE, NOW())
  WHERE id = (psychologist->>'id')::UUID
  RETURNING to_jsonb(psicologos.*) INTO updated_psychologist;
  
  RETURN updated_psychologist;
END;
$$;

-- Función para eliminar psicólogos
CREATE OR REPLACE FUNCTION admin_delete_psychologist(id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_psychologist JSONB;
BEGIN
  DELETE FROM psicologos
  WHERE psicologos.id = admin_delete_psychologist.id
  RETURNING to_jsonb(psicologos.*) INTO deleted_psychologist;
  
  RETURN deleted_psychologist;
END;
$$;

-- Función para crear pacientes
CREATE OR REPLACE FUNCTION admin_create_patient(patient JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_patient JSONB;
BEGIN
  INSERT INTO pacientes (
    nombre,
    fecha_nacimiento,
    genero,
    notas,
    edad,
    institucion_id,
    created_at,
    updated_at
  )
  VALUES (
    patient->>'nombre',
    (patient->>'fecha_nacimiento')::DATE,
    (patient->>'genero')::genero_tipo,
    patient->>'notas',
    (patient->>'edad')::INTEGER,
    (patient->>'institucion_id')::UUID,
    COALESCE((patient->>'created_at')::TIMESTAMP WITH TIME ZONE, NOW()),
    COALESCE((patient->>'updated_at')::TIMESTAMP WITH TIME ZONE, NOW())
  )
  RETURNING to_jsonb(pacientes.*) INTO new_patient;
  
  RETURN new_patient;
END;
$$;

-- Función para actualizar pacientes
CREATE OR REPLACE FUNCTION admin_update_patient(patient JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_patient JSONB;
BEGIN
  UPDATE pacientes
  SET 
    nombre = patient->>'nombre',
    fecha_nacimiento = (patient->>'fecha_nacimiento')::DATE,
    genero = (patient->>'genero')::genero_tipo,
    notas = patient->>'notas',
    edad = (patient->>'edad')::INTEGER,
    institucion_id = (patient->>'institucion_id')::UUID,
    updated_at = COALESCE((patient->>'updated_at')::TIMESTAMP WITH TIME ZONE, NOW())
  WHERE id = (patient->>'id')::UUID
  RETURNING to_jsonb(pacientes.*) INTO updated_patient;
  
  RETURN updated_patient;
END;
$$;

-- Función para eliminar pacientes
CREATE OR REPLACE FUNCTION admin_delete_patient(id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_patient JSONB;
BEGIN
  DELETE FROM pacientes
  WHERE pacientes.id = admin_delete_patient.id
  RETURNING to_jsonb(pacientes.*) INTO deleted_patient;
  
  RETURN deleted_patient;
END;
$$;

-- Otorgar permisos para ejecutar estas funciones a usuarios autenticados
GRANT EXECUTE ON FUNCTION admin_create_institution TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_institution TO authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_institution TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_institutions TO authenticated;
GRANT EXECUTE ON FUNCTION admin_create_psychologist TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_psychologist TO authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_psychologist TO authenticated;
GRANT EXECUTE ON FUNCTION admin_create_patient TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_patient TO authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_patient TO authenticated;
