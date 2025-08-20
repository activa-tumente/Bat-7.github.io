-- Script completo para Módulos de Administración - BAT-7
-- Ejecutar este script en Supabase para crear todas las tablas y funciones necesarias

-- =====================================================
-- PASO 1: CREAR TABLAS
-- =====================================================

-- Ejecutar el esquema de módulos de administración
\i admin_modules_schema.sql

-- =====================================================
-- PASO 2: CREAR FUNCIONES RPC
-- =====================================================

-- Ejecutar las funciones RPC
\i admin_modules_functions.sql

-- =====================================================
-- PASO 3: CONFIGURAR POLÍTICAS RLS
-- =====================================================

-- Ejecutar las políticas de seguridad
\i admin_modules_rls.sql

-- =====================================================
-- PASO 4: DATOS ADICIONALES DE CONFIGURACIÓN
-- =====================================================

-- Insertar configuraciones adicionales de rutas
INSERT INTO route_permissions (route_path, required_permission, required_role, description) VALUES
('/configuracion/usuarios', 'read', 'Administrador', 'Gestión de usuarios en configuración'),
('/configuracion/permisos', 'read', 'Administrador', 'Gestión de permisos en configuración'),
('/configuracion/asignaciones', 'read', 'Administrador', 'Gestión de asignaciones en configuración'),
('/configuracion/uso', 'read', 'Administrador', 'Estadísticas de uso en configuración'),
('/configuracion/reportes', 'read', 'Administrador', 'Reportes del sistema en configuración')
ON CONFLICT (route_path) DO NOTHING;

-- Insertar métricas iniciales de uso
INSERT INTO usage_statistics (date, metric_name, metric_value, metric_type, user_type, metadata) VALUES
(CURRENT_DATE, 'daily_logins', 0, 'count', 'all', '{"description": "Logins diarios totales"}'),
(CURRENT_DATE, 'daily_logins', 0, 'count', 'Administrador', '{"description": "Logins diarios de administradores"}'),
(CURRENT_DATE, 'daily_logins', 0, 'count', 'Psicólogo', '{"description": "Logins diarios de psicólogos"}'),
(CURRENT_DATE, 'daily_logins', 0, 'count', 'Candidato', '{"description": "Logins diarios de candidatos"}'),
(CURRENT_DATE, 'active_users', 0, 'count', 'all', '{"description": "Usuarios activos"}'),
(CURRENT_DATE, 'evaluations_completed', 0, 'count', 'all', '{"description": "Evaluaciones completadas"}'),
(CURRENT_DATE, 'avg_session_duration', 0, 'average', 'all', '{"description": "Duración promedio de sesión en segundos"}')
ON CONFLICT (date, metric_name, user_type) DO NOTHING;

-- =====================================================
-- PASO 5: FUNCIONES ADICIONALES PARA REPORTES
-- =====================================================

-- Función para obtener resumen de actividad diaria
CREATE OR REPLACE FUNCTION get_daily_activity_summary(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  total_logins INTEGER,
  unique_users INTEGER,
  evaluations_completed INTEGER,
  avg_session_duration NUMERIC,
  most_active_hour INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH login_stats AS (
    SELECT 
      COUNT(*) as total_logins,
      COUNT(DISTINCT user_id) as unique_users,
      EXTRACT(HOUR FROM login_time) as hour
    FROM session_logs
    WHERE DATE(login_time) = target_date
    GROUP BY EXTRACT(HOUR FROM login_time)
  ),
  evaluation_stats AS (
    SELECT COUNT(*) as evaluations_completed
    FROM evaluaciones
    WHERE DATE(fecha_evaluacion) = target_date
      AND estado = 'Completada'
  ),
  session_duration AS (
    SELECT AVG(duration_seconds) as avg_duration
    FROM session_logs
    WHERE DATE(login_time) = target_date
      AND duration_seconds IS NOT NULL
  )
  SELECT 
    COALESCE((SELECT SUM(total_logins) FROM login_stats), 0)::INTEGER,
    COALESCE((SELECT MAX(unique_users) FROM login_stats), 0)::INTEGER,
    COALESCE((SELECT evaluations_completed FROM evaluation_stats), 0)::INTEGER,
    COALESCE((SELECT avg_duration FROM session_duration), 0)::NUMERIC,
    COALESCE((SELECT hour FROM login_stats ORDER BY total_logins DESC LIMIT 1), 0)::INTEGER;
END;
$$;

-- Función para obtener estadísticas de usuarios por institución
CREATE OR REPLACE FUNCTION get_institution_user_stats()
RETURNS TABLE (
  institucion_id UUID,
  institucion_nombre TEXT,
  total_usuarios INTEGER,
  psicologos INTEGER,
  candidatos INTEGER,
  usuarios_activos INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.nombre,
    COUNT(u.id)::INTEGER as total_usuarios,
    COUNT(CASE WHEN u.tipo_usuario = 'Psicólogo' THEN 1 END)::INTEGER as psicologos,
    COUNT(c.id)::INTEGER as candidatos,
    COUNT(CASE WHEN u.activo = true THEN 1 END)::INTEGER as usuarios_activos
  FROM instituciones i
  LEFT JOIN usuarios u ON i.id = u.institucion_id
  LEFT JOIN candidatos c ON i.id = c.institucion_id
  WHERE i.activo = true
  GROUP BY i.id, i.nombre
  ORDER BY total_usuarios DESC;
END;
$$;

-- Función para limpiar logs antiguos (mantenimiento)
CREATE OR REPLACE FUNCTION cleanup_old_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Eliminar logs de actividad antiguos
  DELETE FROM user_activity_logs
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Eliminar logs de sesión antiguos (mantener solo los cerrados)
  DELETE FROM session_logs
  WHERE login_time < NOW() - INTERVAL '1 day' * days_to_keep
    AND is_active = false;
  
  -- Actualizar estadística de limpieza
  INSERT INTO usage_statistics (date, metric_name, metric_value, metric_type, user_type, metadata)
  VALUES (
    CURRENT_DATE,
    'logs_cleaned',
    deleted_count,
    'count',
    'all',
    jsonb_build_object('days_kept', days_to_keep, 'cleanup_date', NOW())
  )
  ON CONFLICT (date, metric_name, user_type)
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    metadata = EXCLUDED.metadata;
  
  RETURN deleted_count;
END;
$$;

-- =====================================================
-- PASO 6: TRIGGERS PARA AUTOMATIZACIÓN
-- =====================================================

-- Trigger para actualizar estadísticas automáticamente cuando se crea una sesión
CREATE OR REPLACE FUNCTION update_login_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar estadística de logins diarios
  INSERT INTO usage_statistics (date, metric_name, metric_value, metric_type, user_type)
  VALUES (
    DATE(NEW.login_time),
    'daily_logins',
    1,
    'count',
    'all'
  )
  ON CONFLICT (date, metric_name, user_type)
  DO UPDATE SET metric_value = usage_statistics.metric_value + 1;
  
  -- Actualizar estadística por tipo de usuario
  INSERT INTO usage_statistics (date, metric_name, metric_value, metric_type, user_type)
  SELECT 
    DATE(NEW.login_time),
    'daily_logins',
    1,
    'count',
    u.tipo_usuario
  FROM usuarios u
  WHERE u.id = NEW.user_id
  ON CONFLICT (date, metric_name, user_type)
  DO UPDATE SET metric_value = usage_statistics.metric_value + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_login_statistics
  AFTER INSERT ON session_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_login_statistics();

-- Trigger para actualizar estadísticas cuando se completa una evaluación
CREATE OR REPLACE FUNCTION update_evaluation_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizar si el estado cambió a 'Completada'
  IF NEW.estado = 'Completada' AND (OLD.estado IS NULL OR OLD.estado != 'Completada') THEN
    INSERT INTO usage_statistics (date, metric_name, metric_value, metric_type, user_type)
    VALUES (
      DATE(NEW.fecha_finalizacion),
      'evaluations_completed',
      1,
      'count',
      'all'
    )
    ON CONFLICT (date, metric_name, user_type)
    DO UPDATE SET metric_value = usage_statistics.metric_value + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_evaluation_statistics
  AFTER UPDATE ON evaluaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_evaluation_statistics();

-- =====================================================
-- PASO 7: GRANTS FINALES
-- =====================================================

-- Permitir ejecución de las nuevas funciones
GRANT EXECUTE ON FUNCTION get_daily_activity_summary(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_institution_user_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_logs(INTEGER) TO authenticated;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las tablas se crearon correctamente
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'role_permissions',
      'route_permissions', 
      'user_activity_logs',
      'usage_statistics',
      'session_logs',
      'patient_assignments'
    );
  
  IF table_count = 6 THEN
    RAISE NOTICE 'SUCCESS: Todas las tablas de módulos de administración se crearon correctamente';
  ELSE
    RAISE NOTICE 'WARNING: Solo se crearon % de 6 tablas esperadas', table_count;
  END IF;
END $$;
