-- Script para configurar la base de datos de BAT-7
-- Ejecutar en el editor SQL de Supabase

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA USUARIOS
-- =====================================================

-- Crear tabla usuarios si no existe
CREATE TABLE IF NOT EXISTS public.usuarios (
  -- ID que referencia a auth.users
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Datos personales
  documento TEXT UNIQUE,
  nombre TEXT,
  apellido TEXT,
  
  -- Rol del usuario
  rol TEXT CHECK (rol IN ('estudiante', 'psicologo', 'administrador')),
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  
  -- Timestamps
  fecha_creacion TIMESTAMPTZ DEFAULT now(),
  ultimo_acceso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comentarios para documentación
COMMENT ON TABLE public.usuarios IS 'Tabla de perfiles de usuario del sistema BAT-7';
COMMENT ON COLUMN public.usuarios.id IS 'Referencia al ID del usuario en auth.users';
COMMENT ON COLUMN public.usuarios.documento IS 'Número de documento único del usuario';
COMMENT ON COLUMN public.usuarios.rol IS 'Rol del usuario: estudiante, psicologo, administrador';

-- =====================================================
-- TABLA PACIENTES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  apellido TEXT,
  genero TEXT CHECK (genero IN ('Masculino', 'Femenino', 'Otro')),
  fecha_nacimiento DATE,
  documento TEXT,
  telefono TEXT,
  email TEXT,
  
  -- Relaciones
  psicologo_id UUID REFERENCES usuarios(id),
  
  -- Estado
  activo BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.pacientes IS 'Tabla de pacientes del sistema';

-- =====================================================
-- TABLA EVALUACIONES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.evaluaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relaciones
  paciente_id UUID REFERENCES pacientes(id),
  psicologo_id UUID REFERENCES usuarios(id),
  
  -- Datos de la evaluación
  tipo_evaluacion TEXT NOT NULL,
  fecha_evaluacion TIMESTAMPTZ DEFAULT NOW(),
  estado TEXT CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'cancelada')) DEFAULT 'pendiente',
  
  -- Resultados
  puntuacion_total INTEGER,
  tiempo_total INTEGER, -- en segundos
  observaciones TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.evaluaciones IS 'Tabla de evaluaciones psicométricas';

-- =====================================================
-- TABLA RESULTADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.resultados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relaciones
  evaluacion_id UUID REFERENCES evaluaciones(id),
  
  -- Datos del resultado
  area_evaluada TEXT NOT NULL,
  puntuacion_bruta INTEGER,
  puntuacion_percentil INTEGER,
  nivel_desempeno TEXT,
  
  -- Detalles
  respuestas_correctas INTEGER,
  respuestas_incorrectas INTEGER,
  tiempo_empleado INTEGER, -- en segundos
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.resultados IS 'Tabla de resultados detallados por área';

-- =====================================================
-- TABLA CONFIGURACIONES DE USUARIO
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

COMMENT ON TABLE public.user_settings IS 'Configuraciones personalizadas de usuario';

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS PARA USUARIOS
-- =====================================================

-- Política para que los usuarios puedan leer su propio perfil
CREATE POLICY "usuarios_select_own" ON public.usuarios
FOR SELECT USING (auth.uid() = id);

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "usuarios_update_own" ON public.usuarios
FOR UPDATE USING (auth.uid() = id);

-- Política para que los administradores puedan ver todos los usuarios
CREATE POLICY "usuarios_admin_all" ON public.usuarios
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND rol = 'administrador'
  )
);

-- =====================================================
-- POLÍTICAS RLS PARA PACIENTES
-- =====================================================

-- Los psicólogos pueden ver sus pacientes
CREATE POLICY "pacientes_psicologo_select" ON public.pacientes
FOR SELECT USING (
  psicologo_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND rol = 'administrador'
  )
);

-- Los psicólogos pueden insertar pacientes
CREATE POLICY "pacientes_psicologo_insert" ON public.pacientes
FOR INSERT WITH CHECK (
  psicologo_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND rol IN ('psicologo', 'administrador')
  )
);

-- =====================================================
-- POLÍTICAS RLS PARA EVALUACIONES
-- =====================================================

-- Los usuarios pueden ver evaluaciones relacionadas con ellos
CREATE POLICY "evaluaciones_select" ON public.evaluaciones
FOR SELECT USING (
  psicologo_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND rol = 'administrador'
  ) OR
  EXISTS (
    SELECT 1 FROM public.pacientes p
    JOIN public.usuarios u ON u.id = auth.uid()
    WHERE p.id = paciente_id AND u.rol = 'estudiante'
  )
);

-- =====================================================
-- POLÍTICAS RLS PARA CONFIGURACIONES
-- =====================================================

-- Los usuarios solo pueden acceder a sus propias configuraciones
CREATE POLICY "user_settings_own" ON public.user_settings
FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON public.pacientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluaciones_updated_at BEFORE UPDATE ON public.evaluaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resultados_updated_at BEFORE UPDATE ON public.resultados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

-- Índices en usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_documento ON public.usuarios(documento);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON public.usuarios(rol);

-- Índices en pacientes
CREATE INDEX IF NOT EXISTS idx_pacientes_psicologo ON public.pacientes(psicologo_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_documento ON public.pacientes(documento);

-- Índices en evaluaciones
CREATE INDEX IF NOT EXISTS idx_evaluaciones_paciente ON public.evaluaciones(paciente_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_psicologo ON public.evaluaciones(psicologo_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_fecha ON public.evaluaciones(fecha_evaluacion);

-- Índices en resultados
CREATE INDEX IF NOT EXISTS idx_resultados_evaluacion ON public.resultados(evaluacion_id);

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Mostrar resumen de tablas creadas
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('usuarios', 'pacientes', 'evaluaciones', 'resultados', 'user_settings')
ORDER BY tablename;
