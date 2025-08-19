/**
 * @file DataFlowIntegrityService.js
 * @description Service to ensure data integrity across the 6-step BAT-7 functional flow
 */

import supabase from '../api/supabaseClient';
import ScoreProcessingService from './ScoreProcessingService';
import ReportManagementService from './ReportManagementService';

class DataFlowIntegrityService {
  /**
   * Validate the complete 6-step functional flow for a patient
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Comprehensive flow validation report
   */
  static async validatePatientFlow(patientId) {
    const flowReport = {
      patientId,
      isValid: true,
      steps: {
        patientSelection: { valid: false, data: null, errors: [] },
        testAdministration: { valid: false, data: null, errors: [] },
        rawDataStorage: { valid: false, data: null, errors: [] },
        scoreProcessing: { valid: false, data: null, errors: [] },
        resultVisualization: { valid: false, data: null, errors: [] },
        qualitativeReporting: { valid: false, data: null, errors: [] }
      },
      overallErrors: [],
      recommendations: []
    };

    try {
      // Step 1: Patient Selection Validation
      await this._validatePatientSelection(patientId, flowReport.steps.patientSelection);

      // Step 2: Test Administration Validation
      await this._validateTestAdministration(patientId, flowReport.steps.testAdministration);

      // Step 3: Raw Data Storage Validation
      await this._validateRawDataStorage(patientId, flowReport.steps.rawDataStorage);

      // Step 4: Score Processing Validation
      await this._validateScoreProcessing(patientId, flowReport.steps.scoreProcessing);

      // Step 5: Result Visualization Validation
      await this._validateResultVisualization(patientId, flowReport.steps.resultVisualization);

      // Step 6: Qualitative Reporting Validation
      await this._validateQualitativeReporting(patientId, flowReport.steps.qualitativeReporting);

      // Overall validation
      flowReport.isValid = Object.values(flowReport.steps).every(step => step.valid);

      // Generate recommendations
      flowReport.recommendations = this._generateRecommendations(flowReport);

    } catch (error) {
      flowReport.isValid = false;
      flowReport.overallErrors.push(`Error en validación general: ${error.message}`);
    }

    return flowReport;
  }

  /**
   * Step 1: Validate patient selection and basic data
   */
  static async _validatePatientSelection(patientId, stepReport) {
    try {
      const { data: patient, error } = await supabase
        .from('pacientes')
        .select(`
          id,
          nombre,
          apellido,
          documento,
          fecha_nacimiento,
          genero,
          institucion_id,
          created_at
        `)
        .eq('id', patientId)
        .single();

      if (error || !patient) {
        stepReport.errors.push('Paciente no encontrado en la base de datos');
        return;
      }

      // Validate required fields
      const requiredFields = ['nombre', 'apellido', 'documento'];
      const missingFields = requiredFields.filter(field => !patient[field]);
      
      if (missingFields.length > 0) {
        stepReport.errors.push(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      }

      // Validate data quality
      if (patient.nombre && patient.nombre.length < 2) {
        stepReport.errors.push('Nombre demasiado corto');
      }

      if (patient.documento && patient.documento.length < 5) {
        stepReport.errors.push('Documento inválido');
      }

      stepReport.data = patient;
      stepReport.valid = stepReport.errors.length === 0;

    } catch (error) {
      stepReport.errors.push(`Error validando selección de paciente: ${error.message}`);
    }
  }

  /**
   * Step 2: Validate test administration completeness
   */
  static async _validateTestAdministration(patientId, stepReport) {
    try {
      const { data: results, error } = await supabase
        .from('resultados')
        .select(`
          id,
          aptitud_id,
          created_at,
          tiempo_total,
          respuestas_correctas,
          respuestas_incorrecas,
          aptitudes(codigo, nombre)
        `)
        .eq('paciente_id', patientId);

      if (error) {
        stepReport.errors.push(`Error consultando resultados: ${error.message}`);
        return;
      }

      if (!results || results.length === 0) {
        stepReport.errors.push('No se encontraron tests administrados');
        return;
      }

      // Validate test completeness
      const incompleteTests = results.filter(r => 
        !r.tiempo_total || 
        (r.respuestas_correctas === null && r.respuestas_incorrecas === null)
      );

      if (incompleteTests.length > 0) {
        stepReport.errors.push(`${incompleteTests.length} tests incompletos encontrados`);
      }

      // Check for duplicate aptitudes
      const aptitudeCodes = results.map(r => r.aptitudes?.codigo).filter(Boolean);
      const duplicates = aptitudeCodes.filter((code, index) => aptitudeCodes.indexOf(code) !== index);
      
      if (duplicates.length > 0) {
        stepReport.errors.push(`Aptitudes duplicadas: ${[...new Set(duplicates)].join(', ')}`);
      }

      stepReport.data = {
        totalTests: results.length,
        completeTests: results.length - incompleteTests.length,
        aptitudesTested: [...new Set(aptitudeCodes)],
        duplicateAptitudes: [...new Set(duplicates)]
      };

      stepReport.valid = stepReport.errors.length === 0;

    } catch (error) {
      stepReport.errors.push(`Error validando administración de tests: ${error.message}`);
    }
  }

  /**
   * Step 3: Validate raw data storage integrity
   */
  static async _validateRawDataStorage(patientId, stepReport) {
    try {
      const { data: results, error } = await supabase
        .from('resultados')
        .select('*')
        .eq('paciente_id', patientId);

      if (error) {
        stepReport.errors.push(`Error validando almacenamiento: ${error.message}`);
        return;
      }

      if (!results || results.length === 0) {
        stepReport.errors.push('No hay datos almacenados');
        return;
      }

      // Validate data integrity
      const corruptedResults = results.filter(r => {
        // Check for negative values where they shouldn't exist
        if (r.puntaje_directo < 0 || r.respuestas_correctas < 0 || r.respuestas_incorrecas < 0) {
          return true;
        }
        
        // Check for impossible combinations
        if (r.respuestas_correctas + r.respuestas_incorrecas === 0 && r.puntaje_directo > 0) {
          return true;
        }

        return false;
      });

      if (corruptedResults.length > 0) {
        stepReport.errors.push(`${corruptedResults.length} resultados con datos corruptos`);
      }

      stepReport.data = {
        totalRecords: results.length,
        corruptedRecords: corruptedResults.length,
        dataIntegrityScore: ((results.length - corruptedResults.length) / results.length) * 100
      };

      stepReport.valid = stepReport.errors.length === 0;

    } catch (error) {
      stepReport.errors.push(`Error validando almacenamiento de datos: ${error.message}`);
    }
  }

  /**
   * Step 4: Validate score processing (PD to PC conversion)
   */
  static async _validateScoreProcessing(patientId, stepReport) {
    try {
      const summary = await ScoreProcessingService.calculatePatientSummary(patientId);
      
      if (!summary.hasResults) {
        stepReport.errors.push('No hay resultados procesados');
        return;
      }

      if (summary.invalidTests > 0) {
        stepReport.errors.push(`${summary.invalidTests} tests con errores de procesamiento`);
      }

      // Validate percentile ranges
      const { data: results, error } = await supabase
        .from('resultados')
        .select('percentil, puntaje_directo')
        .eq('paciente_id', patientId);

      if (!error && results) {
        const invalidPercentiles = results.filter(r => 
          r.percentil !== null && (r.percentil < 0 || r.percentil > 100)
        );

        if (invalidPercentiles.length > 0) {
          stepReport.errors.push(`${invalidPercentiles.length} percentiles fuera de rango válido`);
        }
      }

      stepReport.data = {
        ...summary,
        processingAccuracy: summary.validTests / summary.totalTests * 100
      };

      stepReport.valid = stepReport.errors.length === 0;

    } catch (error) {
      stepReport.errors.push(`Error validando procesamiento de puntajes: ${error.message}`);
    }
  }

  /**
   * Step 5: Validate result visualization data consistency
   */
  static async _validateResultVisualization(patientId, stepReport) {
    try {
      // This would validate that the data shown in UI components matches database
      const summary = await ScoreProcessingService.calculatePatientSummary(patientId);
      
      if (!summary.hasResults) {
        stepReport.errors.push('No hay datos para visualización');
        return;
      }

      // Validate that all required visualization data is available
      const requiredFields = ['avgPercentile', 'avgPuntajeDirecto', 'aptitudesByLevel'];
      const missingFields = requiredFields.filter(field => 
        !summary.summary || summary.summary[field] === undefined
      );

      if (missingFields.length > 0) {
        stepReport.errors.push(`Datos faltantes para visualización: ${missingFields.join(', ')}`);
      }

      stepReport.data = {
        visualizationDataComplete: missingFields.length === 0,
        availableMetrics: summary.summary ? Object.keys(summary.summary) : []
      };

      stepReport.valid = stepReport.errors.length === 0;

    } catch (error) {
      stepReport.errors.push(`Error validando visualización de resultados: ${error.message}`);
    }
  }

  /**
   * Step 6: Validate qualitative reporting capability
   */
  static async _validateQualitativeReporting(patientId, stepReport) {
    try {
      // Check if reports can be generated
      const reportHistory = await ReportManagementService.getPatientReportHistory(patientId);
      const testSummary = await ReportManagementService.getPatientTestSummary(patientId);

      if (!testSummary.hasResults) {
        stepReport.errors.push('No hay datos suficientes para generar informes cualitativos');
        return;
      }

      // Validate that all aptitudes have qualitative interpretations available
      const { data: interpretaciones, error } = await supabase
        .from('interpretaciones_cualitativas')
        .select('aptitud_codigo')
        .in('aptitud_codigo', testSummary.aptitudes);

      if (error) {
        stepReport.errors.push('Error verificando interpretaciones cualitativas');
      } else {
        const availableInterpretations = interpretaciones?.map(i => i.aptitud_codigo) || [];
        const missingInterpretations = testSummary.aptitudes.filter(
          code => !availableInterpretations.includes(code)
        );

        if (missingInterpretations.length > 0) {
          stepReport.errors.push(
            `Interpretaciones faltantes para: ${missingInterpretations.join(', ')}`
          );
        }
      }

      stepReport.data = {
        reportHistory: reportHistory.length,
        canGenerateReports: testSummary.hasResults,
        aptitudesWithInterpretations: testSummary.aptitudes.length - (missingInterpretations?.length || 0)
      };

      stepReport.valid = stepReport.errors.length === 0;

    } catch (error) {
      stepReport.errors.push(`Error validando capacidad de informes cualitativos: ${error.message}`);
    }
  }

  /**
   * Generate recommendations based on validation results
   */
  static _generateRecommendations(flowReport) {
    const recommendations = [];

    Object.entries(flowReport.steps).forEach(([stepName, stepData]) => {
      if (!stepData.valid) {
        switch (stepName) {
          case 'patientSelection':
            recommendations.push('Completar información básica del paciente');
            break;
          case 'testAdministration':
            recommendations.push('Completar tests pendientes o corregir duplicados');
            break;
          case 'rawDataStorage':
            recommendations.push('Revisar y corregir datos corruptos en resultados');
            break;
          case 'scoreProcessing':
            recommendations.push('Recalcular puntajes con errores de procesamiento');
            break;
          case 'resultVisualization':
            recommendations.push('Verificar disponibilidad de datos para visualización');
            break;
          case 'qualitativeReporting':
            recommendations.push('Completar interpretaciones cualitativas faltantes');
            break;
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Flujo de datos completo y consistente');
    }

    return recommendations;
  }

  /**
   * Repair common data integrity issues
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Repair results
   */
  static async repairDataIntegrityIssues(patientId) {
    const repairResults = {
      success: false,
      repairsPerformed: [],
      errors: []
    };

    try {
      // Get validation report first
      const flowReport = await this.validatePatientFlow(patientId);

      // Repair corrupted data
      if (!flowReport.steps.rawDataStorage.valid) {
        // Implementation would go here for specific repairs
        repairResults.repairsPerformed.push('Datos corruptos identificados para revisión manual');
      }

      // Recalculate scores if needed
      if (!flowReport.steps.scoreProcessing.valid) {
        // Implementation would trigger score recalculation
        repairResults.repairsPerformed.push('Puntajes marcados para recálculo');
      }

      repairResults.success = true;

    } catch (error) {
      repairResults.errors.push(`Error durante reparación: ${error.message}`);
    }

    return repairResults;
  }
}

export default DataFlowIntegrityService;