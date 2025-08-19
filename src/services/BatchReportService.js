/**
 * @file BatchReportService.js
 * @description Service for batch report generation and processing
 */

import InformesService from './InformesService';
import ResultadosService from './resultadosService';
import { toast } from 'react-toastify';

class BatchReportService {
  /**
   * Generate reports for multiple patients
   * @param {Array<string>} patientIds - Array of patient IDs
   * @param {Function} onProgress - Progress callback
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Batch operation result
   */
  static async generateBatchReports(patientIds, onProgress = null, options = {}) {
    const {
      reportType = 'individual', // 'individual' | 'comparative' | 'summary'
      includeCharts = true,
      format = 'pdf'
    } = options;

    const results = {
      successful: [],
      failed: [],
      total: patientIds.length,
      startTime: new Date(),
      endTime: null
    };

    try {
      for (let i = 0; i < patientIds.length; i++) {
        const patientId = patientIds[i];
        const progress = Math.round(((i + 1) / patientIds.length) * 100);

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: patientIds.length,
            percentage: progress,
            currentPatientId: patientId,
            status: 'processing'
          });
        }

        try {
          // Get patient data
          const patientResults = await ResultadosService.getResultadosByPaciente(patientId);
          
          if (!patientResults || patientResults.length === 0) {
            results.failed.push({
              patientId,
              error: 'No hay resultados de evaluación disponibles'
            });
            continue;
          }

          const patient = patientResults[0]?.pacientes;
          if (!patient) {
            results.failed.push({
              patientId,
              error: 'Información del paciente no encontrada'
            });
            continue;
          }

          // Generate individual report
          const reportId = await InformesService.generarInformeCompleto(
            patientId,
            `Informe BAT-7 - ${patient.nombre} ${patient.apellido}`,
            `Informe generado en lote - ${new Date().toLocaleDateString('es-ES')}`
          );

          const reportData = await InformesService.obtenerInforme(reportId);

          results.successful.push({
            patientId,
            patientName: `${patient.nombre} ${patient.apellido}`,
            reportId,
            reportData
          });

          // Small delay to prevent overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`Error generating report for patient ${patientId}:`, error);
          results.failed.push({
            patientId,
            error: error.message || 'Error desconocido'
          });
        }
      }

      results.endTime = new Date();
      results.duration = results.endTime - results.startTime;

      if (onProgress) {
        onProgress({
          current: patientIds.length,
          total: patientIds.length,
          percentage: 100,
          status: 'completed',
          results
        });
      }

      return results;

    } catch (error) {
      console.error('Error in batch report generation:', error);
      results.endTime = new Date();
      results.duration = results.endTime - results.startTime;
      
      throw new Error(`Error en generación masiva: ${error.message}`);
    }
  }

  /**
   * Generate comparative report for multiple patients
   * @param {Array<string>} patientIds - Array of patient IDs
   * @param {Object} options - Comparison options
   * @returns {Promise<Object>} Comparative report data
   */
  static async generateComparativeReport(patientIds, options = {}) {
    try {
      const {
        title = 'Informe Comparativo BAT-7',
        includeIndividualSections = false,
        groupBy = 'institution' // 'institution' | 'gender' | 'age_group'
      } = options;

      // Get all patient data
      const patientsData = [];
      for (const patientId of patientIds) {
        const results = await ResultadosService.getResultadosByPaciente(patientId);
        if (results && results.length > 0) {
          const stats = await ResultadosService.getEstadisticasPaciente(patientId);
          patientsData.push({
            patient: results[0].pacientes,
            results,
            stats
          });
        }
      }

      if (patientsData.length === 0) {
        throw new Error('No se encontraron datos válidos para la comparación');
      }

      // Generate comparative analysis
      const comparativeData = this.generateComparativeAnalysis(patientsData, groupBy);

      // Create comparative report
      const reportData = {
        tipo: 'comparativo',
        titulo: title,
        fecha_generacion: new Date().toISOString(),
        pacientes_incluidos: patientsData.length,
        contenido: {
          resumen_ejecutivo: this.generateExecutiveSummary(comparativeData),
          analisis_grupal: comparativeData,
          estadisticas_generales: this.calculateGroupStatistics(patientsData),
          recomendaciones: this.generateGroupRecommendations(comparativeData),
          pacientes: includeIndividualSections ? patientsData : null
        }
      };

      return reportData;

    } catch (error) {
      console.error('Error generating comparative report:', error);
      throw error;
    }
  }

  /**
   * Generate comparative analysis between patients
   * @param {Array} patientsData - Patient data array
   * @param {string} groupBy - Grouping criteria
   * @returns {Object} Comparative analysis
   */
  static generateComparativeAnalysis(patientsData, groupBy) {
    const analysis = {
      grupos: {},
      aptitudes_comparadas: {},
      tendencias: {},
      outliers: []
    };

    // Group patients by criteria
    patientsData.forEach(({ patient, stats }) => {
      let groupKey = 'general';
      
      switch (groupBy) {
        case 'institution':
          groupKey = patient.instituciones?.nombre || 'Sin institución';
          break;
        case 'gender':
          groupKey = patient.genero || 'No especificado';
          break;
        case 'age_group':
          const age = this.calculateAge(patient.fecha_nacimiento);
          groupKey = this.getAgeGroup(age);
          break;
      }

      if (!analysis.grupos[groupKey]) {
        analysis.grupos[groupKey] = {
          pacientes: [],
          estadisticas: {
            count: 0,
            promedios: {},
            rangos: {}
          }
        };
      }

      analysis.grupos[groupKey].pacientes.push({ patient, stats });
      analysis.grupos[groupKey].estadisticas.count++;
    });

    // Calculate group statistics
    Object.keys(analysis.grupos).forEach(groupKey => {
      const group = analysis.grupos[groupKey];
      group.estadisticas = this.calculateGroupStats(group.pacientes);
    });

    // Compare aptitudes across groups
    analysis.aptitudes_comparadas = this.compareAptitudesAcrossGroups(analysis.grupos);

    return analysis;
  }

  /**
   * Calculate group statistics
   * @param {Array} patients - Patients in group
   * @returns {Object} Group statistics
   */
  static calculateGroupStats(patients) {
    const stats = {
      count: patients.length,
      promedios: {},
      rangos: {},
      distribucion_genero: { masculino: 0, femenino: 0 }
    };

    if (patients.length === 0) return stats;

    // Calculate averages and ranges for each aptitude
    const aptitudeData = {};
    
    patients.forEach(({ patient, stats: patientStats }) => {
      // Gender distribution
      const gender = patient.genero?.toLowerCase();
      if (gender?.startsWith('m')) stats.distribucion_genero.masculino++;
      if (gender?.startsWith('f')) stats.distribucion_genero.femenino++;

      // Aptitude statistics
      if (patientStats.resultadosPorAptitud) {
        Object.keys(patientStats.resultadosPorAptitud).forEach(aptitudCode => {
          const aptitudStats = patientStats.resultadosPorAptitud[aptitudCode];
          
          if (!aptitudeData[aptitudCode]) {
            aptitudeData[aptitudCode] = {
              percentiles: [],
              puntajesDirectos: []
            };
          }
          
          aptitudeData[aptitudCode].percentiles.push(aptitudStats.promedios.percentil);
          aptitudeData[aptitudCode].puntajesDirectos.push(aptitudStats.promedios.puntajeDirecto);
        });
      }
    });

    // Calculate averages and ranges
    Object.keys(aptitudeData).forEach(aptitudCode => {
      const data = aptitudeData[aptitudCode];
      
      stats.promedios[aptitudCode] = {
        percentil: Math.round(data.percentiles.reduce((a, b) => a + b, 0) / data.percentiles.length),
        puntajeDirecto: Math.round(data.puntajesDirectos.reduce((a, b) => a + b, 0) / data.puntajesDirectos.length)
      };
      
      stats.rangos[aptitudCode] = {
        percentil: {
          min: Math.min(...data.percentiles),
          max: Math.max(...data.percentiles)
        },
        puntajeDirecto: {
          min: Math.min(...data.puntajesDirectos),
          max: Math.max(...data.puntajesDirectos)
        }
      };
    });

    return stats;
  }

  /**
   * Compare aptitudes across different groups
   * @param {Object} grupos - Groups data
   * @returns {Object} Aptitude comparison
   */
  static compareAptitudesAcrossGroups(grupos) {
    const comparison = {};
    const groupKeys = Object.keys(grupos);
    
    // Get all aptitudes present in any group
    const allAptitudes = new Set();
    groupKeys.forEach(groupKey => {
      const group = grupos[groupKey];
      Object.keys(group.estadisticas.promedios || {}).forEach(aptitud => {
        allAptitudes.add(aptitud);
      });
    });

    // Compare each aptitude across groups
    allAptitudes.forEach(aptitudCode => {
      comparison[aptitudCode] = {
        grupos: {},
        mejor_grupo: null,
        mayor_diferencia: 0
      };

      let maxPercentil = -1;
      let minPercentil = 101;
      let bestGroup = null;

      groupKeys.forEach(groupKey => {
        const groupStats = grupos[groupKey].estadisticas.promedios[aptitudCode];
        if (groupStats) {
          comparison[aptitudCode].grupos[groupKey] = groupStats;
          
          if (groupStats.percentil > maxPercentil) {
            maxPercentil = groupStats.percentil;
            bestGroup = groupKey;
          }
          
          if (groupStats.percentil < minPercentil) {
            minPercentil = groupStats.percentil;
          }
        }
      });

      comparison[aptitudCode].mejor_grupo = bestGroup;
      comparison[aptitudCode].mayor_diferencia = maxPercentil - minPercentil;
    });

    return comparison;
  }

  /**
   * Generate executive summary
   * @param {Object} comparativeData - Comparative analysis data
   * @returns {Object} Executive summary
   */
  static generateExecutiveSummary(comparativeData) {
    const summary = {
      total_grupos: Object.keys(comparativeData.grupos).length,
      total_pacientes: Object.values(comparativeData.grupos).reduce((sum, group) => sum + group.estadisticas.count, 0),
      aptitudes_evaluadas: Object.keys(comparativeData.aptitudes_comparadas).length,
      hallazgos_principales: [],
      recomendaciones_clave: []
    };

    // Generate key findings
    const aptitudesComparadas = comparativeData.aptitudes_comparadas;
    Object.keys(aptitudesComparadas).forEach(aptitudCode => {
      const aptitudData = aptitudesComparadas[aptitudCode];
      if (aptitudData.mayor_diferencia > 20) {
        summary.hallazgos_principales.push(
          `Diferencia significativa en ${aptitudCode}: ${aptitudData.mayor_diferencia} puntos entre grupos`
        );
      }
    });

    return summary;
  }

  /**
   * Calculate age from birth date
   * @param {string} birthDate - Birth date string
   * @returns {number} Age in years
   */
  static calculateAge(birthDate) {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Get age group classification
   * @param {number} age - Age in years
   * @returns {string} Age group
   */
  static getAgeGroup(age) {
    if (age < 12) return 'Niños (< 12 años)';
    if (age < 15) return 'Adolescentes tempranos (12-14 años)';
    if (age < 18) return 'Adolescentes (15-17 años)';
    if (age < 25) return 'Jóvenes adultos (18-24 años)';
    return 'Adultos (25+ años)';
  }

  /**
   * Calculate general statistics for all patients
   * @param {Array} patientsData - All patients data
   * @returns {Object} General statistics
   */
  static calculateGroupStatistics(patientsData) {
    return {
      total_pacientes: patientsData.length,
      distribucion_genero: this.calculateGenderDistribution(patientsData),
      rango_edades: this.calculateAgeRange(patientsData),
      instituciones_representadas: this.getUniqueInstitutions(patientsData),
      promedio_tests_por_paciente: this.calculateAverageTestsPerPatient(patientsData)
    };
  }

  /**
   * Generate group recommendations
   * @param {Object} comparativeData - Comparative analysis data
   * @returns {Array} Recommendations
   */
  static generateGroupRecommendations(comparativeData) {
    const recommendations = [];
    
    // Analyze aptitude differences
    Object.keys(comparativeData.aptitudes_comparadas).forEach(aptitudCode => {
      const aptitudData = comparativeData.aptitudes_comparadas[aptitudCode];
      
      if (aptitudData.mayor_diferencia > 25) {
        recommendations.push({
          tipo: 'diferencia_significativa',
          aptitud: aptitudCode,
          descripcion: `Se observa una diferencia significativa de ${aptitudData.mayor_diferencia} puntos en ${aptitudCode} entre grupos`,
          recomendacion: `Considerar estrategias de intervención específicas para los grupos con menor rendimiento en ${aptitudCode}`
        });
      }
    });

    return recommendations;
  }

  // Helper methods for statistics calculation
  static calculateGenderDistribution(patientsData) {
    const distribution = { masculino: 0, femenino: 0, no_especificado: 0 };
    
    patientsData.forEach(({ patient }) => {
      const gender = patient.genero?.toLowerCase();
      if (gender?.startsWith('m')) {
        distribution.masculino++;
      } else if (gender?.startsWith('f')) {
        distribution.femenino++;
      } else {
        distribution.no_especificado++;
      }
    });
    
    return distribution;
  }

  static calculateAgeRange(patientsData) {
    const ages = patientsData
      .map(({ patient }) => this.calculateAge(patient.fecha_nacimiento))
      .filter(age => age > 0);
    
    if (ages.length === 0) return { min: 0, max: 0, promedio: 0 };
    
    return {
      min: Math.min(...ages),
      max: Math.max(...ages),
      promedio: Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length)
    };
  }

  static getUniqueInstitutions(patientsData) {
    const institutions = new Set();
    patientsData.forEach(({ patient }) => {
      if (patient.instituciones?.nombre) {
        institutions.add(patient.instituciones.nombre);
      }
    });
    return Array.from(institutions);
  }

  static calculateAverageTestsPerPatient(patientsData) {
    if (patientsData.length === 0) return 0;
    
    const totalTests = patientsData.reduce((sum, { stats }) => {
      return sum + (stats.totalTests || 0);
    }, 0);
    
    return Math.round((totalTests / patientsData.length) * 10) / 10;
  }
}

export default BatchReportService;