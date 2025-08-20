-- Script para modificar la tabla baremos existente y agregar "Concentración" como un valor válido
-- Versión corregida para PostgreSQL

-- 1. Primero, eliminar la restricción existente
ALTER TABLE baremos DROP CONSTRAINT IF EXISTS baremos_factor_check;

-- 2. Agregar la nueva restricción con "Concentración" incluido
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
