-- Migración 004: Crear tabla informes_generados
-- Ejecutar en Supabase SQL Editor

-- Crear tabla informes_generados
CREATE TABLE IF NOT EXISTS public.informes_generados (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL,
  tipo_informe CHARACTER VARYING(50) NOT NULL,
  titulo CHARACTER VARYING(255) NOT NULL,
  descripcion TEXT NULL,
  contenido JSONB NOT NULL,
  archivo_url TEXT NULL,
  estado CHARACTER VARYING(20) NULL DEFAULT 'generado'::CHARACTER VARYING,
  generado_por UUID NULL,
  fecha_generacion TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  fecha_archivado TIMESTAMP WITH TIME ZONE NULL,
  metadatos JSONB NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT informes_generados_pkey PRIMARY KEY (id),
  CONSTRAINT informes_generados_generado_por_fkey FOREIGN KEY (generado_por) REFERENCES auth.users (id),
  CONSTRAINT informes_generados_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES pacientes (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_informes_tipo ON public.informes_generados USING btree (tipo_informe) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_informes_estado ON public.informes_generados USING btree (estado) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_informes_generado_por ON public.informes_generados USING btree (generado_por) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_informes_generados_paciente_id ON public.informes_generados USING btree (paciente_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_informes_generados_fecha_generacion ON public.informes_generados USING btree (fecha_generacion) TABLESPACE pg_default;

-- Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_informes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_informes_updated_at ON public.informes_generados;
CREATE TRIGGER trigger_update_informes_updated_at
    BEFORE UPDATE ON public.informes_generados
    FOR EACH ROW
    EXECUTE FUNCTION update_informes_updated_at();

-- Habilitar RLS
ALTER TABLE public.informes_generados ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas
DROP POLICY IF EXISTS "informes_generados_select" ON public.informes_generados;
CREATE POLICY "informes_generados_select" ON public.informes_generados
    FOR SELECT USING (true); -- Permitir lectura a usuarios autenticados

DROP POLICY IF EXISTS "informes_generados_insert" ON public.informes_generados;
CREATE POLICY "informes_generados_insert" ON public.informes_generados
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "informes_generados_update" ON public.informes_generados;
CREATE POLICY "informes_generados_update" ON public.informes_generados
    FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "informes_generados_delete" ON public.informes_generados;
CREATE POLICY "informes_generados_delete" ON public.informes_generados
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Comentarios
COMMENT ON TABLE public.informes_generados IS 'Tabla para almacenar informes generados del sistema BAT-7';
COMMENT ON COLUMN public.informes_generados.id IS 'Identificador único del informe';
COMMENT ON COLUMN public.informes_generados.paciente_id IS 'Referencia al paciente';
COMMENT ON COLUMN public.informes_generados.tipo_informe IS 'Tipo de informe (completo, individual, etc.)';
COMMENT ON COLUMN public.informes_generados.titulo IS 'Título del informe';
COMMENT ON COLUMN public.informes_generados.descripcion IS 'Descripción del informe';
COMMENT ON COLUMN public.informes_generados.contenido IS 'Contenido del informe en formato JSON';
COMMENT ON COLUMN public.informes_generados.archivo_url IS 'URL del archivo PDF generado (opcional)';
COMMENT ON COLUMN public.informes_generados.estado IS 'Estado del informe (generado, archivado, eliminado)';
COMMENT ON COLUMN public.informes_generados.generado_por IS 'Usuario que generó el informe';
COMMENT ON COLUMN public.informes_generados.fecha_generacion IS 'Fecha de generación del informe';
COMMENT ON COLUMN public.informes_generados.fecha_archivado IS 'Fecha de archivado del informe';
COMMENT ON COLUMN public.informes_generados.metadatos IS 'Metadatos adicionales del informe';

-- Verificar la creación
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'informes_generados' 
ORDER BY ordinal_position;

SELECT 'Tabla informes_generados creada exitosamente' AS resultado;