// src/scripts/diagnosticoSupabaseES.js
import supabase from '../api/supabaseClient';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Script para diagnosticar problemas de conexión con Supabase
 * Este script verifica varios aspectos de la conexión y autenticación
 */

// Función principal de diagnóstico
const diagnosticarSupabase = async () => {
  console.log('=== DIAGNÓSTICO DE CONEXIÓN A SUPABASE ===');
  console.log('Fecha y hora:', new Date().toLocaleString());
  console.log('\n');

  // 1. Verificar variables de entorno
  console.log('1. VERIFICANDO VARIABLES DE ENTORNO');
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.error('❌ VITE_SUPABASE_URL no está definida');
  } else {
    console.log('✅ VITE_SUPABASE_URL:', supabaseUrl);
  }

  if (!supabaseAnonKey) {
    console.error('❌ VITE_SUPABASE_ANON_KEY no está definida');
  } else {
    console.log('✅ VITE_SUPABASE_ANON_KEY:', supabaseAnonKey.substring(0, 10) + '...');
  }

  console.log('\n');

  // 2. Verificar cliente Supabase
  console.log('2. VERIFICANDO CLIENTE SUPABASE');
  try {
    // Verificar que el cliente tenga la estructura esperada
    if (!supabase || typeof supabase.from !== 'function' || !supabase.auth || typeof supabase.auth.getSession !== 'function') {
      throw new Error('El cliente Supabase no tiene la estructura esperada');
    }

    console.log('✅ Cliente Supabase verificado correctamente');
  } catch (error) {
    console.error('❌ Error al verificar cliente Supabase:', error.message);
    return; // Terminar si no podemos verificar el cliente
  }
  console.log('\n');

  // 3. Probar conexión básica
  console.log('3. PROBANDO CONEXIÓN BÁSICA');
  try {
    const { data, error } = await supabase.from('instituciones').select('count').limit(1);

    if (error) {
      console.error('❌ Error al conectar con Supabase:', error.message);
      console.error('   Código:', error.code);
      console.error('   Detalles:', error.details);
    } else {
      console.log('✅ Conexión a Supabase establecida correctamente');
    }
  } catch (error) {
    console.error('❌ Excepción al conectar con Supabase:', error.message);
  }
  console.log('\n');

  // 4. Probar autenticación
  console.log('4. PROBANDO AUTENTICACIÓN');
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Error al verificar sesión:', error.message);
    } else if (!data.session) {
      console.log('ℹ️ No hay sesión activa (esto es normal si no has iniciado sesión)');
    } else {
      console.log('✅ Sesión activa encontrada');
      console.log('   Usuario:', data.session.user.email);
      console.log('   Expira:', new Date(data.session.expires_at * 1000).toLocaleString());
    }
  } catch (error) {
    console.error('❌ Excepción al verificar sesión:', error.message);
  }
  console.log('\n');

  // 5. Probar inicio de sesión con usuario de prueba
  console.log('5. PROBANDO INICIO DE SESIÓN CON USUARIO DE PRUEBA');
  try {
    // Primero cerrar sesión si hay alguna activa
    await supabase.auth.signOut();

    // Intentar iniciar sesión con usuario de prueba
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@test.local',
      password: 'Admin123!'
    });

    if (error) {
      console.error('❌ Error al iniciar sesión con usuario de prueba:', error.message);
      console.error('   Código:', error.code);

      // Verificar si el problema es de credenciales
      if (error.message === 'Invalid login credentials') {
        console.log('ℹ️ El usuario de prueba no existe o las credenciales son incorrectas');
        console.log('   Sugerencia: Ejecuta el script setupTestUsers.js para crear usuarios de prueba');
      }
    } else {
      console.log('✅ Inicio de sesión exitoso con usuario de prueba');
      console.log('   Usuario:', data.user.email);
      console.log('   ID:', data.user.id);
    }
  } catch (error) {
    console.error('❌ Excepción al iniciar sesión:', error.message);
  }
  console.log('\n');

  // 6. Verificar proyecto de Supabase
  console.log('6. VERIFICANDO PROYECTO DE SUPABASE');
  try {
    // Extraer el ID del proyecto de la URL
    const projectId = supabaseUrl.match(/https:\/\/([^\.]+)\.supabase\.co/)?.[1];
    if (projectId) {
      console.log('✅ ID del proyecto Supabase:', projectId);

      // Verificar si coincide con el archivo .env
      const envProjectId = process.env.VITE_PROJECT_ID;
      if (envProjectId && envProjectId !== projectId) {
        console.error('❌ El ID del proyecto en la URL no coincide con VITE_PROJECT_ID');
        console.log('   URL:', projectId);
        console.log('   .env:', envProjectId);
      } else if (envProjectId) {
        console.log('✅ El ID del proyecto coincide con VITE_PROJECT_ID');
      }
    } else {
      console.error('❌ No se pudo extraer el ID del proyecto de la URL');
    }
  } catch (error) {
    console.error('❌ Error al verificar proyecto:', error.message);
  }
  console.log('\n');

  console.log('=== FIN DEL DIAGNÓSTICO ===');
  console.log('Si encuentras problemas, verifica:');
  console.log('1. Que las variables de entorno en .env sean correctas');
  console.log('2. Que el proyecto de Supabase esté activo');
  console.log('3. Que las credenciales de Supabase sean válidas');
  console.log('4. Que la conexión a internet funcione correctamente');
  console.log('5. Que el cliente Supabase se esté inicializando correctamente en la aplicación');
};

// Ejecutar diagnóstico
diagnosticarSupabase()
  .catch(error => {
    console.error('Error al ejecutar diagnóstico:', error);
  })
  .finally(() => {
    console.log('\nDiagnóstico completado');
  });