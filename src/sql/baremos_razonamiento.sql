-- Script para insertar datos de Razonamiento en la tabla baremos

-- Razonamiento (R)
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion)
VALUES
  ('Razonamiento', 0, 5, 1, 'Muy bajo'),
  ('Razonamiento', 6, 6, 2, 'Muy bajo'),
  ('Razonamiento', 7, 7, 3, 'Muy bajo'),
  ('Razonamiento', 8, 10, 5, 'Muy bajo'),
  ('Razonamiento', 11, 12, 10, 'Bajo'),
  ('Razonamiento', 13, 13, 15, 'Bajo'),
  ('Razonamiento', 14, 14, 20, 'Bajo'),
  ('Razonamiento', 15, 15, 25, 'Bajo'),
  ('Razonamiento', 16, 16, 30, 'Medio'),
  ('Razonamiento', 17, 17, 40, 'Medio'),
  ('Razonamiento', 18, 18, 45, 'Medio'),
  ('Razonamiento', 19, 19, 50, 'Medio'),
  ('Razonamiento', 20, 20, 60, 'Medio'),
  ('Razonamiento', 21, 21, 65, 'Alto'),
  ('Razonamiento', 22, 22, 70, 'Alto'),
  ('Razonamiento', 23, 23, 80, 'Alto'),
  ('Razonamiento', 24, 24, 85, 'Alto'),
  ('Razonamiento', 25, 25, 90, 'Muy alto'),
  ('Razonamiento', 26, 26, 95, 'Muy alto'),
  ('Razonamiento', 27, 27, 96, 'Muy alto'),
  ('Razonamiento', 28, 28, 98, 'Muy alto'),
  ('Razonamiento', 29, 32, 99, 'Muy alto');
