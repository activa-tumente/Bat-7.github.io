# Instrucciones para implementar la tabla de baremos en Supabase

Este documento proporciona instrucciones paso a paso para crear la tabla de baremos en Supabase y poblarla con los datos de conversión de Puntuación Directa (PD) a Percentil (PC).

## 1. Crear la tabla baremos

1. Inicia sesión en tu proyecto de Supabase (https://app.supabase.com)
2. Ve a la sección "SQL Editor" en el menú lateral
3. Crea una nueva consulta haciendo clic en el botón "New Query"
4. Copia y pega el contenido del archivo `src/sql/baremos_table_fixed.sql`
   - Si encuentras algún error, prueba con la versión simplificada: `src/sql/baremos_table_simple.sql`
5. Ejecuta la consulta haciendo clic en el botón "Run" (o presiona Ctrl+Enter)

**Nota importante**: Si encuentras un error de sintaxis relacionado con los comentarios, asegúrate de que todos los comentarios comiencen con dos guiones (`--`) y no con uno solo (`-`). También puedes intentar eliminar todos los comentarios del script antes de ejecutarlo.

## 2. Si la tabla ya existe y necesitas actualizarla

Si la tabla baremos ya existe y necesitas actualizarla para incluir el factor "Concentración", sigue estos pasos:

1. En la sección "SQL Editor", crea una nueva consulta
2. Copia y pega el contenido del archivo `src/sql/actualizar_baremos_tabla_simple.sql`
   - Si encuentras algún error, prueba con el archivo original: `src/sql/actualizar_baremos_tabla.sql`
3. Ejecuta la consulta haciendo clic en el botón "Run" (o presiona Ctrl+Enter)

## 3. Insertar los datos de baremos

1. En la sección "SQL Editor", crea una nueva consulta
2. Copia y pega el contenido del archivo `src/sql/baremos_data_sin_comentarios.sql`
   - Si encuentras algún error, prueba con el archivo original: `src/sql/baremos_data_completo.sql`
3. Ejecuta la consulta haciendo clic en el botón "Run" (o presiona Ctrl+Enter)

Si prefieres insertar los datos por partes (por ejemplo, factor por factor), puedes usar los siguientes archivos:
- `src/sql/baremos_aptitud_verbal.sql`
- `src/sql/baremos_aptitud_espacial.sql`
- `src/sql/baremos_atencion.sql`
- `src/sql/baremos_concentracion.sql`
- `src/sql/baremos_razonamiento.sql`
- `src/sql/baremos_aptitud_numerica.sql`
- `src/sql/baremos_aptitud_mecanica.sql`
- `src/sql/baremos_ortografia.sql`

**Nota importante**: Si encuentras errores de sintaxis, prueba a ejecutar los scripts sin comentarios o a insertar los datos por partes.

## 4. Verificar la estructura de la tabla y la inserción de datos

Para verificar la estructura de la tabla baremos, puedes ejecutar la siguiente consulta SQL:

```sql
-- Verificar la estructura de la tabla baremos
SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'baremos'
ORDER BY ordinal_position;
```

Para verificar que los datos se han insertado correctamente, puedes ejecutar la siguiente consulta SQL:

```sql
SELECT factor, COUNT(*) as total_registros
FROM baremos
GROUP BY factor
ORDER BY factor;
```

Deberías ver un resultado similar a este:

| factor            | total_registros |
|-------------------|-----------------|
| Aptitud Espacial  | 22              |
| Aptitud Mecánica  | 19              |
| Aptitud Numérica  | 24              |
| Aptitud Verbal    | 20              |
| Atención          | 26              |
| Concentración     | 26              |
| Ortografía        | 24              |
| Razonamiento      | 22              |

## 5. Probar la conversión de PD a PC

Para probar que la conversión funciona correctamente, puedes ejecutar la siguiente consulta SQL:

```sql
-- Ejemplo: Convertir una PD de 25 en Aptitud Verbal
SELECT * FROM baremos
WHERE factor = 'Aptitud Verbal'
AND 25 BETWEEN puntaje_minimo AND puntaje_maximo;
```

Esto debería devolver el registro correspondiente con el percentil 80 para una PD de 25 en Aptitud Verbal.

También puedes probar con otros factores:

```sql
-- Ejemplo: Convertir una PD de 85 en Concentración
SELECT * FROM baremos
WHERE factor = 'Concentración'
AND 85 BETWEEN puntaje_minimo AND puntaje_maximo;
```

## 6. Usar la función de conversión (opcional)

Si has creado la función `convertir_pd_a_pc_baremos` (incluida en el archivo `baremos_table.sql`), puedes probarla con la siguiente consulta:

```sql
-- Ejemplo: Convertir una PD de 25 en Aptitud Verbal usando la función
SELECT convertir_pd_a_pc_baremos('Aptitud Verbal', 25) as percentil;
```

## Notas adicionales

- La tabla incluye una columna `interpretacion` que proporciona una interpretación cualitativa del percentil (Muy bajo, Bajo, Medio, Alto, Muy alto).
- Si necesitas modificar los datos, puedes hacerlo directamente en la interfaz de Supabase o mediante consultas SQL.
- La tabla tiene habilitada la seguridad a nivel de fila (RLS), lo que significa que solo los usuarios autenticados pueden ver los baremos, y solo los administradores pueden modificarlos.
