-- Script para insertar datos de Aptitud Mecánica en la tabla baremos

-- Aptitud Mecánica (M)
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion)
VALUES
  ('Aptitud Mecánica', 0, 7, 1, 'Muy bajo'),
  ('Aptitud Mecánica', 8, 8, 3, 'Muy bajo'),
  ('Aptitud Mecánica', 9, 9, 4, 'Muy bajo'),
  ('Aptitud Mecánica', 10, 10, 5, 'Muy bajo'),
  ('Aptitud Mecánica', 11, 11, 10, 'Bajo'),
  ('Aptitud Mecánica', 12, 12, 15, 'Bajo'),
  ('Aptitud Mecánica', 13, 13, 20, 'Bajo'),
  ('Aptitud Mecánica', 14, 14, 30, 'Medio'),
  ('Aptitud Mecánica', 15, 15, 35, 'Medio'),
  ('Aptitud Mecánica', 16, 16, 45, 'Medio'),
  ('Aptitud Mecánica', 17, 17, 50, 'Medio'),
  ('Aptitud Mecánica', 18, 18, 60, 'Medio'),
  ('Aptitud Mecánica', 19, 19, 70, 'Alto'),
  ('Aptitud Mecánica', 20, 20, 80, 'Alto'),
  ('Aptitud Mecánica', 21, 21, 85, 'Alto'),
  ('Aptitud Mecánica', 22, 22, 90, 'Muy alto'),
  ('Aptitud Mecánica', 23, 23, 95, 'Muy alto'),
  ('Aptitud Mecánica', 24, 24, 96, 'Muy alto'),
  ('Aptitud Mecánica', 25, 28, 99, 'Muy alto');
