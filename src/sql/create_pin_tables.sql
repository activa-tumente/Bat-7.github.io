-- Crear tablas faltantes para el sistema de pines
-- Ejecutar antes de pin_optimization_functions.sql

-- Asegurar extensión requerida
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- TABLA NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relaciones
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Datos de notificación
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'success')) DEFAULT 'info',
  
  -- Estado
  read BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.notifications IS 'Sistema de notificaciones para usuarios';
COMMENT ON COLUMN public.notifications.type IS 'Tipo de notificación (pin_warning, pin_exhausted, etc.)';
COMMENT ON COLUMN public.notifications.severity IS 'Nivel de severidad de la notificación';

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- TABLA PIN_USAGE_LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pin_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relaciones
  psychologist_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,
  test_session_id UUID,
  report_id UUID,
  
  -- Datos del log
  action_type TEXT NOT NULL,
  pins_before INTEGER,
  pins_after INTEGER,
  pins_consumed INTEGER,
  description TEXT,
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.pin_usage_logs IS 'Logs de uso y consumo de pines por psicólogo';
COMMENT ON COLUMN public.pin_usage_logs.action_type IS 'Tipo de acción (pin_consumed, notification_created, etc.)';
COMMENT ON COLUMN public.pin_usage_logs.metadata IS 'Información adicional en formato JSON';

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_pin_usage_logs_psychologist_id ON pin_usage_logs(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_pin_usage_logs_action_type ON pin_usage_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_pin_usage_logs_created_at ON pin_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_pin_usage_logs_patient_id ON pin_usage_logs(patient_id);

-- =====================================================
-- POLÍTICAS RLS PARA NOTIFICATIONS
-- =====================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propias notificaciones
CREATE POLICY "Usuarios ven solo sus notificaciones" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Política para administradores
CREATE POLICY "Administradores ven todas las notificaciones" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND rol = 'administrador'
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA PIN_USAGE_LOGS
-- =====================================================
ALTER TABLE pin_usage_logs ENABLE ROW LEVEL SECURITY;

-- Política para que los psicólogos solo vean sus propios logs
CREATE POLICY "Psicólogos ven solo sus logs de pines" ON pin_usage_logs
  FOR ALL USING (auth.uid() = psychologist_id);

-- Política para administradores
CREATE POLICY "Administradores ven todos los logs de pines" ON pin_usage_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND rol = 'administrador'
    )
  );

-- =====================================================
-- FUNCIÓN PARA ACTUALIZAR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Verificar creación de tablas
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE tablename IN ('notifications', 'pin_usage_logs')
ORDER BY tablename;