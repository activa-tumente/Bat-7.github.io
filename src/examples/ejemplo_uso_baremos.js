/**
 * Ejemplo de cómo usar la tabla de baremos desde el código JavaScript
 * Este archivo muestra cómo convertir una puntuación directa (PD) a percentil (PC)
 * utilizando la tabla de baremos en Supabase
 */

import supabase from '../api/supabaseClient';

/**
 * Convierte una puntuación directa a percentil
 * @param {string} factor - Factor para el que se quiere convertir la puntuación
 * @param {number} puntuacionDirecta - Puntuación directa a convertir
 * @returns {Promise<{percentil: number, interpretacion: string, error: Object|null}>} Resultado de la conversión
 */
export const convertirPDaPC = async (factor, puntuacionDirecta) => {
  try {
    // Buscar el baremo correspondiente al factor y puntuación
    const { data, error } = await supabase
      .from('baremos')
      .select('*')
      .eq('factor', factor)
      .lte('puntaje_minimo', puntuacionDirecta)
      .gte('puntaje_maximo', puntuacionDirecta)
      .single();

    if (error) {
      console.error('Error al buscar baremo:', error);
      return {
        percentil: 50, // Valor predeterminado en caso de error
        interpretacion: 'Medio',
        error: error
      };
    }

    if (!data) {
      console.warn(`No se encontró baremo para ${factor} con puntaje ${puntuacionDirecta}`);
      return {
        percentil: 50, // Valor predeterminado si no se encuentra baremo
        interpretacion: 'Medio',
        error: null
      };
    }

    return {
      percentil: data.percentil,
      interpretacion: data.interpretacion || obtenerInterpretacion(data.percentil),
      error: null
    };
  } catch (error) {
    console.error('Error al convertir PD a PC:', error);
    return {
      percentil: 50, // Valor predeterminado en caso de error
      interpretacion: 'Medio',
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

// Ejemplo de uso
const ejemploDeUso = async () => {
  // Ejemplo 1: Convertir una PD de 25 en Aptitud Verbal
  const resultado1 = await convertirPDaPC('Aptitud Verbal', 25);
  console.log('Aptitud Verbal (PD=25):', resultado1);
  // Debería mostrar: { percentil: 80, interpretacion: 'Alto', error: null }

  // Ejemplo 2: Convertir una PD de 40 en Atención
  const resultado2 = await convertirPDaPC('Atención', 40);
  console.log('Atención (PD=40):', resultado2);
  // Debería mostrar: { percentil: 90, interpretacion: 'Muy alto', error: null }

  // Ejemplo 3: Convertir una PD de 15 en Aptitud Numérica
  const resultado3 = await convertirPDaPC('Aptitud Numérica', 15);
  console.log('Aptitud Numérica (PD=15):', resultado3);
  // Debería mostrar: { percentil: 60, interpretacion: 'Medio', error: null }
};

// Ejecutar el ejemplo (descomenta para probar)
// ejemploDeUso();

export default {
  convertirPDaPC,
  obtenerInterpretacion
};
