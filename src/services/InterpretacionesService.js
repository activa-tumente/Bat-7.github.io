import supabase from '../api/supabaseClient.js';
import { INTERPRETACIONES_HARDCODED } from '../utils/interpretacionesHardcoded.js';

/**
 * Servicio para manejar interpretaciones cualitativas de aptitudes e índices
 * Usa interpretaciones hardcodeadas como fallback cuando las funciones SQL no están disponibles
 */
class InterpretacionesService {
  /**
   * Obtiene el nivel de rendimiento basado en el percentil
   * @param {number} percentil - Percentil del resultado (0-100)
   * @returns {Promise<Object>} Nivel de rendimiento
   */
  static async obtenerNivelPorPercentil(percentil) {
    try {
      // Usar interpretaciones hardcodeadas como fallback
      const nivel = INTERPRETACIONES_HARDCODED.obtenerNivelPorPercentil(percentil);
      return nivel;
    } catch (error) {
      console.error('Error al obtener nivel por percentil:', error);
      throw error;
    }
  }

  /**
   * Obtiene la interpretación cualitativa para una aptitud específica
   * @param {string} aptitudCodigo - Código de la aptitud (V, E, R, N, A, M, O)
   * @param {number} percentil - Percentil del resultado
   * @returns {Promise<Object>} Interpretación cualitativa completa
   */
  static async obtenerInterpretacionAptitud(aptitudCodigo, percentil) {
    try {
      // Usar interpretaciones hardcodeadas como fallback
      const interpretacion = INTERPRETACIONES_HARDCODED.obtenerInterpretacionAptitud(aptitudCodigo, percentil);
      return interpretacion;
    } catch (error) {
      console.error('Error al obtener interpretación de aptitud:', error);
      throw error;
    }
  }

  /**
   * Obtiene la interpretación cualitativa para un índice de inteligencia
   * @param {string} indiceCodigo - Código del índice (CG, IE)
   * @param {number} percentil - Percentil del resultado
   * @returns {Promise<Object>} Interpretación cualitativa completa
   */
  static async obtenerInterpretacionIndice(indiceCodigo, percentil) {
    try {
      const { data, error } = await supabase
        .rpc('obtener_interpretacion_indice', {
          p_indice_codigo: indiceCodigo,
          p_percentil: percentil
        });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener interpretación de índice:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las interpretaciones para múltiples aptitudes
   * @param {Array} resultados - Array de objetos con {aptitud_codigo, percentil}
   * @returns {Promise<Array>} Array de interpretaciones
   */
  static async obtenerInterpretacionesMultiples(resultados) {
    try {
      const interpretaciones = await Promise.all(
        resultados.map(async (resultado) => {
          const interpretacion = await this.obtenerInterpretacionAptitud(
            resultado.aptitud_codigo,
            resultado.percentil
          );
          return {
            ...resultado,
            interpretacion
          };
        })
      );
      
      return interpretaciones;
    } catch (error) {
      console.error('Error al obtener interpretaciones múltiples:', error);
      throw error;
    }
  }

  /**
   * Genera un resumen cualitativo completo para un paciente
   * @param {Array} resultadosAptitudes - Resultados de aptitudes
   * @param {Array} resultadosIndices - Resultados de índices
   * @returns {Promise<Object>} Resumen cualitativo completo
   */
  static async generarResumenCualitativo(resultadosAptitudes, resultadosIndices = []) {
    try {
      // Obtener interpretaciones de aptitudes
      const interpretacionesAptitudes = await this.obtenerInterpretacionesMultiples(
        resultadosAptitudes
      );

      // Obtener interpretaciones de índices
      const interpretacionesIndices = await Promise.all(
        resultadosIndices.map(async (indice) => {
          const interpretacion = await this.obtenerInterpretacionIndice(
            indice.indice_codigo,
            indice.percentil
          );
          return {
            ...indice,
            interpretacion
          };
        })
      );

      // Analizar fortalezas y debilidades
      const fortalezas = interpretacionesAptitudes
        .filter(apt => apt.percentil >= 75)
        .map(apt => ({
          aptitud: apt.aptitud_codigo,
          percentil: apt.percentil,
          nivel: apt.interpretacion?.nivel_nombre,
          descripcion: apt.interpretacion?.rendimiento
        }));

      const debilidades = interpretacionesAptitudes
        .filter(apt => apt.percentil <= 25)
        .map(apt => ({
          aptitud: apt.aptitud_codigo,
          percentil: apt.percentil,
          nivel: apt.interpretacion?.nivel_nombre,
          descripcion: apt.interpretacion?.rendimiento
        }));

      // Generar recomendaciones académicas
      const recomendacionesAcademicas = this._generarRecomendacionesAcademicas(
        interpretacionesAptitudes
      );

      // Generar orientación vocacional
      const orientacionVocacional = this._generarOrientacionVocacional(
        interpretacionesAptitudes
      );

      return {
        interpretacionesAptitudes,
        interpretacionesIndices,
        fortalezas,
        debilidades,
        recomendacionesAcademicas,
        orientacionVocacional,
        resumenGeneral: this._generarResumenGeneral(
          interpretacionesAptitudes,
          interpretacionesIndices
        )
      };
    } catch (error) {
      console.error('Error al generar resumen cualitativo:', error);
      throw error;
    }
  }

  /**
   * Genera recomendaciones académicas basadas en las interpretaciones
   * @private
   */
  static _generarRecomendacionesAcademicas(interpretaciones) {
    const recomendaciones = [];
    
    interpretaciones.forEach(interp => {
      if (interp.interpretacion?.academico) {
        recomendaciones.push({
          aptitud: interp.aptitud_codigo,
          nivel: interp.interpretacion.nivel_nombre,
          recomendacion: interp.interpretacion.academico
        });
      }
    });

    return recomendaciones;
  }

  /**
   * Genera orientación vocacional basada en las interpretaciones
   * @private
   */
  static _generarOrientacionVocacional(interpretaciones) {
    const orientaciones = [];
    
    interpretaciones.forEach(interp => {
      if (interp.interpretacion?.vocacional) {
        orientaciones.push({
          aptitud: interp.aptitud_codigo,
          nivel: interp.interpretacion.nivel_nombre,
          orientacion: interp.interpretacion.vocacional
        });
      }
    });

    return orientaciones;
  }

  /**
   * Genera un resumen general del perfil cognitivo
   * @private
   */
  static _generarResumenGeneral(interpretacionesAptitudes, interpretacionesIndices) {
    // Check if interpretacionesAptitudes is empty to avoid reduce error
    const promedioPercentil = interpretacionesAptitudes.length > 0 
      ? interpretacionesAptitudes.reduce(
          (sum, apt) => sum + apt.percentil, 0
        ) / interpretacionesAptitudes.length
      : 50; // Default to median percentile when no aptitudes are available

    let nivelGeneral = 'Promedio';
    if (promedioPercentil >= 85) nivelGeneral = 'Superior';
    else if (promedioPercentil >= 75) nivelGeneral = 'Por encima del promedio';
    else if (promedioPercentil <= 15) nivelGeneral = 'Por debajo del promedio';
    else if (promedioPercentil <= 25) nivelGeneral = 'Ligeramente por debajo del promedio';

    const aptitudesDestacadas = interpretacionesAptitudes
      .filter(apt => apt.percentil >= 75)
      .map(apt => apt.aptitud_codigo);

    const aptitudesAMejorar = interpretacionesAptitudes
      .filter(apt => apt.percentil <= 25)
      .map(apt => apt.aptitud_codigo);

    return {
      nivelGeneral,
      promedioPercentil: Math.round(promedioPercentil),
      aptitudesDestacadas,
      aptitudesAMejorar,
      perfilCognitivo: this._determinarPerfilCognitivo(interpretacionesAptitudes)
    };
  }

  /**
   * Determina el perfil cognitivo predominante
   * @private
   */
  static _determinarPerfilCognitivo(interpretaciones) {
    const perfiles = {
      verbal: ['V', 'O'],
      numerico: ['N', 'R'],
      espacial: ['E', 'M'],
      atencion: ['A']
    };

    const promediosPorPerfil = {};
    
    Object.keys(perfiles).forEach(perfil => {
      const aptitudesPerfil = interpretaciones.filter(
        apt => perfiles[perfil].includes(apt.aptitud_codigo)
      );
      
      if (aptitudesPerfil.length > 0) {
        promediosPorPerfil[perfil] = aptitudesPerfil.reduce(
          (sum, apt) => sum + apt.percentil, 0
        ) / aptitudesPerfil.length;
      }
    });

    // Check if promediosPorPerfil is empty to avoid reduce error
    const perfilesDisponibles = Object.keys(promediosPorPerfil);
    const perfilDominante = perfilesDisponibles.length > 0 
      ? perfilesDisponibles.reduce(
          (a, b) => promediosPorPerfil[a] > promediosPorPerfil[b] ? a : b
        )
      : 'equilibrado'; // Default value when no profiles are available

    return {
      perfilDominante,
      promedios: promediosPorPerfil
    };
  }

  /**
   * Obtiene todas las aptitudes disponibles
   * @returns {Promise<Array>} Lista de aptitudes
   */
  static async obtenerAptitudes() {
    try {
      const { data, error } = await supabase
        .from('aptitudes_interpretacion')
        .select('*')
        .order('codigo');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener aptitudes:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los índices de inteligencia disponibles
   * @returns {Promise<Array>} Lista de índices
   */
  static async obtenerIndices() {
    try {
      const { data, error } = await supabase
        .from('indices_inteligencia')
        .select('*')
        .order('codigo');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener índices:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los niveles de rendimiento
   * @returns {Promise<Array>} Lista de niveles
   */
  static async obtenerNiveles() {
    try {
      const { data, error } = await supabase
        .from('niveles_rendimiento')
        .select('*')
        .order('percentil_minimo');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener niveles:', error);
      throw error;
    }
  }
}

export default InterpretacionesService;