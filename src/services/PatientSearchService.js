/**
 * @file PatientSearchService.js
 * @description Advanced search service for patients with BAT-7 results
 */

import supabase from '../api/supabaseClient';

class PatientSearchService {
  /**
   * Search patients with advanced filters
   * @param {Object} filters - Search filters
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Search results with pagination
   */
  static async searchPatients(filters = {}, pagination = { page: 1, limit: 20 }) {
    try {
      const {
        institution = null,
        gender = null,
        dateFrom = null,
        dateTo = null,
        patientName = '',
        document = '',
        testStatus = 'all', // 'completed', 'partial', 'all'
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = filters;

      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // Build base query
      let query = supabase
        .from('pacientes')
        .select(`
          id,
          nombre,
          apellido,
          documento,
          genero,
          fecha_nacimiento,
          created_at,
          instituciones:institucion_id (
            id,
            nombre,
            codigo
          ),
          resultados (
            id,
            created_at,
            aptitudes (
              codigo,
              nombre
            )
          )
        `, { count: 'exact' });

      // Apply filters
      if (institution) {
        query = query.eq('institucion_id', institution);
      }

      if (gender && gender !== 'all') {
        query = query.eq('genero', gender);
      }

      if (patientName.trim()) {
        const searchTerm = `%${patientName.trim()}%`;
        query = query.or(`nombre.ilike.${searchTerm},apellido.ilike.${searchTerm}`);
      }

      if (document.trim()) {
        query = query.ilike('documento', `%${document.trim()}%`);
      }

      // Filter by test date range
      if (dateFrom || dateTo) {
        // This requires a more complex query - we'll filter after getting results
        // or use a different approach with joins
      }

      // Apply sorting
      const sortColumn = sortBy === 'name' ? 'nombre' : sortBy;
      query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: patients, error, count } = await query;

      if (error) {
        throw new Error(`Error en búsqueda: ${error.message}`);
      }

      // Post-process results to filter by test criteria
      const processedPatients = await this.processSearchResults(
        patients || [], 
        { dateFrom, dateTo, testStatus }
      );

      return {
        patients: processedPatients,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        hasNextPage: page * limit < (count || 0),
        hasPrevPage: page > 1
      };

    } catch (error) {
      console.error('Error in searchPatients:', error);
      throw error;
    }
  }

  /**
   * Process search results to apply additional filters
   * @param {Array} patients - Raw patient data
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Processed patient data
   */
  static async processSearchResults(patients, filters) {
    const { dateFrom, dateTo, testStatus } = filters;

    return patients.map(patient => {
      const results = patient.resultados || [];
      
      // Filter results by date range
      let filteredResults = results;
      if (dateFrom || dateTo) {
        filteredResults = results.filter(result => {
          const testDate = new Date(result.created_at);
          const fromDate = dateFrom ? new Date(dateFrom) : null;
          const toDate = dateTo ? new Date(dateTo) : null;
          
          if (fromDate && testDate < fromDate) return false;
          if (toDate && testDate > toDate) return false;
          return true;
        });
      }

      // Calculate test statistics
      const testCount = filteredResults.length;
      const aptitudes = filteredResults.map(r => r.aptitudes?.codigo).filter(Boolean);
      const uniqueAptitudes = [...new Set(aptitudes)];
      const lastTestDate = filteredResults.length > 0 
        ? filteredResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0].created_at
        : null;

      // Determine test status
      const totalPossibleTests = 8; // BAT-7 has 8 aptitudes
      let status = 'no_tests';
      if (testCount === 0) {
        status = 'no_tests';
      } else if (uniqueAptitudes.length < totalPossibleTests) {
        status = 'partial';
      } else {
        status = 'completed';
      }

      // Apply test status filter
      if (testStatus !== 'all') {
        if (testStatus === 'completed' && status !== 'completed') return null;
        if (testStatus === 'partial' && status !== 'partial') return null;
        if (testStatus === 'no_tests' && status !== 'no_tests') return null;
      }

      return {
        ...patient,
        testSummary: {
          testCount,
          uniqueAptitudesCount: uniqueAptitudes.length,
          aptitudes: uniqueAptitudes,
          lastTestDate,
          status,
          completionPercentage: Math.round((uniqueAptitudes.length / totalPossibleTests) * 100)
        },
        resultados: filteredResults // Return filtered results
      };
    }).filter(Boolean); // Remove null entries
  }

  /**
   * Get institutions for filter dropdown
   * @returns {Promise<Array>} List of institutions
   */
  static async getInstitutions() {
    try {
      const { data: institutions, error } = await supabase
        .from('instituciones')
        .select('id, nombre, codigo')
        .order('nombre');

      if (error) {
        throw new Error(`Error al obtener instituciones: ${error.message}`);
      }

      return institutions || [];

    } catch (error) {
      console.error('Error in getInstitutions:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions for patient names
   * @param {string} query - Search query
   * @param {number} limit - Maximum suggestions
   * @returns {Promise<Array>} Name suggestions
   */
  static async getPatientNameSuggestions(query, limit = 10) {
    try {
      if (!query || query.length < 2) return [];

      const searchTerm = `%${query.trim()}%`;
      
      const { data: suggestions, error } = await supabase
        .from('pacientes')
        .select('id, nombre, apellido, documento')
        .or(`nombre.ilike.${searchTerm},apellido.ilike.${searchTerm}`)
        .limit(limit);

      if (error) {
        throw new Error(`Error en sugerencias: ${error.message}`);
      }

      return (suggestions || []).map(patient => ({
        id: patient.id,
        label: `${patient.nombre} ${patient.apellido}`,
        sublabel: patient.documento,
        value: `${patient.nombre} ${patient.apellido}`
      }));

    } catch (error) {
      console.error('Error in getPatientNameSuggestions:', error);
      return [];
    }
  }

  /**
   * Get quick stats for search results
   * @param {Object} filters - Current search filters
   * @returns {Promise<Object>} Search statistics
   */
  static async getSearchStats(filters = {}) {
    try {
      // Get total patients with results
      const { data: patientsWithResults, error: patientsError } = await supabase
        .from('pacientes')
        .select(`
          id,
          genero,
          institucion_id,
          resultados!inner (
            id,
            created_at
          )
        `);

      if (patientsError) {
        throw new Error(`Error al obtener estadísticas: ${patientsError.message}`);
      }

      const totalPatients = patientsWithResults?.length || 0;
      const maleCount = patientsWithResults?.filter(p => p.genero?.toLowerCase().startsWith('m')).length || 0;
      const femaleCount = patientsWithResults?.filter(p => p.genero?.toLowerCase().startsWith('f')).length || 0;

      // Get institution distribution
      const institutionCounts = {};
      patientsWithResults?.forEach(patient => {
        const instId = patient.institucion_id;
        institutionCounts[instId] = (institutionCounts[instId] || 0) + 1;
      });

      // Get date range
      const allDates = patientsWithResults?.flatMap(p => 
        p.resultados.map(r => new Date(r.created_at))
      ) || [];
      
      const earliestDate = allDates.length > 0 ? new Date(Math.min(...allDates)) : null;
      const latestDate = allDates.length > 0 ? new Date(Math.max(...allDates)) : null;

      return {
        totalPatients,
        genderDistribution: {
          male: maleCount,
          female: femaleCount
        },
        institutionDistribution: institutionCounts,
        dateRange: {
          earliest: earliestDate,
          latest: latestDate
        },
        totalTests: allDates.length
      };

    } catch (error) {
      console.error('Error in getSearchStats:', error);
      return {
        totalPatients: 0,
        genderDistribution: { male: 0, female: 0 },
        institutionDistribution: {},
        dateRange: { earliest: null, latest: null },
        totalTests: 0
      };
    }
  }

  /**
   * Export search results to CSV
   * @param {Array} patients - Patient data to export
   * @returns {string} CSV content
   */
  static exportToCSV(patients) {
    if (!patients || patients.length === 0) {
      return '';
    }

    const headers = [
      'ID',
      'Nombre',
      'Apellido', 
      'Documento',
      'Género',
      'Institución',
      'Tests Realizados',
      'Aptitudes Evaluadas',
      'Porcentaje Completado',
      'Última Evaluación',
      'Estado'
    ];

    const rows = patients.map(patient => [
      patient.id,
      patient.nombre,
      patient.apellido,
      patient.documento,
      patient.genero,
      patient.instituciones?.nombre || 'N/A',
      patient.testSummary?.testCount || 0,
      patient.testSummary?.uniqueAptitudesCount || 0,
      `${patient.testSummary?.completionPercentage || 0}%`,
      patient.testSummary?.lastTestDate 
        ? new Date(patient.testSummary.lastTestDate).toLocaleDateString('es-ES')
        : 'N/A',
      patient.testSummary?.status || 'no_tests'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }
}

export default PatientSearchService;