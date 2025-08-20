-- Script para crear el paciente de prueba Mariana Sanabria Rueda
-- y generar resultados de tests para todas las aptitudes

-- 1. Crear el paciente
INSERT INTO pacientes (
  nombre, 
  apellido, 
  documento, 
  fecha_nacimiento, 
  genero, 
  email, 
  telefono, 
  direccion, 
  ciudad, 
  estado,
  created_at
) VALUES (
  'Mariana',
  'Sanabria Rueda',
  '1234567890',
  '2025-02-25',
  'femenino',
  'marianasanabria@gmail.com',
  '3001234567',
  'Calle 123 #45-67',
  'Bogotá',
  'activo',
  NOW()
) ON CONFLICT (documento) DO NOTHING;

-- 2. Crear psicólogo asignado
INSERT INTO psicologos (
  nombre,
  apellido,
  documento,
  email,
  telefono,
  especialidad,
  numero_licencia,
  estado,
  created_at
) VALUES (
  'Julieta',
  'Hernández Herrera',
  '9876543210',
  'julieta.hernandez@bat7.com',
  '3009876543',
  'Psicología Clínica',
  'PSI-2024-001',
  'activo',
  NOW()
) ON CONFLICT (documento) DO NOTHING;

-- 3. Crear resultados para cada aptitud
-- Primero obtenemos el ID del paciente
DO $$
DECLARE
    paciente_id_var INTEGER;
    aptitud_record RECORD;
    concentracion_calc NUMERIC;
BEGIN
    -- Obtener el ID del paciente
    SELECT id INTO paciente_id_var 
    FROM pacientes 
    WHERE documento = '1234567890';
    
    IF paciente_id_var IS NULL THEN
        RAISE EXCEPTION 'Paciente no encontrado';
    END IF;
    
    -- Crear resultados para cada aptitud
    FOR aptitud_record IN 
        SELECT id, codigo, nombre FROM aptitudes ORDER BY codigo
    LOOP
        -- Calcular concentración y percentil según la aptitud
        CASE aptitud_record.codigo
            WHEN 'V' THEN -- Verbal
                concentracion_calc := (85.0 / (85.0 + 3.0)) * 100;
                INSERT INTO resultados (
                    paciente_id, aptitud_id, puntaje_directo, percentil, 
                    errores, tiempo_segundos, concentracion, nivel_educativo, created_at
                ) VALUES (
                    paciente_id_var, aptitud_record.id, 85, 88, 
                    3, 1200, concentracion_calc, 'E', NOW()
                );
            WHEN 'E' THEN -- Espacial
                concentracion_calc := (78.0 / (78.0 + 5.0)) * 100;
                INSERT INTO resultados (
                    paciente_id, aptitud_id, puntaje_directo, percentil, 
                    errores, tiempo_segundos, concentracion, nivel_educativo, created_at
                ) VALUES (
                    paciente_id_var, aptitud_record.id, 78, 82, 
                    5, 1350, concentracion_calc, 'E', NOW()
                );
            WHEN 'A' THEN -- Atención
                concentracion_calc := (92.0 / (92.0 + 2.0)) * 100;
                INSERT INTO resultados (
                    paciente_id, aptitud_id, puntaje_directo, percentil, 
                    errores, tiempo_segundos, concentracion, nivel_educativo, created_at
                ) VALUES (
                    paciente_id_var, aptitud_record.id, 92, 95, 
                    2, 900, concentracion_calc, 'E', NOW()
                );
            WHEN 'R' THEN -- Razonamiento
                concentracion_calc := (88.0 / (88.0 + 4.0)) * 100;
                INSERT INTO resultados (
                    paciente_id, aptitud_id, puntaje_directo, percentil, 
                    errores, tiempo_segundos, concentracion, nivel_educativo, created_at
                ) VALUES (
                    paciente_id_var, aptitud_record.id, 88, 91, 
                    4, 1100, concentracion_calc, 'E', NOW()
                );
            WHEN 'N' THEN -- Numérico
                concentracion_calc := (82.0 / (82.0 + 6.0)) * 100;
                INSERT INTO resultados (
                    paciente_id, aptitud_id, puntaje_directo, percentil, 
                    errores, tiempo_segundos, concentracion, nivel_educativo, created_at
                ) VALUES (
                    paciente_id_var, aptitud_record.id, 82, 85, 
                    6, 1250, concentracion_calc, 'E', NOW()
                );
            WHEN 'M' THEN -- Mecánica
                concentracion_calc := (75.0 / (75.0 + 8.0)) * 100;
                INSERT INTO resultados (
                    paciente_id, aptitud_id, puntaje_directo, percentil, 
                    errores, tiempo_segundos, concentracion, nivel_educativo, created_at
                ) VALUES (
                    paciente_id_var, aptitud_record.id, 75, 78, 
                    8, 1400, concentracion_calc, 'E', NOW()
                );
            WHEN 'O' THEN -- Ortografía
                concentracion_calc := (90.0 / (90.0 + 1.0)) * 100;
                INSERT INTO resultados (
                    paciente_id, aptitud_id, puntaje_directo, percentil, 
                    errores, tiempo_segundos, concentracion, nivel_educativo, created_at
                ) VALUES (
                    paciente_id_var, aptitud_record.id, 90, 93, 
                    1, 800, concentracion_calc, 'E', NOW()
                );
        END CASE;
        
        RAISE NOTICE 'Resultado creado para aptitud: % (%)', aptitud_record.codigo, aptitud_record.nombre;
    END LOOP;
    
    RAISE NOTICE 'Paciente de prueba creado exitosamente: Mariana Sanabria Rueda';
    RAISE NOTICE 'Total de resultados creados: %', (SELECT COUNT(*) FROM resultados WHERE paciente_id = paciente_id_var);
END $$;
