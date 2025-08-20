// src/utils/testSupabaseConnection.js
import supabase from '../api/supabaseClient';
import { supabaseConfig } from '../api/supabaseConfig';

/**
 * Función para probar la conexión con Supabase
 * @returns {Promise<Object>} Resultado de la prueba
 */
export const testSupabaseConnection = async () => {
  // Si Supabase está deshabilitado, devolver un mensaje informativo
  if (!supabaseConfig.enabled) {
    console.warn(supabaseConfig.disabledMessage);
    return {
      success: true,
      mock: true,
      message: supabaseConfig.disabledMessage,
      session: null,
      testData: [{ id: 'mock-1', nombre: 'Test de ejemplo (mock)' }]
    };
  }

  try {
    // Verificar la sesión actual
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error al obtener la sesión:', sessionError);
      return {
        success: false,
        mock: false,
        message: `Error al obtener la sesión: ${sessionError.message}`,
        session: null,
        testData: null
      };
    }

    // Intentar obtener datos de la tabla instituciones
    const { data: testData, error: testError } = await supabase
      .from('instituciones')
      .select('*')
      .limit(5);

    if (testError) {
      console.error('Error al obtener datos de prueba:', testError);
      return {
        success: false,
        mock: false,
        message: `Error al obtener datos de prueba: ${testError.message}`,
        session: sessionData.session,
        testData: null
      };
    }

    return {
      success: true,
      mock: false,
      message: 'Conexión exitosa con Supabase',
      session: sessionData.session,
      testData
    };
  } catch (error) {
    console.error('Error inesperado al probar la conexión:', error);
    return {
      success: false,
      mock: false,
      message: `Error inesperado: ${error.message}`,
      session: null,
      testData: null
    };
  }
};

export default testSupabaseConnection;
