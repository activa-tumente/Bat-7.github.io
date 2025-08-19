-- Script para insertar datos de Aptitud Verbal en la tabla baremos

-- Aptitud Verbal (V)
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion)
VALUES
  ('Aptitud Verbal', 0, 10, 1, 'Muy bajo'),
  ('Aptitud Verbal', 11, 11, 2, 'Muy bajo'),
  ('Aptitud Verbal', 12, 12, 4, 'Muy bajo'),
  ('Aptitud Verbal', 13, 14, 5, 'Muy bajo'),
  ('Aptitud Verbal', 15, 15, 10, 'Bajo'),
  ('Aptitud Verbal', 16, 16, 15, 'Bajo'),
  ('Aptitud Verbal', 17, 17, 20, 'Bajo'),
  ('Aptitud Verbal', 18, 18, 25, 'Bajo'),
  ('Aptitud Verbal', 19, 19, 35, 'Medio'),
  ('Aptitud Verbal', 20, 20, 40, 'Medio'),
  ('Aptitud Verbal', 21, 21, 50, 'Medio'),
  ('Aptitud Verbal', 22, 22, 55, 'Medio'),
  ('Aptitud Verbal', 23, 23, 65, 'Alto'),
  ('Aptitud Verbal', 24, 24, 70, 'Alto'),
  ('Aptitud Verbal', 25, 25, 80, 'Alto'),
  ('Aptitud Verbal', 26, 26, 85, 'Alto'),
  ('Aptitud Verbal', 27, 27, 90, 'Muy alto'),
  ('Aptitud Verbal', 28, 28, 95, 'Muy alto'),
  ('Aptitud Verbal', 29, 29, 97, 'Muy alto'),
  ('Aptitud Verbal', 30, 32, 99, 'Muy alto');
