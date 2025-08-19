/**
 * @file ScoreProcessingService.js
 * @description Service for processing and validating BAT-7 scores
 */

import supabase from '../api/supabaseClient';
import AptitudeConfigService from './AptitudeConfigService';

class ScoreProcessingService {
  /**
   * Validate and process raw test results
   * @param {Object} rawResult - Raw test result data
   * @returns {Promise<Object>} Processed and validated result
   */
  static async processTestResult(rawResult) {
    try {
      // Input validation
      if (!rawResult.paciente_id || !rawResult.aptitud_id) {
        throw new Error('Datos de resultado incompletos');
      }

      // Get aptitude configuration
      const { data: aptitude, error: aptError } = await supabase
        .from('aptitudes')
        .select('codigo, nombre, descripcion')
        .eq('id', rawResult.aptitud_id)
        .single();

      if (aptError || !aptitude) {
        throw new Error('Aptitud no encontrada');
      }

      // Validate score ranges
      const puntajeDirecto = rawResult.puntaje_directo || 0;
      const percentil = rawResult.percentil || 0;

      if (puntajeDirecto < 0) {
        throw new Error('Puntaje directo no puede ser negativo');
      }

      if (percentil < 0 || percentil > 100) {
        throw new Error('Percentil debe estar entre 0 y 100');
      }

      // Get percentile level interpretation
      const percentileLevel = AptitudeConfigService.getPercentileLevel(percentil);

      // Calculate derived metrics
      const totalItems = (rawResult.respuestas_correctas || 0) + (rawResult.respuestas_incorrectas || 0);
      const accuracy = totalItems > 0 ? (rawResult.respuestas_correctas || 0) / totalItems : 0;
      const timePerItem = rawResult.tiempo_total && totalItems > 0 
        ? rawResult.tiempo_total / totalItems 
        : 0;

      return {
        ...rawResult,
        aptitude,
        percentileLevel,
        derivedMetrics: {
          totalItems,
          accuracy: Math.round(accuracy * 100),
          timePerItem: Math.round(timePerItem),
          efficiency: accuracy > 0 && timePerItem > 0 ? Math.round((accuracy / timePerItem) * 1000) : 0
        },
        isValid: true,
        validationErrors: []
      };

    } catch (error) {
      return {
        ...rawResult,
        isValid: false,
        validationErrors: [error.message],
        percentileLevel: AptitudeConfigService.getPercentileLevel(0)
      };
    }
  }

  /**
   * Batch process multiple test results
   * @param {Array} rawResults - Array of raw test results
   * @returns {Promise<Array>} Array of processed results
   */
  static async batchProcessResults(rawResults) {
    if (!Array.isArray(rawResults)) {
      throw new Error('Se esperaba un array de resultados');
    }

    const processedResults = await Promise.all(
      rawResults.map(result => this.processTestResult(result))
    );

    // Separate valid and invalid results
    const validResults = processedResults.filter(r => r.isValid);
    const invalidResults = processedResults.filter(r => !r.isValid);

    return {
      validResults,
      invalidResults,
      totalProcessed: processedResults.length,
      validCount: validResults.length,
      invalidCount: invalidResults.length
    };
  }

  /**
   * Calculate patient summary statistics
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Patient summary statistics
   */
  static async calculatePatientSummary(patientId) {
    try {
      const { data: results, error } = await supabase
        .from('resultados')
        .select(`
          id,
          puntaje_directo,
          percentil,
          respuestas_correctas,
          respuestas_incorrectas,
          tiempo_total,
          created_at,
          aptitudes(codigo, nombre)
        `)
        .eq('paciente_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Error al obtener resultados del paciente');
      }

      if (!results || results.length === 0) {
        return {
          patientId,
          hasResults: false,
          totalTests: 0,
          summary: null
        };
      }

      // Process all results
      const processedResults = await this.batchProcessResults(results);
      const validResults = processedResults.validResults;

      if (validResults.length === 0) {
        return {
          patientId,
          hasResults: false,
          totalTests: results.length,
          summary: null,
          errors: processedResults.invalidResults.map(r => r.validationErrors).flat()
        };
      }

      // Calculate summary statistics
      const percentiles = validResults.map(r => r.percentil || 0);
      const puntajesDirectos = validResults.map(r => r.puntaje_directo || 0);
      
      const avgPercentile = Math.round(
        percentiles.reduce((sum, p) => sum + p, 0) / percentiles.length
      );
      
      const avgPuntajeDirecto = Math.round(
        puntajesDirectos.reduce((sum, p) => sum + p, 0) / puntajesDirectos.length
      );

      // Count aptitudes by level
      const aptitudesByLevel = {
        high: validResults.filter(r => (r.percentil || 0) >= 75).length,
        medium: validResults.filter(r => (r.percentil || 0) >= 25 && (r.percentil || 0) < 75).length,
        low: validResults.filter(r => (r.percentil || 0) < 25).length
      };

      // Get unique aptitudes tested
      const aptitudesTested = [...new Set(
        validResults.map(r => r.aptitudes?.codigo).filter(Boolean)
      )];

      // Calculate intelligence indices
      const intelligenceIndices = AptitudeConfigService.calculateIntelligenceIndices(validResults);

      return {
        patientId,
        hasResults: true,
        totalTests: results.length,
        validTests: validResults.length,
        invalidTests: processedResults.invalidCount,
        summary: {
          avgPercentile,
          avgPuntajeDirecto,
          aptitudesByLevel,
          aptitudesTested,
          intelligenceIndices,
          lastTestDate: validResults[0]?.created_at,
          overallLevel: AptitudeConfigService.getPercentileLevel(avgPercentile)
        }
      };

    } catch (error) {
      console.error('Error calculating patient summary:', error);
      throw error;
    }
  }

  /**
   * Validate score consistency across multiple tests
   * @param {Array} results - Array of test results for validation
   * @returns {Object} Validation report
   */
  static validateScoreConsistency(results) {
    const validationReport = {
      isConsistent: true,
      warnings: [],
      errors: []
    };

    if (!results || results.length === 0) {
      return validationReport;
    }

    // Check for duplicate aptitude tests
    const aptitudeCounts = {};
    results.forEach(result => {
      const code = result.aptitudes?.codigo || result.test;
      if (code) {
        aptitudeCounts[code] = (aptitudeCounts[code] || 0) + 1;
      }
    });

    Object.entries(aptitudeCounts).forEach(([code, count]) => {
      if (count > 1) {
        validationReport.warnings.push(
          `Aptitud ${code} tiene ${count} resultados. Considere mantener solo el más reciente.`
        );
      }
    });

    // Check for extreme score variations
    const percentiles = results.map(r => r.percentil || r.puntaje_pc || 0).filter(p => p > 0);
    if (percentiles.length > 1) {
      const min = Math.min(...percentiles);
      const max = Math.max(...percentiles);
      const range = max - min;

      if (range > 80) {
        validationReport.warnings.push(
          `Gran variación en percentiles (${min}-${max}). Revisar consistencia de aplicación.`
        );
      }
    }

    // Check for missing critical data
    results.forEach((result, index) => {
      if (!result.percentil && !result.puntaje_pc) {
        validationReport.errors.push(`Resultado ${index + 1}: Falta percentil`);
      }
      if (!result.puntaje_directo) {
        validationReport.errors.push(`Resultado ${index + 1}: Falta puntaje directo`);
      }
    });

    validationReport.isConsistent = validationReport.errors.length === 0;

    return validationReport;
  }
}

export default ScoreProcessingService;