import supabase from '../api/supabaseClient';
import { calculateAge } from '../utils/entityUtils.jsx';

/**
 * Servicio para la gestión de candidatos
 * Utiliza el esquema robusto con la tabla 'candidatos'
 */
class CandidateService {
  
  /**
   * Obtiene la lista de candidatos con filtros y paginación
   */
  async getCandidates(options = {}) {
    try {
      const {
        page = 1,
        pageSize = 50,
        sortField = 'nombre',
        sortDirection = 'asc',
        filters = {},
        searchTerm = ''
      } = options;

      let query = supabase
        .from('candidatos')
        .select(`
          *,
          instituciones(id, nombre),
          psicologos(id, nombre, apellidos)
        `, { count: 'exact' })
        .eq('activo', true);

      // Aplicar filtros
      if (filters.institucion_id) {
        query = query.eq('institucion_id', filters.institucion_id);
      }
      
      if (filters.genero) {
        query = query.eq('genero', filters.genero);
      }
      
      if (filters.psicologo_id) {
        if (filters.psicologo_id === 'null') {
          query = query.is('psicologo_id', null);
        } else {
          query = query.eq('psicologo_id', filters.psicologo_id);
        }
      }

      // Búsqueda por término
      if (searchTerm) {
        query = query.or(`nombre.ilike.%${searchTerm}%,apellidos.ilike.%${searchTerm}%,documento_identidad.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      // Ordenamiento
      const ascending = sortDirection === 'asc';
      query = query.order(sortField, { ascending });

      // Paginación
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Calcular edad para cada candidato
      const candidatesWithAge = (data || []).map(candidate => ({
        ...candidate,
        edad: calculateAge(candidate.fecha_nacimiento),
        institucion_nombre: candidate.instituciones?.nombre,
        psicologo_nombre: candidate.psicologos ? 
          `${candidate.psicologos.nombre} ${candidate.psicologos.apellidos}` : null
      }));

      return {
        data: candidatesWithAge,
        count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize)
      };

    } catch (error) {
      console.error('Error al obtener candidatos:', error);
      throw error;
    }
  }

  /**
   * Obtiene un candidato por ID
   */
  async getCandidateById(id) {
    try {
      const { data, error } = await supabase
        .from('candidatos')
        .select(`
          *,
          instituciones(id, nombre),
          psicologos(id, nombre, apellidos)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...data,
        edad: calculateAge(data.fecha_nacimiento)
      };

    } catch (error) {
      console.error('Error al obtener candidato:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo candidato
   */
  async createCandidate(candidateData) {
    try {
      // Validar datos requeridos
      const requiredFields = ['nombre', 'apellidos', 'fecha_nacimiento', 'genero', 'documento_identidad', 'institucion_id'];
      
      for (const field of requiredFields) {
        if (!candidateData[field]) {
          throw new Error(`El campo ${field} es requerido`);
        }
      }

      // Verificar que no exista otro candidato con el mismo documento
      const { data: existing } = await supabase
        .from('candidatos')
        .select('id')
        .eq('documento_identidad', candidateData.documento_identidad)
        .single();

      if (existing) {
        throw new Error('Ya existe un candidato con este documento de identidad');
      }

      const { data, error } = await supabase
        .from('candidatos')
        .insert([{
          ...candidateData,
          activo: true,
          fecha_registro: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('Error al crear candidato:', error);
      throw error;
    }
  }

  /**
   * Actualiza un candidato existente
   */
  async updateCandidate(id, candidateData) {
    try {
      // Si se está actualizando el documento, verificar que no exista otro candidato con el mismo
      if (candidateData.documento_identidad) {
        const { data: existing } = await supabase
          .from('candidatos')
          .select('id')
          .eq('documento_identidad', candidateData.documento_identidad)
          .neq('id', id)
          .single();

        if (existing) {
          throw new Error('Ya existe otro candidato con este documento de identidad');
        }
      }

      const { data, error } = await supabase
        .from('candidatos')
        .update({
          ...candidateData,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('Error al actualizar candidato:', error);
      throw error;
    }
  }

  /**
   * Elimina un candidato (soft delete)
   */
  async deleteCandidate(id) {
    try {
      const { data, error } = await supabase
        .from('candidatos')
        .update({ 
          activo: false,
          fecha_eliminacion: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('Error al eliminar candidato:', error);
      throw error;
    }
  }

  /**
   * Asigna un psicólogo a un candidato
   */
  async assignPsychologist(candidateId, psychologistId) {
    try {
      const { data, error } = await supabase
        .from('candidatos')
        .update({ 
          psicologo_id: psychologistId,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', candidateId)
        .select()
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('Error al asignar psicólogo:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de candidatos
   */
  async getCandidateStats() {
    try {
      // Total de candidatos activos
      const { count: totalActive } = await supabase
        .from('candidatos')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true);

      // Candidatos por género
      const { data: genderStats } = await supabase
        .from('candidatos')
        .select('genero')
        .eq('activo', true);

      // Candidatos por institución
      const { data: institutionStats } = await supabase
        .from('candidatos')
        .select(`
          institucion_id,
          instituciones(nombre)
        `)
        .eq('activo', true);

      // Candidatos sin psicólogo asignado
      const { count: unassigned } = await supabase
        .from('candidatos')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)
        .is('psicologo_id', null);

      return {
        totalActive: totalActive || 0,
        unassigned: unassigned || 0,
        byGender: this._groupBy(genderStats || [], 'genero'),
        byInstitution: this._groupBy(institutionStats || [], 'institucion_id')
      };

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  /**
   * Función auxiliar para agrupar datos
   */
  _groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) {
        result[group] = 0;
      }
      result[group]++;
      return result;
    }, {});
  }
}

export default new CandidateService();
