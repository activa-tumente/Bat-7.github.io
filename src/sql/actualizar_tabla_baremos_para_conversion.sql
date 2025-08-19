-- Script para actualizar la tabla de baremos para soportar conversión automática PD a PC

-- Primero, verificar si la tabla baremos existe y tiene la estructura correcta
-- Si no existe, crearla
CREATE TABLE IF NOT EXISTS baremos (
    id SERIAL PRIMARY KEY,
    factor VARCHAR(50) NOT NULL,
    puntaje_minimo INTEGER NOT NULL,
    puntaje_maximo INTEGER NOT NULL,
    percentil INTEGER NOT NULL,
    interpretacion VARCHAR(20),
    baremo_grupo VARCHAR(10) DEFAULT '12-13',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar la columna baremo_grupo si no existe
ALTER TABLE baremos ADD COLUMN IF NOT EXISTS baremo_grupo VARCHAR(10) DEFAULT '12-13';

-- Limpiar datos existentes para evitar duplicados
DELETE FROM baremos;

-- Insertar baremos para grupo de edad 12-13 años
-- Aptitud Verbal (V)
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion, baremo_grupo) VALUES
('Aptitud Verbal', 30, 32, 99, 'Muy Alto', '12-13'),
('Aptitud Verbal', 29, 29, 97, 'Alto', '12-13'),
('Aptitud Verbal', 28, 28, 95, 'Alto', '12-13'),
('Aptitud Verbal', 27, 27, 90, 'Alto', '12-13'),
('Aptitud Verbal', 26, 26, 85, 'Alto', '12-13'),
('Aptitud Verbal', 25, 25, 80, 'Medio-Alto', '12-13'),
('Aptitud Verbal', 24, 24, 70, 'Medio-Alto', '12-13'),
('Aptitud Verbal', 23, 23, 65, 'Medio', '12-13'),
('Aptitud Verbal', 22, 22, 55, 'Medio', '12-13'),
('Aptitud Verbal', 21, 21, 50, 'Medio', '12-13'),
('Aptitud Verbal', 20, 20, 40, 'Medio', '12-13'),
('Aptitud Verbal', 19, 19, 35, 'Medio', '12-13'),
('Aptitud Verbal', 18, 18, 25, 'Medio-Bajo', '12-13'),
('Aptitud Verbal', 17, 17, 20, 'Medio-Bajo', '12-13'),
('Aptitud Verbal', 16, 16, 15, 'Bajo', '12-13'),
('Aptitud Verbal', 15, 15, 10, 'Bajo', '12-13'),
('Aptitud Verbal', 13, 14, 5, 'Bajo', '12-13'),
('Aptitud Verbal', 12, 12, 4, 'Bajo', '12-13'),
('Aptitud Verbal', 11, 11, 2, 'Muy Bajo', '12-13'),
('Aptitud Verbal', 0, 10, 1, 'Muy Bajo', '12-13');

-- Aptitud Espacial (E)
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion, baremo_grupo) VALUES
('Aptitud Espacial', 27, 28, 99, 'Muy Alto', '12-13'),
('Aptitud Espacial', 26, 26, 96, 'Alto', '12-13'),
('Aptitud Espacial', 25, 25, 95, 'Alto', '12-13'),
('Aptitud Espacial', 24, 24, 90, 'Alto', '12-13'),
('Aptitud Espacial', 23, 23, 85, 'Alto', '12-13'),
('Aptitud Espacial', 22, 22, 80, 'Medio-Alto', '12-13'),
('Aptitud Espacial', 21, 21, 75, 'Medio-Alto', '12-13'),
('Aptitud Espacial', 20, 20, 70, 'Medio-Alto', '12-13'),
('Aptitud Espacial', 19, 19, 60, 'Medio', '12-13'),
('Aptitud Espacial', 18, 18, 50, 'Medio', '12-13'),
('Aptitud Espacial', 17, 17, 50, 'Medio', '12-13'),
('Aptitud Espacial', 16, 16, 40, 'Medio', '12-13'),
('Aptitud Espacial', 15, 15, 35, 'Medio', '12-13'),
('Aptitud Espacial', 14, 14, 25, 'Medio-Bajo', '12-13'),
('Aptitud Espacial', 13, 13, 20, 'Medio-Bajo', '12-13'),
('Aptitud Espacial', 12, 12, 15, 'Bajo', '12-13'),
('Aptitud Espacial', 11, 11, 10, 'Bajo', '12-13'),
('Aptitud Espacial', 9, 10, 5, 'Bajo', '12-13'),
('Aptitud Espacial', 8, 8, 4, 'Bajo', '12-13'),
('Aptitud Espacial', 7, 7, 3, 'Bajo', '12-13'),
('Aptitud Espacial', 6, 6, 2, 'Muy Bajo', '12-13'),
('Aptitud Espacial', 0, 5, 1, 'Muy Bajo', '12-13');

-- Atención (A)
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion, baremo_grupo) VALUES
('Atención', 49, 80, 99, 'Muy Alto', '12-13'),
('Atención', 48, 48, 98, 'Muy Alto', '12-13'),
('Atención', 46, 47, 97, 'Alto', '12-13'),
('Atención', 44, 45, 96, 'Alto', '12-13'),
('Atención', 43, 43, 95, 'Alto', '12-13'),
('Atención', 39, 42, 90, 'Alto', '12-13'),
('Atención', 36, 38, 85, 'Alto', '12-13'),
('Atención', 35, 35, 80, 'Medio-Alto', '12-13'),
('Atención', 34, 34, 75, 'Medio-Alto', '12-13'),
('Atención', 33, 33, 70, 'Medio-Alto', '12-13'),
('Atención', 31, 32, 65, 'Medio', '12-13'),
('Atención', 29, 30, 60, 'Medio', '12-13'),
('Atención', 28, 28, 55, 'Medio', '12-13'),
('Atención', 27, 27, 50, 'Medio', '12-13'),
('Atención', 26, 26, 45, 'Medio', '12-13'),
('Atención', 25, 25, 40, 'Medio', '12-13'),
('Atención', 24, 24, 35, 'Medio', '12-13'),
('Atención', 23, 23, 30, 'Medio', '12-13'),
('Atención', 22, 22, 25, 'Medio-Bajo', '12-13'),
('Atención', 21, 21, 20, 'Medio-Bajo', '12-13'),
('Atención', 19, 20, 15, 'Bajo', '12-13'),
('Atención', 17, 18, 10, 'Bajo', '12-13'),
('Atención', 15, 16, 5, 'Bajo', '12-13'),
('Atención', 13, 14, 4, 'Bajo', '12-13'),
('Atención', 12, 12, 2, 'Muy Bajo', '12-13'),
('Atención', 0, 11, 1, 'Muy Bajo', '12-13');

-- Concentración (CON)
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion, baremo_grupo) VALUES
('Concentración', 98, 100, 99, 'Muy Alto', '12-13'),
('Concentración', 96, 97, 97, 'Alto', '12-13'),
('Concentración', 95, 95, 96, 'Alto', '12-13'),
('Concentración', 94, 94, 95, 'Alto', '12-13'),
('Concentración', 91, 93, 90, 'Alto', '12-13'),
('Concentración', 89, 90, 85, 'Alto', '12-13'),
('Concentración', 88, 88, 80, 'Medio-Alto', '12-13'),
('Concentración', 85, 87, 75, 'Medio-Alto', '12-13'),
('Concentración', 83, 84, 70, 'Medio-Alto', '12-13'),
('Concentración', 82, 82, 65, 'Medio', '12-13'),
('Concentración', 80, 81, 60, 'Medio', '12-13'),
('Concentración', 78, 79, 55, 'Medio', '12-13'),
('Concentración', 76, 77, 50, 'Medio', '12-13'),
('Concentración', 74, 75, 45, 'Medio', '12-13'),
('Concentración', 72, 73, 40, 'Medio', '12-13'),
('Concentración', 69, 71, 35, 'Medio', '12-13'),
('Concentración', 67, 68, 30, 'Medio', '12-13'),
('Concentración', 64, 66, 25, 'Medio-Bajo', '12-13'),
('Concentración', 61, 63, 20, 'Medio-Bajo', '12-13'),
('Concentración', 56, 60, 15, 'Bajo', '12-13'),
('Concentración', 47, 55, 10, 'Bajo', '12-13'),
('Concentración', 36, 46, 5, 'Bajo', '12-13'),
('Concentración', 33, 35, 4, 'Bajo', '12-13'),
('Concentración', 29, 32, 3, 'Bajo', '12-13'),
('Concentración', 28, 28, 2, 'Muy Bajo', '12-13'),
('Concentración', 0, 27, 1, 'Muy Bajo', '12-13');

-- Razonamiento (R)
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion, baremo_grupo) VALUES
('Razonamiento', 29, 32, 99, 'Muy Alto', '12-13'),
('Razonamiento', 28, 28, 98, 'Muy Alto', '12-13'),
('Razonamiento', 27, 27, 96, 'Alto', '12-13'),
('Razonamiento', 26, 26, 95, 'Alto', '12-13'),
('Razonamiento', 25, 25, 90, 'Alto', '12-13'),
('Razonamiento', 24, 24, 85, 'Alto', '12-13'),
('Razonamiento', 23, 23, 80, 'Medio-Alto', '12-13'),
('Razonamiento', 22, 22, 70, 'Medio-Alto', '12-13'),
('Razonamiento', 21, 21, 65, 'Medio', '12-13'),
('Razonamiento', 20, 20, 60, 'Medio', '12-13'),
('Razonamiento', 19, 19, 50, 'Medio', '12-13'),
('Razonamiento', 18, 18, 45, 'Medio', '12-13'),
('Razonamiento', 17, 17, 40, 'Medio', '12-13'),
('Razonamiento', 16, 16, 30, 'Medio', '12-13'),
('Razonamiento', 15, 15, 25, 'Medio-Bajo', '12-13'),
('Razonamiento', 14, 14, 20, 'Medio-Bajo', '12-13'),
('Razonamiento', 13, 13, 15, 'Bajo', '12-13'),
('Razonamiento', 11, 12, 10, 'Bajo', '12-13'),
('Razonamiento', 8, 10, 5, 'Bajo', '12-13'),
('Razonamiento', 7, 7, 3, 'Bajo', '12-13'),
('Razonamiento', 6, 6, 2, 'Muy Bajo', '12-13'),
('Razonamiento', 0, 5, 1, 'Muy Bajo', '12-13');

-- Aptitud Numérica (N)
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion, baremo_grupo) VALUES
('Aptitud Numérica', 28, 32, 99, 'Muy Alto', '12-13'),
('Aptitud Numérica', 27, 27, 98, 'Muy Alto', '12-13'),
('Aptitud Numérica', 26, 26, 97, 'Alto', '12-13'),
('Aptitud Numérica', 25, 25, 96, 'Alto', '12-13'),
('Aptitud Numérica', 24, 24, 95, 'Alto', '12-13'),
('Aptitud Numérica', 22, 23, 90, 'Alto', '12-13'),
('Aptitud Numérica', 22, 22, 85, 'Alto', '12-13'),
('Aptitud Numérica', 20, 21, 85, 'Alto', '12-13'),
('Aptitud Numérica', 19, 19, 80, 'Medio-Alto', '12-13'),
('Aptitud Numérica', 18, 18, 75, 'Medio-Alto', '12-13'),
('Aptitud Numérica', 17, 17, 70, 'Medio-Alto', '12-13'),
('Aptitud Numérica', 16, 16, 65, 'Medio', '12-13'),
('Aptitud Numérica', 15, 15, 60, 'Medio', '12-13'),
('Aptitud Numérica', 14, 14, 55, 'Medio', '12-13'),
('Aptitud Numérica', 13, 13, 50, 'Medio', '12-13'),
('Aptitud Numérica', 12, 12, 45, 'Medio', '12-13'),
('Aptitud Numérica', 11, 11, 40, 'Medio', '12-13'),
('Aptitud Numérica', 10, 10, 35, 'Medio', '12-13'),
('Aptitud Numérica', 9, 9, 25, 'Medio-Bajo', '12-13'),
('Aptitud Numérica', 8, 8, 20, 'Medio-Bajo', '12-13'),
('Aptitud Numérica', 7, 7, 15, 'Bajo', '12-13'),
('Aptitud Numérica', 6, 6, 10, 'Bajo', '12-13'),
('Aptitud Numérica', 5, 5, 5, 'Bajo', '12-13'),
('Aptitud Numérica', 4, 4, 3, 'Bajo', '12-13'),
('Aptitud Numérica', 0, 3, 1, 'Muy Bajo', '12-13');

-- Aptitud Mecánica (M)
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion, baremo_grupo) VALUES
('Aptitud Mecánica', 25, 28, 99, 'Muy Alto', '12-13'),
('Aptitud Mecánica', 24, 24, 96, 'Alto', '12-13'),
('Aptitud Mecánica', 23, 23, 95, 'Alto', '12-13'),
('Aptitud Mecánica', 22, 22, 90, 'Alto', '12-13'),
('Aptitud Mecánica', 21, 21, 85, 'Alto', '12-13'),
('Aptitud Mecánica', 20, 20, 80, 'Medio-Alto', '12-13'),
('Aptitud Mecánica', 19, 19, 70, 'Medio-Alto', '12-13'),
('Aptitud Mecánica', 18, 18, 60, 'Medio', '12-13'),
('Aptitud Mecánica', 17, 17, 50, 'Medio', '12-13'),
('Aptitud Mecánica', 16, 16, 45, 'Medio', '12-13'),
('Aptitud Mecánica', 15, 15, 35, 'Medio', '12-13'),
('Aptitud Mecánica', 14, 14, 30, 'Medio', '12-13'),
('Aptitud Mecánica', 13, 13, 20, 'Medio-Bajo', '12-13'),
('Aptitud Mecánica', 12, 12, 15, 'Bajo', '12-13'),
('Aptitud Mecánica', 11, 11, 10, 'Bajo', '12-13'),
('Aptitud Mecánica', 10, 10, 5, 'Bajo', '12-13'),
('Aptitud Mecánica', 9, 9, 4, 'Bajo', '12-13'),
('Aptitud Mecánica', 8, 8, 3, 'Bajo', '12-13'),
('Aptitud Mecánica', 0, 7, 1, 'Muy Bajo', '12-13');

-- Ortografía (O)
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion, baremo_grupo) VALUES
('Ortografía', 31, 32, 99, 'Muy Alto', '12-13'),
('Ortografía', 30, 30, 98, 'Muy Alto', '12-13'),
('Ortografía', 29, 29, 95, 'Alto', '12-13'),
('Ortografía', 27, 28, 90, 'Alto', '12-13'),
('Ortografía', 26, 26, 85, 'Alto', '12-13'),
('Ortografía', 25, 25, 80, 'Medio-Alto', '12-13'),
('Ortografía', 24, 24, 70, 'Medio-Alto', '12-13'),
('Ortografía', 23, 23, 65, 'Medio', '12-13'),
('Ortografía', 22, 22, 60, 'Medio', '12-13'),
('Ortografía', 21, 21, 55, 'Medio', '12-13'),
('Ortografía', 20, 20, 50, 'Medio', '12-13'),
('Ortografía', 19, 19, 45, 'Medio', '12-13'),
('Ortografía', 18, 18, 40, 'Medio', '12-13'),
('Ortografía', 17, 17, 35, 'Medio', '12-13'),
('Ortografía', 16, 16, 30, 'Medio', '12-13'),
('Ortografía', 15, 15, 25, 'Medio-Bajo', '12-13'),
('Ortografía', 14, 14, 20, 'Medio-Bajo', '12-13'),
('Ortografía', 13, 13, 15, 'Bajo', '12-13'),
('Ortografía', 11, 12, 10, 'Bajo', '12-13'),
('Ortografía', 9, 10, 5, 'Bajo', '12-13'),
('Ortografía', 8, 8, 4, 'Bajo', '12-13'),
('Ortografía', 7, 7, 3, 'Bajo', '12-13'),
('Ortografía', 6, 6, 2, 'Muy Bajo', '12-13'),
('Ortografía', 0, 5, 1, 'Muy Bajo', '12-13');

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_baremos_factor_grupo ON baremos(factor, baremo_grupo);
CREATE INDEX IF NOT EXISTS idx_baremos_puntaje_range ON baremos(puntaje_minimo, puntaje_maximo);

-- Comentario final
-- Este script crea la tabla de baremos con los datos para el grupo de edad 12-13 años
-- Para agregar el grupo 13-14 años, ejecutar un script similar cambiando baremo_grupo a '13-14'
