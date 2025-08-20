import { supabase } from '../config/supabase';

/**
 * Servicio mejorado para operaciones de pacientes
 * Implementa patrón Repository, validación robusta y manejo de errores
 */
class EnhancedPatientService {
  constructor() {
    this.tableName = 'pacientes';
    this.requiredFields = ['nombre', 'apellido'];
    this.optionalFields = [
      'documento', 'email', 'genero', 'fecha_nacimiento', 
      'nivel_educativo', 'ocupacion', 'institucion_id', 'psicologo_id'
    ];
  }

  /**
   * Valida los datos del paciente
   * @param {Object} data - Datos del paciente
   * @param {boolean} isUpdate - Si es una actualización (campos requeridos opcionales)
   * @returns {Object} - { isValid: boolean, errors: string[] }
   */
  validatePatientData(data, isUpdate = false) {
    const errors = [];
    
    // Validar campos requeridos (solo en creación)
    if (!isUpdate) {
      this.requiredFields.forEach(field => {
        if (!data[field] || data[field].toString().trim() === '') {
          errors.push(`El campo '${field}' es requerido`);
        }
      });
    }

    // Validaciones específicas
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('El formato del email no es válido');
    }

    if (data.documento && !this.isValidDocument(data.documento)) {
      errors.push('El documento debe tener entre 7 y 8 dígitos');
    }

    if (data.fecha_nacimiento && !this.isValidBirthDate(data.fecha_nacimiento)) {
      errors.push('La fecha de nacimiento no es válida');
    }

    if (data.genero && !['masculino', 'femenino', 'otro'].includes(data.genero)) {
      errors.push('El género debe ser masculino, femenino u otro');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida formato de email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida formato de documento
   */
  isValidDocument(documento) {
    const docRegex = /^[0-9]{7,8}$/;
    return docRegex.test(documento);
  }

  /**
   * Valida fecha de nacimiento
   */
  isValidBirthDate(fecha) {
    const date = new Date(fecha);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    return !isNaN(date.getTime()) && age >= 0 && age <= 120;
  }

  /**
   * Sanitiza los datos del paciente
   */
  sanitizePatientData(data) {
    const sanitized = {};
    
    // Solo incluir campos válidos
    [...this.requiredFields, ...this.optionalFields].forEach(field => {
      if (data.hasOwnProperty(field)) {
        let value = data[field];
        
        // Sanitizar strings
        if (typeof value === 'string') {
          value = value.trim();
          // Convertir string vacío a null para campos opcionales
          if (value === '' && this.optionalFields.includes(field)) {
            value = null;
          }
        }
        
        sanitized[field] = value;
      }
    });

    return sanitized;
  }

  /**
   * Maneja errores de Supabase de forma consistente
   */
  handleSupabaseError(error, operation) {
    console.error(`Error en ${operation}:`, error);
    
    // Mapear errores comunes de Supabase
    const errorMappings = {
      '23505': 'Ya existe un registro con estos datos',
      '23503': 'Referencia inválida a otro registro',
      '42P01': 'Tabla no encontrada',
      'PGRST116': 'No se encontró el registro'
    };

    const errorCode = error.code || error.error_code;
    const mappedMessage = errorMappings[errorCode];
    
    return {
      success: false,
      error: {
        message: mappedMessage || error.message || 'Error desconocido',
        code: errorCode,
        operation,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Obtiene todos los pacientes con información relacionada
   */
  async getPatients(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        search = '', 
        sortBy = 'created_at', 
        sortOrder = 'desc' 
      } = options;

      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          instituciones:institucion_id(id, nombre),
          psicologos:psicologo_id(id, nombre, apellido)
        `);

      // Aplicar búsqueda
      if (search) {
        query = query.or(`nombre.ilike.%${search}%,apellido.ilike.%${search}%,documento.ilike.%${search}%,email.ilike.%${search}%`);
      }

      // Aplicar ordenamiento
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Aplicar paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const result = await query;

      if (result.error) {
        return this.handleSupabaseError(result.error, 'obtener pacientes');
      }

      return {
        success: true,
        data: result.data || [],
        pagination: {
          page,
          limit,
          total: result.count || result.data?.length || 0
        }
      };
    } catch (error) {
      return this.handleSupabaseError(error, 'obtener pacientes');
    }
  }

  /**
   * Obtiene un paciente por ID
   */
  async getPatientById(id) {
    try {
      const result = await supabase
        .from(this.tableName)
        .select(`
          *,
          instituciones:institucion_id(id, nombre),
          psicologos:psicologo_id(id, nombre, apellido)
        `)
        .eq('id', id)
        .single();

      if (result.error) {
        return this.handleSupabaseError(result.error, 'obtener paciente');
      }

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      return this.handleSupabaseError(error, 'obtener paciente');
    }
  }

  /**
   * Crea un nuevo paciente
   */
  async createPatient(patientData) {
    try {
      // Validar datos
      const validation = this.validatePatientData(patientData);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            message: 'Datos inválidos',
            details: validation.errors,
            operation: 'crear paciente'
          }
        };
      }

      // Sanitizar datos
      const sanitizedData = this.sanitizePatientData(patientData);
      
      // Agregar timestamps
      const dataToInsert = {
        ...sanitizedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await supabase
        .from(this.tableName)
        .insert([dataToInsert])
        .select(`
          *,
          instituciones:institucion_id(id, nombre),
          psicologos:psicologo_id(id, nombre, apellido)
        `);

      if (result.error) {
        return this.handleSupabaseError(result.error, 'crear paciente');
      }

      return {
        success: true,
        data: result.data[0],
        message: 'Paciente creado exitosamente'
      };
    } catch (error) {
      return this.handleSupabaseError(error, 'crear paciente');
    }
  }

  /**
   * Actualiza un paciente existente
   */
  async updatePatient(id, patientData) {
    try {
      // Validar datos (permitir campos opcionales vacíos en actualización)
      const validation = this.validatePatientData(patientData, true);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            message: 'Datos inválidos',
            details: validation.errors,
            operation: 'actualizar paciente'
          }
        };
      }

      // Sanitizar datos
      const sanitizedData = this.sanitizePatientData(patientData);
      
      // Agregar timestamp de actualización
      const dataToUpdate = {
        ...sanitizedData,
        updated_at: new Date().toISOString()
      };

      const result = await supabase
        .from(this.tableName)
        .update(dataToUpdate)
        .eq('id', id)
        .select(`
          *,
          instituciones:institucion_id(id, nombre),
          psicologos:psicologo_id(id, nombre, apellido)
        `);

      if (result.error) {
        return this.handleSupabaseError(result.error, 'actualizar paciente');
      }

      if (!result.data || result.data.length === 0) {
        return {
          success: false,
          error: {
            message: 'Paciente no encontrado',
            operation: 'actualizar paciente'
          }
        };
      }

      return {
        success: true,
        data: result.data[0],
        message: 'Paciente actualizado exitosamente'
      };
    } catch (error) {
      return this.handleSupabaseError(error, 'actualizar paciente');
    }
  }

  /**
   * Elimina un paciente
   */
  async deletePatient(id) {
    try {
      const result = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .select();

      if (result.error) {
        return this.handleSupabaseError(result.error, 'eliminar paciente');
      }

      if (!result.data || result.data.length === 0) {
        return {
          success: false,
          error: {
            message: 'Paciente no encontrado',
            operation: 'eliminar paciente'
          }
        };
      }

      return {
        success: true,
        message: 'Paciente eliminado exitosamente'
      };
    } catch (error) {
      return this.handleSupabaseError(error, 'eliminar paciente');
    }
  }

  /**
   * Busca pacientes por criterios específicos
   */
  async searchPatients(criteria) {
    try {
      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          instituciones:institucion_id(id, nombre),
          psicologos:psicologo_id(id, nombre, apellido)
        `);

      // Aplicar filtros
      if (criteria.institucion_id) {
        query = query.eq('institucion_id', criteria.institucion_id);
      }

      if (criteria.psicologo_id) {
        query = query.eq('psicologo_id', criteria.psicologo_id);
      }

      if (criteria.genero) {
        query = query.eq('genero', criteria.genero);
      }

      if (criteria.edad_min || criteria.edad_max) {
        const today = new Date();
        if (criteria.edad_max) {
          const minDate = new Date(today.getFullYear() - criteria.edad_max, today.getMonth(), today.getDate());
          query = query.gte('fecha_nacimiento', minDate.toISOString().split('T')[0]);
        }
        if (criteria.edad_min) {
          const maxDate = new Date(today.getFullYear() - criteria.edad_min, today.getMonth(), today.getDate());
          query = query.lte('fecha_nacimiento', maxDate.toISOString().split('T')[0]);
        }
      }

      const result = await query;

      if (result.error) {
        return this.handleSupabaseError(result.error, 'buscar pacientes');
      }

      return {
        success: true,
        data: result.data || []
      };
    } catch (error) {
      return this.handleSupabaseError(error, 'buscar pacientes');
    }
  }
}

// Exportar instancia singleton
export const enhancedPatientService = new EnhancedPatientService();
export default enhancedPatientService;