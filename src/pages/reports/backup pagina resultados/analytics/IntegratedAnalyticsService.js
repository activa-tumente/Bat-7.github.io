/**
 * Servicio Integrado de Analytics
 * Unifica todos los servicios analytics con sincronización optimizada de Supabase
 */

import DashboardService from '../DashboardService.js';
import AnalyticsService from './AnalyticsService.js';
import PatientProgressService from './PatientProgressService.js';
import StatisticalService from './StatisticalService.js';
import { aggregateByTimePeriod, aggregateByAptitude } from '../../utils/analytics/dataAggregation.js';
import { TIME_RANGES } from '../../utils/analytics/constants.js';

/**
 * Servicio principal que integra todos los analytics con cache y optimización
 */
class IntegratedAnalyticsService {
  
  // Cache simple para evitar consultas duplicadas
  static cache = new Map();
  static cacheTimeout = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtener todos los datos del dashboard con cache optimizado
   */
  static async getAllDashboardData(filters = {}) {
    const cacheKey = `dashboard_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      console.log('📋 [IntegratedAnalyticsService] Usando datos en cache');
      return cached;
    }

    try {
      console.log('📊 [IntegratedAnalyticsService] Cargando datos completos del dashboard...');

      // Cargar datos base en paralelo (optimizado)
      // Usar el método unificado del DashboardService
      const dashboardData = await DashboardService.fetchDashboardData(filters);
      const advancedMetrics = await this.getAdvancedMetrics(filters);

      // Extraer los datos del resultado unificado
      const {
        estadisticasGenerales,
        datosDistribucionNivel: distribucionNivel,
        datosPerfilInstitucional: perfilInstitucional,
        kpiData,
        trendData
      } = dashboardData;

      // Generar datos de comparativa (simulados por ahora)
      const comparativaNivel = [
        { nivel: 'Masculino', promedio: 72.5, total: 65 },
        { nivel: 'Femenino', promedio: 78.2, total: 58 },
        { nivel: 'Otro', promedio: 75.0, total: 2 }
      ];

      const comparativaGenero = [
        { genero: 'Masculino', promedio: 72.5, total: 65 },
        { genero: 'Femenino', promedio: 78.2, total: 58 },
        { genero: 'Otro', promedio: 75.0, total: 2 }
      ];

      const result = {
        estadisticasGenerales,
        datosDistribucionNivel: distribucionNivel,
        datosPerfilInstitucional: perfilInstitucional,
        datosComparativaNivel: comparativaNivel,
        datosComparativaGenero: comparativaGenero,
        kpiData,
        trendData,
        advancedMetrics,
        alertsData: this.generateSmartAlerts(estadisticasGenerales, advancedMetrics),
        lastUpdated: new Date()
      };

      this.setCache(cacheKey, result);
      console.log('✅ [IntegratedAnalyticsService] Datos cargados y cacheados correctamente');
      
      return result;

    } catch (error) {
      console.error('❌ [IntegratedAnalyticsService] Error cargando datos:', error);
      throw error;
    }
  }

  /**
   * Obtener métricas avanzadas con sincronización optimizada
   */
  static async getAdvancedMetrics(filters = {}) {
    try {
      const timeRange = filters.dateRange || TIME_RANGES.LAST_30_DAYS;
      
      // Usar AnalyticsService para métricas institucionales avanzadas
      const institutionalMetrics = await AnalyticsService.getAdvancedInstitutionalMetrics({
        dateRange: timeRange,
        institutionId: filters.institutionId
      });

      return {
        institutional: institutionalMetrics,
        timeRange,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('❌ [IntegratedAnalyticsService] Error en métricas avanzadas:', error);
      return {
        institutional: null,
        timeRange: TIME_RANGES.LAST_30_DAYS,
        generatedAt: new Date(),
        error: error.message
      };
    }
  }

  /**
   * Obtener progreso de paciente con datos sincronizados
   */
  static async getPatientProgressData(patientId, options = {}) {
    const cacheKey = `patient_progress_${patientId}_${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      console.log(`📋 [IntegratedAnalyticsService] Usando progreso en cache para paciente ${patientId}`);
      return cached;
    }

    try {
      console.log(`📈 [IntegratedAnalyticsService] Cargando progreso del paciente ${patientId}...`);
      
      const progressData = await PatientProgressService.getPatientProgress(patientId, options);
      
      // Enriquecer con análisis estadístico
      if (progressData.aptitudeProgression) {
        progressData.statisticalAnalysis = this.analyzeProgressStatistically(progressData);
      }

      this.setCache(cacheKey, progressData);
      console.log(`✅ [IntegratedAnalyticsService] Progreso del paciente ${patientId} cargado correctamente`);
      
      return progressData;

    } catch (error) {
      console.error(`❌ [IntegratedAnalyticsService] Error cargando progreso del paciente ${patientId}:`, error);
      throw error;
    }
  }

  /**
   * Realizar análisis comparativo entre grupos
   */
  static async performComparativeAnalysis(groups, options = {}) {
    try {
      console.log('📊 [IntegratedAnalyticsService] Realizando análisis comparativo...');

      const {
        aptitudeCode = null,
        statisticalTests = true,
        includeVisualizations = true
      } = options;

      const results = {
        groups: [],
        statisticalTests: {},
        visualizations: {},
        summary: {},
        generatedAt: new Date()
      };

      // Procesar cada grupo
      for (const group of groups) {
        const groupStats = this.calculateGroupStatistics(group.data, aptitudeCode);
        results.groups.push({
          ...group,
          statistics: groupStats
        });
      }

      // Realizar pruebas estadísticas si se solicita
      if (statisticalTests && results.groups.length >= 2) {
        results.statisticalTests = this.performStatisticalTests(results.groups);
      }

      // Generar datos para visualizaciones
      if (includeVisualizations) {
        results.visualizations = this.generateVisualizationData(results.groups);
      }

      // Generar resumen
      results.summary = this.generateComparativeSummary(results);

      console.log('✅ [IntegratedAnalyticsService] Análisis comparativo completado');
      return results;

    } catch (error) {
      console.error('❌ [IntegratedAnalyticsService] Error en análisis comparativo:', error);
      throw error;
    }
  }

  /**
   * Generar alertas inteligentes basadas en datos
   */
  static generateSmartAlerts(generalStats, advancedMetrics) {
    const alerts = [];

    try {
      // Alerta por bajo rendimiento general
      if (generalStats?.percentil_promedio_general < 50) {
        alerts.push({
          id: 'low_performance',
          type: 'warning',
          title: 'Rendimiento General Bajo',
          message: `El percentil promedio institucional (${generalStats.percentil_promedio_general}%) está por debajo del promedio esperado.`,
          action: 'Revisar estrategias pedagógicas',
          priority: 'high',
          data: { percentile: generalStats.percentil_promedio_general }
        });
      }

      // Alerta por baja tasa de completitud
      const completionRate = generalStats?.pacientes_evaluados / generalStats?.total_pacientes;
      if (completionRate < 0.8) {
        alerts.push({
          id: 'low_completion',
          type: 'critical',
          title: 'Baja Tasa de Completitud',
          message: `Solo el ${Math.round(completionRate * 100)}% de los pacientes han completado las evaluaciones.`,
          action: 'Revisar proceso de evaluación',
          priority: 'critical',
          data: { completionRate: Math.round(completionRate * 100) }
        });
      }

      // Alertas basadas en métricas avanzadas
      if (advancedMetrics?.institutional?.insights) {
        advancedMetrics.institutional.insights.forEach((insight, index) => {
          alerts.push({
            id: `insight_${index}`,
            type: insight.type,
            title: insight.title,
            message: insight.message,
            action: insight.action,
            priority: insight.type === 'critical' ? 'critical' : 'medium',
            data: { value: insight.value }
          });
        });
      }

      // Alerta de éxito si todo va bien
      if (alerts.length === 0) {
        alerts.push({
          id: 'all_good',
          type: 'success',
          title: 'Sistema Funcionando Correctamente',
          message: 'Todos los indicadores están dentro de los rangos esperados.',
          action: 'Continuar monitoreo',
          priority: 'low',
          data: {}
        });
      }

    } catch (error) {
      console.error('❌ [IntegratedAnalyticsService] Error generando alertas:', error);
      alerts.push({
        id: 'error_alert',
        type: 'warning',
        title: 'Error en Análisis de Alertas',
        message: 'No se pudieron generar todas las alertas automáticas.',
        action: 'Revisar logs del sistema',
        priority: 'medium',
        data: { error: error.message }
      });
    }

    return alerts.sort((a, b) => {
      const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Analizar progreso estadísticamente
   */
  static analyzeProgressStatistically(progressData) {
    const analysis = {
      overallTrend: 'stable',
      significantChanges: [],
      correlations: {},
      predictions: {},
      recommendations: []
    };

    try {
      // Analizar tendencia general
      const allProgressions = Object.values(progressData.aptitudeProgression);
      const improvingCount = allProgressions.filter(p => p.trend === 'improving').length;
      const decliningCount = allProgressions.filter(p => p.trend === 'declining').length;

      if (improvingCount > decliningCount) {
        analysis.overallTrend = 'improving';
      } else if (decliningCount > improvingCount) {
        analysis.overallTrend = 'declining';
      }

      // Identificar cambios significativos
      analysis.significantChanges = progressData.significantChanges?.filter(change => 
        change.changeType === 'significant_improvement' || change.changeType === 'significant_decline'
      ) || [];

      // Generar recomendaciones básicas
      if (analysis.overallTrend === 'declining') {
        analysis.recommendations.push('Considerar intervención personalizada');
        analysis.recommendations.push('Revisar estrategias de aprendizaje');
      } else if (analysis.overallTrend === 'improving') {
        analysis.recommendations.push('Mantener estrategias actuales');
        analysis.recommendations.push('Considerar desafíos adicionales');
      }

    } catch (error) {
      console.error('❌ [IntegratedAnalyticsService] Error en análisis estadístico:', error);
      analysis.error = error.message;
    }

    return analysis;
  }

  /**
   * Calcular estadísticas de grupo
   */
  static calculateGroupStatistics(data, aptitudeCode = null) {
    if (!data || data.length === 0) {
      return {
        count: 0,
        mean: 0,
        median: 0,
        standardDeviation: 0,
        min: 0,
        max: 0
      };
    }

    const values = aptitudeCode 
      ? data.map(item => item[aptitudeCode]).filter(val => val !== null && val !== undefined)
      : data.map(item => item.percentil || item.value || 0).filter(val => val !== null && val !== undefined);

    return StatisticalService.calculateDescriptiveStats(values);
  }

  /**
   * Realizar pruebas estadísticas entre grupos
   */
  static performStatisticalTests(groups) {
    const tests = {};

    try {
      if (groups.length === 2) {
        // Prueba t para dos grupos
        const group1Data = groups[0].data.map(item => item.percentil || item.value || 0);
        const group2Data = groups[1].data.map(item => item.percentil || item.value || 0);
        
        tests.tTest = StatisticalService.tTestTwoSamples(group1Data, group2Data);
      } else if (groups.length > 2) {
        // ANOVA para múltiples grupos
        const groupsData = groups.map(group => 
          group.data.map(item => item.percentil || item.value || 0)
        );
        
        tests.anova = StatisticalService.oneWayANOVA(groupsData);
      }

    } catch (error) {
      console.error('❌ [IntegratedAnalyticsService] Error en pruebas estadísticas:', error);
      tests.error = error.message;
    }

    return tests;
  }

  /**
   * Generar datos para visualizaciones
   */
  static generateVisualizationData(groups) {
    const visualizations = {
      boxPlot: [],
      barChart: [],
      scatterPlot: []
    };

    try {
      groups.forEach((group, index) => {
        const values = group.data.map(item => item.percentil || item.value || 0);
        
        // Datos para box plot
        visualizations.boxPlot.push({
          name: group.name || `Grupo ${index + 1}`,
          ...StatisticalService.generateBoxPlotData(values)
        });

        // Datos para gráfico de barras
        visualizations.barChart.push({
          name: group.name || `Grupo ${index + 1}`,
          mean: group.statistics.mean,
          count: group.statistics.count
        });
      });

    } catch (error) {
      console.error('❌ [IntegratedAnalyticsService] Error generando datos de visualización:', error);
      visualizations.error = error.message;
    }

    return visualizations;
  }

  /**
   * Generar resumen comparativo
   */
  static generateComparativeSummary(results) {
    const summary = {
      totalGroups: results.groups.length,
      totalSamples: 0,
      bestPerformingGroup: null,
      significantDifferences: false,
      recommendations: []
    };

    try {
      // Calcular total de muestras
      summary.totalSamples = results.groups.reduce((sum, group) => sum + group.statistics.count, 0);

      // Encontrar grupo con mejor rendimiento
      let bestGroup = null;
      let bestMean = -1;

      results.groups.forEach(group => {
        if (group.statistics.mean > bestMean) {
          bestMean = group.statistics.mean;
          bestGroup = group;
        }
      });

      summary.bestPerformingGroup = bestGroup?.name || 'No determinado';

      // Verificar diferencias significativas
      if (results.statisticalTests.tTest?.isSignificant || results.statisticalTests.anova?.isSignificant) {
        summary.significantDifferences = true;
        summary.recommendations.push('Se detectaron diferencias estadísticamente significativas entre grupos');
      }

      // Generar recomendaciones adicionales
      if (bestMean < 50) {
        summary.recommendations.push('Todos los grupos muestran rendimiento por debajo del promedio');
      } else if (bestMean > 75) {
        summary.recommendations.push('Se observa excelente rendimiento en el mejor grupo');
      }

    } catch (error) {
      console.error('❌ [IntegratedAnalyticsService] Error generando resumen:', error);
      summary.error = error.message;
    }

    return summary;
  }

  /**
   * Métodos de cache
   */
  static getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  static setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  static clearCache() {
    this.cache.clear();
    console.log('🗑️ [IntegratedAnalyticsService] Cache limpiado');
  }

  /**
   * Aplicar filtros con optimización
   */
  static async applyFilters(filters) {
    try {
      console.log('🔍 [IntegratedAnalyticsService] Aplicando filtros optimizados:', filters);
      
      // Limpiar cache relacionado
      this.clearCache();
      
      // Obtener datos filtrados
      const filteredData = await DashboardService.applyFilters(filters);
      
      // Recargar datos con filtros aplicados
      const dashboardData = await this.getAllDashboardData(filters);
      
      return {
        filteredData,
        dashboardData,
        appliedAt: new Date()
      };

    } catch (error) {
      console.error('❌ [IntegratedAnalyticsService] Error aplicando filtros:', error);
      throw error;
    }
  }
}

export default IntegratedAnalyticsService;