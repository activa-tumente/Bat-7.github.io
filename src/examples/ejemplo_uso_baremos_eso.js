/**
 * Ejemplo de cómo usar la tabla Baremos_ESO_E_12_13 desde el código JavaScript
 * Este archivo muestra cómo convertir una puntuación directa (PD) a percentil (PC)
 * utilizando la tabla Baremos_ESO_E_12_13 en Supabase
 */

import supabase from '../api/supabaseClient';

/**
 * Convierte una puntuación directa a percentil usando la tabla Baremos_ESO_E_12_13
 * @param {string} factor - Factor para el que se quiere convertir la puntuación (V, E, A, CON, R, N, M, O)
 * @param {number} puntuacionDirecta - Puntuación directa a convertir
 * @returns {Promise<{percentil: number, interpretacion: string, error: Object|null}>} Resultado de la conversión
 */
export const convertirPDaPC = async (factor, puntuacionDirecta) => {
  try {
    // Buscar el baremo correspondiente al factor y puntuación
    const { data, error } = await supabase
      .from('Baremos_ESO_E_12_13')
      .select('*')
      .eq('Factor', factor)
      .lte('PD_Min', puntuacionDirecta)
      .gte('PD_Max', puntuacionDirecta)
      .single();

    if (error) {
      console.error('Error al buscar baremo:', error);
      return {
        percentil: 50, // Valor predeterminado en caso de error
        interpretacion: obtenerInterpretacion(50),
        error: error
      };
    }

    if (!data) {
      console.warn(`No se encontró baremo para ${factor} con puntaje ${puntuacionDirecta}`);
      return {
        percentil: 50, // Valor predeterminado si no se encuentra baremo
        interpretacion: obtenerInterpretacion(50),
        error: null
      };
    }

    return {
      percentil: data.Pc,
      interpretacion: obtenerInterpretacion(data.Pc),
      error: null
    };
  } catch (error) {
    console.error('Error al convertir PD a PC:', error);
    return {
      percentil: 50, // Valor predeterminado en caso de error
      interpretacion: obtenerInterpretacion(50),
      error: {
        message: 'Error al convertir puntuación directa a percentil',
        original: error
      }
    };
  }
};

/**
 * Obtiene la interpretación de un percentil
 * @param {number} percentil - Percentil a interpretar
 * @returns {string} Interpretación del percentil
 */
export const obtenerInterpretacion = (percentil) => {
  if (percentil >= 90) return 'Muy alto';
  if (percentil >= 70) return 'Alto';
  if (percentil >= 30) return 'Medio';
  if (percentil >= 10) return 'Bajo';
  return 'Muy bajo';
};

/**
 * Convierte el código de factor a nombre completo
 * @param {string} factorCodigo - Código del factor (V, E, A, CON, R, N, M, O)
 * @returns {string} Nombre completo del factor
 */
export const obtenerNombreFactor = (factorCodigo) => {
  switch (factorCodigo) {
    case 'V': return 'Aptitud Verbal';
    case 'E': return 'Aptitud Espacial';
    case 'A': return 'Atención';
    case 'CON': return 'Concentración';
    case 'R': return 'Razonamiento';
    case 'N': return 'Aptitud Numérica';
    case 'M': return 'Aptitud Mecánica';
    case 'O': return 'Ortografía';
    default: return factorCodigo;
  }
};

// Ejemplo de uso
const ejemploDeUso = async () => {
  // Ejemplo 1: Convertir una PD de 25 en Aptitud Verbal (V)
  const resultado1 = await convertirPDaPC('V', 25);
  console.log(`${obtenerNombreFactor('V')} (PD=25):`, resultado1);
  // Debería mostrar: { percentil: 80, interpretacion: 'Alto', error: null }

  // Ejemplo 2: Convertir una PD de 40 en Atención (A)
  const resultado2 = await convertirPDaPC('A', 40);
  console.log(`${obtenerNombreFactor('A')} (PD=40):`, resultado2);
  // Debería mostrar: { percentil: 90, interpretacion: 'Muy alto', error: null }

  // Ejemplo 3: Convertir una PD de 15 en Aptitud Numérica (N)
  const resultado3 = await convertirPDaPC('N', 15);
  console.log(`${obtenerNombreFactor('N')} (PD=15):`, resultado3);
  // Debería mostrar: { percentil: 60, interpretacion: 'Medio', error: null }
};

// Ejecutar el ejemplo (descomenta para probar)
// ejemploDeUso();

export default {
  convertirPDaPC,
  obtenerInterpretacion,
  obtenerNombreFactor
};
