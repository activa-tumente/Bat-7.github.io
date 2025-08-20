/**
 * @file StatisticalAnalysisService.js
 * @description 📊 Servicio para Análisis Estadístico
 * Medidas de tendencia central, dispersión y distribución con datos reales
 */

import supabase from '../../api/supabaseClient.js';

const StatisticalAnalysisService = {
  /**
   * Obtiene análisis estadístico completo
   */
  async getStatisticalAnalysis(filters = {}) {
    console.log('📊 [StatisticalAnalysisService] Obteniendo análisis estadístico...');
    
    try {
      const [
        descriptiveStats,
        distributionAnalysis,
        correlationAnalysis,
        comparativeStats,
        outlierAnalysis
      ] = await Promise.all([
        this.getDescriptiveStatistics(filters),
        this.getDistributionAnalysis(filters),
        this.getCorrelationAnalysis(filters),
        this.getComparativeStatistics(filters),
        this.getOutlierAnalysis(filters)
      ]);

      const analysis = {
        timestamp: new Date().toISOString(),
        filters,
        descriptiveStats,
        distributionAnalysis,
        correlationAnalysis,
        comparativeStats,
        outlierAnalysis,
        summary: this.generateStatisticalSummary({
          descriptiveStats,
          distributionAnalysis,
          correlationAnalysis,
          outlierAnalysis
        })
      };

      console.log('✅ [StatisticalAnalysisService] Análisis estadístico completado');
      return analysis;

    } catch (error) {
      console.error('❌ [StatisticalAnalysisService] Error en análisis:', error);
      return this.getFallbackStatisticalAnalysis(filters);
    }
  },

  /**
   * Calcula estadísticas descriptivas por aptitud
   */
  async getDescriptiveStatistics(filters) {
    try {
      // Obtener datos de resultados con información de aptitudes
      const { data: resultados } = await supabase
        .from('resultados')
        .select(`
          percentil,
          puntaje_directo,
          aptitud_id,
          aptitudes!inner(codigo, nombre)
        `)
        .not('percentil', 'is', null)
        .not('puntaje_directo', 'is', null);

      if (!resultados || resultados.length === 0) {
        return this.getEmptyDescriptiveStats();
      }

      // Agrupar por aptitud
      const aptitudeStats = {};
      resultados.forEach(resultado => {
        const aptitudCode = resultado.aptitudes.codigo;
        const aptitudName = resultado.aptitudes.nombre;
        
        if (!aptitudeStats[aptitudCode]) {
          aptitudeStats[aptitudCode] = {
            name: aptitudName,
            percentiles: [],
            puntajesDirectos: []
          };
        }
        
        aptitudeStats[aptitudCode].percentiles.push(resultado.percentil);
        aptitudeStats[aptitudCode].puntajesDirectos.push(resultado.puntaje_directo);
      });

      // Calcular estadísticas para cada aptitud
      const statsResults = {};
      Object.keys(aptitudeStats).forEach(aptitudCode => {
        const data = aptitudeStats[aptitudCode];
        
        statsResults[aptitudCode] = {
          name: data.name,
          percentiles: this.calculateDescriptiveStats(data.percentiles),
          puntajesDirectos: this.calculateDescriptiveStats(data.puntajesDirectos),
          sampleSize: data.percentiles.length
        };
      });

      // Calcular estadísticas generales
      const allPercentiles = resultados.map(r => r.percentil);
      const allPuntajesDirectos = resultados.map(r => r.puntaje_directo);
      
      const generalStats = {
        percentiles: this.calculateDescriptiveStats(allPercentiles),
        puntajesDirectos: this.calculateDescriptiveStats(allPuntajesDirectos),
        totalSamples: resultados.length
      };

      return {
        byAptitude: statsResults,
        general: generalStats,
        insights: this.generateDescriptiveInsights(statsResults, generalStats)
      };

    } catch (error) {
      console.error('Error en estadísticas descriptivas:', error);
      return this.getEmptyDescriptiveStats();
    }
  },

  /**
   * Calcula estadísticas descriptivas para un conjunto de datos
   */
  calculateDescriptiveStats(values) {
    if (!values || values.length === 0) {
      return this.getEmptyStats();
    }

    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    
    // Medidas de tendencia central
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const median = n % 2 === 0 ? 
      (sorted[n/2 - 1] + sorted[n/2]) / 2 : 
      sorted[Math.floor(n/2)];
    
    // Moda (valor más frecuente)
    const frequency = {};
    values.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(frequency));
    const modes = Object.keys(frequency).filter(key => frequency[key] === maxFreq);
    const mode = modes.length === n ? null : parseFloat(modes[0]); // Si todos son únicos, no hay moda

    // Medidas de dispersión
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const standardDeviation = Math.sqrt(variance);
    const range = sorted[n-1] - sorted[0];
    
    // Percentiles
    const q1 = this.calculatePercentile(sorted, 25);
    const q3 = this.calculatePercentile(sorted, 75);
    const iqr = q3 - q1;
    
    // Medidas de forma
    const skewness = this.calculateSkewness(values, mean, standardDeviation);
    const kurtosis = this.calculateKurtosis(values, mean, standardDeviation);

    return {
      // Tendencia central
      mean: parseFloat(mean.toFixed(2)),
      median: parseFloat(median.toFixed(2)),
      mode: mode ? parseFloat(mode.toFixed(2)) : null,
      
      // Dispersión
      variance: parseFloat(variance.toFixed(2)),
      standardDeviation: parseFloat(standardDeviation.toFixed(2)),
      range: parseFloat(range.toFixed(2)),
      
      // Percentiles
      min: sorted[0],
      max: sorted[n-1],
      q1: parseFloat(q1.toFixed(2)),
      q3: parseFloat(q3.toFixed(2)),
      iqr: parseFloat(iqr.toFixed(2)),
      
      // Forma
      skewness: parseFloat(skewness.toFixed(3)),
      kurtosis: parseFloat(kurtosis.toFixed(3)),
      
      // Información adicional
      count: n,
      coefficientOfVariation: parseFloat((standardDeviation / mean * 100).toFixed(2))
    };
  },

  /**
   * Calcula un percentil específico
   */
  calculatePercentile(sortedValues, percentile) {
    const index = (percentile / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (upper >= sortedValues.length) return sortedValues[sortedValues.length - 1];
    if (lower < 0) return sortedValues[0];
    
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  },

  /**
   * Calcula la asimetría (skewness)
   */
  calculateSkewness(values, mean, stdDev) {
    if (stdDev === 0) return 0;
    
    const n = values.length;
    const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 3), 0);
    return (n / ((n - 1) * (n - 2))) * sum;
  },

  /**
   * Calcula la curtosis
   */
  calculateKurtosis(values, mean, stdDev) {
    if (stdDev === 0) return 0;
    
    const n = values.length;
    const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 4), 0);
    const kurtosis = (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * sum;
    const correction = 3 * Math.pow(n - 1, 2) / ((n - 2) * (n - 3));
    return kurtosis - correction; // Exceso de curtosis
  },

  /**
   * Análisis de distribución de datos
   */
  async getDistributionAnalysis(filters) {
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
        return this.getEmptyDistributionAnalysis();
      }

      // Análisis de distribución por aptitud
      const distributionByAptitude = {};
      const aptitudes = [...new Set(resultados.map(r => r.aptitudes.codigo))];
      
      aptitudes.forEach(aptitudCode => {
        const aptitudData = resultados.filter(r => r.aptitudes.codigo === aptitudCode);
        const percentiles = aptitudData.map(r => r.percentil);
        
        distributionByAptitude[aptitudCode] = {
          name: aptitudData[0].aptitudes.nombre,
          histogram: this.createHistogram(percentiles, 10),
          normalityTest: this.testNormality(percentiles),
          distributionType: this.identifyDistribution(percentiles)
        };
      });

      // Análisis de distribución general
      const allPercentiles = resultados.map(r => r.percentil);
      const generalDistribution = {
        histogram: this.createHistogram(allPercentiles, 15),
        normalityTest: this.testNormality(allPercentiles),
        distributionType: this.identifyDistribution(allPercentiles)
      };

      return {
        byAptitude: distributionByAptitude,
        general: generalDistribution,
        insights: this.generateDistributionInsights(distributionByAptitude, generalDistribution)
      };

    } catch (error) {
      console.error('Error en análisis de distribución:', error);
      return this.getEmptyDistributionAnalysis();
    }
  },

  /**
   * Crea un histograma de los datos
   */
  createHistogram(values, bins = 10) {
    if (!values || values.length === 0) return { bins: [], frequencies: [] };
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / bins;
    
    const histogram = Array(bins).fill(0).map((_, i) => ({
      min: min + i * binWidth,
      max: min + (i + 1) * binWidth,
      count: 0,
      frequency: 0
    }));

    values.forEach(value => {
      let binIndex = Math.floor((value - min) / binWidth);
      if (binIndex >= bins) binIndex = bins - 1; // Manejar el valor máximo
      histogram[binIndex].count++;
    });

    // Calcular frecuencias relativas
    histogram.forEach(bin => {
      bin.frequency = parseFloat((bin.count / values.length).toFixed(4));
    });

    return {
      bins: histogram.map(bin => `${bin.min.toFixed(1)}-${bin.max.toFixed(1)}`),
      counts: histogram.map(bin => bin.count),
      frequencies: histogram.map(bin => bin.frequency),
      binWidth: parseFloat(binWidth.toFixed(2))
    };
  },

  /**
   * Test de normalidad (Shapiro-Wilk simplificado)
   */
  testNormality(values) {
    if (!values || values.length < 3) {
      return { isNormal: false, pValue: null, test: 'insufficient_data' };
    }

    // Para muestras grandes, usar test de asimetría y curtosis
    const stats = this.calculateDescriptiveStats(values);
    const n = values.length;
    
    // Test de asimetría
    const skewnessZ = stats.skewness / Math.sqrt(6 / n);
    const kurtosisZ = stats.kurtosis / Math.sqrt(24 / n);
    
    // Criterio simple: si |Z| < 1.96, se considera normal (α = 0.05)
    const skewnessNormal = Math.abs(skewnessZ) < 1.96;
    const kurtosisNormal = Math.abs(kurtosisZ) < 1.96;
    const isNormal = skewnessNormal && kurtosisNormal;
    
    return {
      isNormal,
      skewnessZ: parseFloat(skewnessZ.toFixed(3)),
      kurtosisZ: parseFloat(kurtosisZ.toFixed(3)),
      test: 'skewness_kurtosis',
      interpretation: isNormal ? 'Los datos siguen una distribución aproximadamente normal' :
                                'Los datos no siguen una distribución normal'
    };
  },

  /**
   * Identifica el tipo de distribución
   */
  identifyDistribution(values) {
    const stats = this.calculateDescriptiveStats(values);
    
    // Criterios simples para identificar distribución
    let type = 'unknown';
    let characteristics = [];
    
    if (Math.abs(stats.skewness) < 0.5 && Math.abs(stats.kurtosis) < 0.5) {
      type = 'normal';
      characteristics.push('Distribución aproximadamente normal');
    } else if (stats.skewness > 1) {
      type = 'right_skewed';
      characteristics.push('Distribución sesgada hacia la derecha');
    } else if (stats.skewness < -1) {
      type = 'left_skewed';
      characteristics.push('Distribución sesgada hacia la izquierda');
    }
    
    if (stats.kurtosis > 1) {
      characteristics.push('Distribución leptocúrtica (más puntiaguda)');
    } else if (stats.kurtosis < -1) {
      characteristics.push('Distribución platicúrtica (más plana)');
    }
    
    if (stats.coefficientOfVariation < 15) {
      characteristics.push('Baja variabilidad');
    } else if (stats.coefficientOfVariation > 30) {
      characteristics.push('Alta variabilidad');
    }

    return {
      type,
      characteristics,
      skewness: stats.skewness,
      kurtosis: stats.kurtosis,
      variability: stats.coefficientOfVariation
    };
  },

  /**
   * Análisis de correlación entre aptitudes
   */
  async getCorrelationAnalysis(filters) {
    try {
      // Obtener datos pivoteados por aptitud
      const { data: resultados } = await supabase
        .from('resultados')
        .select(`
          evaluacion_id,
          percentil,
          aptitudes!inner(codigo, nombre)
        `)
        .not('percentil', 'is', null);

      if (!resultados || resultados.length === 0) {
        return this.getEmptyCorrelationAnalysis();
      }

      // Crear matriz de datos por evaluación
      const evaluacionData = {};
      resultados.forEach(resultado => {
        const evalId = resultado.evaluacion_id;
        const aptitudCode = resultado.aptitudes.codigo;
        
        if (!evaluacionData[evalId]) {
          evaluacionData[evalId] = {};
        }
        evaluacionData[evalId][aptitudCode] = resultado.percentil;
      });

      // Filtrar evaluaciones completas (con todas las aptitudes)
      const aptitudes = [...new Set(resultados.map(r => r.aptitudes.codigo))];
      const completeEvaluations = Object.entries(evaluacionData)
        .filter(([_, data]) => aptitudes.every(apt => data[apt] !== undefined))
        .map(([evalId, data]) => data);

      if (completeEvaluations.length < 3) {
        return this.getEmptyCorrelationAnalysis();
      }

      // Calcular matriz de correlación
      const correlationMatrix = {};
      aptitudes.forEach(apt1 => {
        correlationMatrix[apt1] = {};
        aptitudes.forEach(apt2 => {
          const values1 = completeEvaluations.map(eval => eval[apt1]);
          const values2 = completeEvaluations.map(eval => eval[apt2]);
          correlationMatrix[apt1][apt2] = this.calculateCorrelation(values1, values2);
        });
      });

      // Encontrar correlaciones más altas y más bajas
      const correlations = [];
      for (let i = 0; i < aptitudes.length; i++) {
        for (let j = i + 1; j < aptitudes.length; j++) {
          const apt1 = aptitudes[i];
          const apt2 = aptitudes[j];
          correlations.push({
            aptitude1: apt1,
            aptitude2: apt2,
            correlation: correlationMatrix[apt1][apt2],
            strength: this.interpretCorrelationStrength(correlationMatrix[apt1][apt2])
          });
        }
      }

      correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

      return {
        matrix: correlationMatrix,
        correlations: correlations,
        sampleSize: completeEvaluations.length,
        insights: this.generateCorrelationInsights(correlations)
      };

    } catch (error) {
      console.error('Error en análisis de correlación:', error);
      return this.getEmptyCorrelationAnalysis();
    }
  },

  /**
   * Calcula el coeficiente de correlación de Pearson
   */
  calculateCorrelation(x, y) {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    if (denominator === 0) return 0;
    
    return parseFloat((numerator / denominator).toFixed(3));
  },

  /**
   * Interpreta la fuerza de la correlación
   */
  interpretCorrelationStrength(correlation) {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return 'muy_fuerte';
    if (abs >= 0.6) return 'fuerte';
    if (abs >= 0.4) return 'moderada';
    if (abs >= 0.2) return 'debil';
    return 'muy_debil';
  },

  /**
   * Análisis estadístico comparativo por grupos
   */
  async getComparativeStatistics(filters) {
    try {
      // Obtener datos con información demográfica
      const { data: resultados } = await supabase
        .from('resultados')
        .select(`
          percentil,
          puntaje_directo,
          evaluaciones!inner(
            paciente_id,
            pacientes!inner(
              genero,
              fecha_nacimiento,
              nivel_educativo
            )
          ),
          aptitudes!inner(codigo, nombre)
        `)
        .not('percentil', 'is', null);

      if (!resultados || resultados.length === 0) {
        return this.getEmptyComparativeStats();
      }

      // Análisis por género
      const byGender = this.groupAndAnalyze(resultados, 
        r => r.evaluaciones.pacientes.genero, 'genero');

      // Análisis por grupo de edad
      const byAgeGroup = this.groupAndAnalyze(resultados, 
        r => this.getAgeGroup(r.evaluaciones.pacientes.fecha_nacimiento), 'edad');

      // Análisis por nivel educativo
      const byEducationLevel = this.groupAndAnalyze(resultados, 
        r => r.evaluaciones.pacientes.nivel_educativo || 'No especificado', 'educacion');

      return {
        byGender,
        byAgeGroup,
        byEducationLevel,
        insights: this.generateComparativeInsights({ byGender, byAgeGroup, byEducationLevel })
      };

    } catch (error) {
      console.error('Error en estadísticas comparativas:', error);
      return this.getEmptyComparativeStats();
    }
  },

  /**
   * Agrupa y analiza datos por una función de agrupación
   */
  groupAndAnalyze(data, groupFunction, groupType) {
    const groups = {};
    
    data.forEach(item => {
      const groupKey = groupFunction(item);
      if (!groupKey) return;
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item.percentil);
    });

    const analysis = {};
    Object.keys(groups).forEach(groupKey => {
      if (groups[groupKey].length > 0) {
        analysis[groupKey] = {
          stats: this.calculateDescriptiveStats(groups[groupKey]),
          sampleSize: groups[groupKey].length
        };
      }
    });

    // Realizar test de diferencias si hay múltiples grupos
    const groupKeys = Object.keys(analysis);
    let significanceTest = null;
    
    if (groupKeys.length === 2) {
      // Test t para dos grupos
      const group1 = groups[groupKeys[0]];
      const group2 = groups[groupKeys[1]];
      significanceTest = this.performTTest(group1, group2);
    } else if (groupKeys.length > 2) {
      // ANOVA simplificado para múltiples grupos
      significanceTest = this.performSimpleANOVA(Object.values(groups));
    }

    return {
      groups: analysis,
      significanceTest,
      groupType
    };
  },

  /**
   * Obtiene el grupo de edad
   */
  getAgeGroup(fechaNacimiento) {
    if (!fechaNacimiento) return 'No especificado';
    
    const age = new Date().getFullYear() - new Date(fechaNacimiento).getFullYear();
    
    if (age < 13) return '< 13 años';
    if (age < 16) return '13-15 años';
    if (age < 19) return '16-18 años';
    if (age < 25) return '19-24 años';
    return '25+ años';
  },

  /**
   * Test t simplificado para dos muestras
   */
  performTTest(group1, group2) {
    if (!group1 || !group2 || group1.length < 2 || group2.length < 2) {
      return { test: 't_test', significant: false, reason: 'insufficient_data' };
    }

    const stats1 = this.calculateDescriptiveStats(group1);
    const stats2 = this.calculateDescriptiveStats(group2);
    
    const n1 = group1.length;
    const n2 = group2.length;
    
    // Calcular error estándar
    const pooledVariance = ((n1 - 1) * stats1.variance + (n2 - 1) * stats2.variance) / (n1 + n2 - 2);
    const standardError = Math.sqrt(pooledVariance * (1/n1 + 1/n2));
    
    // Calcular t-statistic
    const tStat = (stats1.mean - stats2.mean) / standardError;
    const degreesOfFreedom = n1 + n2 - 2;
    
    // Criterio simple: |t| > 2 se considera significativo (aproximadamente p < 0.05)
    const significant = Math.abs(tStat) > 2;
    
    return {
      test: 't_test',
      tStatistic: parseFloat(tStat.toFixed(3)),
      degreesOfFreedom,
      significant,
      meanDifference: parseFloat((stats1.mean - stats2.mean).toFixed(2)),
      interpretation: significant ? 
        'Existe una diferencia estadísticamente significativa entre los grupos' :
        'No existe una diferencia estadísticamente significativa entre los grupos'
    };
  },

  /**
   * ANOVA simplificado
   */
  performSimpleANOVA(groups) {
    const validGroups = groups.filter(g => g && g.length > 0);
    if (validGroups.length < 2) {
      return { test: 'anova', significant: false, reason: 'insufficient_groups' };
    }

    // Calcular medias de grupo y media general
    const groupMeans = validGroups.map(group => 
      group.reduce((sum, val) => sum + val, 0) / group.length
    );
    
    const allValues = validGroups.flat();
    const grandMean = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
    
    // Calcular suma de cuadrados
    const ssBetween = validGroups.reduce((sum, group, i) => 
      sum + group.length * Math.pow(groupMeans[i] - grandMean, 2), 0
    );
    
    const ssWithin = validGroups.reduce((sum, group, i) => 
      sum + group.reduce((groupSum, val) => groupSum + Math.pow(val - groupMeans[i], 2), 0), 0
    );
    
    const dfBetween = validGroups.length - 1;
    const dfWithin = allValues.length - validGroups.length;
    
    const msBetween = ssBetween / dfBetween;
    const msWithin = ssWithin / dfWithin;
    
    const fStat = msBetween / msWithin;
    
    // Criterio simple: F > 3 se considera significativo (aproximadamente)
    const significant = fStat > 3;
    
    return {
      test: 'anova',
      fStatistic: parseFloat(fStat.toFixed(3)),
      dfBetween,
      dfWithin,
      significant,
      interpretation: significant ? 
        'Existen diferencias estadísticamente significativas entre los grupos' :
        'No existen diferencias estadísticamente significativas entre los grupos'
    };
  },

  /**
   * Análisis de valores atípicos (outliers)
   */
  async getOutlierAnalysis(filters) {
    try {
      const { data: resultados } = await supabase
        .from('resultados')
        .select(`
          percentil,
          puntaje_directo,
          aptitudes!inner(codigo, nombre),
          evaluaciones!inner(
            pacientes!inner(nombre, apellido)
          )
        `)
        .not('percentil', 'is', null);

      if (!resultados || resultados.length === 0) {
        return this.getEmptyOutlierAnalysis();
      }

      // Análisis de outliers por aptitud
      const outliersByAptitude = {};
      const aptitudes = [...new Set(resultados.map(r => r.aptitudes.codigo))];
      
      aptitudes.forEach(aptitudCode => {
        const aptitudData = resultados.filter(r => r.aptitudes.codigo === aptitudCode);
        const percentiles = aptitudData.map(r => r.percentil);
        
        const outliers = this.detectOutliers(percentiles);
        const outlierDetails = outliers.indices.map(index => ({
          value: percentiles[index],
          percentil: percentiles[index],
          paciente: `${aptitudData[index].evaluaciones.pacientes.nombre} ${aptitudData[index].evaluaciones.pacientes.apellido}`,
          type: percentiles[index] > outliers.upperFence ? 'alto' : 'bajo'
        }));

        outliersByAptitude[aptitudCode] = {
          name: aptitudData[0].aptitudes.nombre,
          outliers: outlierDetails,
          statistics: outliers.statistics,
          totalOutliers: outlierDetails.length,
          outlierRate: parseFloat((outlierDetails.length / aptitudData.length * 100).toFixed(2))
        };
      });

      // Análisis general de outliers
      const allPercentiles = resultados.map(r => r.percentil);
      const generalOutliers = this.detectOutliers(allPercentiles);
      
      return {
        byAptitude: outliersByAptitude,
        general: {
          outliers: generalOutliers,
          totalOutliers: generalOutliers.indices.length,
          outlierRate: parseFloat((generalOutliers.indices.length / resultados.length * 100).toFixed(2))
        },
        insights: this.generateOutlierInsights(outliersByAptitude, generalOutliers)
      };

    } catch (error) {
      console.error('Error en análisis de outliers:', error);
      return this.getEmptyOutlierAnalysis();
    }
  },

  /**
   * Detecta outliers usando el método IQR
   */
  detectOutliers(values) {
    if (!values || values.length < 4) {
      return { indices: [], statistics: null, lowerFence: null, upperFence: null };
    }

    const stats = this.calculateDescriptiveStats(values);
    const iqr = stats.iqr;
    const lowerFence = stats.q1 - 1.5 * iqr;
    const upperFence = stats.q3 + 1.5 * iqr;
    
    const outlierIndices = [];
    values.forEach((value, index) => {
      if (value < lowerFence || value > upperFence) {
        outlierIndices.push(index);
      }
    });

    return {
      indices: outlierIndices,
      statistics: stats,
      lowerFence: parseFloat(lowerFence.toFixed(2)),
      upperFence: parseFloat(upperFence.toFixed(2)),
      method: 'IQR'
    };
  },

  // Métodos para generar insights
  generateStatisticalSummary(analysis) {
    const summary = {
      dataQuality: 'good',
      keyFindings: [],
      recommendations: [],
      alerts: []
    };

    // Evaluar calidad de datos
    if (analysis.descriptiveStats.general.totalSamples < 30) {
      summary.dataQuality = 'limited';
      summary.alerts.push('Muestra pequeña: los resultados deben interpretarse con cautela');
    }

    // Analizar distribución
    if (analysis.distributionAnalysis.general.normalityTest.isNormal) {
      summary.keyFindings.push('Los datos siguen una distribución aproximadamente normal');
    } else {
      summary.keyFindings.push('Los datos no siguen una distribución normal');
      summary.recommendations.push('Considerar usar estadísticas no paramétricas');
    }

    // Analizar variabilidad
    const cv = analysis.descriptiveStats.general.percentiles.coefficientOfVariation;
    if (cv > 30) {
      summary.keyFindings.push('Alta variabilidad en los resultados');
      summary.recommendations.push('Investigar factores que contribuyen a la variabilidad');
    }

    return summary;
  },

  generateDescriptiveInsights(statsResults, generalStats) {
    const insights = [];
    
    // Insight sobre la aptitud con mayor variabilidad
    const aptitudeVariability = Object.entries(statsResults)
      .map(([code, stats]) => ({
        code,
        name: stats.name,
        cv: stats.percentiles.coefficientOfVariation
      }))
      .sort((a, b) => b.cv - a.cv);

    if (aptitudeVariability.length > 0) {
      const mostVariable = aptitudeVariability[0];
      insights.push({
        type: 'warning',
        message: `${mostVariable.name} presenta la mayor variabilidad (CV: ${mostVariable.cv}%)`
      });
    }

    // Insight sobre consistencia
    const avgCV = aptitudeVariability.reduce((sum, apt) => sum + apt.cv, 0) / aptitudeVariability.length;
    if (avgCV < 20) {
      insights.push({
        type: 'positive',
        message: 'Los resultados muestran consistencia general entre aptitudes'
      });
    }

    return insights;
  },

  generateDistributionInsights(distributionByAptitude, generalDistribution) {
    const insights = [];
    
    if (generalDistribution.normalityTest.isNormal) {
      insights.push({
        type: 'info',
        message: 'La distribución general de percentiles es aproximadamente normal'
      });
    } else {
      insights.push({
        type: 'warning',
        message: 'La distribución general se desvía de la normalidad'
      });
    }

    return insights;
  },

  generateCorrelationInsights(correlations) {
    const insights = [];
    
    const strongCorrelations = correlations.filter(c => 
      c.strength === 'fuerte' || c.strength === 'muy_fuerte'
    );

    if (strongCorrelations.length > 0) {
      const strongest = strongCorrelations[0];
      insights.push({
        type: 'info',
        message: `Correlación más fuerte: ${strongest.aptitude1} - ${strongest.aptitude2} (r = ${strongest.correlation})`
      });
    }

    const weakCorrelations = correlations.filter(c => c.strength === 'muy_debil');
    if (weakCorrelations.length > correlations.length / 2) {
      insights.push({
        type: 'info',
        message: 'Las aptitudes muestran independencia relativa entre sí'
      });
    }

    return insights;
  },

  generateComparativeInsights(comparativeStats) {
    const insights = [];
    
    // Analizar diferencias por género
    if (comparativeStats.byGender.significanceTest?.significant) {
      insights.push({
        type: 'warning',
        message: 'Se encontraron diferencias significativas entre géneros'
      });
    }

    return insights;
  },

  generateOutlierInsights(outliersByAptitude, generalOutliers) {
    const insights = [];
    
    const totalOutliers = Object.values(outliersByAptitude)
      .reduce((sum, apt) => sum + apt.totalOutliers, 0);

    if (totalOutliers > 0) {
      insights.push({
        type: 'warning',
        message: `Se detectaron ${totalOutliers} valores atípicos en total`
      });
    }

    // Identificar aptitud con más outliers
    const aptitudeOutliers = Object.entries(outliersByAptitude)
      .sort((a, b) => b[1].totalOutliers - a[1].totalOutliers);

    if (aptitudeOutliers.length > 0 && aptitudeOutliers[0][1].totalOutliers > 0) {
      insights.push({
        type: 'info',
        message: `${aptitudeOutliers[0][1].name} presenta el mayor número de valores atípicos (${aptitudeOutliers[0][1].totalOutliers})`
      });
    }

    return insights;
  },

  // Métodos de fallback
  getEmptyStats() {
    return {
      mean: 0, median: 0, mode: null,
      variance: 0, standardDeviation: 0, range: 0,
      min: 0, max: 0, q1: 0, q3: 0, iqr: 0,
      skewness: 0, kurtosis: 0, count: 0,
      coefficientOfVariation: 0
    };
  },

  getEmptyDescriptiveStats() {
    return {
      byAptitude: {},
      general: { percentiles: this.getEmptyStats(), puntajesDirectos: this.getEmptyStats(), totalSamples: 0 },
      insights: []
    };
  },

  getEmptyDistributionAnalysis() {
    return {
      byAptitude: {},
      general: { histogram: { bins: [], counts: [], frequencies: [] }, normalityTest: { isNormal: false }, distributionType: { type: 'unknown' } },
      insights: []
    };
  },

  getEmptyCorrelationAnalysis() {
    return {
      matrix: {},
      correlations: [],
      sampleSize: 0,
      insights: []
    };
  },

  getEmptyComparativeStats() {
    return {
      byGender: { groups: {}, significanceTest: null },
      byAgeGroup: { groups: {}, significanceTest: null },
      byEducationLevel: { groups: {}, significanceTest: null },
      insights: []
    };
  },

  getEmptyOutlierAnalysis() {
    return {
      byAptitude: {},
      general: { outliers: { indices: [] }, totalOutliers: 0, outlierRate: 0 },
      insights: []
    };
  },

  getFallbackStatisticalAnalysis(filters) {
    return {
      timestamp: new Date().toISOString(),
      filters,
      descriptiveStats: this.getEmptyDescriptiveStats(),
      distributionAnalysis: this.getEmptyDistributionAnalysis(),
      correlationAnalysis: this.getEmptyCorrelationAnalysis(),
      comparativeStats: this.getEmptyComparativeStats(),
      outlierAnalysis: this.getEmptyOutlierAnalysis(),
      summary: {
        dataQuality: 'insufficient',
        keyFindings: ['Datos insuficientes para análisis estadístico'],
        recommendations: ['Recopilar más datos para análisis significativo'],
        alerts: ['Sin datos disponibles']
      },
      simulated: true
    };
  }
};

export default StatisticalAnalysisService;