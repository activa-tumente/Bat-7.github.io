-- Script para verificar la inserción de datos en la tabla baremos

-- Contar registros por factor
SELECT factor, COUNT(*) as total_registros
FROM baremos
GROUP BY factor
ORDER BY factor;

-- Verificar rangos de puntajes para cada factor
SELECT factor, MIN(puntaje_minimo) as min_pd, MAX(puntaje_maximo) as max_pd,
       MIN(percentil) as min_pc, MAX(percentil) as max_pc
FROM baremos
GROUP BY factor
ORDER BY factor;

-- Ejemplos de consultas para verificar la conversión de PD a PC

-- Aptitud Verbal: PD = 25
SELECT * FROM baremos
WHERE factor = 'Aptitud Verbal'
AND 25 BETWEEN puntaje_minimo AND puntaje_maximo;

-- Aptitud Espacial: PD = 20
SELECT * FROM baremos
WHERE factor = 'Aptitud Espacial'
AND 20 BETWEEN puntaje_minimo AND puntaje_maximo;

-- Atención: PD = 40
SELECT * FROM baremos
WHERE factor = 'Atención'
AND 40 BETWEEN puntaje_minimo AND puntaje_maximo;

-- Concentración: PD = 85
SELECT * FROM baremos
WHERE factor = 'Concentración'
AND 85 BETWEEN puntaje_minimo AND puntaje_maximo;

-- Concentración: PD = 50
SELECT * FROM baremos
WHERE factor = 'Concentración'
AND 50 BETWEEN puntaje_minimo AND puntaje_maximo;

-- Concentración: PD = 95
SELECT * FROM baremos
WHERE factor = 'Concentración'
AND 95 BETWEEN puntaje_minimo AND puntaje_maximo;

-- Razonamiento: PD = 22
SELECT * FROM baremos
WHERE factor = 'Razonamiento'
AND 22 BETWEEN puntaje_minimo AND puntaje_maximo;

-- Aptitud Numérica: PD = 15
SELECT * FROM baremos
WHERE factor = 'Aptitud Numérica'
AND 15 BETWEEN puntaje_minimo AND puntaje_maximo;

-- Aptitud Mecánica: PD = 19
SELECT * FROM baremos
WHERE factor = 'Aptitud Mecánica'
AND 19 BETWEEN puntaje_minimo AND puntaje_maximo;

-- Ortografía: PD = 24
SELECT * FROM baremos
WHERE factor = 'Ortografía'
AND 24 BETWEEN puntaje_minimo AND puntaje_maximo;

-- Probar la función de conversión (si está disponible)
-- SELECT convertir_pd_a_pc_baremos('Aptitud Verbal', 25) as percentil;
