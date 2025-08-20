import supabase from '../../api/supabaseClient';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Servicio para análisis de progreso de pacientes individuales
 * Sincronizado con Supabase para datos en tiempo real
 */
class PatientProgressService {

  /**
   * Obtener historial completo de evaluaciones de un paciente
   * @param {string} patientId - ID del paciente
   * @returns {Promise<Object>} Historial completo con progresión
   */
  static async getPatientProgressHistory(patientId) {
    try {
      console.log('🔍 [PatientProgress] Obteniendo historial para paciente:', patientId);

      // Obtener datos del paciente
      const { data: patient, error: patientError } = await supabase
        .from('pacientes')
        .select(`
          id,
          nombre,
          apellido,
          documento,
          genero,
          fecha_nacimiento,
          nivel_educativo,
          created_at,
          instituciones:institucion_id (
            id,
            nombre
          )
        `)
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;

      // Obtener todos los resultados del paciente con información de aptitudes
      const { data: results, error: resultsError } = await supabase
        .from('resultados')
        .select(`
          id,
          puntaje_directo,
          percentil,
          errores,
          tiempo_segundos,
          concentracion,
          created_at,
          aptitudes:aptitud_id (
            id,
            codigo,
            nombre,
            descripcion
          )
        `)
        .eq('paciente_id', patientId)
        .order('created_at', { ascending: true });

      if (resultsError) throw resultsError;

      console.log('✅ [PatientProgress] Resultados obtenidos:', results?.length || 0);

      // Procesar progresión por aptitudes
      const progressByAptitude = this.calculateProgressByAptitude(results);

      // Calcular tendencias generales
      const overallTrends = this.calculateOverallTrends(results);

      // Generar insights automáticos
      const insights = this.generateProgressInsights(results, progressByAptitude);

      return {
        patient,
        results,
        progressByAptitude,
        overallTrends,
        insights,
        totalEvaluations: results.length,
        lastEvaluation: results.length > 0 ? results[results.length - 1].created_at : null
      };

    } catch (error) {
      console.error('❌ [PatientProgress] Error al obtener historial:', error);
      throw error;
    }
  }

  /**
   * Calcular progresión por aptitud individual
   * @param {Array} results - Resultados del paciente
   * @returns {Object} Progresión por aptitud
   */
  static calculateProgressByAptitude(results) {
    const aptitudeProgress = {};

    results.forEach(result => {
      const aptitudeCode = result.aptitudes?.codigo;
      if (!aptitudeCode) return;

      if (!aptitudeProgress[aptitudeCode]) {
        aptitudeProgress[aptitudeCode] = {
          aptitude: result.aptitudes,
          evaluations: [],
          trend: 'stable',
          improvement: 0,
          bestScore: 0,
          worstScore: 100,
          averageScore: 0
        };
      }

      aptitudeProgress[aptitudeCode].evaluations.push({
        date: result.created_at,
        puntajeDirecto: result.puntaje_directo,
        percentil: result.percentil,
        errores: result.errores,
        tiempo: result.tiempo_segundos,
        concentracion: result.concentracion
      });
    });

    // Calcular estadísticas para cada aptitud
    Object.keys(aptitudeProgress).forEach(code => {
      const progress = aptitudeProgress[code];
      const scores = progress.evaluations.map(e => e.percentil).filter(s => s !== null);

      if (scores.length > 0) {
        progress.averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        progress.bestScore = Math.max(...scores);
        progress.worstScore = Math.min(...scores);

        // Calcular tendencia
        if (scores.length > 1) {
          const firstScore = scores[0];
          const lastScore = scores[scores.length - 1];
          const improvement = lastScore - firstScore;

          progress.improvement = improvement;
          progress.trend = improvement > 5 ? 'improving' :
                          improvement < -5 ? 'declining' : 'stable';
        }
      }
    });

    return aptitudeProgress;
  }

  /**
   * Calcular tendencias generales del paciente
   * @param {Array} results - Resultados del paciente
   * @returns {Object} Tendencias generales
   */
  static calculateOverallTrends(results) {
    if (results.length === 0) {
      return {
        totalEvaluations: 0,
        averagePercentile: 0,
        overallTrend: 'no-data',
        strongestAptitudes: [],
        weakestAptitudes: []
      };
    }

    // Calcular percentil promedio general
    const validPercentiles = results
      .map(r => r.percentil)
      .filter(p => p !== null && p !== undefined);

    const averagePercentile = validPercentiles.length > 0
      ? validPercentiles.reduce((sum, p) => sum + p, 0) / validPercentiles.length
      : 0;

    // Identificar aptitudes más fuertes y más débiles
    const aptitudeScores = {};
    results.forEach(result => {
      const code = result.aptitudes?.codigo;
      if (code && result.percentil !== null) {
        if (!aptitudeScores[code]) {
          aptitudeScores[code] = {
            name: result.aptitudes.nombre,
            scores: []
          };
        }
        aptitudeScores[code].scores.push(result.percentil);
      }
    });

    // Calcular promedios por aptitud
    const aptitudeAverages = Object.keys(aptitudeScores).map(code => ({
      code,
      name: aptitudeScores[code].name,
      average: aptitudeScores[code].scores.reduce((sum, s) => sum + s, 0) / aptitudeScores[code].scores.length
    })).sort((a, b) => b.average - a.average);

    return {
      totalEvaluations: results.length,
      averagePercentile: Math.round(averagePercentile),
      overallTrend: this.determineOverallTrend(results),
      strongestAptitudes: aptitudeAverages.slice(0, 3),
      weakestAptitudes: aptitudeAverages.slice(-3).reverse()
    };
  }

  /**
   * Determinar tendencia general basada en evaluaciones recientes
   * @param {Array} results - Resultados ordenados cronológicamente
   * @returns {string} Tendencia: 'improving', 'declining', 'stable'
   */
  static determineOverallTrend(results) {
    if (results.length < 2) return 'stable';

    // Comparar últimas 3 evaluaciones con las 3 anteriores
    const recentResults = results.slice(-3);
    const previousResults = results.slice(-6, -3);

    if (previousResults.length === 0) return 'stable';

    const recentAvg = recentResults
      .map(r => r.percentil)
      .filter(p => p !== null)
      .reduce((sum, p, _, arr) => sum + p / arr.length, 0);

    const previousAvg = previousResults
      .map(r => r.percentil)
      .filter(p => p !== null)
      .reduce((sum, p, _, arr) => sum + p / arr.length, 0);

    const difference = recentAvg - previousAvg;

    return difference > 5 ? 'improving' :
           difference < -5 ? 'declining' : 'stable';
  }

  /**
   * Generar insights automáticos sobre el progreso
   * @param {Array} results - Resultados del paciente
   * @param {Object} progressByAptitude - Progreso por aptitud
   * @returns {Array} Lista de insights
   */
  static generateProgressInsights(results, progressByAptitude) {
    const insights = [];

    // Insight sobre consistencia
    const aptitudeCodes = Object.keys(progressByAptitude);
    if (aptitudeCodes.length > 0) {
      const improvements = aptitudeCodes.map(code => progressByAptitude[code].improvement);
      const consistentImprovement = improvements.filter(imp => imp > 0).length;

      if (consistentImprovement >= aptitudeCodes.length * 0.7) {
        insights.push({
          type: 'positive',
          title: 'Progreso Consistente',
          description: `Muestra mejora en ${consistentImprovement} de ${aptitudeCodes.length} aptitudes evaluadas.`,
          priority: 'high'
        });
      }
    }

    // Insight sobre aptitudes destacadas
    const strongAptitudes = aptitudeCodes.filter(code =>
      progressByAptitude[code].averageScore > 70
    );

    if (strongAptitudes.length > 0) {
      insights.push({
        type: 'info',
        title: 'Fortalezas Identificadas',
        description: `Rendimiento superior en: ${strongAptitudes.map(code =>
          progressByAptitude[code].aptitude.nombre
        ).join(', ')}.`,
        priority: 'medium'
      });
    }

    // Insight sobre áreas de oportunidad
    const weakAptitudes = aptitudeCodes.filter(code =>
      progressByAptitude[code].averageScore < 30
    );

    if (weakAptitudes.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Áreas de Oportunidad',
        description: `Considerar refuerzo en: ${weakAptitudes.map(code =>
          progressByAptitude[code].aptitude.nombre
        ).join(', ')}.`,
        priority: 'high'
      });
    }

    return insights;
  }

  /**
   * Comparar paciente con promedios institucionales
   * @param {string} patientId - ID del paciente
   * @param {string} institutionId - ID de la institución
   * @returns {Promise<Object>} Comparación con promedios
   */
  static async compareWithInstitutionalAverages(patientId, institutionId) {
    try {
      // Obtener resultados del paciente
      const patientHistory = await this.getPatientProgressHistory(patientId);

      // Obtener promedios institucionales
      const { data: institutionalResults, error } = await supabase
        .from('resultados')
        .select(`
          percentil,
          aptitudes:aptitud_id (
            codigo,
            nombre
          ),
          pacientes:paciente_id (
            institucion_id
          )
        `)
        .eq('pacientes.institucion_id', institutionId);

      if (error) throw error;

      // Calcular promedios por aptitud
      const institutionalAverages = {};
      institutionalResults.forEach(result => {
        const code = result.aptitudes?.codigo;
        if (code && result.percentil !== null) {
          if (!institutionalAverages[code]) {
            institutionalAverages[code] = {
              name: result.aptitudes.nombre,
              scores: []
            };
          }
          institutionalAverages[code].scores.push(result.percentil);
        }
      });

      // Calcular promedios finales
      Object.keys(institutionalAverages).forEach(code => {
        const scores = institutionalAverages[code].scores;
        institutionalAverages[code].average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        institutionalAverages[code].count = scores.length;
      });

      // Comparar con el paciente
      const comparisons = {};
      Object.keys(patientHistory.progressByAptitude).forEach(code => {
        const patientAvg = patientHistory.progressByAptitude[code].averageScore;
        const institutionalAvg = institutionalAverages[code]?.average || 0;

        comparisons[code] = {
          aptitude: patientHistory.progressByAptitude[code].aptitude,
          patientAverage: patientAvg,
          institutionalAverage: Math.round(institutionalAvg),
          difference: Math.round(patientAvg - institutionalAvg),
          performance: patientAvg > institutionalAvg + 10 ? 'above' :
                      patientAvg < institutionalAvg - 10 ? 'below' : 'average'
        };
      });

      return {
        patient: patientHistory.patient,
        comparisons,
        institutionalAverages
      };

    } catch (error) {
      console.error('❌ [PatientProgress] Error en comparación institucional:', error);
      throw error;
    }
  }
}

export default PatientProgressService;