-- Script para crear la tabla test_sessions en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Crear la tabla test_sessions
CREATE TABLE IF NOT EXISTS public.test_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID NOT NULL,
    test_id VARCHAR(50) NOT NULL,
    usuario_id UUID,
    aptitud_id UUID,
    fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_fin TIMESTAMPTZ,
    estado VARCHAR(20) NOT NULL DEFAULT 'iniciado' CHECK (estado IN ('iniciado', 'finalizado', 'cancelado')),
    ip_address INET,
    user_agent TEXT,
    resultados JSONB,
    pin_consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_test_sessions_paciente_id ON public.test_sessions(paciente_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_estado ON public.test_sessions(estado);
CREATE INDEX IF NOT EXISTS idx_test_sessions_fecha_inicio ON public.test_sessions(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_test_sessions_usuario_id ON public.test_sessions(usuario_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_aptitud_id ON public.test_sessions(aptitud_id);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_test_sessions_updated_at ON public.test_sessions;
CREATE TRIGGER update_test_sessions_updated_at
    BEFORE UPDATE ON public.test_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "Users can view test sessions" ON public.test_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserción a usuarios autenticados
CREATE POLICY "Users can insert test sessions" ON public.test_sessions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir actualización a usuarios autenticados
CREATE POLICY "Users can update test sessions" ON public.test_sessions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Comentarios para documentación
COMMENT ON TABLE public.test_sessions IS 'Tabla para registrar sesiones de tests de los pacientes';
COMMENT ON COLUMN public.test_sessions.id IS 'Identificador único de la sesión';
COMMENT ON COLUMN public.test_sessions.paciente_id IS 'ID del paciente que realiza el test';
COMMENT ON COLUMN public.test_sessions.test_id IS 'Identificador del tipo de test (verbal, espacial, etc.)';
COMMENT ON COLUMN public.test_sessions.usuario_id IS 'ID del usuario que supervisa la sesión';
COMMENT ON COLUMN public.test_sessions.aptitud_id IS 'ID de la aptitud evaluada';
COMMENT ON COLUMN public.test_sessions.fecha_inicio IS 'Fecha y hora de inicio de la sesión';
COMMENT ON COLUMN public.test_sessions.fecha_fin IS 'Fecha y hora de finalización de la sesión';
COMMENT ON COLUMN public.test_sessions.estado IS 'Estado de la sesión: iniciado, finalizado, cancelado';
COMMENT ON COLUMN public.test_sessions.ip_address IS 'Dirección IP del cliente';
COMMENT ON COLUMN public.test_sessions.user_agent IS 'User agent del navegador';
COMMENT ON COLUMN public.test_sessions.resultados IS 'Resultados de la sesión en formato JSON';
COMMENT ON COLUMN public.test_sessions.pin_consumed_at IS 'Fecha cuando se consumió el pin para esta sesión';

-- Verificar que la tabla se creó correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'test_sessions' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
