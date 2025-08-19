import supabase from '../api/supabaseClient';
import { supabaseConfig } from '../api/supabaseConfig';

/**
 * Verifica la conexión con Supabase
 * @returns {Promise<{connected: boolean, status: Object}>}
 */
export const checkConnection = async () => {
  try {
    // Verificar si Supabase está habilitado en la configuración
    if (!supabaseConfig.enabled) {
      return {
        connected: false,
        status: {
          message: 'Supabase está deshabilitado en la configuración',
          config: supabaseConfig
        }
      };
    }

    // Intentar obtener la sesión actual
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        connected: false,
        status: {
          error,
          message: 'Error al obtener la sesión',
          timestamp: new Date().toISOString()
        }
      };
    }

    // Intentar una consulta simple para verificar la conexión a la base de datos
    const { error: dbError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (dbError) {
      return {
        connected: true, // La autenticación funciona pero hay problemas con la base de datos
        status: {
          auth: 'connected',
          db: 'error',
          error: dbError,
          message: 'Autenticación correcta pero error en la base de datos',
          timestamp: new Date().toISOString()
        }
      };
    }

    // Todo está bien
    return {
      connected: true,
      status: {
        auth: 'connected',
        db: 'connected',
        message: 'Conexión establecida correctamente',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error al verificar conexión con Supabase:', error);
    return {
      connected: false,
      status: {
        error,
        message: 'Error inesperado al verificar la conexión',
        timestamp: new Date().toISOString()
      }
    };
  }
};

/**
 * Intenta restablecer la conexión con Supabase
 * @returns {Promise<{connected: boolean, status: Object}>}
 */
export const resetConnection = async () => {
  try {
    // Cerrar sesión actual si existe
    await supabase.auth.signOut();
    
    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Intentar iniciar sesión anónima
    const { error: signInError } = await supabase.auth.signInAnonymously();
    
    if (signInError) {
      return {
        connected: false,
        status: {
          error: signInError,
          message: 'Error al iniciar sesión anónima',
          timestamp: new Date().toISOString()
        }
      };
    }
    
    // Verificar la conexión nuevamente
    return await checkConnection();
  } catch (error) {
    console.error('Error al restablecer conexión con Supabase:', error);
    return {
      connected: false,
      status: {
        error,
        message: 'Error inesperado al restablecer la conexión',
        timestamp: new Date().toISOString()
      }
    };
  }
};

/**
 * Verifica el acceso a todas las tablas principales
 * @returns {Promise<{success: boolean, tables: Object}>}
 */
export const checkAllTables = async () => {
  const tables = {
    instituciones: { accessible: false },
    psicologos: { accessible: false },
    pacientes: { accessible: false }
  };
  
  try {
    // Verificar cada tabla
    for (const tableName of Object.keys(tables)) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1);
        
        tables[tableName].accessible = !error;
        tables[tableName].error = error;
      } catch (tableError) {
        tables[tableName].accessible = false;
        tables[tableName].error = tableError;
      }
    }
    
    // Determinar si todas las tablas son accesibles
    const allAccessible = Object.values(tables).every(t => t.accessible);
    
    return {
      success: allAccessible,
      tables,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error al verificar tablas:', error);
    return {
      success: false,
      tables,
      error,
      timestamp: new Date().toISOString()
    };
  }
};
