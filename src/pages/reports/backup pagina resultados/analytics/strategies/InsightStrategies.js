/**
 * @file InsightStrategies.js
 * @description Strategy pattern implementation for different types of insights
 */

import { PERFORMANCE_THRESHOLDS, COVERAGE_THRESHOLDS, VARIABILITY_THRESHOLDS } from '../../../constants/thresholds.js';

// Base strategy interface
class InsightStrategy {
  generate(data) {
    throw new Error('generate method must be implemented');
  }
}

// Performance insight strategy
export class PerformanceInsightStrategy extends InsightStrategy {
  generate(estadisticas) {
    const insights = [];
    const rendimientoGeneral = parseFloat(estadisticas.percentil_promedio_general);
    
    if (rendimientoGeneral >= PERFORMANCE_THRESHOLDS.GOOD) {
      insights.push({
        type: 'positive',
        title: 'Rendimiento Sobresaliente',
        description: `El rendimiento general de ${rendimientoGeneral.toFixed(1)} percentil indica un desempeño superior al promedio nacional`,
        impact: 'high',
        category: 'performance',
        value: rendimientoGeneral
      });
    } else if (rendimientoGeneral < PERFORMANCE_THRESHOLDS.AVERAGE) {
      insights.push({
        type: 'concern',
        title: 'Oportunidad de Mejora',
        description: `El rendimiento general de ${rendimientoGeneral.toFixed(1)} percentil sugiere necesidad de intervención`,
        impact: 'high',
        category: 'performance',
        value: rendimientoGeneral
      });
    }
    
    return insights;
  }
}

// Aptitude insight strategy
export class AptitudeInsightStrategy extends InsightStrategy {
  generate(perfilData) {
    const insights = [];
    
    // Best aptitude
    const mejorAptitud = perfilData.reduce((max, apt) => 
      parseFloat(apt.percentil_promedio) > parseFloat(max.percentil_promedio) ? apt : max
    );
    
    insights.push({
      type: 'positive',
      title: 'Fortaleza Identificada',
      description: `${mejorAptitud.aptitud_nombre} muestra el mejor rendimiento con ${parseFloat(mejorAptitud.percentil_promedio).toFixed(1)} percentil`,
      impact: 'medium',
      category: 'strengths',
      value: parseFloat(mejorAptitud.percentil_promedio),
      aptitude: mejorAptitud.aptitud_nombre
    });

    // Worst aptitude
    const peorAptitud = perfilData.reduce((min, apt) => 
      parseFloat(apt.percentil_promedio) < parseFloat(min.percentil_promedio) ? apt : min
    );
    
    if (parseFloat(peorAptitud.percentil_promedio) < 65) {
      insights.push({
        type: 'concern',
        title: 'Área de Desarrollo',
        description: `${peorAptitud.aptitud_nombre} requiere atención especial con ${parseFloat(peorAptitud.percentil_promedio).toFixed(1)} percentil`,
        impact: 'high',
        category: 'development',
        value: parseFloat(peorAptitud.percentil_promedio),
        aptitude: peorAptitud.aptitud_nombre
      });
    }
    
    return insights;
  }
}

// Coverage insight strategy
export class CoverageInsightStrategy extends InsightStrategy {
  generate(estadisticas) {
    const insights = [];
    const tasaCobertura = (estadisticas.pacientes_evaluados / estadisticas.total_pacientes) * 100;
    
    if (tasaCobertura >= COVERAGE_THRESHOLDS.EXCELLENT) {
      insights.push({
        type: 'positive',
        title: 'Excelente Cobertura',
        description: `${tasaCobertura.toFixed(1)}% de los pacientes han completado evaluaciones`,
        impact: 'medium',
        category: 'coverage',
        value: tasaCobertura
      });
    } else if (tasaCobertura < COVERAGE_THRESHOLDS.AVERAGE) {
      insights.push({
        type: 'concern',
        title: 'Cobertura Limitada',
        description: `Solo ${tasaCobertura.toFixed(1)}% de los pacientes han sido evaluados`,
        impact: 'high',
        category: 'coverage',
        value: tasaCobertura
      });
    }
    
    return insights;
  }
}

// Variability insight strategy
export class VariabilityInsightStrategy extends InsightStrategy {
  generate(perfilData) {
    const insights = [];
    const desviacionPromedio = perfilData.reduce((sum, apt) => 
      sum + parseFloat(apt.desviacion_estandar || 0), 0
    ) / perfilData.length;
    
    if (desviacionPromedio > VARIABILITY_THRESHOLDS.HIGH) {
      insights.push({
        type: 'neutral',
        title: 'Alta Variabilidad',
        description: `La desviación promedio de ${desviacionPromedio.toFixed(1)} indica diversidad en los resultados`,
        impact: 'medium',
        category: 'variability',
        value: desviacionPromedio
      });
    }
    
    return insights;
  }
}

// Context class that uses strategies
export class InsightGenerator {
  constructor() {
    this.strategies = [
      new PerformanceInsightStrategy(),
      new AptitudeInsightStrategy(),
      new CoverageInsightStrategy(),
      new VariabilityInsightStrategy()
    ];
  }

  generateAllInsights(estadisticas, perfilData) {
    const allInsights = [];
    
    // Apply performance and coverage strategies to estadisticas
    this.strategies.forEach(strategy => {
      if (strategy instanceof PerformanceInsightStrategy || strategy instanceof CoverageInsightStrategy) {
        allInsights.push(...strategy.generate(estadisticas));
      }
    });
    
    // Apply aptitude and variability strategies to perfilData
    this.strategies.forEach(strategy => {
      if (strategy instanceof AptitudeInsightStrategy || strategy instanceof VariabilityInsightStrategy) {
        allInsights.push(...strategy.generate(perfilData));
      }
    });
    
    return allInsights;
  }
}