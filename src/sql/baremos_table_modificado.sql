-- Definición de la tabla baremos (versión modificada)
CREATE TABLE IF NOT EXISTS baremos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factor TEXT NOT NULL CHECK (
    factor IN (
      'Aptitud Verbal',
      'Aptitud Espacial',
      'Atención',
      'Concentración',
      'Razonamiento',
      'Aptitud Numérica',
      'Aptitud Mecánica',
      'Ortografía'
    )
  ),
  puntaje_minimo INTEGER NOT NULL,
  puntaje_maximo INTEGER NOT NULL,
  percentil INTEGER NOT NULL,
  interpretacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT baremos_rango_puntaje_check CHECK (puntaje_minimo <= puntaje_maximo),
  CONSTRAINT baremos_percentil_range_check CHECK (percentil BETWEEN 1 AND 99)
);

-- Habilitar Row Level Security (RLS) en la tabla baremos
ALTER TABLE baremos ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para la tabla baremos

-- Todos los usuarios autenticados pueden ver los baremos
CREATE POLICY "Baremos visibles para todos los usuarios autenticados" 
ON baremos FOR SELECT TO authenticated
USING (true);

-- Solo los administradores pueden modificar los baremos
CREATE POLICY "Solo administradores pueden modificar baremos" 
ON baremos FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.tipo_usuario = 'Administrador'
  )
);

-- Función para convertir PD a PC utilizando la tabla baremos
CREATE OR REPLACE FUNCTION convertir_pd_a_pc_baremos(
  p_factor TEXT,
  p_puntaje INTEGER
) 
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_percentil INTEGER;
BEGIN
  -- Buscar el percentil correspondiente en la tabla baremos
  SELECT percentil INTO v_percentil
  FROM baremos
  WHERE factor = p_factor
    AND p_puntaje BETWEEN puntaje_minimo AND puntaje_maximo;
  
  -- Si no se encuentra un valor en la tabla, usar un valor predeterminado
  IF v_percentil IS NULL THEN
    v_percentil := 50; -- Valor predeterminado si no hay coincidencia
  END IF;
  
  RETURN v_percentil;
END;
$$;

-- Función para obtener la interpretación de un percentil
CREATE OR REPLACE FUNCTION obtener_interpretacion_percentil(
  p_percentil INTEGER
) 
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_interpretacion TEXT;
BEGIN
  IF p_percentil >= 90 THEN
    v_interpretacion := 'Muy alto';
  ELSIF p_percentil >= 70 THEN
    v_interpretacion := 'Alto';
  ELSIF p_percentil >= 30 THEN
    v_interpretacion := 'Medio';
  ELSIF p_percentil >= 10 THEN
    v_interpretacion := 'Bajo';
  ELSE
    v_interpretacion := 'Muy bajo';
  END IF;
  
  RETURN v_interpretacion;
END;
$$;
