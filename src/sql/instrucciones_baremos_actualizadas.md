# Instrucciones actualizadas para implementar la tabla de baremos en Supabase

Este documento proporciona instrucciones paso a paso para crear la tabla de baremos en Supabase y poblarla con los datos de conversión de Puntuación Directa (PD) a Percentil (PC).

## Opción 1: Modificar la tabla baremos existente

Si ya has creado la tabla baremos pero estás teniendo problemas con la restricción de la columna "factor", sigue estos pasos:

1. Inicia sesión en tu proyecto de Supabase (https://app.supabase.com)
2. Ve a la sección "SQL Editor" en el menú lateral
3. Crea una nueva consulta haciendo clic en el botón "New Query"
4. Copia y pega el contenido del archivo `src/sql/modificar_tabla_baremos.sql`
5. Ejecuta la consulta haciendo clic en el botón "Run" (o presiona Ctrl+Enter)
6. Ahora puedes insertar los datos con el script `src/sql/baremos_data_completo.sql`

## Opción 2: Crear una nueva tabla Baremos_ESO_E_12_13

Si prefieres crear una tabla con la estructura exacta que proporcionaste, sigue estos pasos:

1. Inicia sesión en tu proyecto de Supabase (https://app.supabase.com)
2. Ve a la sección "SQL Editor" en el menú lateral
3. Crea una nueva consulta haciendo clic en el botón "New Query"
4. Copia y pega el contenido del archivo `src/sql/baremos_eso_e_12_13.sql`
5. Ejecuta la consulta haciendo clic en el botón "Run" (o presiona Ctrl+Enter)

## Opción 3: Crear la tabla baremos desde cero (versión modificada)

Si prefieres crear la tabla baremos desde cero con la estructura modificada que incluye "Concentración", sigue estos pasos:

1. Inicia sesión en tu proyecto de Supabase (https://app.supabase.com)
2. Ve a la sección "SQL Editor" en el menú lateral
3. Crea una nueva consulta haciendo clic en el botón "New Query"
4. Copia y pega el contenido del archivo `src/sql/baremos_table_modificado.sql`
5. Ejecuta la consulta haciendo clic en el botón "Run" (o presiona Ctrl+Enter)
6. Ahora puedes insertar los datos con el script `src/sql/baremos_data_completo.sql`

## Verificar la inserción de datos

Para verificar que los datos se han insertado correctamente, puedes ejecutar la siguiente consulta SQL:

```sql
-- Para la tabla baremos
SELECT factor, COUNT(*) as total_registros
FROM baremos
GROUP BY factor
ORDER BY factor;

-- Para la tabla Baremos_ESO_E_12_13
SELECT Factor, COUNT(*) as total_registros
FROM Baremos_ESO_E_12_13
GROUP BY Factor
ORDER BY Factor;
```

## Probar la conversión de PD a PC

Para probar que la conversión funciona correctamente, puedes ejecutar las siguientes consultas SQL:

```sql
-- Para la tabla baremos
SELECT * FROM baremos
WHERE factor = 'Aptitud Verbal'
AND 25 BETWEEN puntaje_minimo AND puntaje_maximo;

-- Para la tabla Baremos_ESO_E_12_13
SELECT * FROM Baremos_ESO_E_12_13
WHERE Factor = 'V'
AND 25 BETWEEN PD_Min AND PD_Max;
```

## Usar las funciones de conversión

Dependiendo de la tabla que hayas creado, puedes usar las siguientes funciones para convertir PD a PC:

```sql
-- Para la tabla baremos
SELECT convertir_pd_a_pc_baremos('Aptitud Verbal', 25) as percentil;

-- Para la tabla Baremos_ESO_E_12_13
SELECT convertir_pd_a_pc_eso_e_12_13('V', 25) as percentil;
```

## Notas adicionales

- Si has creado ambas tablas (baremos y Baremos_ESO_E_12_13), puedes convertir los datos de una a otra usando el script `src/sql/convertir_baremos_eso_a_baremos.sql`.
- La tabla baremos incluye una columna `interpretacion` que proporciona una interpretación cualitativa del percentil (Muy bajo, Bajo, Medio, Alto, Muy alto).
- Si necesitas modificar los datos, puedes hacerlo directamente en la interfaz de Supabase o mediante consultas SQL.
- Ambas tablas tienen habilitada la seguridad a nivel de fila (RLS), lo que significa que solo los usuarios autenticados pueden ver los baremos, y solo los administradores pueden modificarlos.
