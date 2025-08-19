-- -----------------------------------------------------
-- Tabla para almacenar los Baremos de 1º ESO (Nivel E, 12-13 años)
-- PD = Puntuación Directa
-- Pc = Percentil
-- PD_Min y PD_Max definen el rango de Puntuación Directa para un Percentil dado.
-- Si PD_Min == PD_Max, es un valor único.
-- Si PD_Min y PD_Max son NULL, no hay puntuación directa asignada a ese percentil (representado por '--' en la tabla original).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Baremos_ESO_E_12_13 (
    ID SERIAL PRIMARY KEY,
    Factor VARCHAR(5) NOT NULL, -- Factor evaluado (V, E, A, CON, R, N, M, O)
    Pc INT NOT NULL, -- Percentil (1-99)
    PD_Min INT NULL, -- Puntuación Directa Mínima del rango
    PD_Max INT NULL, -- Puntuación Directa Máxima del rango
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_factor_pc ON Baremos_ESO_E_12_13 (Factor, Pc);
CREATE INDEX IF NOT EXISTS idx_factor_pd_range ON Baremos_ESO_E_12_13 (Factor, PD_Min, PD_Max);

-- Habilitar Row Level Security (RLS) en la tabla
ALTER TABLE Baremos_ESO_E_12_13 ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para la tabla
CREATE POLICY "Baremos visibles para todos los usuarios autenticados" 
ON Baremos_ESO_E_12_13 FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Solo administradores pueden modificar baremos" 
ON Baremos_ESO_E_12_13 FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.tipo_usuario = 'Administrador'
  )
);

-- -----------------------------------------------------
-- Inserción de datos
-- -----------------------------------------------------
INSERT INTO Baremos_ESO_E_12_13 (Factor, Pc, PD_Min, PD_Max) VALUES
-- Pc 99
('V', 99, 30, 32), ('E', 99, 27, 28), ('A', 99, 49, 80), ('CON', 99, 98, 100), ('R', 99, 29, 32), ('N', 99, 28, 32), ('M', 99, 25, 28), ('O', 99, 31, 32),
-- Pc 98
('V', 98, NULL, NULL), ('E', 98, NULL, NULL), ('A', 98, 48, 48), ('CON', 98, NULL, NULL), ('R', 98, 28, 28), ('N', 98, 27, 27), ('M', 98, NULL, NULL), ('O', 98, NULL, NULL),
-- Pc 97
('V', 97, 29, 29), ('E', 97, NULL, NULL), ('A', 97, 46, 47), ('CON', 97, 96, 97), ('R', 97, NULL, NULL), ('N', 97, 26, 26), ('M', 97, NULL, NULL), ('O', 97, 30, 30),
-- Pc 96
('V', 96, NULL, NULL), ('E', 96, 26, 26), ('A', 96, 44, 45), ('CON', 96, 95, 95), ('R', 96, 27, 27), ('N', 96, 25, 25), ('M', 96, 24, 24), ('O', 96, NULL, NULL),
-- Pc 95
('V', 95, 28, 28), ('E', 95, 25, 25), ('A', 95, 43, 43), ('CON', 95, 94, 94), ('R', 95, 26, 26), ('N', 95, 24, 24), ('M', 95, 23, 23), ('O', 95, 29, 29),
-- Pc 90
('V', 90, 27, 27), ('E', 90, 24, 24), ('A', 90, 39, 42), ('CON', 90, 91, 93), ('R', 90, 25, 25), ('N', 90, 22, 23), ('M', 90, 22, 22), ('O', 90, 27, 28),
-- Pc 85
('V', 85, 26, 26), ('E', 85, 23, 23), ('A', 85, 36, 38), ('CON', 85, 89, 90), ('R', 85, 24, 24), ('N', 85, 20, 21), ('M', 85, 21, 21), ('O', 85, 26, 26),
-- Pc 80
('V', 80, 25, 25), ('E', 80, 22, 22), ('A', 80, 35, 35), ('CON', 80, 88, 88), ('R', 80, 23, 23), ('N', 80, 19, 19), ('M', 80, 20, 20), ('O', 80, 25, 25),
-- Pc 75
('V', 75, NULL, NULL), ('E', 75, 21, 21), ('A', 75, 34, 34), ('CON', 75, 85, 87), ('R', 75, NULL, NULL), ('N', 75, 18, 18), ('M', 75, NULL, NULL), ('O', 75, NULL, NULL),
-- Pc 70
('V', 70, 24, 24), ('E', 70, 20, 20), ('A', 70, 33, 33), ('CON', 70, 83, 84), ('R', 70, 22, 22), ('N', 70, 17, 17), ('M', 70, 19, 19), ('O', 70, 24, 24),
-- Pc 65
('V', 65, 23, 23), ('E', 65, NULL, NULL), ('A', 65, 31, 32), ('CON', 65, 82, 82), ('R', 65, 21, 21), ('N', 65, 16, 16), ('M', 65, NULL, NULL), ('O', 65, 23, 23),
-- Pc 60
('V', 60, NULL, NULL), ('E', 60, 19, 19), ('A', 60, 29, 30), ('CON', 60, 80, 81), ('R', 60, 20, 20), ('N', 60, 15, 15), ('M', 60, 18, 18), ('O', 60, 22, 22),
-- Pc 55
('V', 55, 22, 22), ('E', 55, 18, 18), ('A', 55, 28, 28), ('CON', 55, 78, 79), ('R', 55, NULL, NULL), ('N', 55, 14, 14), ('M', 55, NULL, NULL), ('O', 55, 21, 21),
-- Pc 50
('V', 50, 21, 21), ('E', 50, 17, 17), ('A', 50, 27, 27), ('CON', 50, 76, 77), ('R', 50, 19, 19), ('N', 50, 13, 13), ('M', 50, 17, 17), ('O', 50, 20, 20),
-- Pc 45
('V', 45, NULL, NULL), ('E', 45, NULL, NULL), ('A', 45, 26, 26), ('CON', 45, 74, 75), ('R', 45, 18, 18), ('N', 45, 12, 12), ('M', 45, 16, 16), ('O', 45, 19, 19),
-- Pc 40
('V', 40, 20, 20), ('E', 40, 16, 16), ('A', 40, 25, 25), ('CON', 40, 72, 73), ('R', 40, 17, 17), ('N', 40, 11, 11), ('M', 40, NULL, NULL), ('O', 40, 18, 18),
-- Pc 35
('V', 35, 19, 19), ('E', 35, 15, 15), ('A', 35, 24, 24), ('CON', 35, 69, 71), ('R', 35, NULL, NULL), ('N', 35, 10, 10), ('M', 35, 15, 15), ('O', 35, 17, 17),
-- Pc 30
('V', 30, NULL, NULL), ('E', 30, NULL, NULL), ('A', 30, 23, 23), ('CON', 30, 67, 68), ('R', 30, 16, 16), ('N', 30, NULL, NULL), ('M', 30, 14, 14), ('O', 30, 16, 16),
-- Pc 25
('V', 25, 18, 18), ('E', 25, 14, 14), ('A', 25, 22, 22), ('CON', 25, 64, 66), ('R', 25, 15, 15), ('N', 25, 9, 9), ('M', 25, NULL, NULL), ('O', 25, 15, 15),
-- Pc 20
('V', 20, 17, 17), ('E', 20, 13, 13), ('A', 20, 21, 21), ('CON', 20, 61, 63), ('R', 20, 14, 14), ('N', 20, 8, 8), ('M', 20, 13, 13), ('O', 20, 14, 14),
-- Pc 15
('V', 15, 16, 16), ('E', 15, 12, 12), ('A', 15, 19, 20), ('CON', 15, 56, 60), ('R', 15, 13, 13), ('N', 15, 7, 7), ('M', 15, 12, 12), ('O', 15, 13, 13),
-- Pc 10
('V', 10, 15, 15), ('E', 10, 11, 11), ('A', 10, 17, 18), ('CON', 10, 47, 55), ('R', 10, 11, 12), ('N', 10, 6, 6), ('M', 10, 11, 11), ('O', 10, 11, 12),
-- Pc 5
('V', 5, 13, 14), ('E', 5, 9, 10), ('A', 5, 15, 16), ('CON', 5, 36, 46), ('R', 5, 8, 10), ('N', 5, 5, 5), ('M', 5, 10, 10), ('O', 5, 9, 10),
-- Pc 4
('V', 4, 12, 12), ('E', 4, 8, 8), ('A', 4, 13, 14), ('CON', 4, 33, 35), ('R', 4, NULL, NULL), ('N', 4, NULL, NULL), ('M', 4, 9, 9), ('O', 4, 8, 8),
-- Pc 3
('V', 3, NULL, NULL), ('E', 3, 7, 7), ('A', 3, NULL, NULL), ('CON', 3, 29, 32), ('R', 3, 7, 7), ('N', 3, 4, 4), ('M', 3, 8, 8), ('O', 3, 7, 7),
-- Pc 2
('V', 2, 11, 11), ('E', 2, 6, 6), ('A', 2, 12, 12), ('CON', 2, 28, 28), ('R', 2, 6, 6), ('N', 2, NULL, NULL), ('M', 2, NULL, NULL), ('O', 2, 6, 6),
-- Pc 1
('V', 1, 0, 10), ('E', 1, 0, 5), ('A', 1, 0, 11), ('CON', 1, 0, 27), ('R', 1, 0, 5), ('N', 1, 0, 3), ('M', 1, 0, 7), ('O', 1, 0, 5);

-- -----------------------------------------------------
-- Función para convertir PD a PC utilizando la tabla Baremos_ESO_E_12_13
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION convertir_pd_a_pc_eso_e_12_13(
  p_factor VARCHAR(5),
  p_puntaje INTEGER
) 
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_percentil INTEGER;
BEGIN
  -- Buscar el percentil correspondiente en la tabla baremos
  SELECT Pc INTO v_percentil
  FROM Baremos_ESO_E_12_13
  WHERE Factor = p_factor
    AND p_puntaje >= PD_Min
    AND p_puntaje <= PD_Max;
  
  -- Si no se encuentra un valor en la tabla, usar un valor predeterminado
  IF v_percentil IS NULL THEN
    v_percentil := 50; -- Valor predeterminado si no hay coincidencia
  END IF;
  
  RETURN v_percentil;
END;
$$;
