-- Definición de la tabla baremos (versión simplificada)
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
