-- Función para convertir automáticamente PD a PC en Supabase
-- Esta función se ejecutará automáticamente cuando se inserte o actualice un resultado

-- Primero, crear la función de conversión PD a PC
CREATE OR REPLACE FUNCTION convertir_pd_a_pc(
    p_puntaje_directo INTEGER,
    p_aptitud_codigo TEXT,
    p_edad INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_percentil INTEGER;
    v_grupo_edad TEXT;
BEGIN
    -- Determinar el grupo de edad
    IF p_edad = 12 THEN
        v_grupo_edad := '12-13';
    ELSIF p_edad = 13 OR p_edad = 14 THEN
        v_grupo_edad := '13-14';
    ELSE
        -- Edad fuera del rango, retornar NULL
        RETURN NULL;
    END IF;

    -- Buscar el percentil en la tabla de baremos
    SELECT percentil INTO v_percentil
    FROM baremos
    WHERE factor = CASE p_aptitud_codigo
        WHEN 'V' THEN 'Aptitud Verbal'
        WHEN 'E' THEN 'Aptitud Espacial'
        WHEN 'A' THEN 'Atención'
        WHEN 'CON' THEN 'Concentración'
        WHEN 'R' THEN 'Razonamiento'
        WHEN 'N' THEN 'Aptitud Numérica'
        WHEN 'M' THEN 'Aptitud Mecánica'
        WHEN 'O' THEN 'Ortografía'
        ELSE NULL
    END
    AND p_puntaje_directo BETWEEN puntaje_minimo AND puntaje_maximo
    AND baremo_grupo = v_grupo_edad
    LIMIT 1;

    RETURN v_percentil;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular la edad a partir de la fecha de nacimiento
CREATE OR REPLACE FUNCTION calcular_edad(p_fecha_nacimiento DATE) RETURNS INTEGER AS $$
DECLARE
    v_edad INTEGER;
BEGIN
    IF p_fecha_nacimiento IS NULL THEN
        RETURN NULL;
    END IF;
    
    v_edad := EXTRACT(YEAR FROM AGE(CURRENT_DATE, p_fecha_nacimiento));
    RETURN v_edad;
END;
$$ LANGUAGE plpgsql;

-- Función trigger para actualizar automáticamente el PC cuando se inserta o actualiza un resultado
CREATE OR REPLACE FUNCTION actualizar_percentil_automatico() RETURNS TRIGGER AS $$
DECLARE
    v_aptitud_codigo TEXT;
    v_fecha_nacimiento DATE;
    v_edad INTEGER;
    v_percentil INTEGER;
BEGIN
    -- Obtener el código de la aptitud
    SELECT codigo INTO v_aptitud_codigo
    FROM aptitudes
    WHERE id = NEW.aptitud_id;

    -- Obtener la fecha de nacimiento del paciente
    SELECT fecha_nacimiento INTO v_fecha_nacimiento
    FROM pacientes
    WHERE id = NEW.paciente_id;

    -- Calcular la edad
    v_edad := calcular_edad(v_fecha_nacimiento);

    -- Convertir PD a PC si tenemos todos los datos necesarios
    IF NEW.puntaje_directo IS NOT NULL AND v_aptitud_codigo IS NOT NULL AND v_edad IS NOT NULL THEN
        v_percentil := convertir_pd_a_pc(NEW.puntaje_directo, v_aptitud_codigo, v_edad);
        
        -- Actualizar los campos calculados
        NEW.percentil := v_percentil;
        NEW.edad_evaluacion := v_edad;
        NEW.baremo_utilizado := CASE 
            WHEN v_edad = 12 THEN '12-13'
            WHEN v_edad = 13 OR v_edad = 14 THEN '13-14'
            ELSE NULL
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger que se ejecuta antes de insertar o actualizar
DROP TRIGGER IF EXISTS trigger_actualizar_percentil ON resultados;
CREATE TRIGGER trigger_actualizar_percentil
    BEFORE INSERT OR UPDATE ON resultados
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_percentil_automatico();

-- Función para recalcular todos los percentiles existentes
CREATE OR REPLACE FUNCTION recalcular_todos_los_percentiles() RETURNS INTEGER AS $$
DECLARE
    v_resultado RECORD;
    v_aptitud_codigo TEXT;
    v_fecha_nacimiento DATE;
    v_edad INTEGER;
    v_percentil INTEGER;
    v_contador INTEGER := 0;
BEGIN
    -- Iterar sobre todos los resultados que no tienen percentil
    FOR v_resultado IN 
        SELECT r.id, r.puntaje_directo, r.aptitud_id, r.paciente_id
        FROM resultados r
        WHERE r.percentil IS NULL AND r.puntaje_directo IS NOT NULL
    LOOP
        -- Obtener el código de la aptitud
        SELECT codigo INTO v_aptitud_codigo
        FROM aptitudes
        WHERE id = v_resultado.aptitud_id;

        -- Obtener la fecha de nacimiento del paciente
        SELECT fecha_nacimiento INTO v_fecha_nacimiento
        FROM pacientes
        WHERE id = v_resultado.paciente_id;

        -- Calcular la edad
        v_edad := calcular_edad(v_fecha_nacimiento);

        -- Convertir PD a PC si tenemos todos los datos necesarios
        IF v_aptitud_codigo IS NOT NULL AND v_edad IS NOT NULL THEN
            v_percentil := convertir_pd_a_pc(v_resultado.puntaje_directo, v_aptitud_codigo, v_edad);
            
            -- Actualizar el resultado
            UPDATE resultados 
            SET 
                percentil = v_percentil,
                edad_evaluacion = v_edad,
                baremo_utilizado = CASE 
                    WHEN v_edad = 12 THEN '12-13'
                    WHEN v_edad = 13 OR v_edad = 14 THEN '13-14'
                    ELSE NULL
                END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = v_resultado.id;
            
            v_contador := v_contador + 1;
        END IF;
    END LOOP;

    RETURN v_contador;
END;
$$ LANGUAGE plpgsql;

-- Comentarios de uso:
-- Para ejecutar la conversión automática en resultados existentes:
-- SELECT recalcular_todos_los_percentiles();

-- Para probar la función de conversión manualmente:
-- SELECT convertir_pd_a_pc(25, 'V', 13); -- Debería retornar el percentil correspondiente

-- Para verificar que el trigger funciona:
-- INSERT INTO resultados (paciente_id, aptitud_id, puntaje_directo, tiempo_segundos, created_at, updated_at)
-- VALUES (1, 1, 25, 600, NOW(), NOW());
-- El percentil debería calcularse automáticamente
