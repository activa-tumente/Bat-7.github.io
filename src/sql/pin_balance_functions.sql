-- Funciones para el manejo de balances de pines
-- Crear función para obtener balance de pines de todos los psicólogos

CREATE OR REPLACE FUNCTION get_all_psychologists_pin_balance()
RETURNS TABLE (
  id UUID,
  nombre TEXT,
  email TEXT,
  pines_asignados INTEGER,
  pines_consumidos INTEGER,
  pines_restantes INTEGER,
  ultima_transaccion TIMESTAMPTZ,
  pacientes_asignados INTEGER,
  pruebas_completadas INTEGER,
  estado TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nombre,
    p.email,
    COALESCE(pt.pines_asignados, 0) as pines_asignados,
    COALESCE(pt.pines_consumidos, 0) as pines_consumidos,
    COALESCE(pt.pines_asignados - pt.pines_consumidos, 0) as pines_restantes,
    pt.ultima_transaccion,
    COALESCE((
      SELECT COUNT(*) 
      FROM asignaciones_pacientes ap 
      WHERE ap.psicologo_id = p.id 
      AND ap.activo = true
    ), 0)::INTEGER as pacientes_asignados,
    COALESCE((
      SELECT COUNT(*) 
      FROM evaluaciones e 
      WHERE e.psicologo_id = p.id 
      AND e.estado = 'completada'
    ), 0)::INTEGER as pruebas_completadas,
    CASE 
      WHEN COALESCE(pt.pines_asignados - pt.pines_consumidos, 0) = 0 THEN 'Sin Pines'
      WHEN COALESCE(pt.pines_asignados - pt.pines_consumidos, 0) < 5 THEN 'Pocos Pines'
      ELSE 'Activo'
    END as estado
  FROM psicologos p
  LEFT JOIN (
    SELECT 
      psicologo_id,
      SUM(CASE WHEN tipo_transaccion = 'asignacion' THEN cantidad ELSE 0 END) as pines_asignados,
      SUM(CASE WHEN tipo_transaccion = 'consumo' THEN cantidad ELSE 0 END) as pines_consumidos,
      MAX(fecha_transaccion) as ultima_transaccion
    FROM pin_transactions 
    GROUP BY psicologo_id
  ) pt ON p.id = pt.psicologo_id
  WHERE p.activo = true
  ORDER BY p.nombre;
END;
$$ LANGUAGE plpgsql;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION get_all_psychologists_pin_balance() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_psychologists_pin_balance() TO anon;
GRANT EXECUTE ON FUNCTION get_all_psychologists_pin_balance() TO service_role;

-- Función para obtener balance de un psicólogo específico
CREATE OR REPLACE FUNCTION get_psychologist_pin_balance(psychologist_id UUID)
RETURNS TABLE (
  id UUID,
  nombre TEXT,
  email TEXT,
  pines_asignados INTEGER,
  pines_consumidos INTEGER,
  pines_restantes INTEGER,
  ultima_transaccion TIMESTAMPTZ,
  pacientes_asignados INTEGER,
  pruebas_completadas INTEGER,
  estado TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM get_all_psychologists_pin_balance()
  WHERE get_all_psychologists_pin_balance.id = psychologist_id;
END;
$$ LANGUAGE plpgsql;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION get_psychologist_pin_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_psychologist_pin_balance(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_psychologist_pin_balance(UUID) TO service_role;

COMMENT ON FUNCTION get_all_psychologists_pin_balance() IS 'Obtiene el balance de pines de todos los psicólogos activos';
COMMENT ON FUNCTION get_psychologist_pin_balance(UUID) IS 'Obtiene el balance de pines de un psicólogo específico';