-- Script para insertar datos de Ortografía en la tabla baremos

-- Ortografía (O)
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion)
VALUES
  ('Ortografía', 0, 5, 1, 'Muy bajo'),
  ('Ortografía', 6, 6, 2, 'Muy bajo'),
  ('Ortografía', 7, 7, 3, 'Muy bajo'),
  ('Ortografía', 8, 8, 4, 'Muy bajo'),
  ('Ortografía', 9, 10, 5, 'Muy bajo'),
  ('Ortografía', 11, 12, 10, 'Bajo'),
  ('Ortografía', 13, 13, 15, 'Bajo'),
  ('Ortografía', 14, 14, 20, 'Bajo'),
  ('Ortografía', 15, 15, 25, 'Bajo'),
  ('Ortografía', 16, 16, 30, 'Medio'),
  ('Ortografía', 17, 17, 35, 'Medio'),
  ('Ortografía', 18, 18, 40, 'Medio'),
  ('Ortografía', 19, 19, 45, 'Medio'),
  ('Ortografía', 20, 20, 50, 'Medio'),
  ('Ortografía', 21, 21, 55, 'Medio'),
  ('Ortografía', 22, 22, 60, 'Medio'),
  ('Ortografía', 23, 23, 65, 'Alto'),
  ('Ortografía', 24, 24, 70, 'Alto'),
  ('Ortografía', 25, 25, 80, 'Alto'),
  ('Ortografía', 26, 26, 85, 'Alto'),
  ('Ortografía', 27, 28, 90, 'Muy alto'),
  ('Ortografía', 29, 29, 95, 'Muy alto'),
  ('Ortografía', 30, 30, 97, 'Muy alto'),
  ('Ortografía', 31, 32, 99, 'Muy alto');
