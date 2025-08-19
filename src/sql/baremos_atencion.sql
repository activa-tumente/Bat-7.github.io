-- Script para insertar datos de Atención en la tabla baremos

-- Atención (A)
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion)
VALUES
  ('Atención', 0, 11, 1, 'Muy bajo'),
  ('Atención', 12, 12, 2, 'Muy bajo'),
  ('Atención', 13, 14, 4, 'Muy bajo'),
  ('Atención', 15, 16, 5, 'Muy bajo'),
  ('Atención', 17, 18, 10, 'Bajo'),
  ('Atención', 19, 20, 15, 'Bajo'),
  ('Atención', 21, 21, 20, 'Bajo'),
  ('Atención', 22, 22, 25, 'Bajo'),
  ('Atención', 23, 23, 30, 'Medio'),
  ('Atención', 24, 24, 35, 'Medio'),
  ('Atención', 25, 25, 40, 'Medio'),
  ('Atención', 26, 26, 45, 'Medio'),
  ('Atención', 27, 27, 50, 'Medio'),
  ('Atención', 28, 28, 55, 'Medio'),
  ('Atención', 29, 30, 60, 'Medio'),
  ('Atención', 31, 32, 65, 'Alto'),
  ('Atención', 33, 33, 70, 'Alto'),
  ('Atención', 34, 34, 75, 'Alto'),
  ('Atención', 35, 35, 80, 'Alto'),
  ('Atención', 36, 38, 85, 'Alto'),
  ('Atención', 39, 42, 90, 'Muy alto'),
  ('Atención', 43, 43, 95, 'Muy alto'),
  ('Atención', 44, 45, 96, 'Muy alto'),
  ('Atención', 46, 47, 97, 'Muy alto'),
  ('Atención', 48, 48, 98, 'Muy alto'),
  ('Atención', 49, 80, 99, 'Muy alto');
