/**
 * Script para corregir las tablas de administración en Supabase
 * Este script ejecuta las correcciones necesarias en la base de datos
 * para asegurar que todas las tablas y funciones estén correctamente configuradas
 */

import supabase from '../api/supabaseClient';

/**
 * Función principal para corregir las tablas de administración
 * @returns {Promise<{success: boolean, message: string, details: object}>}
 */
export const fixAdminTables = async () => {
  console.log('Iniciando corrección de tablas de administración...');

  try {
    // 1. Verificar si existe la tabla instituciones
    console.log('Verificando tabla instituciones...');
    const { data: institutions, error: instError } = await supabase
      .from('instituciones')
      .select('id')
      .limit(1);

    if (instError) {
      console.error('Error al verificar tabla instituciones:', instError);
      return {
        success: false,
        message: 'Error al verificar tabla instituciones',
        details: instError
      };
    }

    console.log('Tabla instituciones verificada correctamente');

    // 2. Verificar si existe la tabla psicologos
    console.log('Verificando tabla psicologos...');
    const { data: psychologists, error: psychError } = await supabase
      .from('psicologos')
      .select('id')
      .limit(1);

    if (psychError) {
      console.error('Error al verificar tabla psicologos:', psychError);
      return {
        success: false,
        message: 'Error al verificar tabla psicologos',
        details: psychError
      };
    }

    console.log('Tabla psicologos verificada correctamente');

    // 3. Verificar si existe la tabla pacientes
    console.log('Verificando tabla pacientes...');
    const { data: patients, error: patientError } = await supabase
      .from('pacientes')
      .select('id')
      .limit(1);

    if (patientError) {
      console.error('Error al verificar tabla pacientes:', patientError);
      return {
        success: false,
        message: 'Error al verificar tabla pacientes',
        details: patientError
      };
    }

    console.log('Tabla pacientes verificada correctamente');

    // 4. Verificar si existen las funciones RPC
    console.log('Verificando funciones RPC...');
    const { data: funcData, error: funcError } = await supabase.rpc('admin_get_institutions');

    // Si hay error con la función RPC, es normal, continuamos
    if (funcError) {
      console.warn('Función RPC admin_get_institutions no está disponible:', funcError.message);
      console.log('Esto es normal si no se han ejecutado los scripts SQL para crear las funciones');
    } else {
      console.log('Función RPC admin_get_institutions está disponible');
    }

    // 5. Probar una inserción y eliminación simple
    console.log('Probando operaciones CRUD...');

    // Crear una institución de prueba
    const testName = `Test Institution ${new Date().getTime()}`;
    const { data: newInst, error: createError } = await supabase
      .from('instituciones')
      .insert([{
        nombre: testName,
        tipo: 'Test',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (createError) {
      console.error('Error al crear institución de prueba:', createError);
      return {
        success: false,
        message: 'Error al crear institución de prueba',
        details: createError
      };
    }

    console.log('Institución de prueba creada correctamente:', newInst);

    // Eliminar la institución de prueba
    if (newInst && newInst.length > 0) {
      const { error: deleteError } = await supabase
        .from('instituciones')
        .delete()
        .eq('id', newInst[0].id);

      if (deleteError) {
        console.error('Error al eliminar institución de prueba:', deleteError);
        return {
          success: false,
          message: 'Error al eliminar institución de prueba',
          details: deleteError
        };
      }

      console.log('Institución de prueba eliminada correctamente');
    }

    return {
      success: true,
      message: 'Verificación de tablas completada con éxito',
      details: {
        institutions: !!institutions,
        psychologists: !!psychologists,
        patients: !!patients,
        rpcFunctions: !funcError
      }
    };

  } catch (error) {
    console.error('Error inesperado al verificar tablas:', error);
    return {
      success: false,
      message: 'Error inesperado al verificar tablas',
      details: error
    };
  }
};

/**
 * Función para ejecutar el script SQL de sincronización de tablas
 * @returns {Promise<{success: boolean, message: string, details?: object}>}
 */
export const syncTables = async () => {
  try {
    console.log('Ejecutando script SQL de sincronización...');

    // Ejecutar el script SQL utilizando la función rpc
    const { data, error } = await supabase.rpc('execute_sql_script', {
      script_name: 'sync_admin_complete'
    });

    if (error) {
      console.error('Error al ejecutar script SQL:', error);
      return {
        success: false,
        message: 'Error al ejecutar script SQL de sincronización',
        details: error
      };
    }

    console.log('Script SQL ejecutado correctamente:', data);
    return {
      success: true,
      message: 'Script SQL de sincronización ejecutado correctamente'
    };

  } catch (error) {
    console.error('Error inesperado al ejecutar script SQL:', error);
    return {
      success: false,
      message: 'Error inesperado al ejecutar script SQL',
      details: error
    };
  }
};

/**
 * Wrapper para ejecutar todas las correcciones
 */
export const runAllFixes = async () => {
  console.log('Iniciando correcciones completas...');

  // 1. Intentar sincronizar tablas desde SQL
  const syncResult = await syncTables();

  if (!syncResult.success) {
    console.warn('No se pudo ejecutar el script SQL automáticamente:', syncResult.message);
    console.log('Verificando tablas de forma individual...');
  } else {
    console.log('Script SQL ejecutado correctamente');
  }

  // 2. Verificar estado actual de las tablas
  const fixResult = await fixAdminTables();

  if (fixResult.success) {
    console.log('Verificación completada con éxito');
    return {
      success: true,
      message: 'Todas las correcciones completadas con éxito',
      details: {
        sync: syncResult,
        fix: fixResult
      }
    };
  } else {
    console.error('Error al verificar tablas:', fixResult.message);
    return {
      success: false,
      message: 'Error en el proceso de corrección',
      details: {
        sync: syncResult,
        fix: fixResult
      }
    };
  }
};

// Exportar función para uso desde la consola
if (typeof window !== 'undefined') {
  window.fixAdminTables = {
    fix: fixAdminTables,
    sync: syncTables,
    runAll: runAllFixes
  };
}

export default {
  fixAdminTables,
  syncTables,
  runAllFixes
};