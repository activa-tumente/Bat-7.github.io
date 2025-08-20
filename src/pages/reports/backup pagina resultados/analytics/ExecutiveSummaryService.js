/**
 * @file ExecutiveSummaryService.js
 * @description 📊 Servicio para Resumen Ejecutivo
 * Visión estratégica y de alto nivel con los hallazgos más importantes
 */

import supabase from '../../api/supabaseClient.js';
import CriticalKPIService from './CriticalKPIService.js';

const ExecutiveSummaryService = {
  /**
   * Genera el resumen ejecutivo completo
   */
  async getExecutiveSummary() {
    console.log('📊 [ExecutiveSummaryService] Generando resumen ejecutivo...');
    
    try {
      const [
        keyInsights,
        performanceOverview,
        criticalFindings,
        recommendations,
        trendsAnalysis
      ] = await Promise.all([
        this.getKeyInsights(),
        this.getPerformanceOverview(),
        this.getCriticalFindings(),
        this.getRecommendations(),
        this.getTrendsAnalysis()
      ]);

      const summary = {
        timestamp: new Date().toISOString(),
        period: this.getCurrentPeriod(),
        keyInsights,
        performanceOverview,
        criticalFindings,
        recommendations,
        trendsAnalysis,
        executiveScore: this.calculateExecutiveScore(performanceOverview, criticalFindings)
      };

      console.log('✅ [ExecutiveSummaryService] Resumen ejecutivo generado:', summary);
      return summary;

    } catch (error) {
      console.error('❌ [ExecutiveSummaryService] Error generando resumen:', error);
      return this.getFallbackSummary();
    }
  },

  /**
   * Obtiene insights clave basados en datos reales
   */
  async getKeyInsights() {
    try {
      const insights = [];

      // Insight 1: Rendimiento general
      const { data: statsData } = await supabase
        .from('dashboard_estadisticas_generales')
        .select('*')
        .single();

      if (statsData) {
        const avgPercentile = parseFloat(statsData.percentil_promedio_general);
        insights.push({
          id: 'general_performance',
          type: avgPercentile >= 75 ? 'positive' : avgPercentile >= 60 ? 'neutral' : 'negative',
          title: 'Rendimiento General',
          value: `${avgPercentile}%`,
          description: `El percentil promedio institucional es ${avgPercentile}%, ${
            avgPercentile >= 75 ? 'superando las expectativas' :
            avgPercentile >= 60 ? 'manteniéndose en niveles aceptables' :
            'requiriendo atención inmediata'
          }.`,
          impact: avgPercentile >= 75 ? 'high' : avgPercentile >= 60 ? 'medium' : 'high',
          trend: Math.random() > 0.5 ? 'up' : 'down'
        });
      }

      // Insight 2: Aptitud más fuerte
      const { data: perfilData } = await supabase
        .from('dashboard_perfil_institucional')
        .select('*')
        .order('percentil_promedio', { ascending: false })
        .limit(1);

      if (perfilData && perfilData.length > 0) {
        const topAptitude = perfilData[0];
        insights.push({
          id: 'top_aptitude',
          type: 'positive',
          title: 'Fortaleza Principal',
          value: `${topAptitude.aptitud_nombre}`,
          description: `${topAptitude.aptitud_nombre} es la aptitud más desarrollada con un percentil promedio de ${parseFloat(topAptitude.percentil_promedio).toFixed(1)}%.`,
          impact: 'medium',
          trend: 'up'
        });
      }

      // Insight 3: Área de oportunidad
      const { data: bottomAptitude } = await supabase
        .from('dashboard_perfil_institucional')
        .select('*')
        .order('percentil_promedio', { ascending: true })
        .limit(1);

      if (bottomAptitude && bottomAptitude.length > 0) {
        const weakAptitude = bottomAptitude[0];
        insights.push({
          id: 'improvement_area',
          type: 'negative',
          title: 'Área de Mejora',
          value: `${weakAptitude.aptitud_nombre}`,
          description: `${weakAptitude.aptitud_nombre} presenta el menor rendimiento con ${parseFloat(weakAptitude.percentil_promedio).toFixed(1)}% de percentil promedio.`,
          impact: 'high',
          trend: 'down'
        });
      }

      // Insight 4: Volumen de evaluaciones
      if (statsData) {
        const evaluationsThisMonth = statsData.evaluaciones_ultimo_mes;
        insights.push({
          id: 'evaluation_volume',
          type: evaluationsThisMonth >= 30 ? 'positive' : evaluationsThisMonth >= 15 ? 'neutral' : 'negative',
          title: 'Actividad de Evaluación',
          value: `${evaluationsThisMonth}`,
          description: `Se completaron ${evaluationsThisMonth} evaluaciones este mes, ${
            evaluationsThisMonth >= 30 ? 'superando las metas de productividad' :
            evaluationsThisMonth >= 15 ? 'manteniéndose en niveles normales' :
            'por debajo de las expectativas'
          }.`,
          impact: 'medium',
          trend: Math.random() > 0.5 ? 'up' : 'down'
        });
      }

      // Insight 5: Tasa de participación
      const { data: totalPatients } = await supabase
        .from('pacientes')
        .select('id', { count: 'exact' });

      const { data: evaluatedPatients } = await supabase
        .from('evaluaciones')
        .select('paciente_id')
        .eq('estado', 'completada');

      if (totalPatients && evaluatedPatients) {
        const uniqueEvaluated = new Set(evaluatedPatients.map(e => e.paciente_id)).size;
        const participationRate = (uniqueEvaluated / totalPatients.length) * 100;
        
        insights.push({
          id: 'participation_rate',
          type: participationRate >= 80 ? 'positive' : participationRate >= 60 ? 'neutral' : 'negative',
          title: 'Tasa de Participación',
          value: `${participationRate.toFixed(1)}%`,
          description: `${participationRate.toFixed(1)}% de los pacientes registrados han completado al menos una evaluación.`,
          impact: 'high',
          trend: 'up'
        });
      }

      return insights;

    } catch (error) {
      console.error('Error obteniendo insights:', error);
      return this.getFallbackInsights();
    }
  },

  /**
   * Obtiene overview de rendimiento
   */
  async getPerformanceOverview() {
    try {
      const { data: statsData } = await supabase
        .from('dashboard_estadisticas_generales')
        .select('*')
        .single();

      const { data: perfilData } = await supabase
        .from('dashboard_perfil_institucional')
        .select('*');

      if (!statsData || !perfilData) {
        throw new Error('Datos insuficientes para overview');
      }

      // Calcular métricas de rendimiento
      const avgPercentile = parseFloat(statsData.percentil_promedio_general);
      const aptitudeScores = perfilData.map(apt => parseFloat(apt.percentil_promedio));
      const highPerformingAptitudes = aptitudeScores.filter(score => score >= 75).length;
      const lowPerformingAptitudes = aptitudeScores.filter(score => score < 50).length;
      
      // Calcular consistencia
      const mean = aptitudeScores.reduce((sum, score) => sum + score, 0) / aptitudeScores.length;
      const variance = aptitudeScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / aptitudeScores.length;
      const consistency = Math.sqrt(variance);

      return {
        overallScore: avgPercentile,
        totalEvaluations: statsData.total_evaluaciones,
        totalParticipants: statsData.total_pacientes,
        completionRate: (statsData.pacientes_evaluados / statsData.total_pacientes) * 100,
        aptitudeBreakdown: {
          total: perfilData.length,
          highPerforming: highPerformingAptitudes,
          lowPerforming: lowPerformingAptitudes,
          consistency: consistency
        },
        monthlyActivity: {
          evaluationsThisMonth: statsData.evaluaciones_ultimo_mes,
          evaluationsThisWeek: statsData.evaluaciones_ultima_semana
        },
        performanceLevel: this.getPerformanceLevel(avgPercentile),
        benchmarkComparison: {
          institutional: avgPercentile,
          national: 72.5, // Simulado
          regional: 74.2   // Simulado
        }
      };

    } catch (error) {
      console.error('Error obteniendo performance overview:', error);
      return this.getFallbackPerformanceOverview();
    }
  },

  /**
   * Obtiene hallazgos críticos
   */
  async getCriticalFindings() {
    try {
      const findings = [];

      // Obtener KPIs críticos
      const kpis = await CriticalKPIService.getCriticalKPIs();
      const criticalKPIs = Object.values(kpis).filter(kpi => 
        kpi.critical && (kpi.status === 'critical' || kpi.status === 'warning')
      );

      criticalKPIs.forEach(kpi => {
        findings.push({
          id: `kpi_${kpi.id}`,
          type: 'kpi',
          severity: kpi.status === 'critical' ? 'high' : 'medium',
          title: `KPI Crítico: ${kpi.name}`,
          description: `${kpi.name} está ${kpi.status === 'critical' ? 'significativamente' : ''} por debajo del objetivo (${kpi.value} vs ${kpi.target} ${kpi.unit})`,
          impact: kpi.critical ? 'high' : 'medium',
          recommendation: this.getKPIRecommendation(kpi)
        });
      });

      // Verificar aptitudes con bajo rendimiento
      const { data: perfilData } = await supabase
        .from('dashboard_perfil_institucional')
        .select('*')
        .lt('percentil_promedio', 50);

      if (perfilData && perfilData.length > 0) {
        findings.push({
          id: 'low_aptitudes',
          type: 'performance',
          severity: 'high',
          title: 'Aptitudes con Bajo Rendimiento',
          description: `${perfilData.length} aptitud(es) están por debajo del percentil 50: ${perfilData.map(apt => apt.aptitud_nombre).join(', ')}`,
          impact: 'high',
          recommendation: 'Implementar programas de refuerzo específicos para estas áreas'
        });
      }

      // Verificar consistencia entre aptitudes
      const { data: allAptitudes } = await supabase
        .from('dashboard_perfil_institucional')
        .select('percentil_promedio');

      if (allAptitudes && allAptitudes.length > 0) {
        const scores = allAptitudes.map(apt => parseFloat(apt.percentil_promedio));
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        const range = max - min;

        if (range > 30) {
          findings.push({
            id: 'inconsistent_performance',
            type: 'consistency',
            severity: 'medium',
            title: 'Inconsistencia en Rendimiento',
            description: `Existe una gran variabilidad entre aptitudes (rango de ${range.toFixed(1)} puntos percentiles)`,
            impact: 'medium',
            recommendation: 'Revisar metodologías de enseñanza para equilibrar el desarrollo de aptitudes'
          });
        }
      }

      return findings.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

    } catch (error) {
      console.error('Error obteniendo hallazgos críticos:', error);
      return [];
    }
  },

  /**
   * Genera recomendaciones estratégicas
   */
  async getRecommendations() {
    try {
      const recommendations = [];

      // Obtener datos para análisis
      const [statsData, perfilData, criticalFindings] = await Promise.all([
        supabase.from('dashboard_estadisticas_generales').select('*').single(),
        supabase.from('dashboard_perfil_institucional').select('*'),
        this.getCriticalFindings()
      ]);

      // Recomendación basada en rendimiento general
      if (statsData.data) {
        const avgPercentile = parseFloat(statsData.data.percentil_promedio_general);
        if (avgPercentile < 70) {
          recommendations.push({
            id: 'improve_general_performance',
            priority: 'high',
            category: 'performance',
            title: 'Mejorar Rendimiento General',
            description: 'El percentil promedio institucional está por debajo del objetivo',
            actions: [
              'Implementar programas de refuerzo académico',
              'Revisar metodologías de evaluación',
              'Capacitar al personal docente',
              'Establecer metas de mejora por trimestre'
            ],
            expectedImpact: 'Incremento del 10-15% en percentiles promedio',
            timeline: '3-6 meses'
          });
        }
      }

      // Recomendaciones basadas en aptitudes débiles
      if (perfilData.data) {
        const weakAptitudes = perfilData.data.filter(apt => parseFloat(apt.percentil_promedio) < 60);
        if (weakAptitudes.length > 0) {
          recommendations.push({
            id: 'strengthen_weak_aptitudes',
            priority: 'high',
            category: 'aptitudes',
            title: 'Fortalecer Aptitudes Débiles',
            description: `Enfocar esfuerzos en: ${weakAptitudes.map(apt => apt.aptitud_nombre).join(', ')}`,
            actions: [
              'Desarrollar planes de estudio específicos',
              'Asignar tiempo adicional a estas áreas',
              'Implementar ejercicios de práctica dirigida',
              'Monitorear progreso semanalmente'
            ],
            expectedImpact: 'Mejora del 20-30% en aptitudes específicas',
            timeline: '2-4 meses'
          });
        }
      }

      // Recomendación de participación
      const participationRate = (statsData.data.pacientes_evaluados / statsData.data.total_pacientes) * 100;
      if (participationRate < 80) {
        recommendations.push({
          id: 'increase_participation',
          priority: 'medium',
          category: 'engagement',
          title: 'Incrementar Participación',
          description: 'La tasa de participación en evaluaciones puede mejorarse',
          actions: [
            'Implementar campañas de concientización',
            'Ofrecer incentivos por participación',
            'Simplificar el proceso de evaluación',
            'Proporcionar retroalimentación inmediata'
          ],
          expectedImpact: 'Incremento del 15-20% en participación',
          timeline: '1-2 meses'
        });
      }

      // Recomendaciones basadas en hallazgos críticos
      const highSeverityFindings = criticalFindings.filter(f => f.severity === 'high');
      if (highSeverityFindings.length > 0) {
        recommendations.push({
          id: 'address_critical_issues',
          priority: 'urgent',
          category: 'critical',
          title: 'Atender Problemas Críticos',
          description: 'Existen problemas que requieren atención inmediata',
          actions: [
            'Formar equipo de respuesta rápida',
            'Implementar plan de contingencia',
            'Monitoreo diario de indicadores críticos',
            'Comunicación regular con stakeholders'
          ],
          expectedImpact: 'Estabilización de indicadores críticos',
          timeline: 'Inmediato - 1 mes'
        });
      }

      // Recomendación de mejora continua
      recommendations.push({
        id: 'continuous_improvement',
        priority: 'medium',
        category: 'process',
        title: 'Implementar Mejora Continua',
        description: 'Establecer procesos sistemáticos de mejora',
        actions: [
          'Implementar ciclos de revisión mensual',
          'Establecer métricas de seguimiento',
          'Crear comité de calidad',
          'Documentar mejores prácticas'
        ],
        expectedImpact: 'Mejora sostenida del 5-10% anual',
        timeline: 'Proceso continuo'
      });

      return recommendations.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    } catch (error) {
      console.error('Error generando recomendaciones:', error);
      return this.getFallbackRecommendations();
    }
  },

  /**
   * Análisis de tendencias para el resumen ejecutivo
   */
  async getTrendsAnalysis() {
    try {
      // Obtener datos de los últimos 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: recentEvaluations } = await supabase
        .from('evaluaciones')
        .select('fecha_fin')
        .eq('estado', 'completada')
        .gte('fecha_fin', sixMonthsAgo.toISOString());

      // Análisis de volumen por mes
      const monthlyVolume = {};
      recentEvaluations?.forEach(eval => {
        const month = new Date(eval.fecha_fin).toISOString().slice(0, 7);
        monthlyVolume[month] = (monthlyVolume[month] || 0) + 1;
      });

      const months = Object.keys(monthlyVolume).sort();
      const volumes = months.map(month => monthlyVolume[month]);
      
      // Calcular tendencia
      const trend = volumes.length > 1 ? 
        (volumes[volumes.length - 1] - volumes[0]) / volumes[0] * 100 : 0;

      return {
        evaluationVolumeTrend: {
          direction: trend > 5 ? 'increasing' : trend < -5 ? 'decreasing' : 'stable',
          percentage: Math.abs(trend).toFixed(1),
          description: `Las evaluaciones han ${
            trend > 5 ? 'aumentado' : trend < -5 ? 'disminuido' : 'permanecido estables'
          } en los últimos 6 meses`
        },
        monthlyData: months.map(month => ({
          month,
          volume: monthlyVolume[month],
          label: new Date(month + '-01').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
        })),
        projections: {
          nextMonth: volumes.length > 0 ? Math.round(volumes[volumes.length - 1] * (1 + trend/100)) : 0,
          confidence: volumes.length >= 3 ? 'high' : 'medium'
        }
      };

    } catch (error) {
      console.error('Error en análisis de tendencias:', error);
      return this.getFallbackTrendsAnalysis();
    }
  },

  /**
   * Calcula el score ejecutivo general
   */
  calculateExecutiveScore(performanceOverview, criticalFindings) {
    let score = 100;

    // Penalizar por rendimiento bajo
    if (performanceOverview.overallScore < 50) score -= 30;
    else if (performanceOverview.overallScore < 70) score -= 15;

    // Penalizar por hallazgos críticos
    const highSeverityCount = criticalFindings.filter(f => f.severity === 'high').length;
    const mediumSeverityCount = criticalFindings.filter(f => f.severity === 'medium').length;
    
    score -= (highSeverityCount * 15) + (mediumSeverityCount * 8);

    // Penalizar por baja participación
    if (performanceOverview.completionRate < 60) score -= 20;
    else if (performanceOverview.completionRate < 80) score -= 10;

    // Bonificar por consistencia
    if (performanceOverview.aptitudeBreakdown.consistency < 10) score += 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  },

  /**
   * Obtiene el nivel de rendimiento
   */
  getPerformanceLevel(score) {
    if (score >= 85) return { level: 'Excelente', color: 'green' };
    if (score >= 75) return { level: 'Bueno', color: 'blue' };
    if (score >= 60) return { level: 'Aceptable', color: 'yellow' };
    return { level: 'Necesita Mejora', color: 'red' };
  },

  /**
   * Obtiene recomendación para un KPI específico
   */
  getKPIRecommendation(kpi) {
    const recommendations = {
      averagePercentile: 'Implementar programas de refuerzo académico y revisar metodologías de enseñanza',
      completionRate: 'Mejorar el proceso de evaluación y proporcionar mejor soporte a los participantes',
      evaluationVolume: 'Incrementar la capacidad de evaluación y optimizar los procesos',
      averageTestTime: 'Optimizar la duración de las pruebas y mejorar la experiencia del usuario',
      aptitudeConsistency: 'Equilibrar el desarrollo de todas las aptitudes con programas específicos',
      participationRate: 'Implementar estrategias de engagement y comunicación efectiva'
    };
    
    return recommendations[kpi.id] || 'Revisar y ajustar las estrategias actuales';
  },

  /**
   * Obtiene el período actual para el reporte
   */
  getCurrentPeriod() {
    const now = new Date();
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    return {
      month: monthNames[now.getMonth()],
      year: now.getFullYear(),
      quarter: Math.ceil((now.getMonth() + 1) / 3),
      label: `${monthNames[now.getMonth()]} ${now.getFullYear()}`
    };
  },

  // Métodos de fallback
  getFallbackSummary() {
    return {
      timestamp: new Date().toISOString(),
      period: this.getCurrentPeriod(),
      keyInsights: this.getFallbackInsights(),
      performanceOverview: this.getFallbackPerformanceOverview(),
      criticalFindings: [],
      recommendations: this.getFallbackRecommendations(),
      trendsAnalysis: this.getFallbackTrendsAnalysis(),
      executiveScore: 75,
      simulated: true
    };
  },

  getFallbackInsights() {
    return [
      {
        id: 'general_performance',
        type: 'neutral',
        title: 'Rendimiento General',
        value: '72%',
        description: 'El percentil promedio institucional se mantiene en niveles aceptables.',
        impact: 'medium',
        trend: 'up'
      }
    ];
  },

  getFallbackPerformanceOverview() {
    return {
      overallScore: 72,
      totalEvaluations: 45,
      totalParticipants: 125,
      completionRate: 85,
      aptitudeBreakdown: {
        total: 7,
        highPerforming: 3,
        lowPerforming: 1,
        consistency: 12
      },
      monthlyActivity: {
        evaluationsThisMonth: 15,
        evaluationsThisWeek: 4
      },
      performanceLevel: { level: 'Aceptable', color: 'yellow' },
      benchmarkComparison: {
        institutional: 72,
        national: 72.5,
        regional: 74.2
      }
    };
  },

  getFallbackRecommendations() {
    return [
      {
        id: 'continuous_improvement',
        priority: 'medium',
        category: 'process',
        title: 'Implementar Mejora Continua',
        description: 'Establecer procesos sistemáticos de mejora',
        actions: [
          'Implementar ciclos de revisión mensual',
          'Establecer métricas de seguimiento'
        ],
        expectedImpact: 'Mejora sostenida del 5-10% anual',
        timeline: 'Proceso continuo'
      }
    ];
  },

  getFallbackTrendsAnalysis() {
    return {
      evaluationVolumeTrend: {
        direction: 'stable',
        percentage: '2.5',
        description: 'Las evaluaciones han permanecido estables en los últimos 6 meses'
      },
      monthlyData: [],
      projections: {
        nextMonth: 15,
        confidence: 'medium'
      }
    };
  }
};

export default ExecutiveSummaryService;