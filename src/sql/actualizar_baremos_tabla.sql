-- Script para actualizar la tabla baremos y añadir 'Concentración' a la lista de valores permitidos

-- Primero, eliminar la restricción existente
ALTER TABLE baremos DROP CONSTRAINT IF EXISTS baremos_factor_check;

-- Luego, añadir la nueva restricción con 'Concentración' incluido
ALTER TABLE baremos ADD CONSTRAINT baremos_factor_check CHECK (
  factor IN (
    'Aptitud Verbal',
    'Aptitud Espacial',
    'Atención',
    'Concentración',
    'Razonamiento',
    'Aptitud Numérica',
    'Aptitud Mecánica',
    'Ortografía'
  )
);
