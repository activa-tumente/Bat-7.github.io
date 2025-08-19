-- Script para insertar datos de Concentración en la tabla baremos

-- Concentración (CON)
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion)
VALUES
  ('Concentración', 0, 27, 1, 'Muy bajo'),
  ('Concentración', 28, 28, 2, 'Muy bajo'),
  ('Concentración', 29, 32, 3, 'Muy bajo'),
  ('Concentración', 33, 35, 4, 'Muy bajo'),
  ('Concentración', 36, 46, 5, 'Muy bajo'),
  ('Concentración', 47, 55, 10, 'Bajo'),
  ('Concentración', 56, 60, 15, 'Bajo'),
  ('Concentración', 61, 63, 20, 'Bajo'),
  ('Concentración', 64, 66, 25, 'Bajo'),
  ('Concentración', 67, 68, 30, 'Medio'),
  ('Concentración', 69, 71, 35, 'Medio'),
  ('Concentración', 72, 73, 40, 'Medio'),
  ('Concentración', 74, 75, 45, 'Medio'),
  ('Concentración', 76, 77, 50, 'Medio'),
  ('Concentración', 78, 79, 55, 'Medio'),
  ('Concentración', 80, 81, 60, 'Medio'),
  ('Concentración', 82, 82, 65, 'Alto'),
  ('Concentración', 83, 84, 70, 'Alto'),
  ('Concentración', 85, 87, 75, 'Alto'),
  ('Concentración', 88, 88, 80, 'Alto'),
  ('Concentración', 89, 90, 85, 'Alto'),
  ('Concentración', 91, 93, 90, 'Muy alto'),
  ('Concentración', 94, 94, 95, 'Muy alto'),
  ('Concentración', 95, 95, 96, 'Muy alto'),
  ('Concentración', 96, 97, 97, 'Muy alto'),
  ('Concentración', 98, 100, 99, 'Muy alto');
