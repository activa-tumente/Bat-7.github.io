import supabase from '../api/supabaseClient';
import { calculateAge } from '../utils/dateUtils';

/**
 * Servicio para extraer y procesar información de resultados por paciente
 * Basado en la tabla 'resultados' de Supabase
 */
export class PatientResultsExtractor {

  /**
   * Obtener todos los resultados de un paciente específico
   * @param {string} patientId - ID del paciente
   * @returns {Promise<Array>} Array de resultados del paciente
   */
  static async getPatientResults(patientId) {
    try {
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
            genero
          )
        `)
        .eq('paciente_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener resultados del paciente:', error);
      throw error;
    }
  }

  /**
   * Calcular estadísticas completas de rendimiento de un paciente
   * @param {string} patientId - ID del paciente
   * @returns {Promise<Object>} Estadísticas detalladas del paciente
   */
  static async getPatientStats(patientId) {
    try {
      const results = await this.getPatientResults(patientId);
      
      const stats = {
        // Información básica
        totalTests: results.length,
        completedTests: results.map(r => r.aptitudes?.codigo).filter(Boolean),
        lastTestDate: results.length > 0 ? results[0].created_at : null,
        firstTestDate: results.length > 0 ? results[results.length - 1].created_at : null,
        
        // Promedios generales
        averageDirectScore: 0,
        averagePercentile: 0,
        averageConcentration: 0,
        
        // Análisis de errores
        totalErrors: results.reduce((sum, r) => sum + (r.errores || 0), 0),
        averageErrors: 0,
        
        // Análisis de tiempo
        totalTimeSeconds: results.reduce((sum, r) => sum + (r.tiempo_segundos || 0), 0),
        averageTimeSeconds: 0,
        
        // Análisis de respuestas
        totalCorrectAnswers: results.reduce((sum, r) => sum + (r.respuestas_correctas || 0), 0),
        totalIncorrectAnswers: results.reduce((sum, r) => sum + (r.respuestas_incorrectas || 0), 0),
        totalUnansweredQuestions: results.reduce((sum, r) => sum + (r.respuestas_sin_contestar || 0), 0),
        
        // Agrupación por aptitudes
        testsByAptitude: {},
        
        // Tendencias de rendimiento
        performanceTrend: null,
        
        // Información del paciente
        patientInfo: results.length > 0 ? results[0].pacientes : null
      };

      if (results.length > 0) {
        // Calcular promedios
        const totalDirectScore = results.reduce((sum, r) => sum + (r.puntaje_directo || 0), 0);
        stats.averageDirectScore = Math.round(totalDirectScore / results.length);
        
        // Promedio de percentiles (solo los que tienen valor)
        const validPercentiles = results.filter(r => r.percentil !== null && r.percentil !== undefined);
        if (validPercentiles.length > 0) {
          const totalPercentile = validPercentiles.reduce((sum, r) => sum + r.percentil, 0);
          stats.averagePercentile = Math.round(totalPercentile / validPercentiles.length);
        }
        
        // Promedio de concentración (solo tests de atención)
        const concentrationTests = results.filter(r => r.concentracion !== null);
        if (concentrationTests.length > 0) {
          const totalConcentration = concentrationTests.reduce((sum, r) => sum + r.concentracion, 0);
          stats.averageConcentration = Math.round(totalConcentration / concentrationTests.length * 100) / 100;
        }
        
        // Promedio de errores
        stats.averageErrors = Math.round(stats.totalErrors / results.length * 100) / 100;
        
        // Promedio de tiempo
        stats.averageTimeSeconds = Math.round(stats.totalTimeSeconds / results.length);
        
        // Agrupar por aptitud
        results.forEach(result => {
          const aptitudeCode = result.aptitudes?.codigo;
          if (aptitudeCode) {
            if (!stats.testsByAptitude[aptitudeCode]) {
              stats.testsByAptitude[aptitudeCode] = {
                name: result.aptitudes.nombre,
                description: result.aptitudes.descripcion,
                count: 0,
                scores: [],
                percentiles: [],
                averageScore: 0,
                averagePercentile: 0,
                lastScore: null,
                lastPercentile: null,
                bestScore: 0,
                worstScore: Infinity,
                improvement: 0
              };
            }
            
            const aptData = stats.testsByAptitude[aptitudeCode];
            aptData.count++;
            aptData.scores.push(result.puntaje_directo || 0);
            if (result.percentil !== null) {
              aptData.percentiles.push(result.percentil);
            }
            aptData.lastScore = result.puntaje_directo;
            aptData.lastPercentile = result.percentil;
            aptData.bestScore = Math.max(aptData.bestScore, result.puntaje_directo || 0);
            aptData.worstScore = Math.min(aptData.worstScore, result.puntaje_directo || Infinity);
          }
        });
        
        // Calcular promedios y mejoras por aptitud
        Object.keys(stats.testsByAptitude).forEach(aptCode => {
          const aptData = stats.testsByAptitude[aptCode];
          
          // Promedio de puntajes
          if (aptData.scores.length > 0) {
            aptData.averageScore = Math.round(
              aptData.scores.reduce((sum, score) => sum + score, 0) / aptData.scores.length * 100
            ) / 100;
          }
          
          // Promedio de percentiles
          if (aptData.percentiles.length > 0) {
            aptData.averagePercentile = Math.round(
              aptData.percentiles.reduce((sum, pc) => sum + pc, 0) / aptData.percentiles.length
            );
          }
          
          // Calcular mejora (diferencia entre primer y último puntaje)
          if (aptData.scores.length > 1) {
            const firstScore = aptData.scores[aptData.scores.length - 1]; // Último en el array (más antiguo)
            const lastScore = aptData.scores[0]; // Primero en el array (más reciente)
            aptData.improvement = lastScore - firstScore;
          }
        });
        
        // Calcular tendencia general de rendimiento
        if (results.length > 1) {
          const recentResults = results.slice(0, Math.min(3, results.length));
          const olderResults = results.slice(-Math.min(3, results.length));
          
          const recentAvg = recentResults.reduce((sum, r) => sum + (r.puntaje_directo || 0), 0) / recentResults.length;
          const olderAvg = olderResults.reduce((sum, r) => sum + (r.puntaje_directo || 0), 0) / olderResults.length;
          
          const improvement = recentAvg - olderAvg;
          
          if (improvement > 2) {
            stats.performanceTrend = 'mejorando';
          } else if (improvement < -2) {
            stats.performanceTrend = 'declinando';
          } else {
            stats.performanceTrend = 'estable';
          }
        }
      }

      return stats;
    } catch (error) {
      console.error('Error al calcular estadísticas del paciente:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de pacientes que han completado evaluaciones
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise<Array>} Array de pacientes con información de resultados
   */
  static async getPatientsWithResults(options = {}) {
    try {
      const { limit = null, sortBy = 'ultimaEvaluacion', sortOrder = 'desc' } = options;
      
      let query = supabase
        .from('resultados')
        .select(`
          paciente_id,
          created_at,
          puntaje_directo,
          percentil,
          aptitudes:aptitud_id (
            codigo,
            nombre
          ),
          pacientes:paciente_id (
            id,
            nombre,
            apellido,
            documento,
            fecha_nacimiento,
            email,
            genero,
            created_at,
            instituciones:institucion_id (
              nombre
            ),
            psicologos:psicologo_id (
              nombre,
              apellidos
            )
          )
        `)
        .not('pacientes', 'is', null)
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data: pacientesConResultados, error } = await query;
      
      if (error) throw error;

      // Agrupar por paciente y obtener información resumida
      const pacientesMap = new Map();
      
      pacientesConResultados.forEach(resultado => {
        const pacienteId = resultado.paciente_id;
        const paciente = resultado.pacientes;
        
        if (!pacientesMap.has(pacienteId)) {
          pacientesMap.set(pacienteId, {
            ...paciente,
            totalTests: 0,
            ultimaEvaluacion: resultado.created_at,
            primeraEvaluacion: resultado.created_at,
            aptitudesCompletadas: new Set(),
            promedioGeneral: 0,
            mejorPuntaje: 0,
            peorPuntaje: Infinity,
            resultadosDetalle: []
          });
        }
        
        const pacienteData = pacientesMap.get(pacienteId);
        pacienteData.totalTests += 1;
        pacienteData.aptitudesCompletadas.add(resultado.aptitudes?.codigo);
        pacienteData.resultadosDetalle.push({
          aptitud: resultado.aptitudes?.codigo,
          nombre: resultado.aptitudes?.nombre,
          puntaje: resultado.puntaje_directo,
          percentil: resultado.percentil,
          fecha: resultado.created_at
        });
        
        // Actualizar puntajes extremos
        if (resultado.puntaje_directo) {
          pacienteData.mejorPuntaje = Math.max(pacienteData.mejorPuntaje, resultado.puntaje_directo);
          pacienteData.peorPuntaje = Math.min(pacienteData.peorPuntaje, resultado.puntaje_directo);
        }
        
        // Actualizar fechas
        if (new Date(resultado.created_at) > new Date(pacienteData.ultimaEvaluacion)) {
          pacienteData.ultimaEvaluacion = resultado.created_at;
        }
        if (new Date(resultado.created_at) < new Date(pacienteData.primeraEvaluacion)) {
          pacienteData.primeraEvaluacion = resultado.created_at;
        }
      });

      // Procesar datos finales y calcular promedios
      const pacientesArray = Array.from(pacientesMap.values()).map(paciente => {
        // Convertir Set a Array
        paciente.aptitudesCompletadas = Array.from(paciente.aptitudesCompletadas);
        
        // Calcular promedio general
        const puntajesValidos = paciente.resultadosDetalle
          .map(r => r.puntaje)
          .filter(p => p !== null && p !== undefined);
        
        if (puntajesValidos.length > 0) {
          paciente.promedioGeneral = Math.round(
            puntajesValidos.reduce((sum, p) => sum + p, 0) / puntajesValidos.length * 100
          ) / 100;
        }
        
        // Calcular edad actual
        if (paciente.fecha_nacimiento) {
          paciente.edad = calculateAge(paciente.fecha_nacimiento);
        }
        
        // Limpiar peorPuntaje si no se estableció
        if (paciente.peorPuntaje === Infinity) {
          paciente.peorPuntaje = 0;
        }
        
        return paciente;
      });
      
      // Ordenar según opciones
      pacientesArray.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortBy) {
          case 'nombre':
            valueA = `${a.nombre} ${a.apellido}`.toLowerCase();
            valueB = `${b.nombre} ${b.apellido}`.toLowerCase();
            break;
          case 'totalTests':
            valueA = a.totalTests;
            valueB = b.totalTests;
            break;
          case 'promedioGeneral':
            valueA = a.promedioGeneral;
            valueB = b.promedioGeneral;
            break;
          case 'ultimaEvaluacion':
          default:
            valueA = new Date(a.ultimaEvaluacion);
            valueB = new Date(b.ultimaEvaluacion);
            break;
        }
        
        if (sortOrder === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });

      return pacientesArray;

    } catch (error) {
      console.error('Error al obtener pacientes con resultados:', error);
      throw error;
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
        if (aptitudeCode) {
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
                peorPD: Infinity,
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
        }
      });
      
      // Calcular estadísticas para cada aptitud
      Object.keys(groupedResults).forEach(aptCode => {
        const aptData = groupedResults[aptCode];
        const evaluaciones = aptData.evaluaciones;
        
        aptData.estadisticas.total = evaluaciones.length;
        
        if (evaluaciones.length > 0) {
          // Ordenar por fecha (más reciente primero)
          evaluaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          
          // Fechas
          aptData.estadisticas.ultimaEvaluacion = evaluaciones[0].fecha;
          aptData.estadisticas.primeraEvaluacion = evaluaciones[evaluaciones.length - 1].fecha;
          
          // Promedios y extremos
          const puntajesValidos = evaluaciones
            .map(e => e.puntajeDirecto)
            .filter(p => p !== null && p !== undefined);
          
          if (puntajesValidos.length > 0) {
            aptData.estadisticas.promedioPD = Math.round(
              puntajesValidos.reduce((sum, p) => sum + p, 0) / puntajesValidos.length * 100
            ) / 100;
            
            aptData.estadisticas.mejorPD = Math.max(...puntajesValidos);
            aptData.estadisticas.peorPD = Math.min(...puntajesValidos);
          }
          
          const percentilesValidos = evaluaciones
            .map(e => e.percentil)
            .filter(p => p !== null && p !== undefined);
          
          if (percentilesValidos.length > 0) {
            aptData.estadisticas.promedioPC = Math.round(
              percentilesValidos.reduce((sum, p) => sum + p, 0) / percentilesValidos.length
            );
          }
          
          // Calcular tendencia
          if (puntajesValidos.length > 1) {
            const ultimosPuntajes = puntajesValidos.slice(0, Math.min(3, puntajesValidos.length));
            const primerosPuntajes = puntajesValidos.slice(-Math.min(3, puntajesValidos.length));
            
            const promedioReciente = ultimosPuntajes.reduce((sum, p) => sum + p, 0) / ultimosPuntajes.length;
            const promedioAntiguo = primerosPuntajes.reduce((sum, p) => sum + p, 0) / primerosPuntajes.length;
            
            const diferencia = promedioReciente - promedioAntiguo;
            
            if (diferencia > 1) {
              aptData.estadisticas.tendencia = 'mejorando';
            } else if (diferencia < -1) {
              aptData.estadisticas.tendencia = 'declinando';
            } else {
              aptData.estadisticas.tendencia = 'estable';
            }
          }
        }
      });
      
      return groupedResults;
      
    } catch (error) {
      console.error('Error al obtener resultados por aptitud:', error);
      throw error;
    }
  }

  /**
   * Generar reporte completo de un paciente
   * @param {string} patientId - ID del paciente
   * @returns {Promise<Object>} Reporte completo del paciente
   */
  static async generatePatientReport(patientId) {
    try {
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
          periodoEvaluacion: {
            inicio: stats.firstTestDate,
            fin: stats.lastTestDate
          }
        },
        rendimientoPorAptitud: resultsByAptitude,
        analisisComparativo: this._generateComparativeAnalysis(resultsByAptitude),
        recomendaciones: this._generateRecommendations(stats, resultsByAptitude),
        fechaGeneracion: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error al generar reporte del paciente:', error);
      throw error;
    }
  }

  /**
   * Generar análisis comparativo entre aptitudes
   * @private
   */
  static _generateComparativeAnalysis(resultsByAptitude) {
    const aptitudes = Object.keys(resultsByAptitude);
    
    if (aptitudes.length === 0) return null;
    
    const promedios = aptitudes.map(apt => ({
      codigo: apt,
      nombre: resultsByAptitude[apt].aptitud.nombre,
      promedio: resultsByAptitude[apt].estadisticas.promedioPD
    }));
    
    // Ordenar por promedio descendente
    promedios.sort((a, b) => b.promedio - a.promedio);
    
    return {
      fortalezas: promedios.slice(0, Math.ceil(promedios.length / 2)),
      areasDeDesarrollo: promedios.slice(Math.ceil(promedios.length / 2)),
      aptitudDestacada: promedios[0],
      aptitudAMejorar: promedios[promedios.length - 1]
    };
  }

  /**
   * Generar recomendaciones basadas en los resultados
   * @private
   */
  static _generateRecommendations(stats, resultsByAptitude) {
    const recomendaciones = [];
    
    // Recomendaciones basadas en tendencia general
    switch (stats.performanceTrend) {
      case 'mejorando':
        recomendaciones.push('El paciente muestra una tendencia positiva de mejora. Continuar con el plan actual.');
        break;
      case 'declinando':
        recomendaciones.push('Se observa una tendencia de declive. Revisar estrategias de intervención.');
        break;
      case 'estable':
        recomendaciones.push('El rendimiento se mantiene estable. Considerar nuevos desafíos para estimular el crecimiento.');
        break;
    }
    
    // Recomendaciones por aptitud
    Object.keys(resultsByAptitude).forEach(aptCode => {
      const aptData = resultsByAptitude[aptCode];
      const stats = aptData.estadisticas;
      
      if (stats.tendencia === 'declinando') {
        recomendaciones.push(`Reforzar trabajo en ${aptData.aptitud.nombre} debido a tendencia declinante.`);
      } else if (stats.tendencia === 'mejorando') {
        recomendaciones.push(`Excelente progreso en ${aptData.aptitud.nombre}. Mantener estrategias actuales.`);
      }
    });
    
    return recomendaciones;
  }
}

export default PatientResultsExtractor;