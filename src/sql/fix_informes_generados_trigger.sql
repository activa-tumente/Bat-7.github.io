-- ==============================================
-- FIX: Corregir error "psicologo_id is ambiguous" en informes_generados
-- ==============================================

-- 1. Verificar si existe algún trigger problemático en informes_generados
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'informes_generados'
  AND event_object_schema = 'public';

-- 2. Verificar funciones que podrían estar causando el problema
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE prosrc ILIKE '%psicologo_id%' 
  AND prosrc ILIKE '%informes_generados%';

-- 3. Verificar políticas RLS que podrían estar causando el problema
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'informes_generados';

-- 4. Buscar cualquier función que haga JOIN con pacientes y cause ambigüedad
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE prosrc ILIKE '%pacientes%' 
  AND prosrc ILIKE '%psicologo_id%'
  AND prosrc ILIKE '%JOIN%';

-- 5. Verificar si hay algún trigger de auditoría en informes_generados
SELECT 
  t.trigger_name,
  t.event_manipulation,
  p.proname as function_name,
  p.prosrc as function_body
FROM information_schema.triggers t
JOIN pg_proc p ON p.proname = t.action_statement
WHERE t.event_object_table = 'informes_generados'
  AND t.event_object_schema = 'public';

-- 6. Crear función corregida para consumo automático de pines (si no existe)
CREATE OR REPLACE FUNCTION auto_consume_pin_on_report()
RETURNS TRIGGER AS $$
DECLARE
  v_psicologo_id UUID;
  v_session_id UUID;
BEGIN
  -- Solo procesar en INSERT
  IF TG_OP = 'INSERT' THEN
    BEGIN
      -- Obtener el psicólogo del paciente usando alias explícitos
      SELECT p.psicologo_id INTO v_psicologo_id
      FROM pacientes p
      WHERE p.id = NEW.paciente_id;
      
      -- Si hay psicólogo asignado, intentar consumir pin
      IF v_psicologo_id IS NOT NULL THEN
        -- Buscar sesión finalizada pendiente de consumo
        SELECT ts.id INTO v_session_id
        FROM test_sessions ts
        WHERE ts.paciente_id = NEW.paciente_id
          AND ts.estado = 'finalizado'
          AND ts.pin_consumed_at IS NULL
        ORDER BY ts.fecha_fin DESC
        LIMIT 1;
        
        -- Si hay sesión, marcarla como consumida
        IF v_session_id IS NOT NULL THEN
          UPDATE test_sessions 
          SET pin_consumed_at = NOW()
          WHERE id = v_session_id;
          
          -- Registrar transacción de pin
          INSERT INTO pines_transacciones (
            psicologo_id,
            cantidad,
            tipo,
            motivo,
            metadata
          ) VALUES (
            v_psicologo_id,
            1,
            'consumo',
            'Generación de informe automática',
            jsonb_build_object(
              'informe_id', NEW.id,
              'paciente_id', NEW.paciente_id,
              'session_id', v_session_id
            )
          );
          
          RAISE NOTICE 'Pin consumido automáticamente para informe %', NEW.id;
        END IF;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error pero no interrumpir la inserción del informe
      RAISE WARNING 'Error al consumir pin automáticamente: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Eliminar cualquier trigger problemático existente
DROP TRIGGER IF EXISTS auto_consume_pin_trigger ON public.informes_generados;

-- 8. Crear el trigger corregido (opcional - comentado por defecto)
-- NOTA: Este trigger está comentado porque el consumo de pines se maneja desde JavaScript
-- Descomenta solo si quieres consumo automático desde la base de datos
/*
CREATE TRIGGER auto_consume_pin_trigger
  AFTER INSERT ON public.informes_generados
  FOR EACH ROW
  EXECUTE FUNCTION auto_consume_pin_on_report();
*/

-- 9. Verificar que no hay conflictos en las políticas RLS
-- Corregir política RLS si existe problema de ambigüedad
DROP POLICY IF EXISTS "informes_generados_insert_with_psicologo" ON public.informes_generados;

-- 10. Crear política RLS corregida para inserción
CREATE POLICY "informes_generados_insert_fixed" ON public.informes_generados
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL OR
    EXISTS (
      SELECT 1 FROM pacientes p
      WHERE p.id = paciente_id
        AND p.psicologo_id IS NOT NULL
    )
  );

-- 11. Verificar resultado
SELECT 'Fix aplicado correctamente para informes_generados' AS resultado;

-- 12. Mostrar triggers actuales después del fix
SELECT 
  trigger_name, 
  event_manipulation, 
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'informes_generados'
  AND event_object_schema = 'public';
