/**
 * Servicio de Cálculos Estadísticos
 * Proporciona funciones estadísticas avanzadas para análisis de datos
 */

import { SIGNIFICANCE_LEVELS, EFFECT_SIZE_INTERPRETATION } from '../../utils/analytics/constants.js';

/**
 * Servicio especializado en cálculos estadísticos
 */
class StatisticalService {

  /**
   * Calcular estadísticas descriptivas básicas
   */
  static calculateDescriptiveStats(data) {
    if (!data || data.length === 0) {
      return {
        count: 0,
        mean: 0,
        median: 0,
        mode: null,
        standardDeviation: 0,
        variance: 0,
        min: 0,
        max: 0,
        range: 0,
        quartiles: { q1: 0, q2: 0, q3: 0 },
        percentiles: {},
        skewness: 0,
        kurtosis: 0
      };
    }

    const sortedData = [...data].sort((a, b) => a - b);
    const n = data.length;
    
    // Medidas de tendencia central
    const mean = data.reduce((sum, val) => sum + val, 0) / n;
    const median = this.calculateMedian(sortedData);
    const mode = this.calculateMode(data);

    // Medidas de dispersión
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const standardDeviation = Math.sqrt(variance);
    const min = sortedData[0];
    const max = sortedData[n - 1];
    const range = max - min;

    // Cuartiles
    const quartiles = this.calculateQuartiles(sortedData);

    // Percentiles comunes
    const percentiles = {
      p5: this.calculatePercentile(sortedData, 5),
      p10: this.calculatePercentile(sortedData, 10),
      p25: this.calculatePercentile(sortedData, 25),
      p50: this.calculatePercentile(sortedData, 50),
      p75: this.calculatePercentile(sortedData, 75),
      p90: this.calculatePercentile(sortedData, 90),
      p95: this.calculatePercentile(sortedData, 95)
    };

    // Medidas de forma
    const skewness = this.calculateSkewness(data, mean, standardDeviation);
    const kurtosis = this.calculateKurtosis(data, mean, standardDeviation);

    return {
      count: n,
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      mode,
      standardDeviation: Math.round(standardDeviation * 100) / 100,
      variance: Math.round(variance * 100) / 100,
      min,
      max,
      range,
      quartiles,
      percentiles,
      skewness: Math.round(skewness * 100) / 100,
      kurtosis: Math.round(kurtosis * 100) / 100
    };
  }

  /**
   * Calcular mediana
   */
  static calculateMedian(sortedData) {
    const n = sortedData.length;
    if (n === 0) return 0;
    
    if (n % 2 === 0) {
      return (sortedData[n / 2 - 1] + sortedData[n / 2]) / 2;
    } else {
      return sortedData[Math.floor(n / 2)];
    }
  }

  /**
   * Calcular moda
   */
  static calculateMode(data) {
    const frequency = {};
    let maxFreq = 0;
    let modes = [];

    data.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
      if (frequency[val] > maxFreq) {
        maxFreq = frequency[val];
        modes = [val];
      } else if (frequency[val] === maxFreq && !modes.includes(val)) {
        modes.push(val);
      }
    });

    return maxFreq > 1 ? modes : null;
  }

  /**
   * Calcular cuartiles
   */
  static calculateQuartiles(sortedData) {
    return {
      q1: this.calculatePercentile(sortedData, 25),
      q2: this.calculatePercentile(sortedData, 50),
      q3: this.calculatePercentile(sortedData, 75)
    };
  }

  /**
   * Calcular percentil específico
   */
  static calculatePercentile(sortedData, percentile) {
    if (sortedData.length === 0) return 0;
    
    const index = (percentile / 100) * (sortedData.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sortedData[lower];
    }
    
    const weight = index - lower;
    return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
  }

  /**
   * Calcular asimetría (skewness)
   */
  static calculateSkewness(data, mean, standardDeviation) {
    if (standardDeviation === 0) return 0;
    
    const n = data.length;
    const skewness = data.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / standardDeviation, 3);
    }, 0) / n;
    
    return skewness;
  }

  /**
   * Calcular curtosis (kurtosis)
   */
  static calculateKurtosis(data, mean, standardDeviation) {
    if (standardDeviation === 0) return 0;
    
    const n = data.length;
    const kurtosis = data.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / standardDeviation, 4);
    }, 0) / n;
    
    return kurtosis - 3; // Exceso de curtosis
  }

  /**
   * Realizar prueba t de Student para una muestra
   */
  static tTestOneSample(data, populationMean = 0) {
    if (!data || data.length < 2) {
      return {
        tStatistic: 0,
        degreesOfFreedom: 0,
        pValue: 1,
        isSignificant: false,
        confidenceInterval: { lower: 0, upper: 0 }
      };
    }

    const n = data.length;
    const sampleMean = data.reduce((sum, val) => sum + val, 0) / n;
    const sampleStd = Math.sqrt(
      data.reduce((sum, val) => sum + Math.pow(val - sampleMean, 2), 0) / (n - 1)
    );
    
    const standardError = sampleStd / Math.sqrt(n);
    const tStatistic = (sampleMean - populationMean) / standardError;
    const degreesOfFreedom = n - 1;
    
    // Aproximación del p-value (simplificada)
    const pValue = this.approximateTTestPValue(Math.abs(tStatistic), degreesOfFreedom);
    
    // Intervalo de confianza del 95%
    const tCritical = this.getTCriticalValue(degreesOfFreedom, 0.05);
    const marginOfError = tCritical * standardError;
    const confidenceInterval = {
      lower: Math.round((sampleMean - marginOfError) * 100) / 100,
      upper: Math.round((sampleMean + marginOfError) * 100) / 100
    };

    return {
      tStatistic: Math.round(tStatistic * 1000) / 1000,
      degreesOfFreedom,
      pValue: Math.round(pValue * 1000) / 1000,
      isSignificant: pValue < 0.05,
      significanceLevel: this.getSignificanceLevel(pValue),
      confidenceInterval,
      sampleMean: Math.round(sampleMean * 100) / 100,
      standardError: Math.round(standardError * 100) / 100
    };
  }

  /**
   * Realizar prueba t de Student para dos muestras independientes
   */
  static tTestTwoSamples(data1, data2) {
    if (!data1 || !data2 || data1.length < 2 || data2.length < 2) {
      return {
        tStatistic: 0,
        degreesOfFreedom: 0,
        pValue: 1,
        isSignificant: false,
        effectSize: 0,
        effectSizeInterpretation: 'none'
      };
    }

    const n1 = data1.length;
    const n2 = data2.length;
    
    const mean1 = data1.reduce((sum, val) => sum + val, 0) / n1;
    const mean2 = data2.reduce((sum, val) => sum + val, 0) / n2;
    
    const var1 = data1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (n1 - 1);
    const var2 = data2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (n2 - 1);
    
    // Prueba t de Welch (varianzas desiguales)
    const standardError = Math.sqrt(var1 / n1 + var2 / n2);
    const tStatistic = (mean1 - mean2) / standardError;
    
    // Grados de libertad de Welch-Satterthwaite
    const degreesOfFreedom = Math.floor(
      Math.pow(var1 / n1 + var2 / n2, 2) /
      (Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1))
    );
    
    const pValue = this.approximateTTestPValue(Math.abs(tStatistic), degreesOfFreedom);
    
    // Tamaño del efecto (Cohen's d)
    const pooledStd = Math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2));
    const effectSize = Math.abs(mean1 - mean2) / pooledStd;
    const effectSizeInterpretation = this.interpretEffectSize(effectSize);

    return {
      tStatistic: Math.round(tStatistic * 1000) / 1000,
      degreesOfFreedom,
      pValue: Math.round(pValue * 1000) / 1000,
      isSignificant: pValue < 0.05,
      significanceLevel: this.getSignificanceLevel(pValue),
      effectSize: Math.round(effectSize * 1000) / 1000,
      effectSizeInterpretation,
      group1: {
        mean: Math.round(mean1 * 100) / 100,
        standardDeviation: Math.round(Math.sqrt(var1) * 100) / 100,
        sampleSize: n1
      },
      group2: {
        mean: Math.round(mean2 * 100) / 100,
        standardDeviation: Math.round(Math.sqrt(var2) * 100) / 100,
        sampleSize: n2
      }
    };
  }

  /**
   * Calcular correlación de Pearson
   */
  static calculatePearsonCorrelation(x, y) {
    if (!x || !y || x.length !== y.length || x.length < 2) {
      return {
        correlation: 0,
        pValue: 1,
        isSignificant: false,
        strength: 'none'
      };
    }

    const n = x.length;
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;
    
    for (let i = 0; i < n; i++) {
      const deltaX = x[i] - meanX;
      const deltaY = y[i] - meanY;
      
      numerator += deltaX * deltaY;
      sumXSquared += deltaX * deltaX;
      sumYSquared += deltaY * deltaY;
    }
    
    const denominator = Math.sqrt(sumXSquared * sumYSquared);
    const correlation = denominator === 0 ? 0 : numerator / denominator;
    
    // Prueba de significancia
    const tStatistic = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
    const pValue = this.approximateTTestPValue(Math.abs(tStatistic), n - 2);
    
    return {
      correlation: Math.round(correlation * 1000) / 1000,
      pValue: Math.round(pValue * 1000) / 1000,
      isSignificant: pValue < 0.05,
      significanceLevel: this.getSignificanceLevel(pValue),
      strength: this.interpretCorrelationStrength(Math.abs(correlation)),
      sampleSize: n
    };
  }

  /**
   * Realizar análisis de regresión lineal simple
   */
  static simpleLinearRegression(x, y) {
    if (!x || !y || x.length !== y.length || x.length < 2) {
      return {
        slope: 0,
        intercept: 0,
        rSquared: 0,
        correlation: 0,
        standardError: 0,
        predictions: []
      };
    }

    const n = x.length;
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      const deltaX = x[i] - meanX;
      const deltaY = y[i] - meanY;
      
      numerator += deltaX * deltaY;
      denominator += deltaX * deltaX;
    }
    
    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    // Calcular R²
    let totalSumSquares = 0;
    let residualSumSquares = 0;
    
    for (let i = 0; i < n; i++) {
      const predicted = slope * x[i] + intercept;
      totalSumSquares += Math.pow(y[i] - meanY, 2);
      residualSumSquares += Math.pow(y[i] - predicted, 2);
    }
    
    const rSquared = totalSumSquares === 0 ? 0 : 1 - (residualSumSquares / totalSumSquares);
    const correlation = Math.sqrt(rSquared) * (slope >= 0 ? 1 : -1);
    
    // Error estándar
    const standardError = Math.sqrt(residualSumSquares / (n - 2));
    
    // Generar predicciones
    const predictions = x.map(xVal => ({
      x: xVal,
      predicted: slope * xVal + intercept
    }));

    return {
      slope: Math.round(slope * 1000) / 1000,
      intercept: Math.round(intercept * 1000) / 1000,
      rSquared: Math.round(rSquared * 1000) / 1000,
      correlation: Math.round(correlation * 1000) / 1000,
      standardError: Math.round(standardError * 1000) / 1000,
      predictions,
      equation: `y = ${Math.round(slope * 1000) / 1000}x + ${Math.round(intercept * 1000) / 1000}`
    };
  }

  /**
   * Calcular análisis de varianza (ANOVA) de un factor
   */
  static oneWayANOVA(groups) {
    if (!groups || groups.length < 2) {
      return {
        fStatistic: 0,
        pValue: 1,
        isSignificant: false,
        betweenGroupsVariance: 0,
        withinGroupsVariance: 0
      };
    }

    // Filtrar grupos vacíos
    const validGroups = groups.filter(group => group && group.length > 0);
    if (validGroups.length < 2) {
      return {
        fStatistic: 0,
        pValue: 1,
        isSignificant: false,
        betweenGroupsVariance: 0,
        withinGroupsVariance: 0
      };
    }

    const k = validGroups.length; // número de grupos
    const n = validGroups.reduce((sum, group) => sum + group.length, 0); // tamaño total
    
    // Calcular medias
    const groupMeans = validGroups.map(group => 
      group.reduce((sum, val) => sum + val, 0) / group.length
    );
    const grandMean = validGroups.flat().reduce((sum, val) => sum + val, 0) / n;
    
    // Suma de cuadrados entre grupos (SSB)
    const ssb = validGroups.reduce((sum, group, i) => {
      return sum + group.length * Math.pow(groupMeans[i] - grandMean, 2);
    }, 0);
    
    // Suma de cuadrados dentro de grupos (SSW)
    const ssw = validGroups.reduce((sum, group, i) => {
      return sum + group.reduce((groupSum, val) => {
        return groupSum + Math.pow(val - groupMeans[i], 2);
      }, 0);
    }, 0);
    
    // Grados de libertad
    const dfBetween = k - 1;
    const dfWithin = n - k;
    
    // Cuadrados medios
    const msBetween = ssb / dfBetween;
    const msWithin = ssw / dfWithin;
    
    // Estadístico F
    const fStatistic = msWithin === 0 ? 0 : msBetween / msWithin;
    
    // Aproximación del p-value para F
    const pValue = this.approximateFTestPValue(fStatistic, dfBetween, dfWithin);

    return {
      fStatistic: Math.round(fStatistic * 1000) / 1000,
      pValue: Math.round(pValue * 1000) / 1000,
      isSignificant: pValue < 0.05,
      significanceLevel: this.getSignificanceLevel(pValue),
      betweenGroupsVariance: Math.round(msBetween * 100) / 100,
      withinGroupsVariance: Math.round(msWithin * 100) / 100,
      degreesOfFreedom: {
        between: dfBetween,
        within: dfWithin
      },
      groupStatistics: validGroups.map((group, i) => ({
        groupIndex: i,
        mean: Math.round(groupMeans[i] * 100) / 100,
        sampleSize: group.length,
        standardDeviation: Math.round(Math.sqrt(
          group.reduce((sum, val) => sum + Math.pow(val - groupMeans[i], 2), 0) / (group.length - 1)
        ) * 100) / 100
      }))
    };
  }

  /**
   * Funciones auxiliares para cálculos estadísticos
   */

  /**
   * Aproximar p-value para prueba t
   */
  static approximateTTestPValue(tStat, df) {
    // Aproximación simplificada usando distribución normal para df > 30
    if (df > 30) {
      return 2 * (1 - this.normalCDF(tStat));
    }
    
    // Para df menores, usar aproximación más conservadora
    const criticalValues = {
      1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
      10: 2.228, 15: 2.131, 20: 2.086, 25: 2.060, 30: 2.042
    };
    
    let criticalValue = 2.042; // valor por defecto
    for (const [degrees, critical] of Object.entries(criticalValues)) {
      if (df <= parseInt(degrees)) {
        criticalValue = critical;
        break;
      }
    }
    
    if (tStat > criticalValue) return 0.01;
    if (tStat > criticalValue * 0.7) return 0.05;
    if (tStat > criticalValue * 0.5) return 0.1;
    return 0.2;
  }

  /**
   * Aproximar p-value para prueba F
   */
  static approximateFTestPValue(fStat, df1, df2) {
    // Aproximación muy simplificada
    if (fStat > 4) return 0.01;
    if (fStat > 2.5) return 0.05;
    if (fStat > 1.5) return 0.1;
    return 0.2;
  }

  /**
   * Función de distribución acumulativa normal estándar
   */
  static normalCDF(x) {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  /**
   * Función de error (aproximación)
   */
  static erf(x) {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  /**
   * Obtener valor crítico t
   */
  static getTCriticalValue(df, alpha) {
    // Valores críticos aproximados para α = 0.05
    const criticalValues = {
      1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
      10: 2.228, 15: 2.131, 20: 2.086, 25: 2.060, 30: 2.042
    };
    
    for (const [degrees, critical] of Object.entries(criticalValues)) {
      if (df <= parseInt(degrees)) {
        return critical;
      }
    }
    
    return 1.96; // Valor para distribución normal
  }

  /**
   * Obtener nivel de significancia
   */
  static getSignificanceLevel(pValue) {
    for (const [level, config] of Object.entries(SIGNIFICANCE_LEVELS)) {
      if (pValue < config.threshold) {
        return {
          level,
          label: config.label,
          threshold: config.threshold
        };
      }
    }
    return {
      level: 'NOT_SIGNIFICANT',
      label: SIGNIFICANCE_LEVELS.NOT_SIGNIFICANT.label,
      threshold: SIGNIFICANCE_LEVELS.NOT_SIGNIFICANT.threshold
    };
  }

  /**
   * Interpretar tamaño del efecto
   */
  static interpretEffectSize(effectSize) {
    for (const [size, config] of Object.entries(EFFECT_SIZE_INTERPRETATION)) {
      if (effectSize >= config.min && effectSize < config.max) {
        return {
          size,
          label: config.label,
          value: effectSize
        };
      }
    }
    return {
      size: 'NEGLIGIBLE',
      label: 'Negligible',
      value: effectSize
    };
  }

  /**
   * Interpretar fuerza de correlación
   */
  static interpretCorrelationStrength(correlation) {
    const absCorr = Math.abs(correlation);
    
    if (absCorr >= 0.9) return 'very_strong';
    if (absCorr >= 0.7) return 'strong';
    if (absCorr >= 0.5) return 'moderate';
    if (absCorr >= 0.3) return 'weak';
    if (absCorr >= 0.1) return 'very_weak';
    return 'negligible';
  }

  /**
   * Generar datos para box plot
   */
  static generateBoxPlotData(data) {
    if (!data || data.length === 0) {
      return {
        min: 0,
        q1: 0,
        median: 0,
        q3: 0,
        max: 0,
        outliers: []
      };
    }

    const sortedData = [...data].sort((a, b) => a - b);
    const quartiles = this.calculateQuartiles(sortedData);
    const iqr = quartiles.q3 - quartiles.q1;
    
    // Calcular límites para outliers
    const lowerFence = quartiles.q1 - 1.5 * iqr;
    const upperFence = quartiles.q3 + 1.5 * iqr;
    
    // Identificar outliers
    const outliers = sortedData.filter(val => val < lowerFence || val > upperFence);
    
    // Calcular whiskers (excluyendo outliers)
    const nonOutliers = sortedData.filter(val => val >= lowerFence && val <= upperFence);
    const min = nonOutliers.length > 0 ? nonOutliers[0] : sortedData[0];
    const max = nonOutliers.length > 0 ? nonOutliers[nonOutliers.length - 1] : sortedData[sortedData.length - 1];

    return {
      min,
      q1: quartiles.q1,
      median: quartiles.q2,
      q3: quartiles.q3,
      max,
      outliers,
      iqr,
      lowerFence,
      upperFence
    };
  }
}

export default StatisticalService;