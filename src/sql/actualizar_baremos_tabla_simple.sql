ALTER TABLE baremos DROP CONSTRAINT IF EXISTS baremos_factor_check;

ALTER TABLE baremos ADD CONSTRAINT baremos_factor_check CHECK (
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
);
