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
  INSERT INTO instituciones (
    nombre, 
    direccion, 
    telefono, 
    created_by, 
    created_at, 
    updated_at
  )
  VALUES (
    institution->>'nombre', 
    institution->>'direccion', 
    institution->>'telefono', 
    auth.uid(), 
    COALESCE((institution->>'created_at')::TIMESTAMP, NOW()), 
    COALESCE((institution->>'updated_at')::TIMESTAMP, NOW())
  )
  RETURNING to_jsonb(*) INTO new_institution;
  
  RETURN new_institution;
END;
$$;

-- Función para actualizar instituciones
CREATE OR REPLACE FUNCTION admin_update_institution(institution_id UUID, institution JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_institution JSONB;
BEGIN
  UPDATE instituciones
  SET 
    nombre = COALESCE(institution->>'nombre', nombre),
    direccion = COALESCE(institution->>'direccion', direccion),
    telefono = COALESCE(institution->>'telefono', telefono),
    updated_at = NOW()
  WHERE id = institution_id
  RETURNING to_jsonb(*) INTO updated_institution;
  
  RETURN updated_institution;
END;
$$;

-- Función para eliminar instituciones
CREATE OR REPLACE FUNCTION admin_delete_institution(institution_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  success BOOLEAN;
BEGIN
  DELETE FROM instituciones
  WHERE id = institution_id;
  
  GET DIAGNOSTICS success = ROW_COUNT;
  
  RETURN success > 0;
END;
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
    nombre, 
    apellido, 
    email, 
    telefono, 
    institucion_id, 
    usuario_id, 
    especialidad, 
    created_by, 
    created_at, 
    updated_at
  )
  VALUES (
    psychologist->>'nombre', 
    psychologist->>'apellido', 
    psychologist->>'email', 
    psychologist->>'telefono', 
    (psychologist->>'institucion_id')::UUID, 
    (psychologist->>'usuario_id')::UUID, 
    psychologist->>'especialidad', 
    auth.uid(), 
    COALESCE((psychologist->>'created_at')::TIMESTAMP, NOW()), 
    COALESCE((psychologist->>'updated_at')::TIMESTAMP, NOW())
  )
  RETURNING to_jsonb(*) INTO new_psychologist;
  
  RETURN new_psychologist;
END;
$$;

-- Función para actualizar psicólogos
CREATE OR REPLACE FUNCTION admin_update_psychologist(psychologist_id UUID, psychologist JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_psychologist JSONB;
BEGIN
  UPDATE psicologos
  SET 
    nombre = COALESCE(psychologist->>'nombre', nombre),
    apellido = COALESCE(psychologist->>'apellido', apellido),
    email = COALESCE(psychologist->>'email', email),
    telefono = COALESCE(psychologist->>'telefono', telefono),
    institucion_id = COALESCE((psychologist->>'institucion_id')::UUID, institucion_id),
    especialidad = COALESCE(psychologist->>'especialidad', especialidad),
    updated_at = NOW()
  WHERE id = psychologist_id
  RETURNING to_jsonb(*) INTO updated_psychologist;
  
  RETURN updated_psychologist;
END;
$$;

-- Función para eliminar psicólogos
CREATE OR REPLACE FUNCTION admin_delete_psychologist(psychologist_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  success BOOLEAN;
BEGIN
  DELETE FROM psicologos
  WHERE id = psychologist_id;
  
  GET DIAGNOSTICS success = ROW_COUNT;
  
  RETURN success > 0;
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
    apellido, 
    fecha_nacimiento, 
    genero, 
    email, 
    telefono, 
    direccion, 
    institucion_id, 
    psicologo_id, 
    notas, 
    creado_por, 
    created_at, 
    updated_at
  )
  VALUES (
    patient->>'nombre', 
    patient->>'apellido', 
    (patient->>'fecha_nacimiento')::DATE, 
    patient->>'genero', 
    patient->>'email', 
    patient->>'telefono', 
    patient->>'direccion', 
    (patient->>'institucion_id')::UUID, 
    (patient->>'psicologo_id')::UUID, 
    patient->>'notas', 
    auth.uid(), 
    COALESCE((patient->>'created_at')::TIMESTAMP, NOW()), 
    COALESCE((patient->>'updated_at')::TIMESTAMP, NOW())
  )
  RETURNING to_jsonb(*) INTO new_patient;
  
  RETURN new_patient;
END;
$$;

-- Función para actualizar pacientes
CREATE OR REPLACE FUNCTION admin_update_patient(patient_id UUID, patient JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_patient JSONB;
BEGIN
  UPDATE pacientes
  SET 
    nombre = COALESCE(patient->>'nombre', nombre),
    apellido = COALESCE(patient->>'apellido', apellido),
    fecha_nacimiento = COALESCE((patient->>'fecha_nacimiento')::DATE, fecha_nacimiento),
    genero = COALESCE(patient->>'genero', genero),
    email = COALESCE(patient->>'email', email),
    telefono = COALESCE(patient->>'telefono', telefono),
    direccion = COALESCE(patient->>'direccion', direccion),
    institucion_id = COALESCE((patient->>'institucion_id')::UUID, institucion_id),
    psicologo_id = COALESCE((patient->>'psicologo_id')::UUID, psicologo_id),
    notas = COALESCE(patient->>'notas', notas),
    updated_at = NOW()
  WHERE id = patient_id
  RETURNING to_jsonb(*) INTO updated_patient;
  
  RETURN updated_patient;
END;
$$;

-- Función para eliminar pacientes
CREATE OR REPLACE FUNCTION admin_delete_patient(patient_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  success BOOLEAN;
BEGIN
  DELETE FROM pacientes
  WHERE id = patient_id;
  
  GET DIAGNOSTICS success = ROW_COUNT;
  
  RETURN success > 0;
END;
$$;

-- Políticas de RLS para instituciones
CREATE POLICY "Permitir lectura de instituciones a todos los usuarios autenticados"
ON instituciones
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserción de instituciones a administradores"
ON instituciones
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = auth.users.id
    AND auth.users.raw_app_meta_data->>'role' = 'administrador'
  )
);

CREATE POLICY "Permitir actualización de instituciones a administradores"
ON instituciones
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = auth.users.id
    AND auth.users.raw_app_meta_data->>'role' = 'administrador'
  )
);

CREATE POLICY "Permitir eliminación de instituciones a administradores"
ON instituciones
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = auth.users.id
    AND auth.users.raw_app_meta_data->>'role' = 'administrador'
  )
);

-- Políticas de RLS para psicólogos
CREATE POLICY "Permitir lectura de psicólogos a todos los usuarios autenticados"
ON psicologos
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserción de psicólogos a administradores"
ON psicologos
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = auth.users.id
    AND auth.users.raw_app_meta_data->>'role' = 'administrador'
  )
);

CREATE POLICY "Permitir actualización de psicólogos a administradores"
ON psicologos
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = auth.users.id
    AND auth.users.raw_app_meta_data->>'role' = 'administrador'
  )
);

CREATE POLICY "Permitir eliminación de psicólogos a administradores"
ON psicologos
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = auth.users.id
    AND auth.users.raw_app_meta_data->>'role' = 'administrador'
  )
);

-- Políticas de RLS para pacientes
CREATE POLICY "Permitir lectura de pacientes a todos los usuarios autenticados"
ON pacientes
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserción de pacientes a administradores y psicólogos"
ON pacientes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = auth.users.id
    AND (
      auth.users.raw_app_meta_data->>'role' = 'administrador'
      OR auth.users.raw_app_meta_data->>'role' = 'psicologo'
    )
  )
);

CREATE POLICY "Permitir actualización de pacientes a administradores y psicólogos asignados"
ON pacientes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = auth.users.id
    AND (
      auth.users.raw_app_meta_data->>'role' = 'administrador'
      OR (
        auth.users.raw_app_meta_data->>'role' = 'psicologo'
        AND EXISTS (
          SELECT 1 FROM psicologos
          WHERE psicologos.usuario_id = auth.uid()
          AND psicologos.id = pacientes.psicologo_id
        )
      )
    )
  )
);

CREATE POLICY "Permitir eliminación de pacientes a administradores"
ON pacientes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = auth.users.id
    AND auth.users.raw_app_meta_data->>'role' = 'administrador'
  )
);
