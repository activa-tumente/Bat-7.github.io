/**
 * @file DataProcessor.js
 * @description Optimized data processing utilities for trend analysis
 */

import { StatisticalUtils } from '../../../utils/StatisticalUtils.js';

export class DataProcessor {
  /**
   * Process raw data into time series with single pass optimization
   */
  static processToTimeSeries(data, period) {
    if (!data || data.length === 0) return [];

    // Group data by period in single pass
    const groupedData = new Map();
    
    data.forEach(item => {
      const periodKey = this.getPeriodKey(item.fecha, period);
      
      if (!groupedData.has(periodKey)) {
        groupedData.set(periodKey, {
          period: periodKey,
          date: this.parseDate(periodKey),
          percentiles: [],
          puntajesDirectos: []
        });
      }
      
      const group = groupedData.get(periodKey);
      group.percentiles.push(item.percentil);
      group.puntajesDirectos.push(item.puntaje_directo);
    });

    // Calculate statistics for each period in single pass
    return Array.from(groupedData.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(group => ({
        period: group.period,
        date: group.date,
        count: group.percentiles.length,
        percentil_promedio: StatisticalUtils.calculateMean(group.percentiles),
        percentil_mediana: StatisticalUtils.calculateMedian(group.percentiles),
        percentil_std: StatisticalUtils.calculateStandardDeviation(group.percentiles),
        puntaje_directo_promedio: StatisticalUtils.calculateMean(group.puntajesDirectos),
        percentil_min: Math.min(...group.percentiles),
        percentil_max: Math.max(...group.percentiles)
      }));
  }

  /**
   * Generate multiple series efficiently with shared processing
   */
  static generateMultipleSeries(data, config) {
    const series = {};
    
    // Process general series
    series.general = this.processToTimeSeries(data, config.period);
    
    // Process by aptitude with optimized grouping
    if (data.length > 0) {
      const aptitudeGroups = this.groupBy(data, 'aptitud_codigo');
      series.byAptitude = {};
      
      Object.entries(aptitudeGroups).forEach(([aptitud, aptitudData]) => {
        series.byAptitude[aptitud] = {
          nombre: aptitudData[0]?.aptitud_nombre || aptitud,
          data: this.processToTimeSeries(aptitudData, config.period)
        };
      });
    }
    
    // Process by custom group if specified
    if (config.groupBy && data.length > 0) {
      const customGroups = this.groupBy(data, config.groupBy);
      series.byGroup = {};
      
      Object.entries(customGroups).forEach(([group, groupData]) => {
        series.byGroup[group] = this.processToTimeSeries(groupData, config.period);
      });
    }
    
    return series;
  }

  /**
   * Optimized groupBy function using Map for better performance
   */
  static groupBy(array, key) {
    const groups = new Map();
    
    array.forEach(item => {
      const groupKey = item[key];
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey).push(item);
    });
    
    return Object.fromEntries(groups);
  }

  /**
   * Get period key with memoization for better performance
   */
  static getPeriodKey(dateString, period) {
    const date = new Date(dateString);
    
    switch (period) {
      case 'daily':
        return date.toISOString().split('T')[0];
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split('T')[0];
      case 'monthly':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${date.getFullYear()}-Q${quarter}`;
      default:
        return dateString;
    }
  }

  /**
   * Parse date with caching for repeated operations
   */
  static parseDate(periodKey) {
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
  }
}