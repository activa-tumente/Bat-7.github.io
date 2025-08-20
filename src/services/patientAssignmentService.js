/**
 * Servicio para gestión de asignaciones de pacientes a psicólogos
 */

import supabase from '../api/supabaseClient';

class PatientAssignmentService {
  /**
   * Obtiene todas las asignaciones de pacientes
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getPatientAssignments(filters = {}) {
    try {
      let query = supabase
        .from('patient_assignments')
        .select(`
          *,
          candidato:candidatos(
            id,
            nombre,
            apellidos,
            documento_identidad,
            email,
            telefono,
            fecha_nacimiento,
            genero,
            nivel_educativo,
            ocupacion
          ),
          psicologo:usuarios!patient_assignments_psicologo_id_fkey(
            id,
            nombre,
            apellido,
            documento,
            tipo_usuario,
            institucion:instituciones(nombre)
          ),
          assigned_by_user:usuarios!patient_assignments_assigned_by_fkey(
            nombre,
            apellido
          )
        `);

      // Aplicar filtros
      if (filters.psicologo_id) {
        query = query.eq('psicologo_id', filters.psicologo_id);
      }

      if (filters.candidato_id) {
        query = query.eq('candidato_id', filters.candidato_id);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters.search) {
        // Buscar en nombre del candidato o psicólogo
        query = query.or(`candidato.nombre.ilike.%${filters.search}%,candidato.apellidos.ilike.%${filters.search}%,candidato.documento_identidad.ilike.%${filters.search}%`);
      }

      // Ordenamiento
      query = query.order('assigned_at', { ascending: false });

      // Paginación
      if (filters.page && filters.pageSize) {
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtiene las asignaciones de un psicólogo específico
   * @param {string} psicologoId - ID del psicólogo
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getPsychologistAssignments(psicologoId) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_assignments', { psicologo_id: psicologoId });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener asignaciones del psicólogo:', error);
      return { data: null, error };
    }
  }

  /**
   * Asigna un paciente a un psicólogo
   * @param {string} candidatoId - ID del candidato
   * @param {string} psicologoId - ID del psicólogo
   * @param {string} assignedBy - ID del usuario que hace la asignación
   * @param {string} notes - Notas adicionales
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async assignPatientToPsychologist(candidatoId, psicologoId, assignedBy, notes = '') {
    try {
      const { data, error } = await supabase
        .rpc('assign_patient_to_psychologist', {
          candidato_id: candidatoId,
          psicologo_id: psicologoId,
          assigned_by: assignedBy,
          notes: notes
        });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al asignar paciente:', error);
      return { data: null, error };
    }
  }

  /**
   * Desasigna un paciente de su psicólogo actual
   * @param {string} candidatoId - ID del candidato
   * @param {string} unassignedBy - ID del usuario que hace la desasignación
   * @param {string} reason - Razón de la desasignación
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async unassignPatient(candidatoId, unassignedBy, reason = '') {
    try {
      const { data, error } = await supabase
        .rpc('unassign_patient', {
          candidato_id: candidatoId,
          unassigned_by: unassignedBy,
          reason: reason
        });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error al desasignar paciente:', error);
      return { success: false, error };
    }
  }

  /**
   * Obtiene todos los candidatos disponibles para asignación
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getAvailableCandidates(filters = {}) {
    try {
      let query = supabase
        .from('candidatos')
        .select(`
          *,
          institucion:instituciones(nombre),
          current_assignment:patient_assignments!patient_assignments_candidato_id_fkey(
            id,
            psicologo_id,
            is_active,
            assigned_at,
            psicologo:usuarios(nombre, apellido)
          )
        `);

      // Aplicar filtros
      if (filters.unassigned_only) {
        query = query.is('psicologo_id', null);
      }

      if (filters.institucion_id) {
        query = query.eq('institucion_id', filters.institucion_id);
      }

      if (filters.search) {
        query = query.or(`nombre.ilike.%${filters.search}%,apellidos.ilike.%${filters.search}%,documento_identidad.ilike.%${filters.search}%`);
      }

      if (filters.activo !== undefined) {
        query = query.eq('activo', filters.activo);
      }

      // Ordenamiento
      query = query.order('nombre', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener candidatos disponibles:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtiene todos los psicólogos disponibles para asignación
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getAvailablePsychologists(filters = {}) {
    try {
      let query = supabase
        .from('psicologos')
        .select(`
          *,
          institucion:instituciones(nombre),
          assignment_count:patient_assignments(count)
        `)
        .eq('activo', true);

      // Aplicar filtros
      if (filters.institucion_id) {
        query = query.eq('institucion_id', filters.institucion_id);
      }

      if (filters.search) {
        query = query.or(`nombre.ilike.%${filters.search}%,apellido.ilike.%${filters.search}%,documento.ilike.%${filters.search}%`);
      }

      // Ordenamiento
      query = query.order('nombre', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener psicólogos disponibles:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtiene estadísticas de asignaciones
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async getAssignmentStatistics() {
    try {
      // Total de candidatos
      const { data: totalCandidates, error: totalCandidatesError } = await supabase
        .from('candidatos')
        .select('id', { count: 'exact' })
        .eq('activo', true);

      if (totalCandidatesError) throw totalCandidatesError;

      // Candidatos asignados
      const { data: assignedCandidates, error: assignedCandidatesError } = await supabase
        .from('candidatos')
        .select('id', { count: 'exact' })
        .not('psicologo_id', 'is', null)
        .eq('activo', true);

      if (assignedCandidatesError) throw assignedCandidatesError;

      // Candidatos sin asignar
      const { data: unassignedCandidates, error: unassignedCandidatesError } = await supabase
        .from('candidatos')
        .select('id', { count: 'exact' })
        .is('psicologo_id', null)
        .eq('activo', true);

      if (unassignedCandidatesError) throw unassignedCandidatesError;

      // Total de psicólogos
      const { data: totalPsychologists, error: totalPsychologistsError } = await supabase
        .from('psicologos')
        .select('id', { count: 'exact' })
        .eq('activo', true);

      if (totalPsychologistsError) throw totalPsychologistsError;

      // Asignaciones por psicólogo
      const { data: assignmentsByPsychologist, error: assignmentsByPsychologistError } = await supabase
        .from('patient_assignments')
        .select(`
          psicologo_id,
          psicologo:usuarios(nombre, apellido),
          count:candidato_id
        `)
        .eq('is_active', true);

      if (assignmentsByPsychologistError) throw assignmentsByPsychologistError;

      // Agrupar asignaciones por psicólogo
      const psychologistStats = assignmentsByPsychologist.reduce((acc, assignment) => {
        const key = assignment.psicologo_id;
        if (!acc[key]) {
          acc[key] = {
            psicologo: assignment.psicologo,
            count: 0
          };
        }
        acc[key].count++;
        return acc;
      }, {});

      return {
        data: {
          totalCandidates: totalCandidates.length,
          assignedCandidates: assignedCandidates.length,
          unassignedCandidates: unassignedCandidates.length,
          totalPsychologists: totalPsychologists.length,
          assignmentsByPsychologist: Object.values(psychologistStats),
          assignmentPercentage: totalCandidates.length > 0 
            ? Math.round((assignedCandidates.length / totalCandidates.length) * 100) 
            : 0
        },
        error: null
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de asignaciones:', error);
      return { data: null, error };
    }
  }

  /**
   * Transfiere múltiples pacientes de un psicólogo a otro
   * @param {Array} candidateIds - IDs de los candidatos a transferir
   * @param {string} fromPsychologistId - ID del psicólogo origen
   * @param {string} toPsychologistId - ID del psicólogo destino
   * @param {string} transferredBy - ID del usuario que hace la transferencia
   * @param {string} reason - Razón de la transferencia
   * @returns {Promise<{success: boolean, results: Array, error: Object}>}
   */
  async transferPatients(candidateIds, fromPsychologistId, toPsychologistId, transferredBy, reason = '') {
    try {
      const results = [];
      
      for (const candidateId of candidateIds) {
        try {
          // Desasignar del psicólogo actual
          await this.unassignPatient(candidateId, transferredBy, `Transferencia: ${reason}`);
          
          // Asignar al nuevo psicólogo
          const assignResult = await this.assignPatientToPsychologist(
            candidateId, 
            toPsychologistId, 
            transferredBy, 
            `Transferido desde otro psicólogo. Razón: ${reason}`
          );
          
          results.push({
            candidateId,
            success: true,
            assignmentId: assignResult.data
          });
        } catch (error) {
          results.push({
            candidateId,
            success: false,
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      
      return {
        success: successCount === candidateIds.length,
        results,
        successCount,
        totalCount: candidateIds.length,
        error: null
      };
    } catch (error) {
      console.error('Error al transferir pacientes:', error);
      return { success: false, results: [], error };
    }
  }
}

export default new PatientAssignmentService();
