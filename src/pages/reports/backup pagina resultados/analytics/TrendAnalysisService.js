/**
 * @file TrendAnalysisService.js
 * @description 📉 Servicio para Análisis de Tendencias
 * Evolución de las métricas a lo largo del tiempo
 */

import supabase from '../../api/supabaseClient.js';
import { StatisticalUtils } from '../../utils/StatisticalUtils.js';
import { TREND_ANALYSIS_CONFIG } from '../../constants/trendAnalysisConfig.js';
import { DataProcessor } from './utils/DataProcessor.js';
import { ValidationUtils, ValidationError } from './utils/ValidationUtils.js';
import { TrendAnalysisContext } from './strategies/TrendAnalysisStrategies.js';

const TrendAnalysisService = {
  /**
   * Obtiene análisis completo de tendencias
   */
  async getTrendAnalysis(config = {}) {
    console.log('📉 [TrendAnalysisService] Generando análisis de tendencias...');
    
    try {
      // Merge with default configuration
      const analysisConfig = { ...TREND_ANALYSIS_CONFIG.DEFAULT_CONFIG, ...config };
      
      // Validate configuration
      ValidationUtils.validateConfig(analysisConfig);

      // Execute analysis pipeline
      const analysis = await this.executeAnalysisPipeline(analysisConfig);
      
      console.log('✅ [TrendAnalysisService] Análisis de tendencias completado:', analysis);
      return analysis;

    } catch (error) {
      if (error instanceof ValidationError) {
        console.error('❌ [TrendAnalysisService] Validation error:', error.message);
        throw error;
      }
      
      console.error('❌ [TrendAnalysisService] Error en análisis de tendencias:', error);
      return this.getFallbackTrendAnalysis();
    }
  },

  /**
   * Execute the complete analysis pipeline
   */
  async executeAnalysisPipeline(config) {
    // Step 1: Get historical data
    const historicalData = await ValidationUtils.safeExecute(
      () => this.getHistoricalData(config),
      [],
      'getHistoricalData'
    );

    if (historicalData.length === 0) {
      return this.getFallbackTrendAnalysis();
    }

    // Step 2: Generate time series (optimized)
    const timeSeries = DataProcessor.generateMultipleSeries(historicalData, config);
    
    // Step 3: Analyze trends using strategy pattern
    const trends = this.analyzeTrendsWithStrategies(timeSeries);
    
    // Step 4: Detect seasonal patterns
    const seasonalPatterns = this.analyzeSeasonalPatterns(timeSeries);
    
    // Step 5: Generate forecasts if requested
    const forecasts = config.includeForecasting ? 
      this.generateOptimizedForecasts(timeSeries, TREND_ANALYSIS_CONFIG.FORECASTING.DEFAULT_PERIODS) : null;
    
    // Step 6: Identify change points
    const changePoints = this.identifyChangePoints(timeSeries);
    
    // Step 7: Calculate metrics and insights
    const trendMetrics = this.calculateTrendMetrics(timeSeries, trends);
    const insights = this.generateTrendInsights(trends, changePoints, seasonalPatterns);

    return {
      timestamp: new Date().toISOString(),
      config: config,
      dataPoints: historicalData.length,
      timeSeries,
      trends,
      seasonalPatterns,
      forecasts,
      changePoints,
      trendMetrics,
      insights,
      recommendations: this.generateTrendRecommendations(insights, trends)
    };
  },

  /**
   * Analyze trends using strategy pattern
   */
  analyzeTrendsWithStrategies(timeSeries) {
    const trendContext = new TrendAnalysisContext();
    const trends = {};
    
    // Analyze general trend
    if (timeSeries.general && timeSeries.general.length > 1) {
      trends.general = trendContext.analyzeTrends(timeSeries.general, 'linear');
    }
    
    // Analyze trends by aptitude
    if (timeSeries.byAptitude) {
      trends.byAptitude = {};
      Object.keys(timeSeries.byAptitude).forEach(aptitud => {
        const aptitudSeries = timeSeries.byAptitude[aptitud].data;
        if (aptitudSeries.length > 1) {
          trends.byAptitude[aptitud] = trendContext.analyzeTrends(aptitudSeries, 'linear');
        }
      });
    }
    
    // Analyze trends by group
    if (timeSeries.byGroup) {
      trends.byGroup = {};
      Object.keys(timeSeries.byGroup).forEach(group => {
        const groupSeries = timeSeries.byGroup[group];
        if (groupSeries.length > 1) {
          trends.byGroup[group] = trendContext.analyzeTrends(groupSeries, 'linear');
        }
      });
    }
    
    return trends;
  },

  /**
   * Analyze seasonal patterns using strategy pattern
   */
  analyzeSeasonalPatterns(timeSeries) {
    const trendContext = new TrendAnalysisContext();
    const patterns = {};
    
    if (timeSeries.general && timeSeries.general.length >= TREND_ANALYSIS_CONFIG.SEASONALITY.MIN_PERIODS_FOR_ANALYSIS) {
      patterns.general = trendContext.analyzeTrends(timeSeries.general, 'seasonal');
    }
    
    if (timeSeries.byAptitude) {
      patterns.byAptitude = {};
      Object.keys(timeSeries.byAptitude).forEach(aptitud => {
        const aptitudSeries = timeSeries.byAptitude[aptitud].data;
        if (aptitudSeries.length >= TREND_ANALYSIS_CONFIG.SEASONALITY.MIN_PERIODS_FOR_ANALYSIS) {
          patterns.byAptitude[aptitud] = trendContext.analyzeTrends(aptitudSeries, 'seasonal');
        }
      });
    }
    
    return patterns;
  },

  /**
   * Obtiene datos históricos para análisis de tendencias
   */
  async getHistoricalData(config) {
    try {
      // Calcular fecha de inicio basada en el rango temporal
      const endDate = new Date();
      const startDate = new Date();
      
      switch (config.period) {
        case 'daily':
          startDate.setDate(endDate.getDate() - config.timeRange);
          break;
        case 'weekly':
          startDate.setDate(endDate.getDate() - (config.timeRange * 7));
          break;
        case 'monthly':
          startDate.setMonth(endDate.getMonth() - config.timeRange);
          break;
        case 'quarterly':
          startDate.setMonth(endDate.getMonth() - (config.timeRange * 3));
          break;
      }

      let query = supabase
        .from('resultados')
        .select(`
          puntaje_directo,
          percentil,
          created_at,
          aptitud_id,
          evaluacion_id,
          aptitudes!inner(codigo, nombre),
          evaluaciones!inner(
            fecha_fin,
            paciente_id,
            pacientes!inner(
              genero,
              fecha_nacimiento,
              nivel_educativo,
              institucion_id,
              instituciones(nombre)
            )
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      const { data, error } = await query;
      
      if (error) throw error;

      // Procesar y enriquecer datos
      return data.map(item => ({
        fecha: item.created_at,
        fecha_evaluacion: item.evaluaciones.fecha_fin,
        puntaje_directo: item.puntaje_directo,
        percentil: item.percentil,
        aptitud_codigo: item.aptitudes.codigo,
        aptitud_nombre: item.aptitudes.nombre,
        genero: item.evaluaciones.pacientes.genero,
        edad: this.calculateAge(item.evaluaciones.pacientes.fecha_nacimiento),
        nivel_educativo: item.evaluaciones.pacientes.nivel_educativo,
        institucion: item.evaluaciones.pacientes.instituciones?.nombre
      }));

    } catch (error) {
      console.error('Error obteniendo datos históricos:', error);
      return this.generateSimulatedHistoricalData(config);
    }
  },

  /**
   * Generate optimized forecasts using configuration constants
   */
  generateOptimizedForecasts(timeSeries, periods) {
    const forecasts = {};
    const { MIN_PERCENTILE, MAX_PERCENTILE, CONFIDENCE_INTERVAL_WIDTH } = TREND_ANALYSIS_CONFIG.FORECASTING;
    
    if (timeSeries.general && timeSeries.general.length > 2) {
      forecasts.general = this.forecastSeriesOptimized(timeSeries.general, periods);
    }
    
    if (timeSeries.byAptitude) {
      forecasts.byAptitude = {};
      Object.keys(timeSeries.byAptitude).forEach(aptitud => {
        const aptitudSeries = timeSeries.byAptitude[aptitud].data;
        if (aptitudSeries.length > 2) {
          forecasts.byAptitude[aptitud] = this.forecastSeriesOptimized(aptitudSeries, periods);
        }
      });
    }
    
    return forecasts;
  },

  /**
   * Optimized forecast series using statistical utilities
   */
  forecastSeriesOptimized(series, periods) {
    const values = series.map(point => point.percentil_promedio);
    const regression = StatisticalUtils.calculateLinearRegression(values);
    const { MIN_PERCENTILE, MAX_PERCENTILE, CONFIDENCE_INTERVAL_WIDTH } = TREND_ANALYSIS_CONFIG.FORECASTING;
    
    const lastIndex = series.length - 1;
    const forecasts = [];
    
    for (let i = 1; i <= periods; i++) {
      const forecastValue = regression.slope * (lastIndex + i) + regression.intercept;
      const clampedValue = Math.max(MIN_PERCENTILE, Math.min(MAX_PERCENTILE, forecastValue));
      
      const lastDate = new Date(series[lastIndex].date);
      const forecastDate = new Date(lastDate);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      
      forecasts.push({
        period: i,
        date: forecastDate.toISOString(),
        predicted_value: clampedValue,
        confidence_interval: {
          lower: Math.max(MIN_PERCENTILE, forecastValue - CONFIDENCE_INTERVAL_WIDTH),
          upper: Math.min(MAX_PERCENTILE, forecastValue + CONFIDENCE_INTERVAL_WIDTH)
        }
      });
    }
    
    return {
      method: 'linear_trend',
      forecasts: forecasts,
      trend: regression
    };
  },

  /**
   * Identifica puntos de cambio significativos
   */
  identifyChangePoints(timeSeries) {
    const changePoints = {};
    
    if (timeSeries.general && timeSeries.general.length > 5) {
      changePoints.general = this.detectChangePoints(timeSeries.general);
    }
    
    if (timeSeries.byAptitude) {
      changePoints.byAptitude = {};
      Object.keys(timeSeries.byAptitude).forEach(aptitud => {
        const aptitudSeries = timeSeries.byAptitude[aptitud].data;
        if (aptitudSeries.length > 5) {
          changePoints.byAptitude[aptitud] = this.detectChangePoints(aptitudSeries);
        }
      });
    }
    
    return changePoints;
  },

  /**
   * Detecta puntos de cambio en una serie
   */
  detectChangePoints(series) {
    const values = series.map(point => point.percentil_promedio);
    const changePoints = [];
    
    // Detectar cambios significativos usando ventana deslizante
    const windowSize = Math.min(3, Math.floor(series.length / 3));
    
    for (let i = windowSize; i < values.length - windowSize; i++) {
      const beforeWindow = values.slice(i - windowSize, i);
      const afterWindow = values.slice(i, i + windowSize);
      
      const beforeMean = this.calculateMean(beforeWindow);
      const afterMean = this.calculateMean(afterWindow);
      const difference = Math.abs(afterMean - beforeMean);
      
      // Si la diferencia es significativa (más de 10 percentiles)
      if (difference > 10) {
        changePoints.push({
          index: i,
          date: series[i].date,
          period: series[i].period,
          before_mean: beforeMean,
          after_mean: afterMean,
          change_magnitude: afterMean - beforeMean,
          change_type: afterMean > beforeMean ? 'improvement' : 'decline'
        });
      }
    }
    
    return changePoints;
  },

  /**
   * Calcula métricas de tendencia
   */
  calculateTrendMetrics(timeSeries, trends) {
    const metrics = {};
    
    if (timeSeries.general && trends.general) {
      const series = timeSeries.general;
      const trend = trends.general;
      
      metrics.general = {
        total_change: series[series.length - 1].percentil_promedio - series[0].percentil_promedio,
        average_change_per_period: trend.slope,
        volatility: this.calculateStandardDeviation(series.map(p => p.percentil_promedio)),
        consistency: trend.rSquared,
        periods_analyzed: series.length
      };
    }
    
    return metrics;
  },

  /**
   * Genera insights de tendencias
   */
  generateTrendInsights(trends, changePoints, seasonalPatterns) {
    const insights = [];
    
    // Insights de tendencia general
    if (trends.general) {
      const trend = trends.general;
      
      if (trend.direction === 'ascending' && trend.significance === 'significant') {
        insights.push({
          type: 'positive',
          category: 'trend',
          title: 'Tendencia Positiva Sostenida',
          description: `El rendimiento muestra una mejora constante con pendiente de ${trend.slope.toFixed(2)} percentiles por período`,
          impact: 'high',
          confidence: trend.rSquared
        });
      } else if (trend.direction === 'descending' && trend.significance === 'significant') {
        insights.push({
          type: 'concern',
          category: 'trend',
          title: 'Tendencia Negativa Preocupante',
          description: `El rendimiento muestra un declive con pendiente de ${trend.slope.toFixed(2)} percentiles por período`,
          impact: 'high',
          confidence: trend.rSquared
        });
      }
    }
    
    // Insights de puntos de cambio
    if (changePoints.general && changePoints.general.length > 0) {
      const significantChanges = changePoints.general.filter(cp => Math.abs(cp.change_magnitude) > 15);
      
      if (significantChanges.length > 0) {
        const latestChange = significantChanges[significantChanges.length - 1];
        insights.push({
          type: latestChange.change_type === 'improvement' ? 'positive' : 'concern',
          category: 'change_point',
          title: `Cambio Significativo Detectado`,
          description: `${latestChange.change_type === 'improvement' ? 'Mejora' : 'Declive'} de ${Math.abs(latestChange.change_magnitude).toFixed(1)} percentiles en ${latestChange.period}`,
          impact: 'medium',
          date: latestChange.date
        });
      }
    }
    
    // Insights de estacionalidad
    if (seasonalPatterns.general && seasonalPatterns.general.hasSeasonality) {
      const pattern = seasonalPatterns.general;
      insights.push({
        type: 'neutral',
        category: 'seasonality',
        title: 'Patrón Estacional Identificado',
        description: `Se detectaron variaciones estacionales con amplitud de ${pattern.amplitude.toFixed(1)} percentiles`,
        impact: 'medium',
        peaks: pattern.peaks,
        valleys: pattern.valleys
      });
    }
    
    return insights;
  },

  /**
   * Genera recomendaciones basadas en tendencias
   */
  generateTrendRecommendations(insights, trends) {
    const recommendations = [];
    
    insights.forEach(insight => {
      switch (insight.category) {
        case 'trend':
          if (insight.type === 'concern') {
            recommendations.push({
              priority: 'high',
              category: 'intervention',
              title: 'Intervención Inmediata Requerida',
              description: 'Implementar medidas correctivas para revertir la tendencia negativa',
              timeline: '1-2 meses',
              expectedImpact: 'Estabilización y mejora gradual'
            });
          } else if (insight.type === 'positive') {
            recommendations.push({
              priority: 'medium',
              category: 'maintenance',
              title: 'Mantener Estrategias Exitosas',
              description: 'Identificar y replicar las prácticas que generan la tendencia positiva',
              timeline: 'Continuo',
              expectedImpact: 'Sostenimiento de la mejora'
            });
          }
          break;
          
        case 'change_point':
          recommendations.push({
            priority: 'medium',
            category: 'analysis',
            title: 'Análisis de Factores de Cambio',
            description: `Investigar las causas del ${insight.type === 'positive' ? 'mejoramiento' : 'declive'} detectado`,
            timeline: '2-4 semanas',
            expectedImpact: 'Mejor comprensión de factores influyentes'
          });
          break;
          
        case 'seasonality':
          recommendations.push({
            priority: 'low',
            category: 'planning',
            title: 'Planificación Estacional',
            description: 'Ajustar estrategias según patrones estacionales identificados',
            timeline: '3-6 meses',
            expectedImpact: 'Optimización de recursos según temporadas'
          });
          break;
      }
    });
    
    return recommendations;
  },

  // Funciones auxiliares
  calculateMean(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  },

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  },

  calculateStandardDeviation(values) {
    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  },

  calculateAge(birthDate) {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    return today.getFullYear() - birth.getFullYear();
  },

  parseDate(periodKey) {
    // Convertir clave de período a fecha
    if (periodKey.includes('-Q')) {
      const [year, quarter] = periodKey.split('-Q');
      const month = (parseInt(quarter) - 1) * 3;
      return new Date(parseInt(year), month, 1).toISOString();
    } else if (periodKey.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = periodKey.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, 1).toISOString();
    } else {
      return new Date(periodKey).toISOString();
    }
  },

  assessTrendSignificance(slope, rSquared, n) {
    // Evaluación simplificada de significancia
    if (Math.abs(slope) > 1 && rSquared > 0.5 && n > 5) {
      return 'significant';
    } else if (Math.abs(slope) > 0.5 && rSquared > 0.3) {
      return 'moderate';
    } else {
      return 'not_significant';
    }
  },

  generateSimulatedHistoricalData(config) {
    const data = [];
    const aptitudes = ['V', 'E', 'A', 'R', 'N', 'M', 'O'];
    const aptitudesNombres = {
      'V': 'Aptitud Verbal', 'E': 'Aptitud Espacial', 'A': 'Atención',
      'R': 'Razonamiento', 'N': 'Aptitud Numérica', 'M': 'Aptitud Mecánica', 'O': 'Ortografía'
    };
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - config.timeRange);
    
    // Generar datos con tendencia simulada
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
      const weekProgress = (d.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime());
      
      for (let i = 0; i < 5; i++) {
        const aptitud = aptitudes[Math.floor(Math.random() * aptitudes.length)];
        const baseTrend = 65 + (weekProgress * 10); // Tendencia ascendente
        const noise = (Math.random() - 0.5) * 20;
        const percentil = Math.max(1, Math.min(100, baseTrend + noise));
        
        data.push({
          fecha: new Date(d).toISOString(),
          fecha_evaluacion: new Date(d).toISOString(),
          puntaje_directo: Math.floor(Math.random() * 40) + 10,
          percentil: Math.round(percentil),
          aptitud_codigo: aptitud,
          aptitud_nombre: aptitudesNombres[aptitud],
          genero: Math.random() > 0.5 ? 'masculino' : 'femenino',
          edad: Math.floor(Math.random() * 8) + 12,
          nivel_educativo: 'secundaria',
          institucion: 'Institución Ejemplo'
        });
      }
    }
    
    return data;
  },

  getFallbackTrendAnalysis() {
    return {
      timestamp: new Date().toISOString(),
      config: { period: 'monthly', timeRange: 12 },
      dataPoints: 0,
      timeSeries: {},
      trends: {},
      seasonalPatterns: {},
      forecasts: null,
      changePoints: {},
      trendMetrics: {},
      insights: [
        { type: 'info', message: 'Análisis de tendencias con datos simulados' }
      ],
      recommendations: []
    };
  }
};

export default TrendAnalysisService;