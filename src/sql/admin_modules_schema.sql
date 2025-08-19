-- Esquema para Módulos de Administración - BAT-7
-- Tablas adicionales para Control de Acceso, Asignaciones y Control de Uso

-- =====================================================
-- TABLA ROLE_PERMISSIONS - Control de Acceso por Roles
-- =====================================================

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL CHECK (role IN ('Administrador', 'Psicólogo', 'Candidato')),
  permission TEXT NOT NULL,
  resource TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índice único para evitar permisos duplicados
  UNIQUE(role, permission, resource)
);

-- =====================================================
-- TABLA ROUTE_PERMISSIONS - Permisos de Rutas
-- =====================================================

CREATE TABLE IF NOT EXISTS public.route_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_path TEXT NOT NULL UNIQUE,
  required_permission TEXT NOT NULL,
  required_role TEXT CHECK (required_role IN ('Administrador', 'Psicólogo', 'Candidato')),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA USER_ACTIVITY_LOGS - Registro de Actividad
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  session_id TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA USAGE_STATISTICS - Estadísticas de Uso
-- =====================================================

CREATE TABLE IF NOT EXISTS public.usage_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  metric_type TEXT CHECK (metric_type IN ('count', 'duration', 'percentage', 'average')),
  user_type TEXT CHECK (user_type IN ('Administrador', 'Psicólogo', 'Candidato', 'all')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índice único para evitar duplicados por día/métrica
  UNIQUE(date, metric_name, user_type)
);

-- =====================================================
-- TABLA SESSION_LOGS - Registro de Sesiones
-- =====================================================

CREATE TABLE IF NOT EXISTS public.session_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  login_time TIMESTAMPTZ DEFAULT NOW(),
  logout_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  logout_reason TEXT CHECK (logout_reason IN ('manual', 'timeout', 'forced', 'error'))
);

-- =====================================================
-- TABLA PATIENT_ASSIGNMENTS - Asignaciones de Pacientes
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patient_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidato_id UUID REFERENCES candidatos(id) ON DELETE CASCADE,
  psicologo_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES usuarios(id), -- Quién hizo la asignación
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  unassigned_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  
  -- Evitar asignaciones duplicadas activas
  UNIQUE(candidato_id, psicologo_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para user_activity_logs
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action ON user_activity_logs(action);

-- Índices para usage_statistics
CREATE INDEX IF NOT EXISTS idx_usage_statistics_date ON usage_statistics(date);
CREATE INDEX IF NOT EXISTS idx_usage_statistics_metric_name ON usage_statistics(metric_name);

-- Índices para session_logs
CREATE INDEX IF NOT EXISTS idx_session_logs_user_id ON session_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_session_id ON session_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_login_time ON session_logs(login_time);

-- Índices para patient_assignments
CREATE INDEX IF NOT EXISTS idx_patient_assignments_candidato_id ON patient_assignments(candidato_id);
CREATE INDEX IF NOT EXISTS idx_patient_assignments_psicologo_id ON patient_assignments(psicologo_id);
CREATE INDEX IF NOT EXISTS idx_patient_assignments_active ON patient_assignments(is_active) WHERE is_active = TRUE;

-- =====================================================
-- DATOS INICIALES - PERMISOS POR ROL
-- =====================================================

-- Permisos para Administrador
INSERT INTO role_permissions (role, permission, resource, description) VALUES
('Administrador', 'read', 'users', 'Ver usuarios'),
('Administrador', 'write', 'users', 'Crear/editar usuarios'),
('Administrador', 'delete', 'users', 'Eliminar usuarios'),
('Administrador', 'read', 'permissions', 'Ver permisos'),
('Administrador', 'write', 'permissions', 'Gestionar permisos'),
('Administrador', 'read', 'assignments', 'Ver asignaciones'),
('Administrador', 'write', 'assignments', 'Gestionar asignaciones'),
('Administrador', 'read', 'usage', 'Ver estadísticas de uso'),
('Administrador', 'read', 'logs', 'Ver logs del sistema'),
('Administrador', 'access', 'admin_panel', 'Acceso al panel de administración')
ON CONFLICT (role, permission, resource) DO NOTHING;

-- Permisos para Psicólogo
INSERT INTO role_permissions (role, permission, resource, description) VALUES
('Psicólogo', 'read', 'own_patients', 'Ver sus pacientes asignados'),
('Psicólogo', 'write', 'evaluations', 'Crear/editar evaluaciones'),
('Psicólogo', 'read', 'evaluations', 'Ver evaluaciones'),
('Psicólogo', 'read', 'results', 'Ver resultados de evaluaciones')
ON CONFLICT (role, permission, resource) DO NOTHING;

-- Permisos para Candidato
INSERT INTO role_permissions (role, permission, resource, description) VALUES
('Candidato', 'read', 'own_profile', 'Ver su propio perfil'),
('Candidato', 'write', 'own_profile', 'Editar su propio perfil'),
('Candidato', 'read', 'own_evaluations', 'Ver sus evaluaciones'),
('Candidato', 'take', 'evaluations', 'Realizar evaluaciones')
ON CONFLICT (role, permission, resource) DO NOTHING;

-- =====================================================
-- PERMISOS DE RUTAS INICIALES
-- =====================================================

INSERT INTO route_permissions (route_path, required_permission, required_role, description) VALUES
('/admin/administration', 'access', 'Administrador', 'Panel de administración'),
('/admin/users', 'read', 'Administrador', 'Gestión de usuarios'),
('/admin/permissions', 'read', 'Administrador', 'Gestión de permisos'),
('/admin/assignments', 'read', 'Administrador', 'Gestión de asignaciones'),
('/admin/usage', 'read', 'Administrador', 'Estadísticas de uso'),
('/configuracion', 'read', 'Candidato', 'Configuración personal'),
('/cuestionario', 'take', 'Candidato', 'Realizar evaluaciones'),
('/resultados', 'read', 'Psicólogo', 'Ver resultados')
ON CONFLICT (route_path) DO NOTHING;
