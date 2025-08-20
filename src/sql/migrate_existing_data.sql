-- Script de migración para el proyecto ydglduxhgwajqdseqzpy
-- Este script migra datos existentes a la nueva estructura

-- =====================================================
-- VERIFICAR ESTRUCTURA ACTUAL
-- =====================================================

-- Verificar qué tablas existen actualmente
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- MIGRACIÓN DE TABLA USUARIOS
-- =====================================================

-- Si existe tabla 'perfiles', migrar a 'usuarios'
DO $$
BEGIN
  -- Verificar si existe tabla perfiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'perfiles' AND table_schema = 'public') THEN
    
    -- Crear tabla usuarios si no existe
    CREATE TABLE IF NOT EXISTS public.usuarios (
      id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      documento TEXT UNIQUE,
      nombre TEXT,
      apellido TEXT,
      rol TEXT CHECK (rol IN ('estudiante', 'psicologo', 'administrador')),
      activo BOOLEAN DEFAULT true,
      fecha_creacion TIMESTAMPTZ DEFAULT now(),
      ultimo_acceso TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    -- Migrar datos de perfiles a usuarios
    INSERT INTO public.usuarios (
      id,
      nombre,
      apellido,
      rol,
      activo,
      fecha_creacion,
      created_at
    )
    SELECT 
      id,
      COALESCE(nombre, name, 'Usuario') as nombre,
      COALESCE(apellido, last_name, '') as apellido,
      CASE 
        WHEN role = 'admin' OR tipo_usuario = 'admin' THEN 'administrador'
        WHEN role = 'professional' OR tipo_usuario = 'professional' THEN 'psicologo'
        WHEN role = 'psicologo' OR tipo_usuario = 'psicologo' THEN 'psicologo'
        ELSE 'estudiante'
      END as rol,
      COALESCE(activo, true) as activo,
      COALESCE(fecha_creacion, created_at, now()) as fecha_creacion,
      COALESCE(created_at, now()) as created_at
    FROM public.perfiles
    WHERE NOT EXISTS (
      SELECT 1 FROM public.usuarios WHERE usuarios.id = perfiles.id
    );
    
    RAISE NOTICE 'Datos migrados de tabla perfiles a usuarios';
    
  END IF;
END $$;

-- Si existe tabla 'users', migrar a 'usuarios'
DO $$
BEGIN
  -- Verificar si existe tabla users
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    
    -- Crear tabla usuarios si no existe
    CREATE TABLE IF NOT EXISTS public.usuarios (
      id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      documento TEXT UNIQUE,
      nombre TEXT,
      apellido TEXT,
      rol TEXT CHECK (rol IN ('estudiante', 'psicologo', 'administrador')),
      activo BOOLEAN DEFAULT true,
      fecha_creacion TIMESTAMPTZ DEFAULT now(),
      ultimo_acceso TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    -- Migrar datos de users a usuarios (si users tiene UUID como ID)
    INSERT INTO public.usuarios (
      id,
      documento,
      nombre,
      apellido,
      rol,
      activo,
      fecha_creacion,
      created_at
    )
    SELECT 
      CASE 
        WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN id::uuid
        ELSE uuid_generate_v4() -- Generar nuevo UUID si no es válido
      END as id,
      COALESCE(document_id, documento) as documento,
      COALESCE(first_name, nombre, name, 'Usuario') as nombre,
      COALESCE(last_name, apellido, '') as apellido,
      CASE 
        WHEN role_id = 1 OR role = 'admin' THEN 'administrador'
        WHEN role_id = 2 OR role = 'professional' OR role = 'psicologo' THEN 'psicologo'
        ELSE 'estudiante'
      END as rol,
      true as activo,
      COALESCE(created_at, now()) as fecha_creacion,
      COALESCE(created_at, now()) as created_at
    FROM public.users
    WHERE NOT EXISTS (
      SELECT 1 FROM public.usuarios WHERE usuarios.documento = users.document_id
    );
    
    RAISE NOTICE 'Datos migrados de tabla users a usuarios';
    
  END IF;
END $$;

-- =====================================================
-- MIGRACIÓN DE TABLA PACIENTES
-- =====================================================

-- Si existe tabla 'patients', migrar a 'pacientes'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients' AND table_schema = 'public') THEN
    
    -- Crear tabla pacientes si no existe
    CREATE TABLE IF NOT EXISTS public.pacientes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      nombre TEXT NOT NULL,
      apellido TEXT,
      genero TEXT CHECK (genero IN ('Masculino', 'Femenino', 'Otro')),
      fecha_nacimiento DATE,
      documento TEXT,
      telefono TEXT,
      email TEXT,
      psicologo_id UUID REFERENCES usuarios(id),
      activo BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Migrar datos de patients a pacientes
    INSERT INTO public.pacientes (
      id,
      nombre,
      apellido,
      genero,
      fecha_nacimiento,
      documento,
      telefono,
      email,
      activo,
      created_at,
      updated_at
    )
    SELECT 
      COALESCE(id::uuid, uuid_generate_v4()) as id,
      COALESCE(first_name, nombre, 'Paciente') as nombre,
      COALESCE(last_name, apellido, '') as apellido,
      COALESCE(gender, genero) as genero,
      COALESCE(birth_date, fecha_nacimiento) as fecha_nacimiento,
      COALESCE(document_id, documento) as documento,
      COALESCE(phone, telefono) as telefono,
      COALESCE(email) as email,
      true as activo,
      COALESCE(created_at, now()) as created_at,
      COALESCE(updated_at, now()) as updated_at
    FROM public.patients
    WHERE NOT EXISTS (
      SELECT 1 FROM public.pacientes WHERE pacientes.documento = patients.document_id
    );
    
    RAISE NOTICE 'Datos migrados de tabla patients a pacientes';
    
  END IF;
END $$;

-- =====================================================
-- CREAR TABLAS FALTANTES
-- =====================================================

-- Crear tabla evaluaciones si no existe
CREATE TABLE IF NOT EXISTS public.evaluaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id),
  psicologo_id UUID REFERENCES usuarios(id),
  tipo_evaluacion TEXT NOT NULL,
  fecha_evaluacion TIMESTAMPTZ DEFAULT NOW(),
  estado TEXT CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'cancelada')) DEFAULT 'pendiente',
  puntuacion_total INTEGER,
  tiempo_total INTEGER,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla resultados si no existe
CREATE TABLE IF NOT EXISTS public.resultados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluacion_id UUID REFERENCES evaluaciones(id),
  area_evaluada TEXT NOT NULL,
  puntuacion_bruta INTEGER,
  puntuacion_percentil INTEGER,
  nivel_desempeno TEXT,
  respuestas_correctas INTEGER,
  respuestas_incorrectas INTEGER,
  tiempo_empleado INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla user_settings si no existe
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- CONFIGURAR RLS Y POLÍTICAS
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para usuarios
DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;
CREATE POLICY "usuarios_select_own" ON public.usuarios
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "usuarios_update_own" ON public.usuarios;
CREATE POLICY "usuarios_update_own" ON public.usuarios
FOR UPDATE USING (auth.uid() = id);

-- Política para administradores
DROP POLICY IF EXISTS "usuarios_admin_all" ON public.usuarios;
CREATE POLICY "usuarios_admin_all" ON public.usuarios
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND rol = 'administrador'
  )
);

-- Políticas para user_settings
DROP POLICY IF EXISTS "user_settings_own" ON public.user_settings;
CREATE POLICY "user_settings_own" ON public.user_settings
FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- CREAR ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_usuarios_documento ON public.usuarios(documento);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON public.usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_pacientes_psicologo ON public.pacientes(psicologo_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_paciente ON public.evaluaciones(paciente_id);
CREATE INDEX IF NOT EXISTS idx_resultados_evaluacion ON public.resultados(evaluacion_id);

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Mostrar resumen de la migración
SELECT 
  'usuarios' as tabla,
  count(*) as registros
FROM public.usuarios
UNION ALL
SELECT 
  'pacientes' as tabla,
  count(*) as registros
FROM public.pacientes
UNION ALL
SELECT 
  'evaluaciones' as tabla,
  count(*) as registros
FROM public.evaluaciones
UNION ALL
SELECT 
  'resultados' as tabla,
  count(*) as registros
FROM public.resultados
ORDER BY tabla;
