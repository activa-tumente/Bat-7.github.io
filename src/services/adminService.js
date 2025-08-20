/**
 * Servicio mejorado para la administración de instituciones, psicólogos y pacientes
 * Utiliza datos mock para realizar operaciones CRUD (sin Supabase)
 */

// import supabase from '../api/supabase';
import { supabaseConfig } from '../api/supabaseConfig';
import mockEnhancedSupabaseService from './mockEnhancedSupabaseService';
import cacheManager from '../utils/cacheManager';

// Usar el servicio mock en lugar del servicio real
const enhancedSupabaseService = mockEnhancedSupabaseService;

// Configuración de timeout para consultas
const DEFAULT_TIMEOUT = 15000; // 15 segundos
const TIMEOUT_CONFIG = supabaseConfig?.timeout || DEFAULT_TIMEOUT;

/**
 * Función genérica para manejar timeouts en consultas con reintentos
 * @param {Function} queryFn - Función que devuelve la promesa de la consulta
 * @param {number} timeout - Tiempo de espera en ms
 * @param {string} operationName - Nombre de la operación para mensajes de error
 * @param {Object} options - Opciones adicionales
 * @returns {Promise} - Promesa con timeout y reintentos
 */
const withTimeout = async (queryFn, timeout = TIMEOUT_CONFIG, operationName = 'consulta', options = {}) => {
  const maxRetries = options.maxRetries || supabaseConfig.network?.maxRetries || 2;
  const retryDelay = options.retryDelay || 1000;
  const retryOnError = options.retryOnError !== undefined ? options.retryOnError : supabaseConfig.network?.retryOnError;

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Si no es el primer intento, esperar antes de reintentar
      if (attempt > 0) {
        console.log(`[AdminService] Reintentando ${operationName} (intento ${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }

      // Crear una promesa con timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Timeout de ${timeout}ms excedido en ${operationName}`)), timeout);
      });

      // Ejecutar la consulta con timeout
      return await Promise.race([queryFn(), timeoutPromise]);
    } catch (error) {
      lastError = error;

      // Determinar si debemos reintentar basado en el tipo de error
      const isNetworkError = error.message?.includes('network') ||
                            error.message?.includes('connection') ||
                            error.message?.includes('timeout') ||
                            error.code === 'PGRST116';

      // Si es el último intento o no debemos reintentar, lanzar el error
      if (attempt >= maxRetries || (!retryOnError && !isNetworkError)) {
        throw error;
      }

      console.warn(`[AdminService] Error en ${operationName} (intento ${attempt + 1}/${maxRetries + 1}):`, error.message);
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  throw lastError;
};

/**
 * Maneja errores comunes de Supabase y los formatea de manera consistente
 * @param {Error} error - Error original
 * @param {string} operacion - Tipo de operación que falló
 * @param {string} entidad - Tipo de entidad afectada
 * @returns {Object} Error formateado
 */
const manejarError = (error, operacion = 'procesar', entidad = 'datos') => {
  console.error(`Error al ${operacion} ${entidad}:`, error);

  // Mapeo de códigos de error comunes de Supabase
  const errorCodigos = {
    '23505': 'Ya existe un registro con esos datos',
    '23503': 'El registro tiene dependencias que impiden esta operación',
    '42501': 'No tiene permisos para realizar esta operación',
    '42P01': 'La tabla no existe o no está disponible',
    'PGRST116': 'Error de conexión con la base de datos'
  };

  // Formatear el mensaje de error
  let mensaje = 'Error desconocido';
  if (error.message) {
    mensaje = error.message;
  } else if (error.code && errorCodigos[error.code]) {
    mensaje = errorCodigos[error.code];
  }

  return {
    message: `Error al ${operacion} ${entidad}: ${mensaje}`,
    code: error.code || 'UNKNOWN',
    details: error.details || null,
    originalError: error
  };
};

// ==================== INSTITUCIONES ====================

/**
 * Obtiene todas las instituciones
 * @returns {Promise<{data: Array, error: Object|null}>} Resultado de la operación
 */
const getInstitutions = async () => {
  try {
    console.log('[AdminService] Obteniendo instituciones...');

    // Usar directamente el servicio mock
    console.log('[AdminService] Usando servicio mock para obtener instituciones...');
    return await enhancedSupabaseService.getInstitutions();
  } catch (error) {
    console.error('[AdminService] Error al obtener instituciones:', error);

    // Intentar con fallback service
    try {
      console.log('[AdminService] Intentando con enhancedSupabaseService como fallback...');
      const fallbackResult = await enhancedSupabaseService.getInstitutions();

      if (!fallbackResult.error && fallbackResult.data) {
        console.log('[AdminService] Fallback exitoso, obtenidas', fallbackResult.data.length, 'instituciones');
        return fallbackResult;
      }
    } catch (fallbackError) {
      console.error('[AdminService] Error en fallbackService:', fallbackError);
    }

    // Intentar obtener datos de caché como último recurso
    try {
      const cachedData = cacheManager?.getCache('institutions');
      if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
        console.log('[AdminService] Usando datos de caché:', cachedData.length, 'instituciones');
        return {
          data: cachedData,
          error: null,
          isFromCache: true,
          originalError: error.message
        };
      }
    } catch (cacheError) {
      console.error('[AdminService] Error al intentar obtener datos de caché:', cacheError);
    }

    // Si todo falla, devolver error formateado
    return {
      data: null,
      error: manejarError(error, 'obtener', 'instituciones')
    };
  }
};

/**
 * Crea una nueva institución
 * @param {Object} institutionData - Datos de la institución
 * @returns {Promise<{data: Object|null, error: Object|null}>} Resultado de la operación
 */
const createInstitution = async (institutionData) => {
  try {
    console.log('[AdminService] Creando institución:', institutionData);

    // Intentar primero usando RPC
    try {
      const { data: rpcData, error: rpcError } = await withTimeout(
        supabase.rpc('admin_create_institution', {
          institution: institutionData
        }),
        TIMEOUT_CONFIG,
        'RPC crear institución'
      );

      if (rpcError) {
        console.warn('[AdminService] Error al usar RPC para crear institución, usando inserción directa:', rpcError);
        throw rpcError;
      }

      console.log('[AdminService] Institución creada exitosamente vía RPC');
      return { data: rpcData, error: null };
    } catch (rpcError) {
      // Si falla RPC, intentar inserción directa
      console.log('[AdminService] Intentando inserción directa a tabla instituciones...');
      const { data, error } = await supabase
        .from('instituciones')
        .insert([{
          ...institutionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('[AdminService] Institución creada exitosamente vía inserción directa');
      return { data, error: null };
    }
  } catch (error) {
    console.error('[AdminService] Error al crear institución:', error);

    // Intentar con fallback service
    try {
      console.log('[AdminService] Intentando con enhancedSupabaseService como fallback...');
      const fallbackResult = await enhancedSupabaseService.createInstitution(institutionData);

      if (!fallbackResult.error) {
        console.log('[AdminService] Institución creada exitosamente vía fallback');
        return fallbackResult;
      }
    } catch (fallbackError) {
      console.error('[AdminService] Error en fallbackService:', fallbackError);
    }

    // Si todo falla, devolver error formateado
    return {
      data: null,
      error: manejarError(error, 'crear', 'institución')
    };
  }
};

/**
 * Actualiza una institución existente
 * @param {string} id - ID de la institución
 * @param {Object} institutionData - Nuevos datos de la institución
 * @returns {Promise<{data: Object|null, error: Object|null}>} Resultado de la operación
 */
const updateInstitution = async (id, institutionData) => {
  try {
    console.log(`[AdminService] Actualizando institución ${id}:`, institutionData);

    // Intentar primero usando RPC
    try {
      const { data: rpcData, error: rpcError } = await withTimeout(
        supabase.rpc('admin_update_institution', {
          institution_id: id,
          institution: institutionData
        }),
        TIMEOUT_CONFIG,
        'RPC actualizar institución'
      );

      if (rpcError) {
        console.warn('[AdminService] Error al usar RPC para actualizar institución, usando actualización directa:', rpcError);
        throw rpcError;
      }

      console.log('[AdminService] Institución actualizada exitosamente vía RPC');
      return { data: rpcData, error: null };
    } catch (rpcError) {
      // Si falla RPC, intentar actualización directa
      console.log('[AdminService] Intentando actualización directa a tabla instituciones...');
      const { data, error } = await supabase
        .from('instituciones')
        .update({
          ...institutionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('[AdminService] Institución actualizada exitosamente vía actualización directa');
      return { data, error: null };
    }
  } catch (error) {
    console.error(`[AdminService] Error al actualizar institución ${id}:`, error);

    // Intentar con fallback service
    try {
      console.log('[AdminService] Intentando con enhancedSupabaseService como fallback...');
      const fallbackResult = await enhancedSupabaseService.updateInstitution(id, institutionData);

      if (!fallbackResult.error) {
        console.log('[AdminService] Institución actualizada exitosamente vía fallback');
        return fallbackResult;
      }
    } catch (fallbackError) {
      console.error('[AdminService] Error en fallbackService:', fallbackError);
    }

    // Si todo falla, devolver error formateado
    return {
      data: null,
      error: manejarError(error, 'actualizar', 'institución')
    };
  }
};

/**
 * Elimina una institución
 * @param {string} id - ID de la institución
 * @returns {Promise<{success: boolean, error: Object|null}>} Resultado de la operación
 */
const deleteInstitution = async (id) => {
  try {
    console.log(`[AdminService] Eliminando institución ${id}`);

    // Intentar primero usando RPC
    try {
      const { data: rpcData, error: rpcError } = await withTimeout(
        supabase.rpc('admin_delete_institution', { institution_id: id }),
        TIMEOUT_CONFIG,
        'RPC eliminar institución'
      );

      if (rpcError) {
        console.warn('[AdminService] Error al usar RPC para eliminar institución, usando eliminación directa:', rpcError);
        throw rpcError;
      }

      console.log('[AdminService] Institución eliminada exitosamente vía RPC');
      return { success: rpcData, error: null };
    } catch (rpcError) {
      // Si falla RPC, intentar eliminación directa
      console.log('[AdminService] Intentando eliminación directa de tabla instituciones...');
      const { error } = await supabase
        .from('instituciones')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      console.log('[AdminService] Institución eliminada exitosamente vía eliminación directa');
      return { success: true, error: null };
    }
  } catch (error) {
    console.error(`[AdminService] Error al eliminar institución ${id}:`, error);

    // Verificar si el error es por dependencias
    if (error.code === '23503' || (error.message && error.message.includes('violates foreign key constraint'))) {
      return {
        success: false,
        error: {
          message: 'No se puede eliminar esta institución porque tiene registros asociados (psicólogos o pacientes)',
          code: 'DEPENDENCY_ERROR',
          details: error.details
        }
      };
    }

    // Intentar con fallback service
    try {
      console.log('[AdminService] Intentando con enhancedSupabaseService como fallback...');
      const fallbackResult = await enhancedSupabaseService.deleteInstitution(id);

      if (!fallbackResult.error) {
        console.log('[AdminService] Institución eliminada exitosamente vía fallback');
        return fallbackResult;
      }
    } catch (fallbackError) {
      console.error('[AdminService] Error en fallbackService:', fallbackError);
    }

    // Si todo falla, devolver error formateado
    return {
      success: false,
      error: manejarError(error, 'eliminar', 'institución')
    };
  }
};

// ==================== PSICÓLOGOS ====================

/**
 * Obtiene todos los psicólogos
 * @returns {Promise<{data: Array, error: Object|null}>} Resultado de la operación
 */
const getPsychologists = async () => {
  try {
    console.log('[AdminService] Obteniendo psicólogos...');

    // Intentar primero usando RPC
    try {
      console.log('[AdminService] Intentando obtener psicólogos usando RPC...');
      const { data: rpcData, error: rpcError } = await withTimeout(
        supabase.rpc('admin_get_psychologists'),
        TIMEOUT_CONFIG,
        'RPC psicólogos'
      );

      if (rpcError) {
        console.warn('[AdminService] Error al usar RPC para psicólogos, usando consulta directa:', rpcError);
        throw rpcError;
      }

      console.log('[AdminService] RPC exitoso, obtenidos', rpcData.length, 'psicólogos');
      return { data: rpcData, error: null };
    } catch (rpcError) {
      // Si falla RPC, intentar consulta directa con JOIN
      console.log('[AdminService] Intentando consulta directa con JOIN a tabla psicólogos...');
      const { data, error } = await withTimeout(
        supabase
          .from('psicologos')
          .select(`
            *,
            instituciones:institucion_id (id, nombre)
          `)
          .order('apellidos, nombre'),
        TIMEOUT_CONFIG,
        'consulta psicólogos'
      );

      if (error) {
        throw error;
      }

      console.log('[AdminService] Consulta directa exitosa, obtenidos', data.length, 'psicólogos');
      return { data, error: null };
    }
  } catch (error) {
    console.error('[AdminService] Error al obtener psicólogos:', error);

    // Intentar con fallback service
    try {
      console.log('[AdminService] Intentando con enhancedSupabaseService como fallback...');
      const fallbackResult = await enhancedSupabaseService.getPsychologists();

      if (!fallbackResult.error && fallbackResult.data) {
        console.log('[AdminService] Fallback exitoso, obtenidos', fallbackResult.data.length, 'psicólogos');
        return fallbackResult;
      }
    } catch (fallbackError) {
      console.error('[AdminService] Error en fallbackService:', fallbackError);
    }

    // Intentar obtener datos de caché como último recurso
    try {
      const cachedData = cacheManager?.getCache('psychologists');
      if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
        console.log('[AdminService] Usando datos de caché:', cachedData.length, 'psicólogos');
        return {
          data: cachedData,
          error: null,
          isFromCache: true,
          originalError: error.message
        };
      }
    } catch (cacheError) {
      console.error('[AdminService] Error al intentar obtener datos de caché:', cacheError);
    }

    // Si todo falla, devolver error formateado
    return {
      data: null,
      error: manejarError(error, 'obtener', 'psicólogos')
    };
  }
};

/**
 * Crea un nuevo psicólogo
 * @param {Object} psychologistData - Datos del psicólogo
 * @returns {Promise<{data: Object|null, error: Object|null}>} Resultado de la operación
 */
const createPsychologist = async (psychologistData) => {
  try {
    console.log('[AdminService] Creando psicólogo:', psychologistData);

    // Verificar si se incluye usuario_id
    const tieneCuentaUsuario = !!psychologistData.usuario_id;

    // Si no tiene usuario_id y tiene email, verificar si es necesario crear un usuario
    if (!tieneCuentaUsuario && psychologistData.email) {
      console.log('[AdminService] Se requiere crear usuario para el psicólogo con email:', psychologistData.email);

      // Intentar usar la función RPC registrar_psicologo que crea usuario y psicólogo
      try {
        const { data: rpcData, error: rpcError } = await withTimeout(
          supabase.rpc('registrar_psicologo', {
            p_nombre: psychologistData.nombre,
            p_apellidos: psychologistData.apellidos,
            p_genero: psychologistData.genero,
            p_documento_identidad: psychologistData.documento_identidad,
            p_email: psychologistData.email,
            p_telefono: psychologistData.telefono,
            p_institucion_id: psychologistData.institucion_id,
            p_especialidad: psychologistData.especialidad || null,
            p_password: null // Generará una contraseña aleatoria
          }),
          TIMEOUT_CONFIG,
          'RPC registrar psicólogo'
        );

        if (rpcError) {
          console.warn('[AdminService] Error al usar RPC para registrar psicólogo y usuario:', rpcError);
          throw rpcError;
        }

        console.log('[AdminService] Psicólogo y usuario creados exitosamente vía RPC');
        return {
          data: rpcData,
          error: null,
          passwordTemporal: rpcData.password_temporal
        };
      } catch (rpcError) {
        console.warn('[AdminService] Fallido RPC registrar_psicologo, continuando con creación manual');
        // Continuamos con la inserción manual a continuación
      }
    }

    // Si llegamos aquí, intentamos la inserción directa
    const { data, error } = await supabase
      .from('psicologos')
      .insert([{
        ...psychologistData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('[AdminService] Psicólogo creado exitosamente vía inserción directa');
    return { data, error: null };
  } catch (error) {
    console.error('[AdminService] Error al crear psicólogo:', error);

    // Intentar con fallback service
    try {
      console.log('[AdminService] Intentando con enhancedSupabaseService como fallback...');
      const fallbackResult = await enhancedSupabaseService.createPsychologist(psychologistData);

      if (!fallbackResult.error) {
        console.log('[AdminService] Psicólogo creado exitosamente vía fallback');
        return fallbackResult;
      }
    } catch (fallbackError) {
      console.error('[AdminService] Error en fallbackService:', fallbackError);
    }

    // Si todo falla, devolver error formateado
    return {
      data: null,
      error: manejarError(error, 'crear', 'psicólogo')
    };
  }
};

/**
 * Actualiza un psicólogo existente
 * @param {string} id - ID del psicólogo
 * @param {Object} psychologistData - Nuevos datos del psicólogo
 * @returns {Promise<{data: Object|null, error: Object|null}>} Resultado de la operación
 */
const updatePsychologist = async (id, psychologistData) => {
  try {
    console.log(`[AdminService] Actualizando psicólogo ${id}:`, psychologistData);

    // Intentar primero usando RPC
    try {
      const { data: rpcData, error: rpcError } = await withTimeout(
        supabase.rpc('admin_update_psychologist', {
          psychologist_id: id,
          psychologist: psychologistData
        }),
        TIMEOUT_CONFIG,
        'RPC actualizar psicólogo'
      );

      if (rpcError) {
        console.warn('[AdminService] Error al usar RPC para actualizar psicólogo, usando actualización directa:', rpcError);
        throw rpcError;
      }

      console.log('[AdminService] Psicólogo actualizado exitosamente vía RPC');
      return { data: rpcData, error: null };
    } catch (rpcError) {
      // Si falla RPC, intentar actualización directa
      console.log('[AdminService] Intentando actualización directa a tabla psicólogos...');

      // En la actualización directa, asegurarse de no actualizar el email
      const dataToUpdate = { ...psychologistData };
      delete dataToUpdate.email; // No actualizar email para mantener consistencia con Auth

      const { data, error } = await supabase
        .from('psicologos')
        .update({
          ...dataToUpdate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('[AdminService] Psicólogo actualizado exitosamente vía actualización directa');
      return { data, error: null };
    }
  } catch (error) {
    console.error(`[AdminService] Error al actualizar psicólogo ${id}:`, error);

    // Intentar con fallback service
    try {
      console.log('[AdminService] Intentando con enhancedSupabaseService como fallback...');
      const fallbackResult = await enhancedSupabaseService.updatePsychologist(id, psychologistData);

      if (!fallbackResult.error) {
        console.log('[AdminService] Psicólogo actualizado exitosamente vía fallback');
        return fallbackResult;
      }
    } catch (fallbackError) {
      console.error('[AdminService] Error en fallbackService:', fallbackError);
    }

    // Si todo falla, devolver error formateado
    return {
      data: null,
      error: manejarError(error, 'actualizar', 'psicólogo')
    };
  }
};

/**
 * Elimina un psicólogo
 * @param {string} id - ID del psicólogo
 * @returns {Promise<{success: boolean, error: Object|null}>} Resultado de la operación
 */
const deletePsychologist = async (id) => {
  try {
    console.log(`[AdminService] Eliminando psicólogo ${id}`);

    // Primero verificar si tiene pacientes asignados
    const { data: pacientesAsignados, error: errorPacientes } = await supabase
      .from('pacientes')
      .select('id')
      .eq('psicologo_id', id)
      .limit(1);

    if (!errorPacientes && pacientesAsignados && pacientesAsignados.length > 0) {
      console.warn(`[AdminService] El psicólogo ${id} tiene pacientes asignados, no se puede eliminar`);
      return {
        success: false,
        error: {
          message: 'No se puede eliminar este psicólogo porque tiene pacientes asignados',
          code: 'DEPENDENCY_ERROR'
        }
      };
    }

    // Intentar primero usando RPC
    try {
      const { data: rpcData, error: rpcError } = await withTimeout(
        supabase.rpc('admin_delete_psychologist', { psychologist_id: id }),
        TIMEOUT_CONFIG,
        'RPC eliminar psicólogo'
      );

      if (rpcError) {
        console.warn('[AdminService] Error al usar RPC para eliminar psicólogo, usando eliminación directa:', rpcError);
        throw rpcError;
      }

      console.log('[AdminService] Psicólogo eliminado exitosamente vía RPC');
      return { success: rpcData, error: null };
    } catch (rpcError) {
      // Si falla RPC, intentar eliminación directa
      console.log('[AdminService] Intentando eliminación directa de tabla psicólogos...');
      const { error } = await supabase
        .from('psicologos')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      console.log('[AdminService] Psicólogo eliminado exitosamente vía eliminación directa');
      return { success: true, error: null };
    }
  } catch (error) {
    console.error(`[AdminService] Error al eliminar psicólogo ${id}:`, error);

    // Verificar si el error es por dependencias
    if (error.code === '23503' || (error.message && error.message.includes('violates foreign key constraint'))) {
      return {
        success: false,
        error: {
          message: 'No se puede eliminar este psicólogo porque tiene registros asociados',
          code: 'DEPENDENCY_ERROR',
          details: error.details
        }
      };
    }

    // Intentar con fallback service
    try {
      console.log('[AdminService] Intentando con enhancedSupabaseService como fallback...');
      const fallbackResult = await enhancedSupabaseService.deletePsychologist(id);

      if (!fallbackResult.error) {
        console.log('[AdminService] Psicólogo eliminado exitosamente vía fallback');
        return fallbackResult;
      }
    } catch (fallbackError) {
      console.error('[AdminService] Error en fallbackService:', fallbackError);
    }

    // Si todo falla, devolver error formateado
    return {
      success: false,
      error: manejarError(error, 'eliminar', 'psicólogo')
    };
  }
};

// ==================== PACIENTES ====================

/**
 * Obtiene todos los pacientes
 * @returns {Promise<{data: Array, error: Object|null}>} Resultado de la operación
 */
const getPatients = async () => {
  try {
    console.log('[AdminService] Obteniendo pacientes...');

    // Intentar primero usando RPC
    try {
      console.log('[AdminService] Intentando obtener pacientes usando RPC...');
      const { data: rpcData, error: rpcError } = await withTimeout(
        supabase.rpc('admin_get_patients'),
        TIMEOUT_CONFIG,
        'RPC pacientes'
      );

      if (rpcError) {
        console.warn('[AdminService] Error al usar RPC para pacientes, usando consulta directa:', rpcError);
        throw rpcError;
      }

      // Calcular edad para cada paciente
      const patientsWithAge = rpcData.map(patient => {
        if (patient.fecha_nacimiento) {
          const today = new Date();
          const birthDate = new Date(patient.fecha_nacimiento);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          return { ...patient, edad: age };
        }
        return patient;
      });

      console.log('[AdminService] RPC exitoso, obtenidos', patientsWithAge.length, 'pacientes');
      return { data: patientsWithAge, error: null };
    } catch (rpcError) {
      // Si falla RPC, intentar consulta directa con JOIN
      console.log('[AdminService] Intentando consulta directa con JOIN a tabla pacientes...');
      const { data, error } = await withTimeout(
        supabase
          .from('pacientes')
          .select(`
            *,
            instituciones:institucion_id (id, nombre),
            psicologos:psicologo_id (id, nombre, apellidos)
          `)
          .order('apellidos, nombre'),
        TIMEOUT_CONFIG,
        'consulta pacientes'
      );

      if (error) {
        throw error;
      }

      // Calcular edad para cada paciente
      const patientsWithAge = data.map(patient => {
        if (patient.fecha_nacimiento) {
          const today = new Date();
          const birthDate = new Date(patient.fecha_nacimiento);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          return { ...patient, edad: age };
        }
        return patient;
      });

      console.log('[AdminService] Consulta directa exitosa, obtenidos', patientsWithAge.length, 'pacientes');
      return { data: patientsWithAge, error: null };
    }
  } catch (error) {
    console.error('[AdminService] Error al obtener pacientes:', error);

    // Intentar con fallback service
    try {
      console.log('[AdminService] Intentando con enhancedSupabaseService como fallback...');
      const fallbackResult = await enhancedSupabaseService.getPatients();

      if (!fallbackResult.error && fallbackResult.data) {
        console.log('[AdminService] Fallback exitoso, obtenidos', fallbackResult.data.length, 'pacientes');
        return fallbackResult;
      }
    } catch (fallbackError) {
      console.error('[AdminService] Error en fallbackService:', fallbackError);
    }

    // Intentar obtener datos de caché como último recurso
    try {
      const cachedData = cacheManager?.getCache('patients');
      if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
        console.log('[AdminService] Usando datos de caché:', cachedData.length, 'pacientes');
        return {
          data: cachedData,
          error: null,
          isFromCache: true,
          originalError: error.message
        };
      }
    } catch (cacheError) {
      console.error('[AdminService] Error al intentar obtener datos de caché:', cacheError);
    }

    // Si todo falla, devolver error formateado
    return {
      data: null,
      error: manejarError(error, 'obtener', 'pacientes')
    };
  }
};

/**
 * Crea un nuevo paciente
 * @param {Object} patientData - Datos del paciente
 * @returns {Promise<{data: Object|null, error: Object|null}>} Resultado de la operación
 */
const createPatient = async (patientData) => {
  try {
    console.log('[AdminService] Creando paciente:', patientData);

    // Intentar primero usando RPC
    try {
      const { data: rpcData, error: rpcError } = await withTimeout(
        supabase.rpc('admin_create_patient', { patient: patientData }),
        TIMEOUT_CONFIG,
        'RPC crear paciente'
      );

      if (rpcError) {
        console.warn('[AdminService] Error al usar RPC para crear paciente, usando inserción directa:', rpcError);
        throw rpcError;
      }

      console.log('[AdminService] Paciente creado exitosamente vía RPC');
      return { data: rpcData, error: null };
    } catch (rpcError) {
      // Si falla RPC, intentar inserción directa
      console.log('[AdminService] Intentando inserción directa a tabla pacientes...');
      const { data, error } = await supabase
        .from('pacientes')
        .insert([{
          ...patientData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          creado_por: await supabase.auth.getUser().then(res => res.data?.user?.id)
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('[AdminService] Paciente creado exitosamente vía inserción directa');
      return { data, error: null };
    }
  } catch (error) {
    console.error('[AdminService] Error al crear paciente:', error);

    // Intentar con fallback service
    try {
      console.log('[AdminService] Intentando con enhancedSupabaseService como fallback...');
      const fallbackResult = await enhancedSupabaseService.createPatient(patientData);

      if (!fallbackResult.error) {
        console.log('[AdminService] Paciente creado exitosamente vía fallback');
        return fallbackResult;
      }
    } catch (fallbackError) {
      console.error('[AdminService] Error en fallbackService:', fallbackError);
    }

    // Si todo falla, devolver error formateado
    return {
      data: null,
      error: manejarError(error, 'crear', 'paciente')
    };
  }
};

/**
 * Actualiza un paciente existente
 * @param {string} id - ID del paciente
 * @param {Object} patientData - Nuevos datos del paciente
 * @returns {Promise<{data: Object|null, error: Object|null}>} Resultado de la operación
 */
const updatePatient = async (id, patientData) => {
  try {
    console.log(`[AdminService] Actualizando paciente ${id}:`, patientData);

    // Intentar primero usando RPC
    try {
      const { data: rpcData, error: rpcError } = await withTimeout(
        supabase.rpc('admin_update_patient', {
          patient_id: id,
          patient: patientData
        }),
        TIMEOUT_CONFIG,
        'RPC actualizar paciente'
      );

      if (rpcError) {
        console.warn('[AdminService] Error al usar RPC para actualizar paciente, usando actualización directa:', rpcError);
        throw rpcError;
      }

      console.log('[AdminService] Paciente actualizado exitosamente vía RPC');
      return { data: rpcData, error: null };
    } catch (rpcError) {
      // Si falla RPC, intentar actualización directa
      console.log('[AdminService] Intentando actualización directa a tabla pacientes...');
      const { data, error } = await supabase
        .from('pacientes')
        .update({
          ...patientData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('[AdminService] Paciente actualizado exitosamente vía actualización directa');
      return { data, error: null };
    }
  } catch (error) {
    console.error(`[AdminService] Error al actualizar paciente ${id}:`, error);

    // Intentar con fallback service
    try {
      console.log('[AdminService] Intentando con enhancedSupabaseService como fallback...');
      const fallbackResult = await enhancedSupabaseService.updatePatient(id, patientData);

      if (!fallbackResult.error) {
        console.log('[AdminService] Paciente actualizado exitosamente vía fallback');
        return fallbackResult;
      }
    } catch (fallbackError) {
      console.error('[AdminService] Error en fallbackService:', fallbackError);
    }

    // Si todo falla, devolver error formateado
    return {
      data: null,
      error: manejarError(error, 'actualizar', 'paciente')
    };
  }
};

/**
 * Elimina un paciente
 * @param {string} id - ID del paciente
 * @returns {Promise<{success: boolean, error: Object|null}>} Resultado de la operación
 */
const deletePatient = async (id) => {
  try {
    console.log(`[AdminService] Eliminando paciente ${id}`);

    // Intentar primero usando RPC
    try {
      const { data: rpcData, error: rpcError } = await withTimeout(
        supabase.rpc('admin_delete_patient', { patient_id: id }),
        TIMEOUT_CONFIG,
        'RPC eliminar paciente'
      );

      if (rpcError) {
        console.warn('[AdminService] Error al usar RPC para eliminar paciente, usando eliminación directa:', rpcError);
        throw rpcError;
      }

      console.log('[AdminService] Paciente eliminado exitosamente vía RPC');
      return { success: rpcData, error: null };
    } catch (rpcError) {
      // Si falla RPC, intentar eliminación directa
      console.log('[AdminService] Intentando eliminación directa de tabla pacientes...');
      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      console.log('[AdminService] Paciente eliminado exitosamente vía eliminación directa');
      return { success: true, error: null };
    }
  } catch (error) {
    console.error(`[AdminService] Error al eliminar paciente ${id}:`, error);

    // Verificar si el error es por dependencias
    if (error.code === '23503' || (error.message && error.message.includes('violates foreign key constraint'))) {
      return {
        success: false,
        error: {
          message: 'No se puede eliminar este paciente porque tiene registros asociados',
          code: 'DEPENDENCY_ERROR',
          details: error.details
        }
      };
    }

    // Intentar con fallback service
    try {
      console.log('[AdminService] Intentando con enhancedSupabaseService como fallback...');
      const fallbackResult = await enhancedSupabaseService.deletePatient(id);

      if (!fallbackResult.error) {
        console.log('[AdminService] Paciente eliminado exitosamente vía fallback');
        return fallbackResult;
      }
    } catch (fallbackError) {
      console.error('[AdminService] Error en fallbackService:', fallbackError);
    }

    // Si todo falla, devolver error formateado
    return {
      success: false,
      error: manejarError(error, 'eliminar', 'paciente')
    };
  }
};

// ==================== BÚSQUEDA GLOBAL ====================

/**
 * Realiza una búsqueda global en varias entidades
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<{data: Array, error: Object|null}>} Resultado de la operación
 */
const searchEntities = async (searchTerm) => {
  try {
    console.log('[AdminService] Realizando búsqueda global con término:', searchTerm);

    if (!searchTerm || searchTerm.trim().length < 2) {
      return {
        data: [],
        error: {
          message: 'El término de búsqueda debe tener al menos 2 caracteres',
          code: 'INVALID_SEARCH'
        }
      };
    }

    // Usar la función RPC admin_search
    const { data, error } = await withTimeout(
      supabase.rpc('admin_search', { search_term: searchTerm.trim() }),
      TIMEOUT_CONFIG,
      'búsqueda global'
    );

    if (error) {
      throw error;
    }

    console.log('[AdminService] Búsqueda exitosa, encontrados', data.length, 'resultados');
    return { data, error: null };
  } catch (error) {
    console.error('[AdminService] Error en búsqueda global:', error);
    return {
      data: null,
      error: manejarError(error, 'realizar', 'búsqueda')
    };
  }
};

// Exportar todas las funciones
export default {
  // Instituciones
  getInstitutions,
  createInstitution,
  updateInstitution,
  deleteInstitution,

  // Psicólogos
  getPsychologists,
  createPsychologist,
  updatePsychologist,
  deletePsychologist,

  // Pacientes
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,

  // Búsqueda
  searchEntities
};
