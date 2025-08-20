# Instrucciones para implementar la tabla de baremos en Supabase (PostgreSQL)

Este documento proporciona instrucciones paso a paso para crear la tabla de baremos en Supabase y poblarla con los datos de conversión de Puntuación Directa (PD) a Percentil (PC).

## Opción 1: Implementación completa en un solo script

Esta es la opción más sencilla y recomendada:

1. Inicia sesión en tu proyecto de Supabase (https://app.supabase.com)
2. Ve a la sección "SQL Editor" en el menú lateral
3. Crea una nueva consulta haciendo clic en el botón "New Query"
4. Copia y pega el contenido del archivo `src/sql/baremos_completo_postgresql.sql`
5. Ejecuta la consulta haciendo clic en el botón "Run" (o presiona Ctrl+Enter)

Este script creará:
- La tabla `Baremos_ESO_E_12_13` con la estructura correcta
- Los índices necesarios para optimizar las consultas
- Las políticas de seguridad (RLS)
- Insertará todos los datos de baremos
- Creará las funciones para convertir PD a PC y obtener interpretaciones

## Opción 2: Modificar la tabla baremos existente

Si ya has creado la tabla baremos pero estás teniendo problemas con la restricción de la columna "factor", sigue estos pasos:

1. Inicia sesión en tu proyecto de Supabase (https://app.supabase.com)
2. Ve a la sección "SQL Editor" en el menú lateral
3. Crea una nueva consulta haciendo clic en el botón "New Query"
4. Copia y pega el contenido del archivo `src/sql/modificar_tabla_baremos_corregido.sql`
5. Ejecuta la consulta haciendo clic en el botón "Run" (o presiona Ctrl+Enter)

## Verificar la inserción de datos

Para verificar que los datos se han insertado correctamente, puedes ejecutar la siguiente consulta SQL:

```sql
-- Contar registros por factor
SELECT Factor, COUNT(*) as total_registros
FROM Baremos_ESO_E_12_13
GROUP BY Factor
ORDER BY Factor;

-- Verificar rangos de puntajes para cada factor
SELECT Factor, 
       MIN(PD_Min) as min_pd, 
       MAX(PD_Max) as max_pd,
       MIN(Pc) as min_pc, 
       MAX(Pc) as max_pc
FROM Baremos_ESO_E_12_13
WHERE PD_Min IS NOT NULL AND PD_Max IS NOT NULL
GROUP BY Factor
ORDER BY Factor;
```

## Probar la conversión de PD a PC

Para probar que la conversión funciona correctamente, puedes ejecutar las siguientes consultas SQL:

```sql
-- Ejemplo 1: Convertir una PD de 25 en Aptitud Verbal (V)
SELECT convertir_pd_a_pc_eso_e_12_13('V', 25) as percentil,
       obtener_interpretacion_percentil(convertir_pd_a_pc_eso_e_12_13('V', 25)) as interpretacion;

-- Ejemplo 2: Convertir una PD de 40 en Atención (A)
SELECT convertir_pd_a_pc_eso_e_12_13('A', 40) as percentil,
       obtener_interpretacion_percentil(convertir_pd_a_pc_eso_e_12_13('A', 40)) as interpretacion;

-- Ejemplo 3: Convertir una PD de 15 en Aptitud Numérica (N)
SELECT convertir_pd_a_pc_eso_e_12_13('N', 15) as percentil,
       obtener_interpretacion_percentil(convertir_pd_a_pc_eso_e_12_13('N', 15)) as interpretacion;
```

## Uso desde JavaScript

Para usar la tabla de baremos desde tu código JavaScript, puedes utilizar el ejemplo proporcionado en `src/examples/ejemplo_uso_baremos_eso.js`. Este archivo muestra cómo convertir una puntuación directa a percentil utilizando la tabla `Baremos_ESO_E_12_13` en Supabase.

## Notas adicionales

- La tabla `Baremos_ESO_E_12_13` incluye registros con valores NULL para `PD_Min` y `PD_Max`, que representan percentiles sin puntuación directa asignada (representados por '--' en la tabla original).
- La función `convertir_pd_a_pc_eso_e_12_13` solo considera los registros con valores no nulos para `PD_Min` y `PD_Max`.
- Si no se encuentra un percentil correspondiente a una puntuación directa, la función devuelve un valor predeterminado de 50.
- La función `obtener_interpretacion_percentil` proporciona una interpretación cualitativa del percentil (Muy bajo, Bajo, Medio, Alto, Muy alto).
- La tabla tiene habilitada la seguridad a nivel de fila (RLS), lo que significa que solo los usuarios autenticados pueden ver los baremos, y solo los administradores pueden modificarlos.
