import supabase from '../api/supabaseClient';

/**
 * Servicio mejorado para interactuar con Supabase
 * Proporciona funciones para gestionar instituciones, psicólogos y pacientes
 * con manejo de errores, caché y recuperación resiliente
 */
class EnhancedSupabaseService {
  constructor() {
    this.cache = {
      institutions: { data: null, timestamp: null },
      psychologists: { data: null, timestamp: null },
      patients: { data: null, timestamp: null },
    };

    // Tiempo de expiración de caché en minutos
    this.cacheTTL = 5;
  }

  /**
   * Verifica si hay un error en la respuesta de Supabase y lo formatea
   * @param {Object} error - Error de Supabase
   * @returns {Object} - Error formateado
   */
  _handleError(error) {
    console.error('Error en servicio Supabase:', error);

    // Formato estándar para errores
    return {
      message: error.message || 'Error desconocido',
      code: error.code || 'UNKNOWN_ERROR',
      details: error.details || null,
      hint: error.hint || null,
    };
  }

  /**
   * Verifica si el caché para una entidad está vigente
   * @param {string} entity - Nombre de la entidad (institutions, psychologists, patients)
   * @returns {boolean} - true si el caché es válido, false en caso contrario
   */
  _isCacheValid(entity) {
    if (!this.cache[entity] || !this.cache[entity].timestamp) return false;

    const now = new Date();
    const cacheTime = new Date(this.cache[entity].timestamp);
    const diffMinutes = (now - cacheTime) / 60000;

    return diffMinutes < this.cacheTTL;
  }

  /**
   * Actualiza el caché para una entidad
   * @param {string} entity - Nombre de la entidad
   * @param {Array} data - Datos a almacenar en caché
   */
  _updateCache(entity, data) {
    this.cache[entity] = {
      data: [...data], // Copia para evitar mutaciones
      timestamp: new Date()
    };
  }

  // ========== INSTITUCIONES ==========

  /**
   * Obtiene la lista de instituciones
   * @param {string} sortField - Campo para ordenar
   * @param {string} sortOrder - Dirección del ordenamiento (asc, desc)
   * @returns {Promise<Object>} - { data, error, source }
   */
  async getInstitutions(sortField = 'nombre', sortOrder = 'asc') {
    try {
      // Verificar caché primero
      if (this._isCacheValid('institutions')) {
        const cachedData = [...this.cache.institutions.data];

        // Ordenar en memoria si es necesario
        if (sortField) {
          cachedData.sort((a, b) => {
            if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
            if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
            return 0;
          });
        }

        return {
          data: cachedData,
          error: null,
          source: 'cache'
        };
      }

      // Obtener datos frescos de la base de datos
      let query = supabase.from('instituciones').select('*');

      // Agregar ordenamiento si se especificó
      if (sortField) {
        query = query.order(sortField, { ascending: sortOrder === 'asc' });
      }

      const { data, error } = await query;

      // Manejar error
      if (error) throw error;

      // Actualizar caché con datos nuevos
      this._updateCache('institutions', data);

      return { data, error: null, source: 'database' };
    } catch (error) {
      return {
        data: this.cache.institutions.data || [],
        error: this._handleError(error),
        source: 'fallback'
      };
    }
  }

  /**
   * Crea una nueva institución
   * @param {Object} institutionData - Datos de la institución
   * @returns {Promise<Object>} - { data, error }
   */
  async createInstitution(institutionData) {
    try {
      // Sanitizar datos
      const cleanData = {
        nombre: institutionData.nombre?.trim() || 'Sin nombre',
        tipo: institutionData.tipo || null,
        direccion: institutionData.direccion || null,
        telefono: institutionData.telefono || null,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Insertar en la base de datos
      const { data, error } = await supabase
        .from('instituciones')
        .insert([cleanData])
        .select();

      // Manejar error
      if (error) throw error;

      // Actualizar caché
      if (this.cache.institutions.data) {
        this.cache.institutions.data.push(data[0]);
      }

      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: this._handleError(error) };
    }
  }

  /**
   * Actualiza una institución existente
   * @param {string} id - ID de la institución
   * @param {Object} institutionData - Datos actualizados
   * @returns {Promise<Object>} - { data, error }
   */
  async updateInstitution(id, institutionData) {
    try {
      // Validar ID
      if (!id) throw new Error('ID de institución requerido');

      // Sanitizar datos
      const cleanData = {
        nombre: institutionData.nombre?.trim() || 'Sin nombre',
        tipo: institutionData.tipo || null,
        direccion: institutionData.direccion || null,
        telefono: institutionData.telefono || null,
        updated_at: new Date()
      };

      // Actualizar en la base de datos
      const { data, error } = await supabase
        .from('instituciones')
        .update(cleanData)
        .eq('id', id)
        .select();

      // Manejar error
      if (error) throw error;

      // Actualizar caché si existe
      if (this.cache.institutions.data) {
        const index = this.cache.institutions.data.findIndex(i => i.id === id);
        if (index >= 0) {
          this.cache.institutions.data[index] = data[0];
        }
      }

      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: this._handleError(error) };
    }
  }

  /**
   * Elimina una institución
   * @param {string} id - ID de la institución
   * @returns {Promise<Object>} - { error }
   */
  async deleteInstitution(id) {
    try {
      // Validar ID
      if (!id) throw new Error('ID de institución requerido');

      // Eliminar de la base de datos
      const { error } = await supabase
        .from('instituciones')
        .delete()
        .eq('id', id);

      // Manejar error
      if (error) throw error;

      // Actualizar caché si existe
      if (this.cache.institutions.data) {
        this.cache.institutions.data = this.cache.institutions.data.filter(i => i.id !== id);
      }

      return { error: null };
    } catch (error) {
      return { error: this._handleError(error) };
    }
  }

  // ========== PSICÓLOGOS ==========

  /**
   * Obtiene la lista de psicólogos
   * @param {string} sortField - Campo para ordenar
   * @param {string} sortOrder - Dirección del ordenamiento (asc, desc)
   * @returns {Promise<Object>} - { data, error, source }
   */
  async getPsychologists(sortField = 'nombre', sortOrder = 'asc') {
    try {
      // Verificar caché primero
      if (this._isCacheValid('psychologists')) {
        const cachedData = [...this.cache.psychologists.data];

        // Ordenar en memoria si es necesario
        if (sortField) {
          cachedData.sort((a, b) => {
            if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
            if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
            return 0;
          });
        }

        return {
          data: cachedData,
          error: null,
          source: 'cache'
        };
      }

      // Obtener datos frescos de la base de datos
      let query = supabase
        .from('psicologos')
        .select(`
          *,
          instituciones (id, nombre)
        `);

      // Agregar ordenamiento si se especificó
      if (sortField) {
        query = query.order(sortField, { ascending: sortOrder === 'asc' });
      }

      const { data, error } = await query;

      // Manejar error
      if (error) throw error;

      // Actualizar caché con datos nuevos
      this._updateCache('psychologists', data);

      return { data, error: null, source: 'database' };
    } catch (error) {
      return {
        data: this.cache.psychologists.data || [],
        error: this._handleError(error),
        source: 'fallback'
      };
    }
  }

  /**
   * Crea un nuevo psicólogo
   * @param {Object} psychologistData - Datos del psicólogo
   * @returns {Promise<Object>} - { data, error }
   */
  async createPsychologist(psychologistData) {
    try {
      // Sanitizar datos
      const cleanData = {
        nombre: psychologistData.nombre?.trim() || 'Sin nombre',
        apellido: psychologistData.apellido?.trim() || psychologistData.apellidos?.trim() || '',
        genero: psychologistData.genero || null,
        email: psychologistData.email || null,
        documento_identidad: psychologistData.documento_identidad || null,
        telefono: psychologistData.telefono || null,
        institucion_id: psychologistData.institucion_id || null,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Insertar en la base de datos
      const { data, error } = await supabase
        .from('psicologos')
        .insert([cleanData])
        .select();

      // Manejar error
      if (error) throw error;

      // Actualizar caché
      if (this.cache.psychologists.data) {
        this.cache.psychologists.data.push(data[0]);
      }

      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: this._handleError(error) };
    }
  }

  /**
   * Actualiza un psicólogo existente
   * @param {string} id - ID del psicólogo
   * @param {Object} psychologistData - Datos actualizados
   * @returns {Promise<Object>} - { data, error }
   */
  async updatePsychologist(id, psychologistData) {
    try {
      // Validar ID
      if (!id) throw new Error('ID de psicólogo requerido');

      // Sanitizar datos
      const cleanData = {
        nombre: psychologistData.nombre?.trim() || 'Sin nombre',
        apellido: psychologistData.apellido?.trim() || psychologistData.apellidos?.trim() || '',
        genero: psychologistData.genero || null,
        documento_identidad: psychologistData.documento_identidad || null,
        telefono: psychologistData.telefono || null,
        institucion_id: psychologistData.institucion_id || null,
        updated_at: new Date()
      };

      // Actualizar en la base de datos
      const { data, error } = await supabase
        .from('psicologos')
        .update(cleanData)
        .eq('id', id)
        .select();

      // Manejar error
      if (error) throw error;

      // Actualizar caché si existe
      if (this.cache.psychologists.data) {
        const index = this.cache.psychologists.data.findIndex(p => p.id === id);
        if (index >= 0) {
          this.cache.psychologists.data[index] = {
            ...this.cache.psychologists.data[index],
            ...data[0]
          };
        }
      }

      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: this._handleError(error) };
    }
  }

  /**
   * Elimina un psicólogo
   * @param {string} id - ID del psicólogo
   * @returns {Promise<Object>} - { error }
   */
  async deletePsychologist(id) {
    try {
      // Validar ID
      if (!id) throw new Error('ID de psicólogo requerido');

      // Eliminar de la base de datos
      const { error } = await supabase
        .from('psicologos')
        .delete()
        .eq('id', id);

      // Manejar error
      if (error) throw error;

      // Actualizar caché si existe
      if (this.cache.psychologists.data) {
        this.cache.psychologists.data = this.cache.psychologists.data.filter(p => p.id !== id);
      }

      return { error: null };
    } catch (error) {
      return { error: this._handleError(error) };
    }
  }

  // ========== PACIENTES ==========

  /**
   * Obtiene la lista de pacientes
   * @param {string} sortField - Campo para ordenar
   * @param {string} sortOrder - Dirección del ordenamiento (asc, desc)
   * @returns {Promise<Object>} - { data, error, source }
   */
  async getPatients(sortField = 'nombre', sortOrder = 'asc') {
    try {
      // Verificar caché primero
      if (this._isCacheValid('patients')) {
        const cachedData = [...this.cache.patients.data];

        // Ordenar en memoria si es necesario
        if (sortField) {
          cachedData.sort((a, b) => {
            if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
            if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
            return 0;
          });
        }

        return {
          data: cachedData,
          error: null,
          source: 'cache'
        };
      }

      // Obtener datos frescos de la base de datos con relaciones
      let query = supabase
        .from('pacientes')
        .select(`
          *,
          instituciones (id, nombre),
          psicologos (id, nombre, apellido)
        `);

      // Agregar ordenamiento si se especificó
      if (sortField) {
        query = query.order(sortField, { ascending: sortOrder === 'asc' });
      }

      const { data, error } = await query;

      // Manejar error
      if (error) throw error;

      // Actualizar caché con datos nuevos
      this._updateCache('patients', data);

      return { data, error: null, source: 'database' };
    } catch (error) {
      return {
        data: this.cache.patients.data || [],
        error: this._handleError(error),
        source: 'fallback'
      };
    }
  }

  /**
   * Crea un nuevo paciente
   * @param {Object} patientData - Datos del paciente
   * @returns {Promise<Object>} - { data, error }
   */
  async createPatient(patientData) {
    try {
      // Sanitizar datos
      const cleanData = {
        nombre: patientData.nombre?.trim() || 'Sin nombre',
        apellido: patientData.apellido?.trim() || patientData.apellidos?.trim() || '',
        fecha_nacimiento: patientData.fecha_nacimiento || null,
        genero: patientData.genero || null,
        documento_identidad: patientData.documento_identidad || null,
        email: patientData.email || null,
        telefono: patientData.telefono || null,
        institucion_id: patientData.institucion_id || null,
        psicologo_id: patientData.psicologo_id || null,
        notas: patientData.notas || null,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Insertar en la base de datos
      const { data, error } = await supabase
        .from('pacientes')
        .insert([cleanData])
        .select();

      // Manejar error
      if (error) throw error;

      // Actualizar caché
      if (this.cache.patients.data) {
        this.cache.patients.data.push(data[0]);
      }

      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: this._handleError(error) };
    }
  }

  /**
   * Actualiza un paciente existente
   * @param {string} id - ID del paciente
   * @param {Object} patientData - Datos actualizados
   * @returns {Promise<Object>} - { data, error }
   */
  async updatePatient(id, patientData) {
    try {
      // Validar ID
      if (!id) throw new Error('ID de paciente requerido');

      // Sanitizar datos
      const cleanData = {
        nombre: patientData.nombre?.trim() || 'Sin nombre',
        apellido: patientData.apellido?.trim() || patientData.apellidos?.trim() || '',
        fecha_nacimiento: patientData.fecha_nacimiento || null,
        genero: patientData.genero || null,
        documento_identidad: patientData.documento_identidad || null,
        email: patientData.email || null,
        telefono: patientData.telefono || null,
        institucion_id: patientData.institucion_id || null,
        psicologo_id: patientData.psicologo_id || null,
        notas: patientData.notas || null,
        updated_at: new Date()
      };

      // Actualizar en la base de datos
      const { data, error } = await supabase
        .from('pacientes')
        .update(cleanData)
        .eq('id', id)
        .select();

      // Manejar error
      if (error) throw error;

      // Actualizar caché si existe
      if (this.cache.patients.data) {
        const index = this.cache.patients.data.findIndex(p => p.id === id);
        if (index >= 0) {
          this.cache.patients.data[index] = {
            ...this.cache.patients.data[index],
            ...data[0]
          };
        }
      }

      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: this._handleError(error) };
    }
  }

  /**
   * Elimina un paciente
   * @param {string} id - ID del paciente
   * @returns {Promise<Object>} - { error }
   */
  async deletePatient(id) {
    try {
      // Validar ID
      if (!id) throw new Error('ID de paciente requerido');

      // Eliminar de la base de datos
      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', id);

      // Manejar error
      if (error) throw error;

      // Actualizar caché si existe
      if (this.cache.patients.data) {
        this.cache.patients.data = this.cache.patients.data.filter(p => p.id !== id);
      }

      return { error: null };
    } catch (error) {
      return { error: this._handleError(error) };
    }
  }

  /**
   * Simula obtener información del usuario actual (siempre administrador)
   * @returns {Promise<Object>} - { data, error }
   */
  async getCurrentUser() {
    try {
      // Usuario mock para autenticación desactivada
      const mockUser = {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'admin@example.com',
        role: 'admin',
        is_admin: true
      };

      return { data: mockUser, error: null };
    } catch (error) {
      return { data: null, error: this._handleError(error) };
    }
  }

  /**
   * Simula verificar si el usuario actual tiene rol de administrador (siempre true)
   * @returns {Promise<Object>} - { data, error }
   */
  async getUserRole() {
    try {
      // Datos mock para autenticación desactivada
      const mockRole = {
        role: 'admin',
        is_admin: true
      };

      return { data: mockRole, error: null };
    } catch (error) {
      return { data: null, error: this._handleError(error) };
    }
  }

  /**
   * Simula verificar si el usuario actual tiene permisos de administrador (siempre true)
   * @returns {Promise<Object>} - { data, error }
   */
  async isAdmin() {
    return { data: true, error: null };
  }

  /**
   * Limpia el caché del servicio
   * @param {string} entity - Nombre de la entidad a limpiar (opcional, limpia todo si no se proporciona)
   * @returns {void}
   */
  clearCache(entity = null) {
    if (entity && this.cache[entity]) {
      this.cache[entity] = { data: null, timestamp: null };
    } else {
      // Limpiar todo el caché
      Object.keys(this.cache).forEach(key => {
        this.cache[key] = { data: null, timestamp: null };
      });
    }
  }
}

// Exportar una instancia única del servicio
const enhancedSupabaseService = new EnhancedSupabaseService();

export default enhancedSupabaseService;
