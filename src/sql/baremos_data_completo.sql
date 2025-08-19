-- Script para insertar datos en la tabla baremos
-- Este script inserta los datos de conversión de PD a PC para todos los factores

-- Limpiar datos existentes (opcional, comentar si no se desea eliminar datos previos)
-- DELETE FROM baremos;

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

-- Aptitud Espacial (E)
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion)
VALUES
  ('Aptitud Espacial', 0, 5, 1, 'Muy bajo'),
  ('Aptitud Espacial', 6, 6, 2, 'Muy bajo'),
  ('Aptitud Espacial', 7, 7, 3, 'Muy bajo'),
  ('Aptitud Espacial', 8, 8, 4, 'Muy bajo'),
  ('Aptitud Espacial', 9, 10, 5, 'Muy bajo'),
  ('Aptitud Espacial', 11, 11, 10, 'Bajo'),
  ('Aptitud Espacial', 12, 12, 15, 'Bajo'),
  ('Aptitud Espacial', 13, 13, 20, 'Bajo'),
  ('Aptitud Espacial', 14, 14, 25, 'Bajo'),
  ('Aptitud Espacial', 15, 15, 35, 'Medio'),
  ('Aptitud Espacial', 16, 16, 40, 'Medio'),
  ('Aptitud Espacial', 17, 17, 50, 'Medio'),
  ('Aptitud Espacial', 18, 18, 55, 'Medio'),
  ('Aptitud Espacial', 19, 19, 60, 'Medio'),
  ('Aptitud Espacial', 20, 20, 70, 'Alto'),
  ('Aptitud Espacial', 21, 21, 75, 'Alto'),
  ('Aptitud Espacial', 22, 22, 80, 'Alto'),
  ('Aptitud Espacial', 23, 23, 85, 'Alto'),
  ('Aptitud Espacial', 24, 24, 90, 'Muy alto'),
  ('Aptitud Espacial', 25, 25, 95, 'Muy alto'),
  ('Aptitud Espacial', 26, 26, 96, 'Muy alto'),
  ('Aptitud Espacial', 27, 28, 99, 'Muy alto');

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

-- Concentración (CON) - Añadido como factor adicional
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

-- Aptitud Numérica (N)
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion)
VALUES
  ('Aptitud Numérica', 0, 3, 1, 'Muy bajo'),
  ('Aptitud Numérica', 4, 4, 3, 'Muy bajo'),
  ('Aptitud Numérica', 5, 5, 5, 'Muy bajo'),
  ('Aptitud Numérica', 6, 6, 10, 'Bajo'),
  ('Aptitud Numérica', 7, 7, 15, 'Bajo'),
  ('Aptitud Numérica', 8, 8, 20, 'Bajo'),
  ('Aptitud Numérica', 9, 9, 25, 'Bajo'),
  ('Aptitud Numérica', 10, 10, 35, 'Medio'),
  ('Aptitud Numérica', 11, 11, 40, 'Medio'),
  ('Aptitud Numérica', 12, 12, 45, 'Medio'),
  ('Aptitud Numérica', 13, 13, 50, 'Medio'),
  ('Aptitud Numérica', 14, 14, 55, 'Medio'),
  ('Aptitud Numérica', 15, 15, 60, 'Medio'),
  ('Aptitud Numérica', 16, 16, 65, 'Alto'),
  ('Aptitud Numérica', 17, 17, 70, 'Alto'),
  ('Aptitud Numérica', 18, 18, 75, 'Alto'),
  ('Aptitud Numérica', 19, 19, 80, 'Alto'),
  ('Aptitud Numérica', 20, 21, 85, 'Alto'),
  ('Aptitud Numérica', 22, 23, 90, 'Muy alto'),
  ('Aptitud Numérica', 24, 24, 95, 'Muy alto'),
  ('Aptitud Numérica', 25, 25, 96, 'Muy alto'),
  ('Aptitud Numérica', 26, 26, 97, 'Muy alto'),
  ('Aptitud Numérica', 27, 27, 98, 'Muy alto'),
  ('Aptitud Numérica', 28, 32, 99, 'Muy alto');

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
