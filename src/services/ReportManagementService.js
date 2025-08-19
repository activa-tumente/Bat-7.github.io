/**
 * @file ReportManagementService.js
 * @description Service for managing report operations while preserving test data
 */

import supabase from '../api/supabaseClient';

class ReportManagementService {
  /**
   * Delete only generated reports for a patient, preserving test results
   * @param {string} patientId - Patient ID
   * @param {string} deleteType - 'single' | 'all'
   * @returns {Promise<Object>} Operation result
   */
  static async deletePatientReports(patientId, deleteType = 'all') {
    // Input validation
    if (!patientId || typeof patientId !== 'string') {
      return {
        success: false,
        message: 'ID de paciente inválido'
      };
    }

    if (!['single', 'all'].includes(deleteType)) {
      return {
        success: false,
        message: 'Tipo de eliminación inválido'
      };
    }

    try {
      // Get patient info for confirmation messages
      const { data: patient, error: patientError } = await supabase
        .from('pacientes')
        .select('nombre, apellido')
        .eq('id', patientId)
        .single();

      if (patientError) {
        throw new Error('Error al obtener información del paciente');
      }

      const patientName = `${patient.nombre} ${patient.apellido}`;

      if (deleteType === 'single') {
        // Delete only the most recent report
        const { data: latestReport, error: latestError } = await supabase
          .from('informes_generados')
          .select('id, titulo, fecha_generacion')
          .eq('paciente_id', patientId)
          .eq('estado', 'generado')
          .order('fecha_generacion', { ascending: false })
          .limit(1)
          .single();

        if (latestError || !latestReport) {
          return {
            success: false,
            message: 'No hay informes generados para eliminar'
          };
        }

        // Soft delete the latest report
        const { error: deleteError } = await supabase
          .from('informes_generados')
          .update({ 
            estado: 'eliminado',
            fecha_eliminacion: new Date().toISOString()
          })
          .eq('id', latestReport.id);

        if (deleteError) {
          throw new Error('Error al eliminar el informe');
        }

        return {
          success: true,
          message: `Último informe de ${patientName} eliminado exitosamente`,
          deletedCount: 1
        };

      } else {
        // Delete all reports for the patient
        const { data: reports, error: reportsError } = await supabase
          .from('informes_generados')
          .select('id, titulo')
          .eq('paciente_id', patientId)
          .eq('estado', 'generado');

        if (reportsError) {
          throw new Error('Error al buscar informes del paciente');
        }

        if (!reports || reports.length === 0) {
          return {
            success: false,
            message: 'No hay informes generados para eliminar'
          };
        }

        // Soft delete all reports
        const { error: deleteError } = await supabase
          .from('informes_generados')
          .update({ 
            estado: 'eliminado',
            fecha_eliminacion: new Date().toISOString()
          })
          .eq('paciente_id', patientId)
          .eq('estado', 'generado');

        if (deleteError) {
          throw new Error('Error al eliminar los informes');
        }

        return {
          success: true,
          message: `${reports.length} informe(s) de ${patientName} eliminado(s) exitosamente`,
          deletedCount: reports.length
        };
      }

    } catch (error) {
      console.error('Error in deletePatientReports:', error);
      return {
        success: false,
        message: error.message || 'Error al eliminar informes'
      };
    }
  }

  /**
   * Batch delete reports for multiple patients
   * @param {Array<string>} patientIds - Array of patient IDs
   * @returns {Promise<Object>} Operation result
   */
  static async batchDeleteReports(patientIds) {
    try {
      if (!patientIds || patientIds.length === 0) {
        return {
          success: false,
          message: 'No se seleccionaron pacientes'
        };
      }

      // Get count of reports to delete
      const { data: reports, error: countError } = await supabase
        .from('informes_generados')
        .select('id, paciente_id')
        .in('paciente_id', patientIds)
        .eq('estado', 'generado');

      if (countError) {
        throw new Error('Error al contar informes a eliminar');
      }

      if (!reports || reports.length === 0) {
        return {
          success: false,
          message: 'No hay informes generados para los pacientes seleccionados'
        };
      }

      // Batch soft delete
      const { error: deleteError } = await supabase
        .from('informes_generados')
        .update({ 
          estado: 'eliminado',
          fecha_eliminacion: new Date().toISOString()
        })
        .in('paciente_id', patientIds)
        .eq('estado', 'generado');

      if (deleteError) {
        throw new Error('Error al eliminar informes en lote');
      }

      return {
        success: true,
        message: `${reports.length} informe(s) de ${patientIds.length} paciente(s) eliminado(s) exitosamente`,
        deletedCount: reports.length,
        affectedPatients: patientIds.length
      };

    } catch (error) {
      console.error('Error in batchDeleteReports:', error);
      return {
        success: false,
        message: error.message || 'Error al eliminar informes en lote'
      };
    }
  }

  /**
   * Restore deleted reports
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Operation result
   */
  static async restorePatientReports(patientId) {
    try {
      const { data: deletedReports, error: findError } = await supabase
        .from('informes_generados')
        .select('id, titulo')
        .eq('paciente_id', patientId)
        .eq('estado', 'eliminado');

      if (findError) {
        throw new Error('Error al buscar informes eliminados');
      }

      if (!deletedReports || deletedReports.length === 0) {
        return {
          success: false,
          message: 'No hay informes eliminados para restaurar'
        };
      }

      const { error: restoreError } = await supabase
        .from('informes_generados')
        .update({ 
          estado: 'generado',
          fecha_eliminacion: null
        })
        .eq('paciente_id', patientId)
        .eq('estado', 'eliminado');

      if (restoreError) {
        throw new Error('Error al restaurar informes');
      }

      return {
        success: true,
        message: `${deletedReports.length} informe(s) restaurado(s) exitosamente`,
        restoredCount: deletedReports.length
      };

    } catch (error) {
      console.error('Error in restorePatientReports:', error);
      return {
        success: false,
        message: error.message || 'Error al restaurar informes'
      };
    }
  }

  /**
   * Get report history for a patient
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} Report history
   */
  static async getPatientReportHistory(patientId) {
    try {
      const { data: reports, error } = await supabase
        .from('informes_generados')
        .select(`
          id,
          titulo,
          descripcion,
          estado,
          fecha_generacion,
          fecha_eliminacion,
          contenido
        `)
        .eq('paciente_id', patientId)
        .order('fecha_generacion', { ascending: false });

      if (error) {
        throw new Error('Error al obtener historial de informes');
      }

      return reports || [];

    } catch (error) {
      console.error('Error in getPatientReportHistory:', error);
      throw error;
    }
  }

  /**
   * Check if patient has test results (to prevent accidental data loss)
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Results summary
   */
  static async getPatientTestSummary(patientId) {
    try {
      const { data: results, error } = await supabase
        .from('resultados')
        .select(`
          id,
          created_at,
          aptitudes(codigo, nombre)
        `)
        .eq('paciente_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Error al obtener resumen de tests');
      }

      const testCount = results?.length || 0;
      const aptitudes = results?.map(r => r.aptitudes?.codigo).filter(Boolean) || [];
      const uniqueAptitudes = [...new Set(aptitudes)];
      const lastTestDate = results?.[0]?.created_at;

      return {
        hasResults: testCount > 0,
        testCount,
        aptitudesCount: uniqueAptitudes.length,
        aptitudes: uniqueAptitudes,
        lastTestDate
      };

    } catch (error) {
      console.error('Error in getPatientTestSummary:', error);
      throw error;
    }
  }
}

export default ReportManagementService;