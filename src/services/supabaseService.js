import supabase from '../api/supabaseClient';

/**
 * Función para registrar acciones en la tabla logs
 * @param {string} action - Acción realizada (create, update, delete)
 * @param {string} tableName - Nombre de la tabla
 * @param {string} recordId - ID del registro
 * @param {Object} data - Datos del registro
 */
const logAction = async (action, tableName, recordId, data) => {
  try {
    await supabase.from('logs').insert({
      action,
      table_name: tableName,
      record_id: recordId,
      data,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al registrar acción:', error);
  }
};

/**
 * Servicio para interactuar con Supabase
 * Proporciona funciones para realizar operaciones CRUD en las tablas
 */
const supabaseService = {
  /**
   * Verifica la conexión a Supabase
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async checkConnection() {
    try {
      const { data, error } = await supabase.rpc('get_tables');
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al verificar conexión:', error);
      return { success: false, error };
    }
  },
  /**
   * Obtiene todas las instituciones
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getInstitutions() {
    return await supabase
      .from('instituciones')
      .select('*')
      .order('nombre', { ascending: true });
  },

  /**
   * Crea una nueva institución
   * @param {Object} institutionData - Datos de la institución
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async createInstitution(institutionData) {
    // Asegurar que los campos coincidan con la estructura de la tabla
    const dataToInsert = {
      nombre: institutionData.nombre,
      direccion: institutionData.direccion || '',
      telefono: institutionData.telefono || '',
      email: institutionData.email || '',
      sitio_web: institutionData.sitio_web || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const result = await supabase
      .from('instituciones')
      .insert([dataToInsert])
      .select();

    // Registrar acción si fue exitosa
    if (result.data && result.data.length > 0) {
      await logAction('create', 'instituciones', result.data[0].id, dataToInsert);
    }

    return result;
  },

  /**
   * Actualiza una institución existente
   * @param {string} id - ID de la institución
   * @param {Object} institutionData - Datos actualizados de la institución
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async updateInstitution(id, institutionData) {
    // Asegurar que los campos coincidan con la estructura de la tabla
    const dataToUpdate = {
      nombre: institutionData.nombre,
      direccion: institutionData.direccion || '',
      telefono: institutionData.telefono || '',
      email: institutionData.email || '',
      sitio_web: institutionData.sitio_web || '',
      updated_at: new Date().toISOString()
    };

    const result = await supabase
      .from('instituciones')
      .update(dataToUpdate)
      .eq('id', id)
      .select();

    // Registrar acción si fue exitosa
    if (result.data && result.data.length > 0) {
      await logAction('update', 'instituciones', id, dataToUpdate);
    }

    return result;
  },

  /**
   * Elimina una institución
   * @param {string} id - ID de la institución
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async deleteInstitution(id) {
    // Obtener datos de la institución antes de eliminarla
    const { data: institutionData } = await supabase
      .from('instituciones')
      .select('*')
      .eq('id', id)
      .single();

    // Eliminar la institución
    const result = await supabase
      .from('instituciones')
      .delete()
      .eq('id', id);

    // Registrar acción si fue exitosa
    if (!result.error && institutionData) {
      await logAction('delete', 'instituciones', id, institutionData);
    }

    return result;
  },

  /**
   * Obtiene todos los psicólogos
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getPsychologists() {
    return await supabase
      .from('psicologos')
      .select('*, instituciones(id, nombre)')
      .order('nombre', { ascending: true });
  },

  /**
   * Crea un nuevo psicólogo
   * @param {Object} psychologistData - Datos del psicólogo
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async createPsychologist(psychologistData) {
    // Asegurar que los campos coincidan con la estructura de la tabla
    const dataToInsert = {
      usuario_id: psychologistData.usuario_id || null,
      institucion_id: psychologistData.institucion_id,
      nombre: psychologistData.nombre,
      apellido: psychologistData.apellido || '',
      email: psychologistData.email || '',
      telefono: psychologistData.telefono || '',
      genero: psychologistData.genero || '',
      especialidad: psychologistData.especialidad || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const result = await supabase
      .from('psicologos')
      .insert([dataToInsert])
      .select();

    // Registrar acción si fue exitosa
    if (result.data && result.data.length > 0) {
      await logAction('create', 'psicologos', result.data[0].id, dataToInsert);
    }

    return result;
  },

  /**
   * Actualiza un psicólogo existente
   * @param {string} id - ID del psicólogo
   * @param {Object} psychologistData - Datos actualizados del psicólogo
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async updatePsychologist(id, psychologistData) {
    // Asegurar que los campos coincidan con la estructura de la tabla
    const dataToUpdate = {
      institucion_id: psychologistData.institucion_id,
      nombre: psychologistData.nombre,
      apellido: psychologistData.apellido || '',
      email: psychologistData.email || '',
      telefono: psychologistData.telefono || '',
      genero: psychologistData.genero || '',
      especialidad: psychologistData.especialidad || '',
      updated_at: new Date().toISOString()
    };

    const result = await supabase
      .from('psicologos')
      .update(dataToUpdate)
      .eq('id', id)
      .select();

    // Registrar acción si fue exitosa
    if (result.data && result.data.length > 0) {
      await logAction('update', 'psicologos', id, dataToUpdate);
    }

    return result;
  },

  /**
   * Elimina un psicólogo
   * @param {string} id - ID del psicólogo
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async deletePsychologist(id) {
    // Obtener datos del psicólogo antes de eliminarlo
    const { data: psychologistData } = await supabase
      .from('psicologos')
      .select('*')
      .eq('id', id)
      .single();

    // Eliminar el psicólogo
    const result = await supabase
      .from('psicologos')
      .delete()
      .eq('id', id);

    // Registrar acción si fue exitosa
    if (!result.error && psychologistData) {
      await logAction('delete', 'psicologos', id, psychologistData);
    }

    return result;
  },

  /**
   * Obtiene todos los pacientes
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getPatients() {
    return await supabase
      .from('pacientes')
      .select('*, instituciones(id, nombre), psicologos(id, nombre, apellido)')
      .order('nombre', { ascending: true });
  },

  /**
   * Crea un nuevo paciente
   * @param {Object} patientData - Datos del paciente
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async createPatient(patientData) {
    // Asegurar que los campos coincidan con la estructura de la tabla
    const dataToInsert = {
      psicologo_id: patientData.psicologo_id || null,
      institucion_id: patientData.institucion_id,
      nombre: patientData.nombre,
      apellido: patientData.apellido || patientData.apellidos || '',
      documento: patientData.documento || patientData.documento_identidad || '',
      email: patientData.email || '',
      genero: patientData.genero || '',
      fecha_nacimiento: patientData.fecha_nacimiento || null,
      nivel_educativo: patientData.nivel_educativo || '',
      ocupacion: patientData.ocupacion || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const result = await supabase
      .from('pacientes')
      .insert([dataToInsert])
      .select();

    // Registrar acción si fue exitosa
    if (result.data && result.data.length > 0) {
      await logAction('create', 'pacientes', result.data[0].id, dataToInsert);
    }

    return result;
  },

  /**
   * Actualiza un paciente existente
   * @param {string} id - ID del paciente
   * @param {Object} patientData - Datos actualizados del paciente
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async updatePatient(id, patientData) {
    // Asegurar que los campos coincidan con la estructura de la tabla
    const dataToUpdate = {
      psicologo_id: patientData.psicologo_id || null,
      institucion_id: patientData.institucion_id,
      nombre: patientData.nombre,
      apellido: patientData.apellido || patientData.apellidos || '',
      documento: patientData.documento || patientData.documento_identidad || '',
      email: patientData.email || '',
      genero: patientData.genero || '',
      fecha_nacimiento: patientData.fecha_nacimiento || null,
      nivel_educativo: patientData.nivel_educativo || '',
      ocupacion: patientData.ocupacion || '',
      updated_at: new Date().toISOString()
    };

    const result = await supabase
      .from('pacientes')
      .update(dataToUpdate)
      .eq('id', id)
      .select();

    // Registrar acción si fue exitosa
    if (result.data && result.data.length > 0) {
      await logAction('update', 'pacientes', id, dataToUpdate);
    }

    return result;
  },

  /**
   * Elimina un paciente
   * @param {string} id - ID del paciente
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async deletePatient(id) {
    // Obtener datos del paciente antes de eliminarlo
    const { data: patientData } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single();

    // Eliminar el paciente
    const result = await supabase
      .from('pacientes')
      .delete()
      .eq('id', id);

    // Registrar acción si fue exitosa
    if (!result.error && patientData) {
      await logAction('delete', 'pacientes', id, patientData);
    }

    return result;
  },

  /**
   * Obtiene los pacientes asignados a un psicólogo
   * @param {string} psychologistId - ID del psicólogo
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getPatientsByPsychologist(psychologistId) {
    return await supabase
      .from('pacientes')
      .select('*')
      .eq('psicologo_id', psychologistId)
      .order('nombre', { ascending: true });
  },

  /**
   * Obtiene los pacientes de una institución
   * @param {string} institutionId - ID de la institución
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getPatientsByInstitution(institutionId) {
    return await supabase
      .from('pacientes')
      .select('*')
      .eq('institucion_id', institutionId)
      .order('nombre', { ascending: true });
  },

  /**
   * Obtiene los psicólogos de una institución
   * @param {string} institutionId - ID de la institución
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getPsychologistsByInstitution(institutionId) {
    return await supabase
      .from('psicologos')
      .select('*')
      .eq('institucion_id', institutionId)
      .order('nombre', { ascending: true });
  }
};

export default supabaseService;
