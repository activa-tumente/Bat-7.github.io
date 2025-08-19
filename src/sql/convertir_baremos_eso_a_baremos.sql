-- Script para convertir los datos de la tabla Baremos_ESO_E_12_13 al formato de la tabla baremos

-- Función para obtener la interpretación de un percentil
CREATE OR REPLACE FUNCTION obtener_interpretacion_percentil(
  p_percentil INTEGER
) 
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_interpretacion TEXT;
BEGIN
  IF p_percentil >= 90 THEN
    v_interpretacion := 'Muy alto';
  ELSIF p_percentil >= 70 THEN
    v_interpretacion := 'Alto';
  ELSIF p_percentil >= 30 THEN
    v_interpretacion := 'Medio';
  ELSIF p_percentil >= 10 THEN
    v_interpretacion := 'Bajo';
  ELSE
    v_interpretacion := 'Muy bajo';
  END IF;
  
  RETURN v_interpretacion;
END;
$$;

-- Convertir los datos de Baremos_ESO_E_12_13 a baremos
INSERT INTO baremos (factor, puntaje_minimo, puntaje_maximo, percentil, interpretacion)
SELECT 
  CASE 
    WHEN Factor = 'V' THEN 'Aptitud Verbal'
    WHEN Factor = 'E' THEN 'Aptitud Espacial'
    WHEN Factor = 'A' THEN 'Atención'
    WHEN Factor = 'CON' THEN 'Concentración'
    WHEN Factor = 'R' THEN 'Razonamiento'
    WHEN Factor = 'N' THEN 'Aptitud Numérica'
    WHEN Factor = 'M' THEN 'Aptitud Mecánica'
    WHEN Factor = 'O' THEN 'Ortografía'
  END as factor,
  COALESCE(PD_Min, 0) as puntaje_minimo,
  COALESCE(PD_Max, 0) as puntaje_maximo,
  Pc as percentil,
  obtener_interpretacion_percentil(Pc) as interpretacion
FROM Baremos_ESO_E_12_13
WHERE PD_Min IS NOT NULL AND PD_Max IS NOT NULL; -- Solo insertar registros con rangos definidos
