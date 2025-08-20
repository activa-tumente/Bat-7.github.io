-- Esquema robusto para BAT-7 - Sistema de Evaluación Psicométrica
-- Proyecto: ydglduxhgwajqdseqzpy
-- Basado en evaluacion_psicometrica_schema.sql con mejoras

-- =====================================================
-- EXTENSIONES Y CONFIGURACIÓN INICIAL
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLA INSTITUCIONES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.instituciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  tipo_institucion TEXT CHECK (tipo_institucion IN ('Universidad', 'Colegio', 'Instituto', 'Centro de Salud', 'Otro')),
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  contacto_principal TEXT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índices únicos
  UNIQUE(nombre)
);

-- =====================================================
-- TABLA USUARIOS (UNIFICADA)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.usuarios (
  -- ID que referencia a auth.users
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Datos personales
  documento TEXT UNIQUE,
  nombre TEXT NOT NULL,
  apellido TEXT,
  
  -- Tipo de usuario (usando el esquema robusto)
  tipo_usuario TEXT CHECK (tipo_usuario IN ('Administrador', 'Psicólogo', 'Candidato')) DEFAULT 'Candidato',
  
  -- Relación con institución (para psicólogos principalmente)
  institucion_id UUID REFERENCES instituciones(id),
  
  -- Estado
  activo BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  ultimo_acceso TIMESTAMPTZ,
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA PSICÓLOGOS (VISTA ESPECIALIZADA)
-- =====================================================

CREATE VIEW public.psicologos AS
SELECT 
  id,
  documento,
  nombre,
  apellido AS apellidos,
  institucion_id,
  activo,
  fecha_creacion,
  ultimo_acceso,
  fecha_actualizacion
FROM public.usuarios 
WHERE tipo_usuario = 'Psicólogo';

-- =====================================================
-- TABLA CANDIDATOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.candidatos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Datos personales
  nombre TEXT NOT NULL,
  apellidos TEXT,
  fecha_nacimiento DATE,
  genero TEXT CHECK (genero IN ('Masculino', 'Femenino', 'Otro')),
  documento_identidad TEXT UNIQUE,
  
  -- Información de contacto
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  
  -- Relaciones
  institucion_id UUID REFERENCES instituciones(id) NOT NULL,
  psicologo_id UUID REFERENCES usuarios(id), -- Psicólogo asignado
  
  -- Información académica/laboral
  nivel_educativo TEXT,
  ocupacion TEXT,
  
  -- Notas y observaciones
  notas TEXT,
  
  -- Estado
  activo BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_eliminacion TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_birth_date CHECK (fecha_nacimiento IS NULL OR fecha_nacimiento <= CURRENT_DATE)
);

-- =====================================================
-- TABLA EVALUACIONES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.evaluaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relaciones
  candidato_id UUID REFERENCES candidatos(id) NOT NULL,
  psicologo_id UUID REFERENCES usuarios(id) NOT NULL,
  institucion_id UUID REFERENCES instituciones(id) NOT NULL,
  
  -- Información de la evaluación
  tipo_evaluacion TEXT NOT NULL DEFAULT 'BAT-7',
  fecha_evaluacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_inicio TIMESTAMPTZ,
  fecha_finalizacion TIMESTAMPTZ,
  
  -- Estado de la evaluación
  estado TEXT CHECK (estado IN ('Programada', 'En Progreso', 'Completada', 'Cancelada', 'Suspendida')) DEFAULT 'Programada',
  
  -- Resultados generales
  puntuacion_total INTEGER,
  tiempo_total_segundos INTEGER,
  porcentaje_completado DECIMAL(5,2) DEFAULT 0,
  
  -- Observaciones
  observaciones_psicologo TEXT,
  observaciones_sistema TEXT,
  
  -- Configuración de la evaluación
  configuracion JSONB DEFAULT '{}',
  
  -- Timestamps
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA RESULTADOS DETALLADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.resultados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relación con evaluación
  evaluacion_id UUID REFERENCES evaluaciones(id) NOT NULL,
  
  -- Área evaluada
  area_evaluada TEXT NOT NULL,
  subarea TEXT,
  
  -- Puntuaciones
  puntuacion_bruta INTEGER,
  puntuacion_estandar DECIMAL(5,2),
  puntuacion_percentil INTEGER,
  puntuacion_t DECIMAL(5,2),
  
  -- Clasificación del desempeño
  nivel_desempeno TEXT,
  categoria_desempeno TEXT,
  
  -- Detalles de respuestas
  respuestas_correctas INTEGER DEFAULT 0,
  respuestas_incorrectas INTEGER DEFAULT 0,
  respuestas_omitidas INTEGER DEFAULT 0,
  total_items INTEGER,
  
  -- Tiempo empleado
  tiempo_empleado_segundos INTEGER,
  
  -- Datos adicionales
  datos_adicionales JSONB DEFAULT '{}',
  
  -- Timestamps
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA CONFIGURACIONES DE USUARIO
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  configuraciones JSONB DEFAULT '{}',
  tema TEXT DEFAULT 'light',
  idioma TEXT DEFAULT 'es',
  notificaciones_email BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.instituciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS PARA USUARIOS
-- =====================================================

-- Los usuarios pueden ver su propio perfil
DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;
CREATE POLICY "usuarios_select_own" ON public.usuarios
FOR SELECT USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
DROP POLICY IF EXISTS "usuarios_update_own" ON public.usuarios;
CREATE POLICY "usuarios_update_own" ON public.usuarios
FOR UPDATE USING (auth.uid() = id);

-- Los administradores pueden ver todos los usuarios
DROP POLICY IF EXISTS "usuarios_admin_all" ON public.usuarios;
CREATE POLICY "usuarios_admin_all" ON public.usuarios
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
  )
);

-- Los psicólogos pueden ver otros psicólogos de su institución
DROP POLICY IF EXISTS "usuarios_psicologo_institucion" ON public.usuarios;
CREATE POLICY "usuarios_psicologo_institucion" ON public.usuarios
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.usuarios current_user
    WHERE current_user.id = auth.uid() 
      AND current_user.tipo_usuario = 'Psicólogo'
      AND current_user.institucion_id = usuarios.institucion_id
  )
);

-- =====================================================
-- POLÍTICAS RLS PARA CANDIDATOS
-- =====================================================

-- Los psicólogos pueden ver candidatos de su institución
DROP POLICY IF EXISTS "candidatos_psicologo_institucion" ON public.candidatos;
CREATE POLICY "candidatos_psicologo_institucion" ON public.candidatos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() 
      AND tipo_usuario IN ('Psicólogo', 'Administrador')
      AND (tipo_usuario = 'Administrador' OR institucion_id = candidatos.institucion_id)
  )
);

-- Los psicólogos pueden crear candidatos en su institución
DROP POLICY IF EXISTS "candidatos_psicologo_insert" ON public.candidatos;
CREATE POLICY "candidatos_psicologo_insert" ON public.candidatos
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() 
      AND tipo_usuario IN ('Psicólogo', 'Administrador')
      AND (tipo_usuario = 'Administrador' OR institucion_id = candidatos.institucion_id)
  )
);

-- Los psicólogos pueden actualizar candidatos de su institución
DROP POLICY IF EXISTS "candidatos_psicologo_update" ON public.candidatos;
CREATE POLICY "candidatos_psicologo_update" ON public.candidatos
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() 
      AND tipo_usuario IN ('Psicólogo', 'Administrador')
      AND (tipo_usuario = 'Administrador' OR institucion_id = candidatos.institucion_id)
  )
);

-- =====================================================
-- POLÍTICAS RLS PARA EVALUACIONES
-- =====================================================

-- Los psicólogos pueden ver evaluaciones de su institución
DROP POLICY IF EXISTS "evaluaciones_psicologo_institucion" ON public.evaluaciones;
CREATE POLICY "evaluaciones_psicologo_institucion" ON public.evaluaciones
FOR SELECT USING (
  psicologo_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() 
      AND tipo_usuario = 'Administrador'
  ) OR
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() 
      AND tipo_usuario = 'Psicólogo'
      AND institucion_id = evaluaciones.institucion_id
  )
);

-- =====================================================
-- POLÍTICAS RLS PARA CONFIGURACIONES
-- =====================================================

DROP POLICY IF EXISTS "user_settings_own" ON public.user_settings;
CREATE POLICY "user_settings_own" ON public.user_settings
FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar fecha_actualizacion
DROP TRIGGER IF EXISTS update_instituciones_fecha_actualizacion ON public.instituciones;
CREATE TRIGGER update_instituciones_fecha_actualizacion
    BEFORE UPDATE ON public.instituciones
    FOR EACH ROW EXECUTE FUNCTION update_fecha_actualizacion();

DROP TRIGGER IF EXISTS update_usuarios_fecha_actualizacion ON public.usuarios;
CREATE TRIGGER update_usuarios_fecha_actualizacion
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION update_fecha_actualizacion();

DROP TRIGGER IF EXISTS update_candidatos_fecha_actualizacion ON public.candidatos;
CREATE TRIGGER update_candidatos_fecha_actualizacion
    BEFORE UPDATE ON public.candidatos
    FOR EACH ROW EXECUTE FUNCTION update_fecha_actualizacion();

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices en usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_documento ON public.usuarios(documento);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON public.usuarios(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_institucion ON public.usuarios(institucion_id);

-- Índices en candidatos
CREATE INDEX IF NOT EXISTS idx_candidatos_institucion ON public.candidatos(institucion_id);
CREATE INDEX IF NOT EXISTS idx_candidatos_psicologo ON public.candidatos(psicologo_id);
CREATE INDEX IF NOT EXISTS idx_candidatos_documento ON public.candidatos(documento_identidad);
CREATE INDEX IF NOT EXISTS idx_candidatos_activo ON public.candidatos(activo);

-- Índices en evaluaciones
CREATE INDEX IF NOT EXISTS idx_evaluaciones_candidato ON public.evaluaciones(candidato_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_psicologo ON public.evaluaciones(psicologo_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_institucion ON public.evaluaciones(institucion_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_fecha ON public.evaluaciones(fecha_evaluacion);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_estado ON public.evaluaciones(estado);

-- Índices en resultados
CREATE INDEX IF NOT EXISTS idx_resultados_evaluacion ON public.resultados(evaluacion_id);
CREATE INDEX IF NOT EXISTS idx_resultados_area ON public.resultados(area_evaluada);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar institución por defecto si no existe
INSERT INTO public.instituciones (nombre, tipo_institucion, activo)
SELECT 'Institución General', 'Universidad', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.instituciones WHERE nombre = 'Institución General');

-- =====================================================
-- FUNCIONES RPC PARA AUTENTICACIÓN SEGURA
-- =====================================================

-- Función para obtener email por documento de forma segura
CREATE OR REPLACE FUNCTION get_email_by_documento(p_documento TEXT)
RETURNS TEXT AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT u.email INTO v_email
  FROM auth.users u
  JOIN public.usuarios pu ON u.id = pu.id
  WHERE pu.documento = p_documento AND pu.activo = true;

  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas del dashboard según el rol del usuario
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_tipo_usuario TEXT;
  v_institucion_id UUID;
  v_stats JSON;
BEGIN
  -- Obtener información del usuario actual
  v_user_id := auth.uid();

  SELECT tipo_usuario, institucion_id INTO v_tipo_usuario, v_institucion_id
  FROM public.usuarios
  WHERE id = v_user_id;

  -- Calcular estadísticas según el rol
  IF v_tipo_usuario = 'Administrador' THEN
    -- Administrador ve todas las estadísticas
    SELECT json_build_object(
      'candidatos', (SELECT count(*) FROM public.candidatos WHERE activo = true),
      'evaluaciones', (SELECT count(*) FROM public.evaluaciones),
      'psicologos', (SELECT count(*) FROM public.usuarios WHERE tipo_usuario = 'Psicólogo' AND activo = true),
      'instituciones', (SELECT count(*) FROM public.instituciones WHERE activo = true)
    ) INTO v_stats;

  ELSIF v_tipo_usuario = 'Psicólogo' THEN
    -- Psicólogo ve estadísticas de su institución
    SELECT json_build_object(
      'candidatos', (SELECT count(*) FROM public.candidatos WHERE institucion_id = v_institucion_id AND activo = true),
      'evaluaciones', (SELECT count(*) FROM public.evaluaciones WHERE institucion_id = v_institucion_id),
      'mis_candidatos', (SELECT count(*) FROM public.candidatos WHERE psicologo_id = v_user_id AND activo = true)
    ) INTO v_stats;

  ELSE
    -- Candidato ve sus propias estadísticas
    SELECT json_build_object(
      'mis_evaluaciones', (SELECT count(*) FROM public.evaluaciones e
                          JOIN public.candidatos c ON e.candidato_id = c.id
                          WHERE c.documento_identidad = (SELECT documento FROM public.usuarios WHERE id = v_user_id))
    ) INTO v_stats;
  END IF;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Mostrar resumen de tablas creadas
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('instituciones', 'usuarios', 'candidatos', 'evaluaciones', 'resultados', 'user_settings')
ORDER BY tablename;
