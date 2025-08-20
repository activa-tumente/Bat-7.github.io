-- Políticas RLS para Módulos de Administración - BAT-7

-- =====================================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_assignments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA ROLE_PERMISSIONS
-- =====================================================

-- Solo administradores pueden ver y gestionar permisos de roles
CREATE POLICY "Administradores pueden ver permisos de roles" ON role_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
    )
  );

CREATE POLICY "Administradores pueden insertar permisos de roles" ON role_permissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
    )
  );

CREATE POLICY "Administradores pueden actualizar permisos de roles" ON role_permissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
    )
  );

CREATE POLICY "Administradores pueden eliminar permisos de roles" ON role_permissions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
    )
  );

-- =====================================================
-- POLÍTICAS PARA ROUTE_PERMISSIONS
-- =====================================================

-- Solo administradores pueden gestionar permisos de rutas
CREATE POLICY "Administradores pueden ver permisos de rutas" ON route_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
    )
  );

CREATE POLICY "Administradores pueden insertar permisos de rutas" ON route_permissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
    )
  );

CREATE POLICY "Administradores pueden actualizar permisos de rutas" ON route_permissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
    )
  );

CREATE POLICY "Administradores pueden eliminar permisos de rutas" ON route_permissions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
    )
  );

-- =====================================================
-- POLÍTICAS PARA USER_ACTIVITY_LOGS
-- =====================================================

-- Los usuarios pueden ver sus propios logs, los administradores pueden ver todos
CREATE POLICY "Usuarios pueden ver sus propios logs" ON user_activity_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
    )
  );

-- Solo el sistema puede insertar logs (a través de funciones RPC)
CREATE POLICY "Sistema puede insertar logs" ON user_activity_logs
  FOR INSERT WITH CHECK (true);

-- Solo administradores pueden eliminar logs (para limpieza)
CREATE POLICY "Administradores pueden eliminar logs" ON user_activity_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
    )
  );

-- =====================================================
-- POLÍTICAS PARA USAGE_STATISTICS
-- =====================================================

-- Solo administradores pueden ver estadísticas de uso
CREATE POLICY "Administradores pueden ver estadísticas" ON usage_statistics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
    )
  );

-- Solo el sistema puede insertar/actualizar estadísticas
CREATE POLICY "Sistema puede gestionar estadísticas" ON usage_statistics
  FOR ALL WITH CHECK (true);

-- =====================================================
-- POLÍTICAS PARA SESSION_LOGS
-- =====================================================

-- Los usuarios pueden ver sus propias sesiones, los administradores pueden ver todas
CREATE POLICY "Usuarios pueden ver sus propias sesiones" ON session_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
    )
  );

-- Solo el sistema puede gestionar logs de sesión
CREATE POLICY "Sistema puede gestionar logs de sesión" ON session_logs
  FOR ALL WITH CHECK (true);

-- =====================================================
-- POLÍTICAS PARA PATIENT_ASSIGNMENTS
-- =====================================================

-- Los psicólogos pueden ver sus asignaciones, los administradores pueden ver todas
CREATE POLICY "Psicólogos pueden ver sus asignaciones" ON patient_assignments
  FOR SELECT USING (
    psicologo_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
    )
  );

-- Solo administradores pueden crear asignaciones
CREATE POLICY "Administradores pueden crear asignaciones" ON patient_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
    )
  );

-- Solo administradores pueden actualizar asignaciones
CREATE POLICY "Administradores pueden actualizar asignaciones" ON patient_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
    )
  );

-- Solo administradores pueden eliminar asignaciones
CREATE POLICY "Administradores pueden eliminar asignaciones" ON patient_assignments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
    )
  );

-- =====================================================
-- FUNCIÓN HELPER PARA VERIFICAR PERMISOS
-- =====================================================

CREATE OR REPLACE FUNCTION auth.user_has_permission(permission_name TEXT, resource_name TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Obtener el rol del usuario actual
  SELECT tipo_usuario INTO user_role
  FROM usuarios
  WHERE id = auth.uid();
  
  -- Si no hay usuario autenticado, denegar
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Los administradores tienen todos los permisos
  IF user_role = 'Administrador' THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar permiso específico
  RETURN EXISTS (
    SELECT 1 FROM role_permissions
    WHERE role = user_role 
      AND permission = permission_name
      AND (resource_name IS NULL OR resource = resource_name)
  );
END;
$$;

-- =====================================================
-- TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para tablas que tienen updated_at
CREATE TRIGGER update_role_permissions_updated_at 
  BEFORE UPDATE ON role_permissions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_permissions_updated_at 
  BEFORE UPDATE ON route_permissions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANTS PARA FUNCIONES RPC
-- =====================================================

-- Permitir que usuarios autenticados ejecuten las funciones RPC
GRANT EXECUTE ON FUNCTION get_user_permissions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_route_access(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION log_user_activity(UUID, TEXT, TEXT, TEXT, UUID, JSONB, INET, TEXT, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_usage_statistics(DATE, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_patient_to_psychologist(UUID, UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION unassign_patient(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_assignments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_usage_statistics(TEXT, NUMERIC, TEXT, TEXT, DATE, JSONB) TO authenticated;

-- Permitir acceso a la función helper de permisos
GRANT EXECUTE ON FUNCTION auth.user_has_permission(TEXT, TEXT) TO authenticated;
