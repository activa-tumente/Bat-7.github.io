/**
 * @file index.js
 * @description Índice de servicios analíticos del dashboard
 * Exporta todos los servicios especializados para facilitar el acceso
 */

// Servicios principales
export { default as SyncTestService } from './SyncTestService.js';
export { default as CriticalKPIService } from './CriticalKPIService.js';
export { default as ExecutiveSummaryService } from './ExecutiveSummaryService.js';
export { default as TrendAnalysisService } from './TrendAnalysisService.js';
export { default as StatisticalAnalysisService } from './StatisticalAnalysisService.js';
export { default as ComparativeAnalysisService } from './ComparativeAnalysisService.js';

// Servicios de utilidades (cuando se implementen)
// export { default as ValidationUtils } from './utils/ValidationUtils.js';
// export { default as DataProcessor } from './utils/DataProcessor.js';

// Estrategias especializadas (cuando se implementen)
// export { default as TrendAnalysisStrategies } from './strategies/TrendAnalysisStrategies.js';
// export { default as InsightStrategies } from './strategies/InsightStrategies.js';

/**
 * Configuración de módulos del dashboard
 */
export const DASHBOARD_MODULES = {
  SYNC_TEST: {
    id: 'sync_test',
    name: '🔧 Pruebas Sync',
    description: 'Verificar la integridad y estado de la sincronización de datos',
    service: 'SyncTestService',
    component: 'SyncTestModule',
    category: 'system',
    priority: 1
  },
  EXECUTIVE_SUMMARY: {
    id: 'executive_summary',
    name: '📊 Resumen Ejecutivo',
    description: 'Visión estratégica y de alto nivel con los hallazgos más importantes',
    service: 'ExecutiveSummaryService',
    component: 'ExecutiveSummaryModule',
    category: 'executive',
    priority: 2
  },
  CRITICAL_KPIS: {
    id: 'critical_kpis',
    name: '📈 KPIs Críticos',
    description: 'Monitoreo de Indicadores Clave de Rendimiento (KPIs) definidos',
    service: 'CriticalKPIService',
    component: 'CriticalKPIModule',
    category: 'performance',
    priority: 3
  },
  OVERVIEW: {
    id: 'overview',
    name: '📋 Visión General',
    description: 'Estadísticas descriptivas globales de la población evaluada',
    service: 'DashboardService',
    component: 'OverviewModule',
    category: 'general',
    priority: 4
  },
  TREND_ANALYSIS: {
    id: 'trend_analysis',
    name: '📉 Análisis de Tendencias',
    description: 'Evolución de las métricas a lo largo del tiempo',
    service: 'TrendAnalysisService',
    component: 'TrendAnalysisModule',
    category: 'analytics',
    priority: 5
  },
  COMPARATIVE_ANALYSIS: {
    id: 'comparative_analysis',
    name: '⚖️ Análisis Comparativo',
    description: 'Benchmarking entre diferentes segmentos de la población',
    service: 'ComparativeAnalysisService',
    component: 'ComparativeAnalysisModule',
    category: 'analytics',
    priority: 6
  },
  STATISTICAL_ANALYSIS: {
    id: 'statistical_analysis',
    name: '📊 Análisis Estadístico',
    description: 'Medidas de tendencia central, dispersión y distribución',
    service: 'StatisticalAnalysisService',
    component: 'StatisticalAnalysisModule',
    category: 'analytics',
    priority: 7
  },
  EXPORT: {
    id: 'export',
    name: '📤 Exportación',
    description: 'Generar y descargar reportes en diferentes formatos',
    service: 'ExportService',
    component: 'ExportModule',
    category: 'tools',
    priority: 8
  },
  INDIVIDUAL_REPORT: {
    id: 'individual_report',
    name: '👤 Informe Individual',
    description: 'Análisis profundo y detallado de un único evaluado',
    service: 'DashboardService',
    component: 'IndividualReportModule',
    category: 'reports',
    priority: 9
  },
  SYSTEM_STATUS: {
    id: 'system_status',
    name: '🖥️ Estado del Sistema',
    description: 'Dashboard técnico para administradores',
    service: 'DashboardService',
    component: 'SystemStatusModule',
    category: 'system',
    priority: 10
  }
};

/**
 * Obtiene la configuración de un módulo por ID
 */
export const getModuleConfig = (moduleId) => {
  return Object.values(DASHBOARD_MODULES).find(module => module.id === moduleId);
};

/**
 * Obtiene módulos por categoría
 */
export const getModulesByCategory = (category) => {
  return Object.values(DASHBOARD_MODULES)
    .filter(module => module.category === category)
    .sort((a, b) => a.priority - b.priority);
};

/**
 * Obtiene todos los módulos ordenados por prioridad
 */
export const getAllModules = () => {
  return Object.values(DASHBOARD_MODULES).sort((a, b) => a.priority - b.priority);
};

/**
 * Configuración de gráficos por módulo
 */
export const CHART_CONFIGS = {
  sync_test: {
    performanceChart: { type: 'line', responsive: true },
    recordsChart: { type: 'bar', responsive: true },
    statusChart: { type: 'doughnut', responsive: true }
  },
  critical_kpis: {
    bulletChart: { type: 'custom', responsive: true },
    gaugeChart: { type: 'gauge', responsive: true },
    trendChart: { type: 'bar', responsive: true }
  },
  executive_summary: {
    scoreGauge: { type: 'gauge', responsive: true },
    overviewCards: { type: 'cards', responsive: true },
    insightsChart: { type: 'mixed', responsive: true }
  },
  trend_analysis: {
    performanceChart: { type: 'line', responsive: true },
    volumeChart: { type: 'area', responsive: true },
    aptitudeChart: { type: 'multi-line', responsive: true }
  },
  comparative_analysis: {
    radarChart: { type: 'radar', responsive: true },
    barChart: { type: 'grouped-bar', responsive: true },
    boxPlotChart: { type: 'box-plot', responsive: true }
  },
  statistical_analysis: {
    histogramChart: { type: 'histogram', responsive: true },
    correlationChart: { type: 'heatmap', responsive: true },
    distributionChart: { type: 'box-plot', responsive: true }
  }
};

/**
 * Configuración de filtros por módulo
 */
export const FILTER_CONFIGS = {
  global: {
    dateRange: { type: 'date-range', default: '6months' },
    institution: { type: 'select', multiple: true },
    gender: { type: 'select', multiple: true },
    ageGroup: { type: 'select', multiple: true },
    aptitude: { type: 'select', multiple: true }
  },
  trend_analysis: {
    timeRange: { type: 'select', options: ['3months', '6months', '1year', '2years'] },
    granularity: { type: 'select', options: ['weekly', 'monthly', 'quarterly'] }
  },
  comparative_analysis: {
    comparisonType: { type: 'select', options: ['gender', 'age', 'education', 'institution'] },
    groups: { type: 'multi-select', dynamic: true }
  },
  statistical_analysis: {
    analysisType: { type: 'select', options: ['descriptive', 'correlation', 'distribution'] },
    confidenceLevel: { type: 'select', options: [90, 95, 99] }
  }
};

export default {
  SyncTestService,
  CriticalKPIService,
  ExecutiveSummaryService,
  TrendAnalysisService,
  StatisticalAnalysisService,
  ComparativeAnalysisService,
  DASHBOARD_MODULES,
  CHART_CONFIGS,
  FILTER_CONFIGS,
  getModuleConfig,
  getModulesByCategory,
  getAllModules
};