// src/scripts/verificarConexionSupabase.js

/**
 * Script para verificar la conexión con Supabase y diagnosticar problemas comunes
 * Este script puede ejecutarse desde la consola del navegador o como un módulo independiente
 */

// Importar configuración
import { supabaseConfig } from '../api/supabaseConfig';

// Variables para almacenar información de diagnóstico
let diagnostico = {
  conexionInternet: false,
  conexionSupabase: false,
  variablesEntorno: {
    supabaseUrl: null,
    supabaseAnonKey: null,
    environment: null
  },
  errores: []
};

/**
 * Verifica las variables de entorno necesarias para Supabase
 */
const verificarVariablesEntorno = () => {
  console.log('🔍 Verificando variables de entorno...');
  
  // Verificar URL de Supabase
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  diagnostico.variablesEntorno.supabaseUrl = supabaseUrl || null;
  
  if (!supabaseUrl) {
    const error = 'Variable VITE_SUPABASE_URL no encontrada';
    console.error(`❌ ${error}`);
    diagnostico.errores.push(error);
  } else {
    console.log(`✅ VITE_SUPABASE_URL: ${supabaseUrl}`);
    
    // Verificar si la URL contiene 'yjghsqedyrriieadxzwa.supabase.co'
    if (supabaseUrl.includes('yjghsqedyrriieadxzwa.supabase.co')) {
      const error = 'La URL de Supabase contiene un dominio que está causando errores de DNS';
      console.warn(`⚠️ ${error}`);
      diagnostico.errores.push(error);
    }
  }
  
  // Verificar clave anónima de Supabase
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  diagnostico.variablesEntorno.supabaseAnonKey = supabaseAnonKey ? '***' : null;
  
  if (!supabaseAnonKey) {
    const error = 'Variable VITE_SUPABASE_ANON_KEY no encontrada';
    console.error(`❌ ${error}`);
    diagnostico.errores.push(error);
  } else {
    console.log('✅ VITE_SUPABASE_ANON_KEY: [OCULTA]');
  }
  
  // Verificar entorno
  const environment = import.meta.env.VITE_ENVIRONMENT;
  diagnostico.variablesEntorno.environment = environment || null;
  
  if (!environment) {
    console.warn('⚠️ Variable VITE_ENVIRONMENT no encontrada, asumiendo desarrollo');
  } else {
    console.log(`✅ VITE_ENVIRONMENT: ${environment}`);
  }
};

/**
 * Verifica la conexión a Internet
 */
const verificarConexionInternet = async () => {
  console.log('🔍 Verificando conexión a Internet...');
  
  try {
    const response = await fetch('https://www.google.com', {
      mode: 'no-cors',
      cache: 'no-store',
      timeout: 5000
    });
    
    console.log('✅ Conexión a Internet: OK');
    diagnostico.conexionInternet = true;
    return true;
  } catch (error) {
    const mensajeError = `Error al verificar conexión a Internet: ${error.message}`;
    console.error(`❌ ${mensajeError}`);
    diagnostico.errores.push(mensajeError);
    diagnostico.conexionInternet = false;
    return false;
  }
};

/**
 * Verifica la conexión con Supabase
 */
const verificarConexionSupabase = async () => {
  console.log('🔍 Verificando conexión con Supabase...');
  
  // Verificar que tenemos la URL de Supabase
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('❌ No se puede verificar la conexión con Supabase: URL no disponible');
    return false;
  }
  
  try {
    // Extraer el hostname de la URL de Supabase
    const supabaseHostname = new URL(supabaseUrl).hostname;
    console.log(`📌 Hostname de Supabase: ${supabaseHostname}`);
    
    // Obtener la clave anónima de Supabase
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Intentar conectar a un endpoint válido de la API de Supabase
    const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey
      },
      cache: 'no-store',
      timeout: 5000
    });
    
    console.log('✅ Conexión con Supabase: OK');
    diagnostico.conexionSupabase = true;
    return true;
  } catch (error) {
    const mensajeError = `Error al conectar con Supabase: ${error.message}`;
    console.error(`❌ ${mensajeError}`);
    diagnostico.errores.push(mensajeError);
    
    // Verificar si es un error de DNS
    if (error.message.includes('ERR_NAME_NOT_RESOLVED')) {
      const errorDNS = 'Error de resolución DNS. El dominio de Supabase no puede ser resuelto.';
      console.error(`❌ ${errorDNS}`);
      console.error('❌ Posibles causas: URL incorrecta, proyecto eliminado o problemas con el servicio DNS.');
      diagnostico.errores.push(errorDNS);
    }
    
    diagnostico.conexionSupabase = false;
    return false;
  }
};

/**
 * Ejecuta todas las verificaciones y muestra un resumen
 */
const ejecutarDiagnostico = async () => {
  console.log('🔧 Iniciando diagnóstico de conexión con Supabase...');
  console.log('==================================================');
  
  // Verificar variables de entorno
  verificarVariablesEntorno();
  
  // Verificar conexión a Internet
  await verificarConexionInternet();
  
  // Verificar conexión con Supabase solo si hay Internet
  if (diagnostico.conexionInternet) {
    await verificarConexionSupabase();
  }
  
  // Mostrar resumen
  console.log('\n📊 RESUMEN DEL DIAGNÓSTICO:');
  console.log('==================================================');
  console.log(`Conexión a Internet: ${diagnostico.conexionInternet ? '✅ OK' : '❌ Error'}`);
  console.log(`Conexión con Supabase: ${diagnostico.conexionSupabase ? '✅ OK' : '❌ Error'}`);
  console.log(`Variables de entorno: ${diagnostico.errores.length === 0 ? '✅ OK' : '⚠️ Con problemas'}`);
  
  if (diagnostico.errores.length > 0) {
    console.log('\n⚠️ PROBLEMAS DETECTADOS:');
    diagnostico.errores.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
    
    console.log('\n🔧 RECOMENDACIONES:');
    console.log('1. Verificar que las variables en el archivo .env sean correctas');
    console.log('2. Comprobar que el proyecto en Supabase esté activo y accesible');
    console.log('3. Verificar la conexión a Internet y problemas de DNS');
    console.log('4. Revisar la configuración de supabaseConfig.js');
  } else {
    console.log('\n✅ No se detectaron problemas. La conexión con Supabase funciona correctamente.');
  }
  
  return diagnostico;
};

// Exportar funciones para uso en otros módulos
export {
  verificarVariablesEntorno,
  verificarConexionInternet,
  verificarConexionSupabase,
  ejecutarDiagnostico
};

// Si se ejecuta directamente, iniciar diagnóstico
if (typeof window !== 'undefined' && window.location) {
  console.log('Script de diagnóstico de Supabase ejecutándose en el navegador');
  ejecutarDiagnostico().then(resultado => {
    console.log('Diagnóstico completado:', resultado);
  });
}