/**
 * @file ComparativeAnalysisService.js
 * @description ⚖️ Servicio para Análisis Comparativo
 * Benchmarking entre diferentes segmentos de la población con datos reales
 */

import supabase from '../../api/supabaseClient.js';

const ComparativeAnalysisService = {
  /**
   * Obtiene análisis comparativo completo
   */
  async getComparativeAnalysis(filters = {}) {
    console.log('⚖️ [ComparativeAnalysisService] Obteniendo análisis comparativo...');
    
    try {
      const [
        genderComparison,
        ageGroupComparison,
        educationComparison,
        institutionComparison,
        aptitudeComparison,
        temporalComparison
      ] = await Promise.all([
        this.getGenderComparison(filters),
        this.getAgeGroupComparison(filters),
        this.getEducationLevelComparison(filters),
        this.getInstitutionComparison(filters),
        this.getAptitudeComparison(filters),
        this.getTemporalComparison(filters)
      ]);

      const analysis = {
        timestamp: new Date().toISOString(),
        filters,
        genderComparison,
        ageGroupComparison,
        educationComparison,
        institutionComparison,
        aptitudeComparison,
        temporalComparison,
        summary: this.generateComparativeSummary({
          genderComparison,
          ageGroupComparison,
          educationComparison,
          institutionComparison,
          aptitudeComparison
        })
      };

      console.log('✅ [ComparativeAnalysisService] Análisis comparativo completado');
      return analysis;

    } catch (error) {
      console.error('❌ [ComparativeAnalysisService] Error en análisis:', error);
      return this.getFallbackComparativeAnalysis(filters);
    }
  },

  /**
   * Comparación por género
   */
  async getGenderComparison(filters) {
    try {
      const { data: resultados } = await supabase
        .from('resultados')
        .select(`
          percentil,
          puntaje_directo,
          aptitudes!inner(codigo, nombre),
          evaluaciones!inner(
            pacientes!inner(genero)
          )
        `)
        .not('percentil', 'is', null)
        .not('evaluaciones.pacientes.genero', 'is', null);

      if (!resultados || resultados.length === 0) {
        return this.getEmptyComparison('gender');
      }

      // Agrupar por género y aptitud
      const genderData = {};
      resultados.forEach(resultado => {
        const gender = resultado.evaluaciones.pacientes.genero;
        const aptitudCode = resultado.aptitudes.codigo;
        const aptitudName = resultado.aptitudes.nombre;
        
        if (!genderData[gender]) {
          genderData[gender] = {};
        }
        if (!genderData[gender][aptitudCode]) {
          genderData[gender][aptitudCode] = {
            name: aptitudName,
            percentiles: [],
            puntajesDirectos: []
          };
        }
        
        genderData[gender][aptitudCode].percentiles.push(resultado.percentil);
        genderData[gender][aptitudCode].puntajesDirectos.push(resultado.puntaje_directo);
      });

      // Calcular estadísticas por género y aptitud
      const comparisonData = {};
      Object.keys(genderData).forEach(gender => {
        comparisonData[gender] = {};
        Object.keys(genderData[gender]).forEach(aptitudCode => {
          const data = genderData[gender][aptitudCode];
          comparisonData[gender][aptitudCode] = {
            name: data.name,
            stats: this.calculateBasicStats(data.percentiles),
            sampleSize: data.percentiles.length
          };
        });
      });

      // Generar datos para gráficos
      const chartData = this.generateGenderChartData(comparisonData);
      
      // Realizar tests de significancia
      const significanceTests = this.performGenderSignificanceTests(genderData);

      return {
        type: 'gender',
        data: comparisonData,
        chartData,
        significanceTests,
        insights: this.generateGenderInsights(comparisonData, significanceTests)
      };

    } catch (error) {
      console.error('Error en comparación por género:', error);
      return this.getEmptyComparison('gender');
    }
  },

  /**
   * Comparación por grupo de edad
   */
  async getAgeGroupComparison(filters) {
    try {
      const { data: resultados } = await supabase
        .from('resultados')
        .select(`
          percentil,
          puntaje_directo,
          aptitudes!inner(codigo, nombre),
          evaluaciones!inner(
            pacientes!inner(fecha_nacimiento)
          )
        `)
        .not('percentil', 'is', null)
        .not('evaluaciones.pacientes.fecha_nacimiento', 'is', null);

      if (!resultados || resultados.length === 0) {
        return this.getEmptyComparison('age');
      }

      // Agrupar por grupo de edad
      const ageGroupData = {};
      resultados.forEach(resultado => {
        const birthDate = new Date(resultado.evaluaciones.pacientes.fecha_nacimiento);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        const ageGroup = this.getAgeGroup(age);
        const aptitudCode = resultado.aptitudes.codigo;
        const aptitudName = resultado.aptitudes.nombre;
        
        if (!ageGroupData[ageGroup]) {
          ageGroupData[ageGroup] = {};
        }
        if (!ageGroupData[ageGroup][aptitudCode]) {
          ageGroupData[ageGroup][aptitudCode] = {
            name: aptitudName,
            percentiles: []
          };
        }
        
        ageGroupData[ageGroup][aptitudCode].percentiles.push(resultado.percentil);
      });

      // Calcular estadísticas
      const comparisonData = {};
      Object.keys(ageGroupData).forEach(ageGroup => {
        comparisonData[ageGroup] = {};
        Object.keys(ageGroupData[ageGroup]).forEach(aptitudCode => {
          const data = ageGroupData[ageGroup][aptitudCode];
          comparisonData[ageGroup][aptitudCode] = {
            name: data.name,
            stats: this.calculateBasicStats(data.percentiles),
            sampleSize: data.percentiles.length
          };
        });
      });

      const chartData = this.generateAgeGroupChartData(comparisonData);
      const significanceTests = this.performAgeGroupSignificanceTests(ageGroupData);

      return {
        type: 'age',
        data: comparisonData,
        chartData,
        significanceTests,
        insights: this.generateAgeGroupInsights(comparisonData, significanceTests)
      };

    } catch (error) {
      console.error('Error en comparación por edad:', error);
      return this.getEmptyComparison('age');
    }
  },

  /**
   * Comparación por nivel educativo
   */
  async getEducationLevelComparison(filters) {
    try {
      const { data: resultados } = await supabase
        .from('resultados')
        .select(`
          percentil,
          aptitudes!inner(codigo, nombre),
          evaluaciones!inner(
            pacientes!inner(nivel_educativo)
          )
        `)
        .not('percentil', 'is', null);

      if (!resultados || resultados.length === 0) {
        return this.getEmptyComparison('education');
      }

      // Agrupar por nivel educativo
      const educationData = {};
      resultados.forEach(resultado => {
        const educationLevel = resultado.evaluaciones.pacientes.nivel_educativo || 'No especificado';
        const aptitudCode = resultado.aptitudes.codigo;
        const aptitudName = resultado.aptitudes.nombre;
        
        if (!educationData[educationLevel]) {
          educationData[educationLevel] = {};
        }
        if (!educationData[educationLevel][aptitudCode]) {
          educationData[educationLevel][aptitudCode] = {
            name: aptitudName,
            percentiles: []
          };
        }
        
        educationData[educationLevel][aptitudCode].percentiles.push(resultado.percentil);
      });

      // Calcular estadísticas
      const comparisonData = {};
      Object.keys(educationData).forEach(educationLevel => {
        comparisonData[educationLevel] = {};
        Object.keys(educationData[educationLevel]).forEach(aptitudCode => {
          const data = educationData[educationLevel][aptitudCode];
          comparisonData[educationLevel][aptitudCode] = {
            name: data.name,
            stats: this.calculateBasicStats(data.percentiles),
            sampleSize: data.percentiles.length
          };
        });
      });

      const chartData = this.generateEducationChartData(comparisonData);

      return {
        type: 'education',
        data: comparisonData,
        chartData,
        insights: this.generateEducationInsights(comparisonData)
      };

    } catch (error) {
      console.error('Error en comparación por educación:', error);
      return this.getEmptyComparison('education');
    }
  },

  /**
   * Comparación por institución
   */
  async getInstitutionComparison(filters) {
    try {
      const { data: resultados } = await supabase
        .from('resultados')
        .select(`
          percentil,
          aptitudes!inner(codigo, nombre),
          evaluaciones!inner(
            pacientes!inner(
              instituciones!inner(nombre)
            )
          )
        `)
        .not('percentil', 'is', null);

      if (!resultados || resultados.length === 0) {
        return this.getEmptyComparison('institution');
      }

      // Agrupar por institución
      const institutionData = {};
      resultados.forEach(resultado => {
        const institution = resultado.evaluaciones.pacientes.instituciones?.nombre || 'Sin institución';
        const aptitudCode = resultado.aptitudes.codigo;
        const aptitudName = resultado.aptitudes.nombre;
        
        if (!institutionData[institution]) {
          institutionData[institution] = {};
        }
        if (!institutionData[institution][aptitudCode]) {
          institutionData[institution][aptitudCode] = {
            name: aptitudName,
            percentiles: []
          };
        }
        
        institutionData[institution][aptitudCode].percentiles.push(resultado.percentil);
      });

      // Calcular estadísticas
      const comparisonData = {};
      Object.keys(institutionData).forEach(institution => {
        comparisonData[institution] = {};
        Object.keys(institutionData[institution]).forEach(aptitudCode => {
          const data = institutionData[institution][aptitudCode];
          comparisonData[institution][aptitudCode] = {
            name: data.name,
            stats: this.calculateBasicStats(data.percentiles),
            sampleSize: data.percentiles.length
          };
        });
      });

      const chartData = this.generateInstitutionChartData(comparisonData);

      return {
        type: 'institution',
        data: comparisonData,
        chartData,
        insights: this.generateInstitutionInsights(comparisonData)
      };

    } catch (error) {
      console.error('Error en comparación por institución:', error);
      return this.getEmptyComparison('institution');
    }
  },

  /**
   * Comparación entre aptitudes
   */
  async getAptitudeComparison(filters) {
    try {
      const { data: resultados } = await supabase
        .from('resultados')
        .select(`
          percentil,
          puntaje_directo,
          aptitudes!inner(codigo, nombre)
        `)
        .not('percentil', 'is', null);

      if (!resultados || resultados.length === 0) {
        return this.getEmptyComparison('aptitude');
      }

      // Agrupar por aptitud
      const aptitudeData = {};
      resultados.forEach(resultado => {
        const aptitudCode = resultado.aptitudes.codigo;
        const aptitudName = resultado.aptitudes.nombre;
        
        if (!aptitudeData[aptitudCode]) {
          aptitudeData[aptitudCode] = {
            name: aptitudName,
            percentiles: [],
            puntajesDirectos: []
          };
        }
        
        aptitudeData[aptitudCode].percentiles.push(resultado.percentil);
        aptitudeData[aptitudCode].puntajesDirectos.push(resultado.puntaje_directo);
      });

      // Calcular estadísticas
      const comparisonData = {};
      Object.keys(aptitudeData).forEach(aptitudCode => {
        const data = aptitudeData[aptitudCode];
        comparisonData[aptitudCode] = {
          name: data.name,
          stats: this.calculateBasicStats(data.percentiles),
          directScoreStats: this.calculateBasicStats(data.puntajesDirectos),
          sampleSize: data.percentiles.length
        };
      });

      const chartData = this.generateAptitudeChartData(comparisonData);
      const rankingData = this.generateAptitudeRanking(comparisonData);

      return {
        type: 'aptitude',
        data: comparisonData,
        chartData,
        ranking: rankingData,
        insights: this.generateAptitudeInsights(comparisonData, rankingData)
      };

    } catch (error) {
      console.error('Error en comparación de aptitudes:', error);
      return this.getEmptyComparison('aptitude');
    }
  },

  /**
   * Comparación temporal
   */
  async getTemporalComparison(filters) {
    try {
      const { data: resultados } = await supabase
        .from('resultados')
        .select(`
          percentil,
          aptitudes!inner(codigo, nombre),
          evaluaciones!inner(fecha_fin)
        `)
        .not('percentil', 'is', null)
        .not('evaluaciones.fecha_fin', 'is', null)
        .order('evaluaciones(fecha_fin)');

      if (!resultados || resultados.length === 0) {
        return this.getEmptyComparison('temporal');
      }

      // Agrupar por período (trimestre)
      const temporalData = {};
      resultados.forEach(resultado => {
        const date = new Date(resultado.evaluaciones.fecha_fin);
        const quarter = this.getQuarter(date);
        const aptitudCode = resultado.aptitudes.codigo;
        const aptitudName = resultado.aptitudes.nombre;
        
        if (!temporalData[quarter]) {
          temporalData[quarter] = {};
        }
        if (!temporalData[quarter][aptitudCode]) {
          temporalData[quarter][aptitudCode] = {
            name: aptitudName,
            percentiles: []
          };
        }
        
        temporalData[quarter][aptitudCode].percentiles.push(resultado.percentil);
      });

      // Calcular estadísticas
      const comparisonData = {};
      Object.keys(temporalData).forEach(quarter => {
        comparisonData[quarter] = {};
        Object.keys(temporalData[quarter]).forEach(aptitudCode => {
          const data = temporalData[quarter][aptitudCode];
          comparisonData[quarter][aptitudCode] = {
            name: data.name,
            stats: this.calculateBasicStats(data.percentiles),
            sampleSize: data.percentiles.length
          };
        });
      });

      const chartData = this.generateTemporalChartData(comparisonData);
      const trendAnalysis = this.analyzeTemporalTrends(comparisonData);

      return {
        type: 'temporal',
        data: comparisonData,
        chartData,
        trends: trendAnalysis,
        insights: this.generateTemporalInsights(comparisonData, trendAnalysis)
      };

    } catch (error) {
      console.error('Error en comparación temporal:', error);
      return this.getEmptyComparison('temporal');
    }
  },

  /**
   * Calcula estadísticas básicas
   */
  calculateBasicStats(values) {
    if (!values || values.length === 0) {
      return { mean: 0, median: 0, std: 0, min: 0, max: 0, count: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const median = n % 2 === 0 ? 
      (sorted[n/2 - 1] + sorted[n/2]) / 2 : 
      sorted[Math.floor(n/2)];
    
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const std = Math.sqrt(variance);

    return {
      mean: parseFloat(mean.toFixed(2)),
      median: parseFloat(median.toFixed(2)),
      std: parseFloat(std.toFixed(2)),
      min: sorted[0],
      max: sorted[n-1],
      count: n
    };
  },

  /**
   * Obtiene el grupo de edad
   */
  getAgeGroup(age) {
    if (age < 13) return '< 13 años';
    if (age < 16) return '13-15 años';
    if (age < 19) return '16-18 años';
    if (age < 25) return '19-24 años';
    return '25+ años';
  },

  /**
   * Obtiene el trimestre
   */
  getQuarter(date) {
    const year = date.getFullYear();
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    return `${year}-Q${quarter}`;
  },

  /**
   * Genera datos para gráfico de comparación por género
   */
  generateGenderChartData(comparisonData) {
    const aptitudes = new Set();
    Object.values(comparisonData).forEach(genderData => {
      Object.keys(genderData).forEach(aptCode => aptitudes.add(aptCode));
    });

    const radarData = {
      labels: Array.from(aptitudes).map(code => 
        Object.values(comparisonData)[0][code]?.name || code
      ),
      datasets: Object.keys(comparisonData).map((gender, index) => ({
        label: gender.charAt(0).toUpperCase() + gender.slice(1),
        data: Array.from(aptitudes).map(aptCode => 
          comparisonData[gender][aptCode]?.stats.mean || 0
        ),
        backgroundColor: index === 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(236, 72, 153, 0.2)',
        borderColor: index === 0 ? 'rgba(59, 130, 246, 1)' : 'rgba(236, 72, 153, 1)',
        borderWidth: 2
      }))
    };

    const barData = {
      labels: Array.from(aptitudes).map(code => 
        Object.values(comparisonData)[0][code]?.name || code
      ),
      datasets: Object.keys(comparisonData).map((gender, index) => ({
        label: gender.charAt(0).toUpperCase() + gender.slice(1),
        data: Array.from(aptitudes).map(aptCode => 
          comparisonData[gender][aptCode]?.stats.mean || 0
        ),
        backgroundColor: index === 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(236, 72, 153, 0.8)',
        borderColor: index === 0 ? 'rgba(59, 130, 246, 1)' : 'rgba(236, 72, 153, 1)',
        borderWidth: 1
      }))
    };

    return { radarData, barData };
  },

  /**
   * Genera datos para gráfico de comparación por grupo de edad
   */
  generateAgeGroupChartData(comparisonData) {
    const aptitudes = new Set();
    Object.values(comparisonData).forEach(ageData => {
      Object.keys(ageData).forEach(aptCode => aptitudes.add(aptCode));
    });

    const colors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(139, 92, 246, 0.8)'
    ];

    const barData = {
      labels: Array.from(aptitudes).map(code => 
        Object.values(comparisonData)[0] && Object.values(comparisonData)[0][code]?.name || code
      ),
      datasets: Object.keys(comparisonData).map((ageGroup, index) => ({
        label: ageGroup,
        data: Array.from(aptitudes).map(aptCode => 
          comparisonData[ageGroup][aptCode]?.stats.mean || 0
        ),
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length].replace('0.8', '1'),
        borderWidth: 1
      }))
    };

    return { barData };
  },

  /**
   * Genera datos para gráfico de comparación de aptitudes
   */
  generateAptitudeChartData(comparisonData) {
    const aptitudes = Object.keys(comparisonData);
    
    const boxPlotData = aptitudes.map(aptCode => ({
      label: comparisonData[aptCode].name,
      min: comparisonData[aptCode].stats.min,
      q1: comparisonData[aptCode].stats.mean - comparisonData[aptCode].stats.std,
      median: comparisonData[aptCode].stats.median,
      q3: comparisonData[aptCode].stats.mean + comparisonData[aptCode].stats.std,
      max: comparisonData[aptCode].stats.max,
      mean: comparisonData[aptCode].stats.mean
    }));

    const barData = {
      labels: aptitudes.map(code => comparisonData[code].name),
      datasets: [{
        label: 'Percentil Promedio',
        data: aptitudes.map(code => comparisonData[code].stats.mean),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }]
    };

    return { boxPlotData, barData };
  },

  /**
   * Genera ranking de aptitudes
   */
  generateAptitudeRanking(comparisonData) {
    return Object.entries(comparisonData)
      .map(([code, data]) => ({
        code,
        name: data.name,
        mean: data.stats.mean,
        sampleSize: data.sampleSize,
        rank: 0
      }))
      .sort((a, b) => b.mean - a.mean)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  },

  /**
   * Realiza tests de significancia para género
   */
  performGenderSignificanceTests(genderData) {
    const tests = {};
    const genders = Object.keys(genderData);
    
    if (genders.length === 2) {
      const aptitudes = new Set();
      Object.values(genderData).forEach(data => {
        Object.keys(data).forEach(apt => aptitudes.add(apt));
      });

      Array.from(aptitudes).forEach(aptCode => {
        const group1 = genderData[genders[0]][aptCode]?.percentiles || [];
        const group2 = genderData[genders[1]][aptCode]?.percentiles || [];
        
        if (group1.length > 1 && group2.length > 1) {
          tests[aptCode] = this.performTTest(group1, group2);
        }
      });
    }

    return tests;
  },

  /**
   * Test t simplificado
   */
  performTTest(group1, group2) {
    const stats1 = this.calculateBasicStats(group1);
    const stats2 = this.calculateBasicStats(group2);
    
    const n1 = group1.length;
    const n2 = group2.length;
    
    const pooledVariance = ((n1 - 1) * Math.pow(stats1.std, 2) + (n2 - 1) * Math.pow(stats2.std, 2)) / (n1 + n2 - 2);
    const standardError = Math.sqrt(pooledVariance * (1/n1 + 1/n2));
    const tStat = (stats1.mean - stats2.mean) / standardError;
    
    return {
      tStatistic: parseFloat(tStat.toFixed(3)),
      significant: Math.abs(tStat) > 2,
      meanDifference: parseFloat((stats1.mean - stats2.mean).toFixed(2)),
      effectSize: Math.abs(stats1.mean - stats2.mean) / Math.sqrt(pooledVariance)
    };
  },

  // Métodos para generar datos de gráficos adicionales
  generateEducationChartData(comparisonData) {
    // Similar a generateAgeGroupChartData pero para educación
    return this.generateAgeGroupChartData(comparisonData);
  },

  generateInstitutionChartData(comparisonData) {
    // Similar a generateAgeGroupChartData pero para instituciones
    return this.generateAgeGroupChartData(comparisonData);
  },

  generateTemporalChartData(comparisonData) {
    const quarters = Object.keys(comparisonData).sort();
    const aptitudes = new Set();
    
    Object.values(comparisonData).forEach(quarterData => {
      Object.keys(quarterData).forEach(aptCode => aptitudes.add(aptCode));
    });

    const lineData = {
      labels: quarters,
      datasets: Array.from(aptitudes).map((aptCode, index) => {
        const colors = [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(34, 197, 94, 1)'
        ];
        
        return {
          label: Object.values(comparisonData)[0][aptCode]?.name || aptCode,
          data: quarters.map(quarter => 
            comparisonData[quarter][aptCode]?.stats.mean || null
          ),
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length].replace('1)', '0.1)'),
          tension: 0.4,
          fill: false
        };
      })
    };

    return { lineData };
  },

  /**
   * Analiza tendencias temporales
   */
  analyzeTemporalTrends(comparisonData) {
    const quarters = Object.keys(comparisonData).sort();
    const trends = {};
    
    const aptitudes = new Set();
    Object.values(comparisonData).forEach(quarterData => {
      Object.keys(quarterData).forEach(aptCode => aptitudes.add(aptCode));
    });

    Array.from(aptitudes).forEach(aptCode => {
      const values = quarters.map(quarter => 
        comparisonData[quarter][aptCode]?.stats.mean
      ).filter(val => val !== undefined);

      if (values.length > 1) {
        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        const change = lastValue - firstValue;
        const percentChange = (change / firstValue) * 100;

        trends[aptCode] = {
          name: Object.values(comparisonData)[0][aptCode]?.name || aptCode,
          change: parseFloat(change.toFixed(2)),
          percentChange: parseFloat(percentChange.toFixed(2)),
          direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
          significance: Math.abs(percentChange) > 5 ? 'significant' : 'minor'
        };
      }
    });

    return trends;
  },

  // Métodos para generar insights
  generateComparativeSummary(analysis) {
    const summary = {
      significantDifferences: [],
      keyFindings: [],
      recommendations: []
    };

    // Analizar diferencias por género
    if (analysis.genderComparison.significanceTests) {
      const significantGenderDiffs = Object.entries(analysis.genderComparison.significanceTests)
        .filter(([_, test]) => test.significant)
        .map(([aptCode, test]) => aptCode);

      if (significantGenderDiffs.length > 0) {
        summary.significantDifferences.push({
          type: 'gender',
          aptitudes: significantGenderDiffs,
          count: significantGenderDiffs.length
        });
      }
    }

    // Analizar ranking de aptitudes
    if (analysis.aptitudeComparison.ranking) {
      const topAptitude = analysis.aptitudeComparison.ranking[0];
      const bottomAptitude = analysis.aptitudeComparison.ranking[analysis.aptitudeComparison.ranking.length - 1];
      
      summary.keyFindings.push(`Aptitud más desarrollada: ${topAptitude.name} (${topAptitude.mean}%)`);
      summary.keyFindings.push(`Aptitud con mayor oportunidad: ${bottomAptitude.name} (${bottomAptitude.mean}%)`);
    }

    return summary;
  },

  generateGenderInsights(comparisonData, significanceTests) {
    const insights = [];
    
    if (significanceTests) {
      const significantDiffs = Object.entries(significanceTests)
        .filter(([_, test]) => test.significant);

      if (significantDiffs.length > 0) {
        insights.push({
          type: 'warning',
          message: `Se encontraron diferencias significativas por género en ${significantDiffs.length} aptitud(es)`
        });
      } else {
        insights.push({
          type: 'positive',
          message: 'No se encontraron diferencias significativas por género'
        });
      }
    }

    return insights;
  },

  generateAgeGroupInsights(comparisonData, significanceTests) {
    const insights = [];
    
    const ageGroups = Object.keys(comparisonData);
    if (ageGroups.length > 1) {
      insights.push({
        type: 'info',
        message: `Análisis realizado con ${ageGroups.length} grupos de edad diferentes`
      });
    }

    return insights;
  },

  generateEducationInsights(comparisonData) {
    const insights = [];
    
    const educationLevels = Object.keys(comparisonData);
    if (educationLevels.length > 1) {
      insights.push({
        type: 'info',
        message: `Comparación entre ${educationLevels.length} niveles educativos`
      });
    }

    return insights;
  },

  generateInstitutionInsights(comparisonData) {
    const insights = [];
    
    const institutions = Object.keys(comparisonData);
    if (institutions.length > 1) {
      insights.push({
        type: 'info',
        message: `Análisis comparativo entre ${institutions.length} instituciones`
      });
    }

    return insights;
  },

  generateAptitudeInsights(comparisonData, rankingData) {
    const insights = [];
    
    if (rankingData && rankingData.length > 0) {
      const topAptitude = rankingData[0];
      const bottomAptitude = rankingData[rankingData.length - 1];
      const range = topAptitude.mean - bottomAptitude.mean;
      
      insights.push({
        type: 'info',
        message: `Rango de rendimiento: ${range.toFixed(1)} puntos percentiles entre la aptitud más alta y más baja`
      });

      if (range > 20) {
        insights.push({
          type: 'warning',
          message: 'Existe una gran variabilidad entre aptitudes'
        });
      }
    }

    return insights;
  },

  generateTemporalInsights(comparisonData, trendAnalysis) {
    const insights = [];
    
    if (trendAnalysis) {
      const improvingAptitudes = Object.values(trendAnalysis)
        .filter(trend => trend.direction === 'up' && trend.significance === 'significant');
      
      const decliningAptitudes = Object.values(trendAnalysis)
        .filter(trend => trend.direction === 'down' && trend.significance === 'significant');

      if (improvingAptitudes.length > 0) {
        insights.push({
          type: 'positive',
          message: `${improvingAptitudes.length} aptitud(es) muestran mejora significativa en el tiempo`
        });
      }

      if (decliningAptitudes.length > 0) {
        insights.push({
          type: 'warning',
          message: `${decliningAptitudes.length} aptitud(es) muestran declive significativo en el tiempo`
        });
      }
    }

    return insights;
  },

  // Métodos de fallback
  getEmptyComparison(type) {
    return {
      type,
      data: {},
      chartData: {},
      insights: []
    };
  },

  getFallbackComparativeAnalysis(filters) {
    return {
      timestamp: new Date().toISOString(),
      filters,
      genderComparison: this.getEmptyComparison('gender'),
      ageGroupComparison: this.getEmptyComparison('age'),
      educationComparison: this.getEmptyComparison('education'),
      institutionComparison: this.getEmptyComparison('institution'),
      aptitudeComparison: this.getEmptyComparison('aptitude'),
      temporalComparison: this.getEmptyComparison('temporal'),
      summary: {
        significantDifferences: [],
        keyFindings: ['Datos insuficientes para análisis comparativo'],
        recommendations: ['Recopilar más datos para comparaciones significativas']
      },
      simulated: true
    };
  }
};

export default ComparativeAnalysisService;