-- Funciones RPC para Módulos de Administración - BAT-7

-- =====================================================
-- FUNCIÓN: get_user_permissions
-- Obtiene todos los permisos de un usuario basado en su rol
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_permissions(user_id UUID)
RETURNS TABLE (
  permission TEXT,
  resource TEXT,
  description TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Obtener el rol del usuario
  SELECT tipo_usuario INTO user_role
  FROM usuarios
  WHERE id = user_id;
  
  -- Si no se encuentra el usuario, retornar vacío
  IF user_role IS NULL THEN
    RETURN;
  END IF;
  
  -- Retornar permisos del rol
  RETURN QUERY
  SELECT rp.permission, rp.resource, rp.description
  FROM role_permissions rp
  WHERE rp.role = user_role;
END;
$$;

-- =====================================================
-- FUNCIÓN: check_route_access
-- Verifica si un usuario tiene acceso a una ruta específica
-- =====================================================

CREATE OR REPLACE FUNCTION check_route_access(user_id UUID, route_path TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
  required_role TEXT;
  has_access BOOLEAN := FALSE;
BEGIN
  -- Obtener el rol del usuario
  SELECT tipo_usuario INTO user_role
  FROM usuarios
  WHERE id = user_id;
  
  -- Si no se encuentra el usuario, denegar acceso
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Obtener el rol requerido para la ruta
  SELECT rp.required_role INTO required_role
  FROM route_permissions rp
  WHERE rp.route_path = route_path AND rp.is_active = TRUE;
  
  -- Si no hay restricción para la ruta, permitir acceso
  IF required_role IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar si el usuario tiene el rol requerido
  -- Los administradores tienen acceso a todo
  IF user_role = 'Administrador' THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar rol específico
  IF user_role = required_role THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- =====================================================
-- FUNCIÓN: log_user_activity
-- Registra la actividad de un usuario
-- =====================================================

CREATE OR REPLACE FUNCTION log_user_activity(
  user_id UUID,
  session_id TEXT,
  action TEXT,
  resource TEXT DEFAULT NULL,
  resource_id UUID DEFAULT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO user_activity_logs (
    user_id, session_id, action, resource, resource_id,
    details, ip_address, user_agent, success, error_message
  ) VALUES (
    user_id, session_id, action, resource, resource_id,
    details, ip_address, user_agent, success, error_message
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- =====================================================
-- FUNCIÓN: get_usage_statistics
-- Obtiene estadísticas de uso para un rango de fechas
-- =====================================================

CREATE OR REPLACE FUNCTION get_usage_statistics(
  start_date DATE,
  end_date DATE,
  user_type TEXT DEFAULT 'all'
)
RETURNS TABLE (
  date DATE,
  metric_name TEXT,
  metric_value NUMERIC,
  metric_type TEXT,
  user_type TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT us.date, us.metric_name, us.metric_value, us.metric_type, us.user_type, us.metadata
  FROM usage_statistics us
  WHERE us.date BETWEEN start_date AND end_date
    AND (user_type = 'all' OR us.user_type = user_type OR us.user_type = 'all')
  ORDER BY us.date DESC, us.metric_name;
END;
$$;

-- =====================================================
-- FUNCIÓN: assign_patient_to_psychologist
-- Asigna un paciente a un psicólogo
-- =====================================================

CREATE OR REPLACE FUNCTION assign_patient_to_psychologist(
  candidato_id UUID,
  psicologo_id UUID,
  assigned_by UUID,
  notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  assignment_id UUID;
  psicologo_role TEXT;
BEGIN
  -- Verificar que el psicólogo tenga el rol correcto y esté activo
  SELECT tipo_usuario INTO psicologo_role
  FROM usuarios
  WHERE id = psicologo_id AND activo = true;
  
  IF psicologo_role IS NULL THEN
    RAISE EXCEPTION 'Cannot assign patient to inactive or non-existent psychologist' USING ERRCODE = 'P0001';
  END IF;
  
  IF psicologo_role != 'Psicólogo' THEN
    RAISE EXCEPTION 'El usuario especificado no es un psicólogo';
  END IF;
  
  -- Desactivar asignaciones previas del candidato
  UPDATE patient_assignments
  SET is_active = FALSE, unassigned_at = NOW()
  WHERE candidato_id = candidato_id AND is_active = TRUE;
  
  -- Crear nueva asignación
  INSERT INTO patient_assignments (candidato_id, psicologo_id, assigned_by, notes)
  VALUES (candidato_id, psicologo_id, assigned_by, notes)
  RETURNING id INTO assignment_id;
  
  -- Actualizar la tabla candidatos con la nueva asignación
  UPDATE candidatos
  SET psicologo_id = psicologo_id, fecha_actualizacion = NOW()
  WHERE id = candidato_id;
  
  -- Registrar la actividad
  PERFORM log_user_activity(
    assigned_by,
    NULL,
    'assign_patient',
    'patient_assignments',
    assignment_id,
    jsonb_build_object('candidato_id', candidato_id, 'psicologo_id', psicologo_id)
  );
  
  RETURN assignment_id;
END;
$$;

-- =====================================================
-- FUNCIÓN: unassign_patient
-- Desasigna un paciente de un psicólogo
-- =====================================================

CREATE OR REPLACE FUNCTION unassign_patient(
  candidato_id UUID,
  unassigned_by UUID,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Desactivar asignación activa
  UPDATE patient_assignments
  SET is_active = FALSE, unassigned_at = NOW()
  WHERE candidato_id = candidato_id AND is_active = TRUE;
  
  -- Limpiar asignación en tabla candidatos
  UPDATE candidatos
  SET psicologo_id = NULL, fecha_actualizacion = NOW()
  WHERE id = candidato_id;
  
  -- Registrar la actividad
  PERFORM log_user_activity(
    unassigned_by,
    NULL,
    'unassign_patient',
    'patient_assignments',
    candidato_id,
    jsonb_build_object('candidato_id', candidato_id, 'reason', reason)
  );
  
  RETURN TRUE;
END;
$$;

-- =====================================================
-- FUNCIÓN: get_user_assignments
-- Obtiene las asignaciones de pacientes para un psicólogo
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_assignments(psicologo_id UUID)
RETURNS TABLE (
  assignment_id UUID,
  candidato_id UUID,
  candidato_nombre TEXT,
  candidato_apellidos TEXT,
  candidato_documento TEXT,
  assigned_at TIMESTAMPTZ,
  notes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.id,
    c.id,
    c.nombre,
    c.apellidos,
    c.documento_identidad,
    pa.assigned_at,
    pa.notes
  FROM patient_assignments pa
  JOIN candidatos c ON pa.candidato_id = c.id
  WHERE pa.psicologo_id = psicologo_id AND pa.is_active = TRUE
  ORDER BY pa.assigned_at DESC;
END;
$$;

-- =====================================================
-- FUNCIÓN: update_usage_statistics
-- Actualiza o crea estadísticas de uso diarias
-- =====================================================

CREATE OR REPLACE FUNCTION update_usage_statistics(
  metric_name TEXT,
  metric_value NUMERIC,
  metric_type TEXT DEFAULT 'count',
  user_type TEXT DEFAULT 'all',
  target_date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO usage_statistics (date, metric_name, metric_value, metric_type, user_type, metadata)
  VALUES (target_date, metric_name, metric_value, metric_type, user_type, metadata)
  ON CONFLICT (date, metric_name, user_type)
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    metric_type = EXCLUDED.metric_type,
    metadata = EXCLUDED.metadata;
  
  RETURN TRUE;
END;
$$;
