-- Crear tabla para almacenar informes generados
-- Ejecutar en Supabase SQL Editor

-- Crear tabla informes
CREATE TABLE IF NOT EXISTS informes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resultado_id UUID NOT NULL REFERENCES resultados(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    contenido JSONB NOT NULL,
    fecha_generacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generado_por VARCHAR(255),
    tipo_informe VARCHAR(50) DEFAULT 'evaluacion_individual',
    estado VARCHAR(20) DEFAULT 'generado',
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_informes_resultado_id ON informes(resultado_id);
CREATE INDEX IF NOT EXISTS idx_informes_paciente_id ON informes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_informes_fecha_generacion ON informes(fecha_generacion);
CREATE INDEX IF NOT EXISTS idx_informes_tipo ON informes(tipo_informe);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION actualizar_updated_at_informes()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_actualizar_updated_at_informes ON informes;
CREATE TRIGGER trigger_actualizar_updated_at_informes
    BEFORE UPDATE ON informes
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at_informes();

-- Agregar comentarios a la tabla y columnas
COMMENT ON TABLE informes IS 'Tabla para almacenar informes de evaluación psicológica generados';
COMMENT ON COLUMN informes.id IS 'Identificador único del informe';
COMMENT ON COLUMN informes.resultado_id IS 'Referencia al resultado de la evaluación';
COMMENT ON COLUMN informes.paciente_id IS 'Referencia al paciente evaluado';
COMMENT ON COLUMN informes.titulo IS 'Título del informe';
COMMENT ON COLUMN informes.contenido IS 'Contenido del informe en formato JSON';
COMMENT ON COLUMN informes.fecha_generacion IS 'Fecha y hora de generación del informe';
COMMENT ON COLUMN informes.generado_por IS 'Usuario que generó el informe';
COMMENT ON COLUMN informes.tipo_informe IS 'Tipo de informe (evaluacion_individual, comparativo, etc.)';
COMMENT ON COLUMN informes.estado IS 'Estado del informe (generado, revisado, finalizado)';
COMMENT ON COLUMN informes.observaciones IS 'Observaciones adicionales sobre el informe';

-- Insertar datos de ejemplo (opcional)
-- INSERT INTO informes (resultado_id, paciente_id, titulo, contenido, generado_por) VALUES
-- (
--     (SELECT id FROM resultados LIMIT 1),
--     (SELECT id FROM pacientes LIMIT 1),
--     'Informe de Evaluación - Aptitud Verbal',
--     '{"paciente": {"nombre": "Ejemplo"}, "test": {"nombre": "Aptitud Verbal"}, "resultados": {"pd": 25, "pc": 65}}'::jsonb,
--     'Sistema'
-- );

-- Verificar la creación de la tabla
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'informes' 
ORDER BY ordinal_position;
