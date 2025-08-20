/**
 * Servicio de Analytics Avanzado
 * Extiende DashboardService con capacidades analytics mejoradas
 */

import supabase from '../../api/supabaseClient.js';
import {
  TIME_RANGES,
  APTITUDE_CODES,
  PERCENTILE_RANGES,
  SIGNIFICANCE_LEVELS,
  EFFECT_SIZE_INTERPRETATION
} from '../../utils/analytics/constants.js';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';

/**
 * Servicio principal de Analytics con funcionalidades avanzadas
 */
class AnalyticsService {

  /**
   * Obtener métricas institucionales avanzadas con análisis temporal
   */
  static async getAdvancedInstitutionalMetrics(filters = {}) {
    try {
      console.log('📊 [AnalyticsService] Obteniendo métricas institucionales avanzadas...');

      const { dateRange = TIME_RANGES.LAST_30_DAYS, institutionId } = filters;
      const { startDate, endDate } = AnalyticsService.getDateRange(dateRange);

      // Obtener datos base
      const [
        currentMetrics,
        historicalMetrics,
        psychologistMetrics,
        trendData
      ] = await Promise.all([
        AnalyticsService.getCurrentPeriodMetrics(startDate, endDate, institutionId),
        AnalyticsService.getHistoricalMetrics(startDate, endDate, institutionId),
        AnalyticsService.getPsychologistPerformanceMetrics(startDate, endDate, institutionId),
        AnalyticsService.getTrendAnalysis(startDate, endDate, institutionId)
      ]);

      return {
        current: currentMetrics,
        historical: historicalMetrics,
        psychologists: psychologistMetrics,
        trends: trendData,
        insights: AnalyticsService.generateInstitutionalInsights(currentMetrics, historicalMetrics),
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('❌ [AnalyticsService] Error en métricas institucionales:', error);
      throw error;
    }
  }

  /**
   * Obtener métricas del período actual
   */
  static async getCurrentPeriodMetrics(startDate, endDate, institutionId = null) {
    let query = supabase
      .from('resultados')
      .select(`
        id,
        percentil,
        puntaje_directo,
        created_at,
        aptitud_id,
        evaluacion_id,
        aptitudes:aptitud_id (codigo, nombre),
        evaluaciones:evaluacion_id (
          id,
          fecha_inicio,
          fecha_fin,
          estado,
          paciente_id,
          psicologo_id,
          pacientes:paciente_id (
            id,
            nivel_educativo,
            genero,
            institucion_id
          ),
          psicologos:psicologo_id (
            id,
            nombre,
            institucion_id
          )
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (institutionId) {
      query = query.eq('evaluaciones.psicologos.institucion_id', institutionId);
    }

    const { data: resultados, error } = await query;
    if (error) throw error;

    // Calcular métricas
    const totalEvaluaciones = new Set(resultados?.map(r => r.evaluacion_id)).size;
    const totalPacientes = new Set(resultados?.map(r => r.evaluaciones?.paciente_id)).size;
    const evaluacionesCompletadas = resultados?.filter(r => 
      r.evaluaciones?.estado === 'completada'
    ).length || 0;

    const percentilPromedio = resultados?.length > 0
      ? resultados.reduce((sum, r) => sum + (r.percentil || 0), 0) / resultados.length
      : 0;

    // Distribución por aptitudes
    const aptitudeDistribution = AnalyticsService.calculateAptitudeDistribution(resultados);

    // Distribución por niveles educativos
    const educationLevelDistribution = AnalyticsService.calculateEducationLevelDistribution(resultados);

    // Métricas de rendimiento
    const performanceMetrics = AnalyticsService.calculatePerformanceMetrics(resultados);

    return {
      totalEvaluaciones,
      totalPacientes,
      evaluacionesCompletadas,
      tasaCompletitud: totalEvaluaciones > 0 ? evaluacionesCompletadas / totalEvaluaciones : 0,
      percentilPromedio: Math.round(percentilPromedio * 10) / 10,
      aptitudeDistribution,
      educationLevelDistribution,
      performanceMetrics,
      period: { startDate, endDate }
    };
  }

  /**
   * Obtener métricas históricas para comparación
   */
  static async getHistoricalMetrics(currentStart, currentEnd, institutionId = null) {
    const periodDays = Math.ceil((currentEnd - currentStart) / (1000 * 60 * 60 * 24));
    const historicalStart = subDays(currentStart, periodDays);
    const historicalEnd = subDays(currentEnd, periodDays);

    const historicalMetrics = await AnalyticsService.getCurrentPeriodMetrics(
      historicalStart,
      historicalEnd,
      institutionId
    );

    return {
      ...historicalMetrics,
      period: { startDate: historicalStart, endDate: historicalEnd }
    };
  }

  /**
   * Calcular distribución por aptitudes
   */
  static calculateAptitudeDistribution(resultados) {
    const distribution = {};
    
    Object.keys(APTITUDE_CODES).forEach(code => {
      distribution[code] = {
        codigo: code,
        nombre: APTITUDE_CODES[code],
        count: 0,
        averagePercentile: 0,
        scores: []
      };
    });

    resultados?.forEach(resultado => {
      const codigo = resultado.aptitudes?.codigo;
      if (codigo && distribution[codigo]) {
        distribution[codigo].count++;
        distribution[codigo].scores.push(resultado.percentil || 0);
      }
    });

    // Calcular promedios
    Object.keys(distribution).forEach(code => {
      const scores = distribution[code].scores;
      if (scores.length > 0) {
        distribution[code].averagePercentile = 
          Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10;
      }
    });

    return distribution;
  }

  /**
   * Calcular distribución por niveles educativos
   */
  static calculateEducationLevelDistribution(resultados) {
    const distribution = { E: 0, M: 0, S: 0, 'Sin definir': 0 };
    const scores = { E: [], M: [], S: [], 'Sin definir': [] };

    resultados?.forEach(resultado => {
      const nivel = resultado.evaluaciones?.pacientes?.nivel_educativo || 'Sin definir';
      const normalizedLevel = AnalyticsService.normalizeEducationLevel(nivel);
      
      distribution[normalizedLevel]++;
      scores[normalizedLevel].push(resultado.percentil || 0);
    });

    // Calcular promedios por nivel
    const result = {};
    Object.keys(distribution).forEach(level => {
      const levelScores = scores[level];
      result[level] = {
        count: distribution[level],
        averagePercentile: levelScores.length > 0 
          ? Math.round((levelScores.reduce((sum, score) => sum + score, 0) / levelScores.length) * 10) / 10
          : 0
      };
    });

    return result;
  }

  /**
   * Normalizar nivel educativo
   */
  static normalizeEducationLevel(nivel) {
    if (!nivel) return 'Sin definir';
    
    const nivelLower = nivel.toLowerCase();
    if (nivelLower.includes('elemental') || nivel === 'E') return 'E';
    if (nivelLower.includes('medio') || nivel === 'M') return 'M';
    if (nivelLower.includes('superior') || nivelLower.includes('bachillerato') || nivel === 'S') return 'S';
    
    return 'Sin definir';
  }

  /**
   * Calcular métricas de rendimiento
   */
  static calculatePerformanceMetrics(resultados) {
    if (!resultados || resultados.length === 0) {
      return {
        percentileRanges: {},
        riskStudents: 0,
        highPerformers: 0,
        averageCompletionTime: 0
      };
    }

    const percentileRanges = {};
    let riskStudents = 0;
    let highPerformers = 0;

    // Inicializar rangos
    Object.keys(PERCENTILE_RANGES).forEach(range => {
      percentileRanges[range] = 0;
    });

    // Clasificar estudiantes por percentiles
    const studentPercentiles = new Map();
    
    resultados.forEach(resultado => {
      const pacienteId = resultado.evaluaciones?.paciente_id;
      const percentil = resultado.percentil || 0;
      
      if (pacienteId) {
        if (!studentPercentiles.has(pacienteId)) {
          studentPercentiles.set(pacienteId, []);
        }
        studentPercentiles.get(pacienteId).push(percentil);
      }
    });

    // Calcular promedios por estudiante y clasificar
    studentPercentiles.forEach(percentiles => {
      const avgPercentile = percentiles.reduce((sum, p) => sum + p, 0) / percentiles.length;
      
      // Clasificar en rangos
      for (const [rangeName, range] of Object.entries(PERCENTILE_RANGES)) {
        if (avgPercentile >= range.min && avgPercentile < range.max) {
          percentileRanges[rangeName]++;
          break;
        }
      }

      // Identificar estudiantes en riesgo y alto rendimiento
      if (avgPercentile < 25) riskStudents++;
      if (avgPercentile >= 75) highPerformers++;
    });

    return {
      percentileRanges,
      riskStudents,
      highPerformers,
      totalStudents: studentPercentiles.size,
      averageCompletionTime: AnalyticsService.calculateAverageCompletionTime(resultados)
    };
  }

  /**
   * Calcular tiempo promedio de completitud
   */
  static calculateAverageCompletionTime(resultados) {
    const completionTimes = [];
    
    resultados?.forEach(resultado => {
      const evaluacion = resultado.evaluaciones;
      if (evaluacion?.fecha_inicio && evaluacion?.fecha_fin) {
        const startTime = new Date(evaluacion.fecha_inicio);
        const endTime = new Date(evaluacion.fecha_fin);
        const duration = (endTime - startTime) / (1000 * 60); // minutos
        
        if (duration > 0 && duration < 300) { // Filtrar duraciones razonables (< 5 horas)
          completionTimes.push(duration);
        }
      }
    });

    return completionTimes.length > 0
      ? Math.round(completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length)
      : 0;
  }

  /**
   * Obtener métricas de rendimiento por psicólogo
   */
  static async getPsychologistPerformanceMetrics(startDate, endDate, institutionId = null) {
    let query = supabase
      .from('evaluaciones')
      .select(`
        id,
        fecha_inicio,
        fecha_fin,
        estado,
        psicologo_id,
        psicologos:psicologo_id (
          id,
          nombre,
          institucion_id
        ),
        resultados (
          percentil,
          aptitud_id,
          aptitudes:aptitud_id (codigo, nombre)
        )
      `)
      .gte('fecha_inicio', startDate.toISOString())
      .lte('fecha_inicio', endDate.toISOString());

    if (institutionId) {
      query = query.eq('psicologos.institucion_id', institutionId);
    }

    const { data: evaluaciones, error } = await query;
    if (error) throw error;

    const psychologistMetrics = new Map();

    evaluaciones?.forEach(evaluacion => {
      const psicologoId = evaluacion.psicologo_id;
      const psicologo = evaluacion.psicologos;
      
      if (!psychologistMetrics.has(psicologoId)) {
        psychologistMetrics.set(psicologoId, {
          psychologistId: psicologoId,
          psychologistName: psicologo?.nombre || 'Sin nombre',
          totalAssessments: 0,
          completedAssessments: 0,
          averageCompletionTime: 0,
          completionTimes: [],
          averageScores: {},
          scoresByAptitude: {}
        });
      }

      const metrics = psychologistMetrics.get(psicologoId);
      metrics.totalAssessments++;

      if (evaluacion.estado === 'completada') {
        metrics.completedAssessments++;

        // Calcular tiempo de completitud
        if (evaluacion.fecha_inicio && evaluacion.fecha_fin) {
          const duration = (new Date(evaluacion.fecha_fin) - new Date(evaluacion.fecha_inicio)) / (1000 * 60);
          if (duration > 0 && duration < 300) {
            metrics.completionTimes.push(duration);
          }
        }

        // Agregar puntajes por aptitud
        evaluacion.resultados?.forEach(resultado => {
          const codigo = resultado.aptitudes?.codigo;
          if (codigo) {
            if (!metrics.scoresByAptitude[codigo]) {
              metrics.scoresByAptitude[codigo] = [];
            }
            metrics.scoresByAptitude[codigo].push(resultado.percentil || 0);
          }
        });
      }
    });

    // Calcular promedios finales
    const result = Array.from(psychologistMetrics.values()).map(metrics => {
      // Tiempo promedio de completitud
      metrics.averageCompletionTime = metrics.completionTimes.length > 0
        ? Math.round(metrics.completionTimes.reduce((sum, time) => sum + time, 0) / metrics.completionTimes.length)
        : 0;

      // Puntajes promedio por aptitud
      Object.keys(metrics.scoresByAptitude).forEach(codigo => {
        const scores = metrics.scoresByAptitude[codigo];
        metrics.averageScores[codigo] = scores.length > 0
          ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10
          : 0;
      });

      // Limpiar datos temporales
      delete metrics.completionTimes;
      delete metrics.scoresByAptitude;

      return metrics;
    });

    return result.sort((a, b) => b.completedAssessments - a.completedAssessments);
  }

  /**
   * Obtener análisis de tendencias temporales
   */
  static async getTrendAnalysis(startDate, endDate, institutionId = null) {
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const interval = days > 90 ? 'week' : days > 30 ? 'day' : 'day';

    let query = supabase
      .from('resultados')
      .select(`
        created_at,
        percentil,
        aptitud_id,
        aptitudes:aptitud_id (codigo),
        evaluaciones:evaluacion_id (
          psicologos:psicologo_id (institucion_id)
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at');

    if (institutionId) {
      query = query.eq('evaluaciones.psicologos.institucion_id', institutionId);
    }

    const { data: resultados, error } = await query;
    if (error) throw error;

    return AnalyticsService.processTrendData(resultados, interval, startDate, endDate);
  }

  /**
   * Procesar datos de tendencias
   */
  static processTrendData(resultados, interval, startDate, endDate) {
    const trendData = new Map();
    const aptitudeTrends = new Map();

    // Inicializar estructura de datos
    Object.keys(APTITUDE_CODES).forEach(code => {
      aptitudeTrends.set(code, new Map());
    });

    resultados?.forEach(resultado => {
      const date = new Date(resultado.created_at);
      const dateKey = interval === 'week'
        ? AnalyticsService.getWeekKey(date)
        : format(date, 'yyyy-MM-dd');
      
      const codigo = resultado.aptitudes?.codigo;
      
      // Tendencia general
      if (!trendData.has(dateKey)) {
        trendData.set(dateKey, {
          date: dateKey,
          count: 0,
          totalPercentile: 0,
          averagePercentile: 0
        });
      }
      
      const dayData = trendData.get(dateKey);
      dayData.count++;
      dayData.totalPercentile += resultado.percentil || 0;
      dayData.averagePercentile = Math.round((dayData.totalPercentile / dayData.count) * 10) / 10;

      // Tendencias por aptitud
      if (codigo && aptitudeTrends.has(codigo)) {
        const aptitudeMap = aptitudeTrends.get(codigo);
        if (!aptitudeMap.has(dateKey)) {
          aptitudeMap.set(dateKey, {
            date: dateKey,
            count: 0,
            totalPercentile: 0,
            averagePercentile: 0
          });
        }
        
        const aptitudeData = aptitudeMap.get(dateKey);
        aptitudeData.count++;
        aptitudeData.totalPercentile += resultado.percentil || 0;
        aptitudeData.averagePercentile = Math.round((aptitudeData.totalPercentile / aptitudeData.count) * 10) / 10;
      }
    });

    // Convertir a arrays y ordenar
    const generalTrend = Array.from(trendData.values()).sort((a, b) => a.date.localeCompare(b.date));
    
    const aptitudeTrendData = {};
    aptitudeTrends.forEach((trendMap, codigo) => {
      aptitudeTrendData[codigo] = Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    });

    return {
      general: generalTrend,
      byAptitude: aptitudeTrendData,
      interval,
      period: { startDate, endDate }
    };
  }

  /**
   * Obtener clave de semana para agrupación
   */
  static getWeekKey(date) {
    const year = date.getFullYear();
    const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  /**
   * Generar insights institucionales
   */
  static generateInstitutionalInsights(current, historical) {
    const insights = [];

    // Comparar rendimiento general
    const performanceChange = current.percentilPromedio - historical.percentilPromedio;
    if (Math.abs(performanceChange) > 2) {
      insights.push({
        type: performanceChange > 0 ? 'success' : 'warning',
        title: performanceChange > 0 ? 'Mejora en Rendimiento General' : 'Declive en Rendimiento General',
        message: `El percentil promedio ${performanceChange > 0 ? 'aumentó' : 'disminuyó'} ${Math.abs(performanceChange).toFixed(1)} puntos respecto al período anterior.`,
        value: performanceChange,
        action: performanceChange < 0 ? 'Revisar estrategias de intervención' : 'Mantener estrategias actuales'
      });
    }

    // Comparar tasa de completitud
    const completionChange = current.tasaCompletitud - historical.tasaCompletitud;
    if (Math.abs(completionChange) > 0.05) {
      insights.push({
        type: completionChange > 0 ? 'success' : 'warning',
        title: completionChange > 0 ? 'Mejora en Tasa de Completitud' : 'Declive en Tasa de Completitud',
        message: `La tasa de completitud ${completionChange > 0 ? 'aumentó' : 'disminuyó'} ${Math.abs(completionChange * 100).toFixed(1)}% respecto al período anterior.`,
        value: completionChange,
        action: completionChange < 0 ? 'Revisar proceso de evaluación' : 'Excelente gestión del proceso'
      });
    }

    // Identificar estudiantes en riesgo
    if (current.performanceMetrics.riskStudents > 0) {
      const riskPercentage = (current.performanceMetrics.riskStudents / current.performanceMetrics.totalStudents) * 100;
      insights.push({
        type: riskPercentage > 20 ? 'critical' : 'warning',
        title: 'Estudiantes en Riesgo Identificados',
        message: `${current.performanceMetrics.riskStudents} estudiantes (${riskPercentage.toFixed(1)}%) presentan percentiles críticos (<25).`,
        value: current.performanceMetrics.riskStudents,
        action: 'Implementar plan de intervención personalizado'
      });
    }

    return insights;
  }

  /**
   * Obtener rango de fechas basado en configuración
   */
  static getDateRange(timeRange) {
    const endDate = endOfDay(new Date());
    let startDate;

    switch (timeRange.key || timeRange) {
      case 'last_7_days':
        startDate = startOfDay(subDays(endDate, 7));
        break;
      case 'last_30_days':
        startDate = startOfDay(subDays(endDate, 30));
        break;
      case 'last_3_months':
        startDate = startOfDay(subMonths(endDate, 3));
        break;
      case 'last_6_months':
        startDate = startOfDay(subMonths(endDate, 6));
        break;
      case 'last_year':
        startDate = startOfDay(subMonths(endDate, 12));
        break;
      default:
        startDate = startOfDay(subDays(endDate, 30));
    }

    return { startDate, endDate };
  }
}

export default AnalyticsService;