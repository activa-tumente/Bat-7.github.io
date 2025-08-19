/**
 * PASO 1: Ejecutar Esquema SQL en Supabase
 * Proyecto: ydglduxhgwajqdseqzpy
 */

import supabase from '../api/supabaseClient.js';

const FULL_SCHEMA_SQL = `
-- =====================================================
-- ESQUEMA ROBUSTO BAT-7 - EJECUCIÓN COMPLETA
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
  UNIQUE(nombre)
);

-- =====================================================
-- TABLA USUARIOS (UNIFICADA)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  documento TEXT UNIQUE,
  nombre TEXT NOT NULL,
  apellido TEXT,
  tipo_usuario TEXT CHECK (tipo_usuario IN ('Administrador', 'Psicólogo', 'Candidato')) DEFAULT 'Candidato',
  institucion_id UUID REFERENCES instituciones(id),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  ultimo_acceso TIMESTAMPTZ,
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA CANDIDATOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.candidatos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  apellidos TEXT,
  fecha_nacimiento DATE,
  genero TEXT CHECK (genero IN ('Masculino', 'Femenino', 'Otro')),
  documento_identidad TEXT UNIQUE,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  institucion_id UUID REFERENCES instituciones(id) NOT NULL,
  psicologo_id UUID REFERENCES usuarios(id),
  nivel_educativo TEXT,
  ocupacion TEXT,
  notas TEXT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_eliminacion TIMESTAMPTZ,
  CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_birth_date CHECK (fecha_nacimiento IS NULL OR fecha_nacimiento <= CURRENT_DATE)
);

-- =====================================================
-- TABLA EVALUACIONES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.evaluaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidato_id UUID REFERENCES candidatos(id) NOT NULL,
  psicologo_id UUID REFERENCES usuarios(id) NOT NULL,
  institucion_id UUID REFERENCES instituciones(id) NOT NULL,
  tipo_evaluacion TEXT NOT NULL DEFAULT 'BAT-7',
  fecha_evaluacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_inicio TIMESTAMPTZ,
  fecha_finalizacion TIMESTAMPTZ,
  estado TEXT CHECK (estado IN ('Programada', 'En Progreso', 'Completada', 'Cancelada', 'Suspendida')) DEFAULT 'Programada',
  puntuacion_total INTEGER,
  tiempo_total_segundos INTEGER,
  porcentaje_completado DECIMAL(5,2) DEFAULT 0,
  observaciones_psicologo TEXT,
  observaciones_sistema TEXT,
  configuracion JSONB DEFAULT '{}',
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA RESULTADOS DETALLADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.resultados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluacion_id UUID REFERENCES evaluaciones(id) NOT NULL,
  area_evaluada TEXT NOT NULL,
  subarea TEXT,
  puntuacion_bruta INTEGER,
  puntuacion_estandar DECIMAL(5,2),
  puntuacion_percentil INTEGER,
  puntuacion_t DECIMAL(5,2),
  nivel_desempeno TEXT,
  categoria_desempeno TEXT,
  respuestas_correctas INTEGER DEFAULT 0,
  respuestas_incorrectas INTEGER DEFAULT 0,
  respuestas_omitidas INTEGER DEFAULT 0,
  total_items INTEGER,
  tiempo_empleado_segundos INTEGER,
  datos_adicionales JSONB DEFAULT '{}',
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
-- FUNCIONES RPC PARA AUTENTICACIÓN SEGURA
-- =====================================================

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

-- =====================================================
-- POLÍTICAS RLS PARA USUARIOS
-- =====================================================

DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;
CREATE POLICY "usuarios_select_own" ON public.usuarios
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "usuarios_update_own" ON public.usuarios;
CREATE POLICY "usuarios_update_own" ON public.usuarios
FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "usuarios_admin_all" ON public.usuarios;
CREATE POLICY "usuarios_admin_all" ON public.usuarios
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND tipo_usuario = 'Administrador'
  )
);

-- =====================================================
-- POLÍTICAS RLS PARA CANDIDATOS
-- =====================================================

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

-- =====================================================
-- POLÍTICAS RLS PARA CONFIGURACIONES
-- =====================================================

DROP POLICY IF EXISTS "user_settings_own" ON public.user_settings;
CREATE POLICY "user_settings_own" ON public.user_settings
FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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

CREATE INDEX IF NOT EXISTS idx_usuarios_documento ON public.usuarios(documento);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON public.usuarios(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_institucion ON public.usuarios(institucion_id);
CREATE INDEX IF NOT EXISTS idx_candidatos_institucion ON public.candidatos(institucion_id);
CREATE INDEX IF NOT EXISTS idx_candidatos_psicologo ON public.candidatos(psicologo_id);
CREATE INDEX IF NOT EXISTS idx_candidatos_documento ON public.candidatos(documento_identidad);
CREATE INDEX IF NOT EXISTS idx_candidatos_activo ON public.candidatos(activo);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_candidato ON public.evaluaciones(candidato_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_psicologo ON public.evaluaciones(psicologo_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_institucion ON public.evaluaciones(institucion_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_fecha ON public.evaluaciones(fecha_evaluacion);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_estado ON public.evaluaciones(estado);
CREATE INDEX IF NOT EXISTS idx_resultados_evaluacion ON public.resultados(evaluacion_id);
CREATE INDEX IF NOT EXISTS idx_resultados_area ON public.resultados(area_evaluada);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

INSERT INTO public.instituciones (nombre, tipo_institucion, activo)
SELECT 'Institución General', 'Universidad', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.instituciones WHERE nombre = 'Institución General');
`;

async function executeStep1() {
  console.log('🚀 PASO 1: Ejecutando Esquema SQL en Supabase');
  console.log('===============================================');
  console.log('📋 Proyecto: ydglduxhgwajqdseqzpy\n');
  
  try {
    console.log('⚠️ IMPORTANTE: Este script requiere ejecución manual en Supabase');
    console.log('🔗 Ve a: https://supabase.com/dashboard/project/ydglduxhgwajqdseqzpy/sql');
    console.log('\n📋 INSTRUCCIONES:');
    console.log('1. Copia el SQL que aparece abajo');
    console.log('2. Pégalo en el editor SQL de Supabase');
    console.log('3. Ejecuta el script completo');
    console.log('4. Verifica que no hay errores\n');
    
    console.log('📄 SQL PARA COPIAR Y PEGAR:');
    console.log('============================');
    console.log(FULL_SCHEMA_SQL);
    console.log('============================\n');
    
    // Intentar verificar si ya está ejecutado
    try {
      const { count: institutionsCount } = await supabase
        .from('instituciones')
        .select('*', { count: 'exact', head: true });
      
      const { count: usersCount } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });
      
      console.log('✅ VERIFICACIÓN:');
      console.log(`📊 Instituciones: ${institutionsCount || 0} registros`);
      console.log(`👥 Usuarios: ${usersCount || 0} registros`);
      
      if (institutionsCount >= 0 && usersCount >= 0) {
        console.log('🎉 ¡El esquema parece estar ejecutado correctamente!');
        return { success: true, alreadyExecuted: true };
      }
      
    } catch (error) {
      console.log('⚠️ Las tablas aún no existen. Ejecuta el SQL en Supabase.');
    }
    
    console.log('\n🎯 PRÓXIMO PASO:');
    console.log('Una vez ejecutado el SQL, ejecuta el PASO 2: Crear Usuarios de Prueba');
    
    return { success: true, requiresManual: true };
    
  } catch (error) {
    console.error('❌ Error en el Paso 1:', error);
    return { success: false, error: error.message };
  }
}

// Función para verificar si el esquema está ejecutado
async function verifySchemaExecution() {
  const tables = ['instituciones', 'usuarios', 'candidatos', 'evaluaciones', 'resultados'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      results[table] = { 
        exists: !error, 
        count: count || 0,
        error: error?.message 
      };
    } catch (err) {
      results[table] = { exists: false, error: err.message };
    }
  }
  
  return results;
}

// Exportar para uso en consola
if (typeof window !== 'undefined') {
  window.step1 = {
    execute: executeStep1,
    verify: verifySchemaExecution,
    sql: FULL_SCHEMA_SQL
  };
  
  console.log('🛠️ PASO 1 disponible en window.step1:');
  console.log('- execute(): Ejecutar paso 1');
  console.log('- verify(): Verificar esquema');
  console.log('- sql: Ver SQL completo');
}

export { executeStep1, verifySchemaExecution, FULL_SCHEMA_SQL };
