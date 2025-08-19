import supabase from '../api/supabaseClient';
import { calculateAge } from '../utils/dateUtils';

/**
 * Constantes para evitar magic numbers y mejorar mantenibilidad
 */
const PERFORMANCE_CONSTANTS = {
  TREND_THRESHOLD: 2,
  RECENT_RESULTS_LIMIT: 3,
  PERCENTILE_THRESHOLDS: {
    EXCELLENT: 75,
    GOOD: 50,
    FAIR: 25
  },
  PRECISION: {
    AVERAGES: 2,
    PERCENTAGES: 1
  }
};

/**
 * Tipos de error específicos para mejor manejo
 */
class PatientDataError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'PatientDataError';
    this.code = code;
    this.details = details;
  }
}

class DatabaseConnectionError extends PatientDataError {
  constructor(message, details) {
    super(message, 'DB_CONNECTION_ERROR', details);
  }
}

class ValidationError extends PatientDataError {
  constructor(message, field, value) {
    super(message, 'VALIDATION_ERROR', { field, value });
  }
}

/**
 * Utilidades para cálculos estadísticos reutilizables
 */
class StatisticsCalculator {
  /**
   * Calcula el promedio de un array de valores
   * @param {number[]} values - Array de valores numéricos
   * @param {number} precision - Número de decimales
   * @returns {number} Promedio calculado
   */
  static calculateAverage(values, precision = PERFORMANCE_CONSTANTS.PRECISION.AVERAGES) {
    const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    if (validValues.length === 0) return 0;
    
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / validValues.length) * Math.pow(10, precision)) / Math.pow(10, precision);
  }
  
  /**
   * Calcula la tendencia comparando valores recientes con antiguos
   * @param {number[]} recentValues - Valores recientes
   * @param {number[]} olderValues - Valores antiguos
   * @param {number} threshold - Umbral para determinar cambio significativo
   * @returns {string} 'mejorando', 'declinando', o 'estable'
   */
  static calculateTrend(recentValues, olderValues, threshold = PERFORMANCE_CONSTANTS.TREND_THRESHOLD) {
    const recentAvg = this.calculateAverage(recentValues);
    const olderAvg = this.calculateAverage(olderValues);
    const improvement = recentAvg - olderAvg;
    
    if (improvement > threshold) return 'mejorando';
    if (improvement < -threshold) return 'declinando';
    return 'estable';
  }
  
  /**
   * Encuentra valores extremos en un array
   * @param {number[]} values - Array de valores
   * @returns {Object} Objeto con min y max
   */
  static findExtremes(values) {
    const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    if (validValues.length === 0) return { min: 0, max: 0 };
    
    return {
      min: Math.min(...validValues),
      max: Math.max(...validValues)
    };
  }
}

/**
 * Lógica de reintentos para operaciones que pueden fallar
 */
class RetryableOperation {
  /**
   * Ejecuta una operación con reintentos automáticos
   * @param {Function} operation - Función a ejecutar
   * @param {number} maxRetries - Número máximo de reintentos
   * @param {number} delay - Delay inicial en ms
   * @returns {Promise} Resultado de la operación
   */
  static async execute(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw new DatabaseConnectionError(
            `Operation failed after ${maxRetries} attempts: ${error.message}`,
            { originalError: error, attempts: maxRetries }
          );
        }
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, delay * Math.pow(2, attempt - 1))
        );
      }
    }
  }
}

/**
 * Servicio mejorado para extraer y procesar información de resultados por paciente
 * Implementa mejores prácticas de código y patrones de diseño
 */
export class PatientResultsExtractorImproved {

  /**
   * Validar ID de paciente
   * @private
   * @param {string} patientId - ID del paciente
   * @throws {ValidationError} Si el ID no es válido
   */
  static _validatePatientId(patientId) {
    if (!patientId || typeof patientId !== 'string' || patientId.trim() === '') {
      throw new ValidationError('ID de paciente inválido', 'patientId', patientId);
    }
  }

  /**
   * Obtener todos los resultados de un paciente específico
   * @param {string} patientId - ID del paciente
   * @returns {Promise<Array>} Array de resultados del paciente
   * @throws {PatientDataError} Si hay errores en la consulta
   */
  static async getPatientResults(patientId) {
    this._validatePatientId(patientId);
    
    return RetryableOperation.execute(async () => {
      const { data, error } = await supabase
        .from('resultados')
        .select(`
          *,
          aptitudes:aptitud_id (
            codigo,
            nombre,
            descripcion
          ),
          pacientes:paciente_id (
            nombre,
            apellido,
            documento,
            fecha_nacimiento,
            genero,
            email
          )
        `)
        .eq('paciente_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new DatabaseConnectionError(
          `Error al obtener resultados del paciente: ${error.message}`,
          { patientId, supabaseError: error }
        );
      }
      
      return data || [];
    });
  }

  /**
   * Calcular estadísticas básicas de los resultados
   * @private
   * @param {Array} results - Array de resultados
   * @returns {Object} Estadísticas básicas
   */
  static _calculateBasicStats(results) {
    return {
      totalTests: results.length,
      completedTests: results.map(r => r.aptitudes?.codigo).filter(Boolean),
      lastTestDate: results.length > 0 ? results[0].created_at : null,
      firstTestDate: results.length > 0 ? results[results.length - 1].created_at : null,
      patientInfo: results.length > 0 ? {
        ...results[0].pacientes,
        edad: results[0].pacientes?.fecha_nacimiento ? 
          calculateAge(results[0].pacientes.fecha_nacimiento) : null
      } : null
    };
  }

  /**
   * Calcular promedios generales
   * @private
   * @param {Array} results - Array de resultados
   * @returns {Object} Promedios calculados
   */
  static _calculateAverages(results) {
    const directScores = results.map(r => r.puntaje_directo).filter(Boolean);
    const percentiles = results.map(r => r.percentil).filter(p => p !== null && p !== undefined);
    const concentrations = results.map(r => r.concentracion).filter(Boolean);
    
    return {
      averageDirectScore: StatisticsCalculator.calculateAverage(directScores),
      averagePercentile: Math.round(StatisticsCalculator.calculateAverage(percentiles)),
      averageConcentration: StatisticsCalculator.calculateAverage(concentrations)
    };
  }

  /**
   * Calcular análisis de errores y respuestas
   * @private
   * @param {Array} results - Array de resultados
   * @returns {Object} Análisis de errores
   */
  static _calculateErrorAnalysis(results) {
    const totalErrors = results.reduce((sum, r) => sum + (r.errores || 0), 0);
    const totalCorrect = results.reduce((sum, r) => sum + (r.respuestas_correctas || 0), 0);
    const totalIncorrect = results.reduce((sum, r) => sum + (r.respuestas_incorrectas || 0), 0);
    const totalUnanswered = results.reduce((sum, r) => sum + (r.respuestas_sin_contestar || 0), 0);
    
    return {
      totalErrors,
      averageErrors: StatisticsCalculator.calculateAverage([totalErrors], 2),
      totalCorrectAnswers: totalCorrect,
      totalIncorrectAnswers: totalIncorrect,
      totalUnansweredQuestions: totalUnanswered,
      accuracyRate: totalCorrect + totalIncorrect > 0 ? 
        Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100) : 0
    };
  }

  /**
   * Calcular análisis de tiempo
   * @private
   * @param {Array} results - Array de resultados
   * @returns {Object} Análisis de tiempo
   */
  static _calculateTimeAnalysis(results) {
    const times = results.map(r => r.tiempo_segundos).filter(Boolean);
    const totalTime = times.reduce((sum, t) => sum + t, 0);
    
    return {
      totalTimeSeconds: totalTime,
      averageTimeSeconds: Math.round(StatisticsCalculator.calculateAverage(times)),
      fastestTime: times.length > 0 ? Math.min(...times) : 0,
      slowestTime: times.length > 0 ? Math.max(...times) : 0
    };
  }

  /**
   * Agrupar resultados por aptitud
   * @private
   * @param {Array} results - Array de resultados
   * @returns {Object} Resultados agrupados por aptitud
   */
  static _groupByAptitude(results) {
    const testsByAptitude = {};
    
    results.forEach(result => {
      const aptitudeCode = result.aptitudes?.codigo;
      if (!aptitudeCode) return;
      
      if (!testsByAptitude[aptitudeCode]) {
        testsByAptitude[aptitudeCode] = {
          name: result.aptitudes.nombre,
          description: result.aptitudes.descripcion,
          count: 0,
          scores: [],
          percentiles: [],
          averageScore: 0,
          averagePercentile: 0,
          extremes: { min: 0, max: 0 },
          improvement: 0
        };
      }
      
      const aptData = testsByAptitude[aptitudeCode];
      aptData.count++;
      
      if (result.puntaje_directo !== null) {
        aptData.scores.push(result.puntaje_directo);
      }
      
      if (result.percentil !== null) {
        aptData.percentiles.push(result.percentil);
      }
    });
    
    // Calcular estadísticas finales para cada aptitud
    Object.keys(testsByAptitude).forEach(aptCode => {
      const aptData = testsByAptitude[aptCode];
      
      aptData.averageScore = StatisticsCalculator.calculateAverage(aptData.scores);
      aptData.averagePercentile = Math.round(StatisticsCalculator.calculateAverage(aptData.percentiles));
      aptData.extremes = StatisticsCalculator.findExtremes(aptData.scores);
      
      // Calcular mejora (diferencia entre primer y último puntaje)
      if (aptData.scores.length > 1) {
        const firstScore = aptData.scores[aptData.scores.length - 1]; // Más antiguo
        const lastScore = aptData.scores[0]; // Más reciente
        aptData.improvement = lastScore - firstScore;
      }
    });
    
    return { testsByAptitude };
  }

  /**
   * Calcular tendencia de rendimiento general
   * @private
   * @param {Array} results - Array de resultados
   * @returns {Object} Tendencia de rendimiento
   */
  static _calculatePerformanceTrend(results) {
    if (results.length <= 1) {
      return { performanceTrend: null };
    }
    
    const limit = PERFORMANCE_CONSTANTS.RECENT_RESULTS_LIMIT;
    const recentResults = results.slice(0, Math.min(limit, results.length));
    const olderResults = results.slice(-Math.min(limit, results.length));
    
    const recentScores = recentResults.map(r => r.puntaje_directo).filter(Boolean);
    const olderScores = olderResults.map(r => r.puntaje_directo).filter(Boolean);
    
    const trend = StatisticsCalculator.calculateTrend(recentScores, olderScores);
    
    return { performanceTrend: trend };
  }

  /**
   * Calcular estadísticas completas de rendimiento de un paciente
   * Método refactorizado en funciones más pequeñas y especializadas
   * @param {string} patientId - ID del paciente
   * @returns {Promise<Object>} Estadísticas detalladas del paciente
   */
  static async getPatientStats(patientId) {
    try {
      const results = await this.getPatientResults(patientId);
      
      // Combinar todas las estadísticas calculadas por métodos especializados
      return {
        ...this._calculateBasicStats(results),
        ...this._calculateAverages(results),
        ...this._calculateErrorAnalysis(results),
        ...this._calculateTimeAnalysis(results),
        ...this._groupByAptitude(results),
        ...this._calculatePerformanceTrend(results)
      };
      
    } catch (error) {
      if (error instanceof PatientDataError) {
        throw error;
      }
      
      throw new PatientDataError(
        `Error al calcular estadísticas del paciente: ${error.message}`,
        'CALCULATION_ERROR',
        { patientId, originalError: error }
      );
    }
  }

  /**
   * Obtener resultados agrupados por aptitud para un paciente
   * @param {string} patientId - ID del paciente
   * @returns {Promise<Object>} Resultados agrupados por aptitud
   */
  static async getPatientResultsByAptitude(patientId) {
    try {
      const results = await this.getPatientResults(patientId);
      const groupedResults = {};
      
      results.forEach(result => {
        const aptitudeCode = result.aptitudes?.codigo;
        if (!aptitudeCode) return;
        
        if (!groupedResults[aptitudeCode]) {
          groupedResults[aptitudeCode] = {
            aptitud: {
              codigo: aptitudeCode,
              nombre: result.aptitudes.nombre,
              descripcion: result.aptitudes.descripcion
            },
            evaluaciones: [],
            estadisticas: {
              total: 0,
              promedioPD: 0,
              promedioPC: 0,
              mejorPD: 0,
              peorPD: 0,
              ultimaEvaluacion: null,
              primeraEvaluacion: null,
              tendencia: null
            }
          };
        }
        
        groupedResults[aptitudeCode].evaluaciones.push({
          id: result.id,
          puntajeDirecto: result.puntaje_directo,
          percentil: result.percentil,
          interpretacion: result.interpretacion,
          errores: result.errores,
          concentracion: result.concentracion,
          tiempoSegundos: result.tiempo_segundos,
          respuestasCorrectas: result.respuestas_correctas,
          respuestasIncorrectas: result.respuestas_incorrectas,
          respuestasSinContestar: result.respuestas_sin_contestar,
          totalPreguntas: result.total_preguntas,
          fecha: result.created_at,
          respuestas: result.respuestas
        });
      });
      
      // Calcular estadísticas para cada aptitud usando las utilidades
      Object.keys(groupedResults).forEach(aptCode => {
        const aptData = groupedResults[aptCode];
        const evaluaciones = aptData.evaluaciones;
        
        // Ordenar por fecha (más reciente primero)
        evaluaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        aptData.estadisticas.total = evaluaciones.length;
        
        if (evaluaciones.length > 0) {
          aptData.estadisticas.ultimaEvaluacion = evaluaciones[0].fecha;
          aptData.estadisticas.primeraEvaluacion = evaluaciones[evaluaciones.length - 1].fecha;
          
          const puntajes = evaluaciones.map(e => e.puntajeDirecto).filter(Boolean);
          const percentiles = evaluaciones.map(e => e.percentil).filter(p => p !== null);
          
          if (puntajes.length > 0) {
            aptData.estadisticas.promedioPD = StatisticsCalculator.calculateAverage(puntajes);
            const extremes = StatisticsCalculator.findExtremes(puntajes);
            aptData.estadisticas.mejorPD = extremes.max;
            aptData.estadisticas.peorPD = extremes.min;
          }
          
          if (percentiles.length > 0) {
            aptData.estadisticas.promedioPC = Math.round(StatisticsCalculator.calculateAverage(percentiles));
          }
          
          // Calcular tendencia usando la utilidad
          if (puntajes.length > 1) {
            const limit = Math.min(3, puntajes.length);
            const recentScores = puntajes.slice(0, limit);
            const olderScores = puntajes.slice(-limit);
            aptData.estadisticas.tendencia = StatisticsCalculator.calculateTrend(recentScores, olderScores, 1);
          }
        }
      });
      
      return groupedResults;
      
    } catch (error) {
      if (error instanceof PatientDataError) {
        throw error;
      }
      
      throw new PatientDataError(
        `Error al obtener resultados por aptitud: ${error.message}`,
        'APTITUDE_GROUPING_ERROR',
        { patientId, originalError: error }
      );
    }
  }

  /**
   * Generar reporte completo de un paciente
   * @param {string} patientId - ID del paciente
   * @returns {Promise<Object>} Reporte completo del paciente
   */
  static async generatePatientReport(patientId) {
    try {
      this._validatePatientId(patientId);
      
      const [stats, resultsByAptitude] = await Promise.all([
        this.getPatientStats(patientId),
        this.getPatientResultsByAptitude(patientId)
      ]);
      
      return {
        paciente: stats.patientInfo,
        estadisticasGenerales: {
          totalEvaluaciones: stats.totalTests,
          aptitudesEvaluadas: stats.completedTests,
          promedioGeneral: stats.averageDirectScore,
          promedioPercentil: stats.averagePercentile,
          tendenciaGeneral: stats.performanceTrend,
          tasaAciertos: stats.accuracyRate,
          periodoEvaluacion: {
            inicio: stats.firstTestDate,
            fin: stats.lastTestDate
          },
          tiempoPromedio: stats.averageTimeSeconds
        },
        rendimientoPorAptitud: resultsByAptitude,
        analisisComparativo: this._generateComparativeAnalysis(resultsByAptitude),
        recomendaciones: this._generateRecommendations(stats, resultsByAptitude),
        fechaGeneracion: new Date().toISOString(),
        metadatos: {
          version: '2.0',
          algoritmo: 'improved-extraction',
          confiabilidad: this._calculateReliabilityScore(stats)
        }
      };
      
    } catch (error) {
      if (error instanceof PatientDataError) {
        throw error;
      }
      
      throw new PatientDataError(
        `Error al generar reporte del paciente: ${error.message}`,
        'REPORT_GENERATION_ERROR',
        { patientId, originalError: error }
      );
    }
  }

  /**
   * Calcular puntuación de confiabilidad del reporte
   * @private
   * @param {Object} stats - Estadísticas del paciente
   * @returns {number} Puntuación de confiabilidad (0-100)
   */
  static _calculateReliabilityScore(stats) {
    let score = 0;
    
    // Más evaluaciones = mayor confiabilidad
    if (stats.totalTests >= 10) score += 40;
    else if (stats.totalTests >= 5) score += 25;
    else if (stats.totalTests >= 3) score += 15;
    
    // Diversidad de aptitudes evaluadas
    const uniqueAptitudes = stats.completedTests.length;
    if (uniqueAptitudes >= 5) score += 30;
    else if (uniqueAptitudes >= 3) score += 20;
    else if (uniqueAptitudes >= 2) score += 10;
    
    // Consistencia temporal (evaluaciones distribuidas en el tiempo)
    if (stats.firstTestDate && stats.lastTestDate) {
      const daysDiff = Math.abs(new Date(stats.lastTestDate) - new Date(stats.firstTestDate)) / (1000 * 60 * 60 * 24);
      if (daysDiff >= 30) score += 20;
      else if (daysDiff >= 7) score += 15;
      else if (daysDiff >= 1) score += 10;
    }
    
    // Calidad de datos (menos errores = mayor confiabilidad)
    if (stats.accuracyRate >= 90) score += 10;
    else if (stats.accuracyRate >= 75) score += 5;
    
    return Math.min(score, 100);
  }

  /**
   * Generar análisis comparativo entre aptitudes
   * @private
   * @param {Object} resultsByAptitude - Resultados agrupados por aptitud
   * @returns {Object|null} Análisis comparativo
   */
  static _generateComparativeAnalysis(resultsByAptitude) {
    const aptitudes = Object.keys(resultsByAptitude);
    
    if (aptitudes.length === 0) return null;
    
    const promedios = aptitudes.map(apt => ({
      codigo: apt,
      nombre: resultsByAptitude[apt].aptitud.nombre,
      promedio: resultsByAptitude[apt].estadisticas.promedioPD,
      percentil: resultsByAptitude[apt].estadisticas.promedioPC
    }));
    
    // Ordenar por promedio descendente
    promedios.sort((a, b) => b.promedio - a.promedio);
    
    const mitad = Math.ceil(promedios.length / 2);
    
    return {
      fortalezas: promedios.slice(0, mitad),
      areasDeDesarrollo: promedios.slice(mitad),
      aptitudDestacada: promedios[0],
      aptitudAMejorar: promedios[promedios.length - 1],
      rangoRendimiento: {
        maximo: promedios[0]?.promedio || 0,
        minimo: promedios[promedios.length - 1]?.promedio || 0,
        amplitud: (promedios[0]?.promedio || 0) - (promedios[promedios.length - 1]?.promedio || 0)
      }
    };
  }

  /**
   * Generar recomendaciones mejoradas basadas en los resultados
   * @private
   * @param {Object} stats - Estadísticas generales
   * @param {Object} resultsByAptitude - Resultados por aptitud
   * @returns {Array} Array de recomendaciones
   */
  static _generateRecommendations(stats, resultsByAptitude) {
    const recomendaciones = [];
    
    // Recomendaciones basadas en tendencia general
    switch (stats.performanceTrend) {
      case 'mejorando':
        recomendaciones.push('🎯 El paciente muestra una tendencia positiva de mejora. Continuar con el plan actual y considerar aumentar la complejidad de los ejercicios.');
        break;
      case 'declinando':
        recomendaciones.push('⚠️ Se observa una tendencia de declive. Revisar estrategias de intervención y considerar factores externos que puedan estar afectando el rendimiento.');
        break;
      case 'estable':
        recomendaciones.push('📊 El rendimiento se mantiene estable. Considerar nuevos desafíos para estimular el crecimiento o consolidar los logros actuales.');
        break;
    }
    
    // Recomendaciones basadas en tasa de aciertos
    if (stats.accuracyRate < 70) {
      recomendaciones.push('🎯 La tasa de aciertos es baja (< 70%). Revisar la comprensión de las instrucciones y considerar ejercicios de práctica adicionales.');
    } else if (stats.accuracyRate > 90) {
      recomendaciones.push('✅ Excelente tasa de aciertos (> 90%). El paciente demuestra buena comprensión y ejecución de las tareas.');
    }
    
    // Recomendaciones por aptitud específica
    Object.keys(resultsByAptitude).forEach(aptCode => {
      const aptData = resultsByAptitude[aptCode];
      const stats = aptData.estadisticas;
      
      if (stats.tendencia === 'declinando') {
        recomendaciones.push(`📉 Reforzar trabajo en ${aptData.aptitud.nombre} debido a tendencia declinante. Considerar ejercicios específicos de rehabilitación.`);
      } else if (stats.tendencia === 'mejorando') {
        recomendaciones.push(`📈 Excelente progreso en ${aptData.aptitud.nombre}. Mantener estrategias actuales y considerar ejercicios de mayor complejidad.`);
      }
      
      // Recomendaciones basadas en percentiles
      if (stats.promedioPC < PERFORMANCE_CONSTANTS.PERCENTILE_THRESHOLDS.FAIR) {
        recomendaciones.push(`🔄 ${aptData.aptitud.nombre} requiere atención prioritaria (percentil < 25). Implementar programa de intervención intensiva.`);
      } else if (stats.promedioPC > PERFORMANCE_CONSTANTS.PERCENTILE_THRESHOLDS.EXCELLENT) {
        recomendaciones.push(`🌟 ${aptData.aptitud.nombre} muestra rendimiento excelente (percentil > 75). Considerar como fortaleza para compensar otras áreas.`);
      }
    });
    
    // Recomendaciones basadas en número de evaluaciones
    if (stats.totalTests < 3) {
      recomendaciones.push('📋 Se recomienda realizar más evaluaciones para obtener un perfil más completo y confiable del paciente.');
    }
    
    // Recomendaciones basadas en diversidad de aptitudes
    if (stats.completedTests.length < 3) {
      recomendaciones.push('🎯 Considerar evaluar más aptitudes para obtener un perfil cognitivo más completo.');
    }
    
    return recomendaciones;
  }
}

// Exportar también las utilidades para uso independiente
export { StatisticsCalculator, RetryableOperation, PatientDataError, ValidationError, DatabaseConnectionError };

export default PatientResultsExtractorImproved;