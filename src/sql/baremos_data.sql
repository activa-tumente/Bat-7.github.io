-- Insertar datos de ejemplo en la tabla baremos
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion)
VALUES
  -- Aptitud Verbal
  ('Aptitud Verbal', 0, 5, 10, 'Muy bajo'),
  ('Aptitud Verbal', 6, 10, 25, 'Bajo'),
  ('Aptitud Verbal', 11, 15, 40, 'Medio'),
  ('Aptitud Verbal', 16, 20, 50, 'Medio'),
  ('Aptitud Verbal', 21, 25, 75, 'Alto'),
  ('Aptitud Verbal', 26, 32, 90, 'Muy alto'),
  
  -- Aptitud Espacial
  ('Aptitud Espacial', 0, 5, 10, 'Muy bajo'),
  ('Aptitud Espacial', 6, 10, 25, 'Bajo'),
  ('Aptitud Espacial', 11, 15, 40, 'Medio'),
  ('Aptitud Espacial', 16, 20, 60, 'Medio'),
  ('Aptitud Espacial', 21, 25, 80, 'Alto'),
  ('Aptitud Espacial', 26, 28, 95, 'Muy alto'),
  
  -- Atención
  ('Atención', 0, 5, 5, 'Muy bajo'),
  ('Atención', 6, 10, 20, 'Bajo'),
  ('Atención', 11, 15, 40, 'Medio'),
  ('Atención', 16, 20, 60, 'Medio'),
  ('Atención', 21, 25, 80, 'Alto'),
  ('Atención', 26, 32, 95, 'Muy alto'),
  
  -- Razonamiento
  ('Razonamiento', 0, 5, 5, 'Muy bajo'),
  ('Razonamiento', 6, 10, 20, 'Bajo'),
  ('Razonamiento', 11, 15, 40, 'Medio'),
  ('Razonamiento', 16, 20, 60, 'Medio'),
  ('Razonamiento', 21, 25, 80, 'Alto'),
  ('Razonamiento', 26, 32, 95, 'Muy alto'),
  
  -- Aptitud Numérica
  ('Aptitud Numérica', 0, 5, 10, 'Muy bajo'),
  ('Aptitud Numérica', 6, 10, 25, 'Bajo'),
  ('Aptitud Numérica', 11, 15, 40, 'Medio'),
  ('Aptitud Numérica', 16, 20, 60, 'Medio'),
  ('Aptitud Numérica', 21, 25, 80, 'Alto'),
  ('Aptitud Numérica', 26, 32, 95, 'Muy alto'),
  
  -- Aptitud Mecánica
  ('Aptitud Mecánica', 0, 5, 10, 'Muy bajo'),
  ('Aptitud Mecánica', 6, 10, 30, 'Bajo'),
  ('Aptitud Mecánica', 11, 15, 50, 'Medio'),
  ('Aptitud Mecánica', 16, 20, 70, 'Alto'),
  ('Aptitud Mecánica', 21, 25, 85, 'Alto'),
  ('Aptitud Mecánica', 26, 28, 95, 'Muy alto'),
  
  -- Ortografía
  ('Ortografía', 0, 5, 5, 'Muy bajo'),
  ('Ortografía', 6, 10, 20, 'Bajo'),
  ('Ortografía', 11, 15, 40, 'Medio'),
  ('Ortografía', 16, 20, 60, 'Medio'),
  ('Ortografía', 21, 25, 80, 'Alto'),
  ('Ortografía', 26, 29, 95, 'Muy alto');
