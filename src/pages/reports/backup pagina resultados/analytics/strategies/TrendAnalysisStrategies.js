/**
 * @file TrendAnalysisStrategies.js
 * @description Strategy pattern implementation for different trend analysis types
 */

import { StatisticalUtils } from '../../../utils/StatisticalUtils.js';
import { TREND_ANALYSIS_CONFIG } from '../../../constants/trendAnalysisConfig.js';

// Base strategy interface
class TrendAnalysisStrategy {
  analyze(data, config) {
    throw new Error('analyze method must be implemented');
  }
}

// Linear trend analysis strategy
export class LinearTrendStrategy extends TrendAnalysisStrategy {
  analyze(timeSeries) {
    if (!timeSeries || timeSeries.length < 2) {
      return { direction: 'insufficient_data', strength: 0, significance: 'not_significant' };
    }

    const values = timeSeries.map(point => point.percentil_promedio);
    const regression = StatisticalUtils.calculateLinearRegression(values);
    
    return {
      slope: regression.slope,
      intercept: regression.intercept,
      rSquared: regression.rSquared,
      direction: this.classifyDirection(regression.slope),
      strength: Math.abs(regression.slope),
      significance: this.assessSignificance(regression.slope, regression.rSquared, values.length)
    };
  }

  classifyDirection(slope) {
    const { SLOPE_SIGNIFICANT, SLOPE_MODERATE } = TREND_ANALYSIS_CONFIG.TREND_THRESHOLDS;
    
    if (slope > SLOPE_MODERATE) return 'ascending';
    if (slope < -SLOPE_MODERATE) return 'descending';
    return 'stable';
  }

  assessSignificance(slope, rSquared, sampleSize) {
    const { SLOPE_SIGNIFICANT, SLOPE_MODERATE, R_SQUARED_SIGNIFICANT, R_SQUARED_MODERATE, MIN_SAMPLE_SIZE } = 
      TREND_ANALYSIS_CONFIG.TREND_THRESHOLDS;
    
    if (sampleSize < MIN_SAMPLE_SIZE) return 'insufficient_data';
    if (Math.abs(slope) > SLOPE_SIGNIFICANT && rSquared > R_SQUARED_SIGNIFICANT) return 'significant';
    if (Math.abs(slope) > SLOPE_MODERATE && rSquared > R_SQUARED_MODERATE) return 'moderate';
    return 'not_significant';
  }
}

// Seasonal pattern analysis strategy
export class SeasonalAnalysisStrategy extends TrendAnalysisStrategy {
  analyze(timeSeries) {
    if (!timeSeries || timeSeries.length < TREND_ANALYSIS_CONFIG.SEASONALITY.MIN_PERIODS_FOR_ANALYSIS) {
      return { hasSeasonality: false, reason: 'insufficient_data' };
    }

    const monthlyAverages = this.calculateMonthlyAverages(timeSeries);
    const seasonalPattern = this.detectSeasonalPattern(monthlyAverages);
    
    return seasonalPattern;
  }

  calculateMonthlyAverages(timeSeries) {
    const monthlyData = {};
    
    timeSeries.forEach(point => {
      const date = new Date(point.date);
      const month = date.getMonth();
      
      if (!monthlyData[month]) {
        monthlyData[month] = [];
      }
      monthlyData[month].push(point.percentil_promedio);
    });
    
    const monthlyAverages = {};
    Object.keys(monthlyData).forEach(month => {
      monthlyAverages[month] = StatisticalUtils.calculateMean(monthlyData[month]);
    });
    
    return monthlyAverages;
  }

  detectSeasonalPattern(monthlyAverages) {
    const values = Object.values(monthlyAverages);
    const mean = StatisticalUtils.calculateMean(values);
    const std = StatisticalUtils.calculateStandardDeviation(values);
    
    const peaks = [];
    const valleys = [];
    
    Object.keys(monthlyAverages).forEach(month => {
      const value = monthlyAverages[month];
      if (value > mean + std * TREND_ANALYSIS_CONFIG.SEASONALITY.STANDARD_DEVIATION_MULTIPLIER) {
        peaks.push({ month: parseInt(month), value: value });
      } else if (value < mean - std * TREND_ANALYSIS_CONFIG.SEASONALITY.STANDARD_DEVIATION_MULTIPLIER) {
        valleys.push({ month: parseInt(month), value: value });
      }
    });
    
    return {
      pattern: monthlyAverages,
      peaks: peaks,
      valleys: valleys,
      amplitude: Math.max(...values) - Math.min(...values),
      hasSeasonality: peaks.length > 0 || valleys.length > 0
    };
  }
}

// Context class that uses strategies
export class TrendAnalysisContext {
  constructor() {
    this.strategies = {
      linear: new LinearTrendStrategy(),
      seasonal: new SeasonalAnalysisStrategy()
    };
  }

  analyzeTrends(timeSeries, analysisType = 'linear') {
    const strategy = this.strategies[analysisType];
    if (!strategy) {
      throw new Error(`Unknown analysis type: ${analysisType}`);
    }
    
    return strategy.analyze(timeSeries);
  }
}