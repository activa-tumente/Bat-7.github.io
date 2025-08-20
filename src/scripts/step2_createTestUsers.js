/**
 * PASO 2: Crear Usuarios de Prueba
 * Crea usuarios en auth.users y en la tabla usuarios
 */

import supabase from '../api/supabaseClient.js';

const TEST_USERS = [
  {
    email: 'admin@bat7.test',
    password: 'Admin123!',
    documento: '12345678',
    nombre: 'Administrador',
    apellido: 'Sistema',
    tipo_usuario: 'Administrador'
  },
  {
    email: 'psicologo@bat7.test',
    password: 'Psico123!',
    documento: '87654321',
    nombre: 'Dr. Juan',
    apellido: 'Pérez',
    tipo_usuario: 'Psicólogo'
  },
  {
    email: 'candidato@bat7.test',
    password: 'Candidato123!',
    documento: '11223344',
    nombre: 'María',
    apellido: 'González',
    tipo_usuario: 'Candidato'
  }
];

async function createSingleUser(userData) {
  try {
    console.log(`🔄 Creando usuario: ${userData.email}...`);
    
    // 1. Crear usuario en auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          nombre: userData.nombre,
          apellido: userData.apellido,
          tipo_usuario: userData.tipo_usuario
        }
      }
    });
    
    if (authError) {
      // Si el usuario ya existe, intentar obtener su ID
      if (authError.message.includes('already registered')) {
        console.log(`⚠️ ${userData.email}: Usuario ya existe en auth.users`);
        
        // Intentar login para obtener el ID
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: userData.password
        });
        
        if (loginData?.user) {
          authData.user = loginData.user;
        } else {
          throw new Error(`No se pudo obtener ID del usuario existente: ${loginError?.message}`);
        }
      } else {
        throw authError;
      }
    }
    
    if (!authData?.user?.id) {
      throw new Error('No se obtuvo ID del usuario');
    }
    
    // 2. Obtener institución por defecto
    const { data: institution, error: instError } = await supabase
      .from('instituciones')
      .select('id')
      .eq('nombre', 'Institución General')
      .single();
    
    if (instError || !institution) {
      throw new Error('No se encontró la institución por defecto');
    }
    
    // 3. Crear/actualizar registro en tabla usuarios
    const { data: existingUser, error: checkError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', authData.user.id)
      .single();
    
    if (existingUser) {
      // Actualizar usuario existente
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          documento: userData.documento,
          nombre: userData.nombre,
          apellido: userData.apellido,
          tipo_usuario: userData.tipo_usuario,
          institucion_id: institution.id,
          activo: true,
          ultimo_acceso: new Date().toISOString()
        })
        .eq('id', authData.user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      console.log(`✅ ${userData.email}: Usuario actualizado en tabla usuarios`);
    } else {
      // Crear nuevo registro en tabla usuarios
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          id: authData.user.id,
          documento: userData.documento,
          nombre: userData.nombre,
          apellido: userData.apellido,
          tipo_usuario: userData.tipo_usuario,
          institucion_id: institution.id,
          activo: true
        });
      
      if (insertError) {
        throw insertError;
      }
      
      console.log(`✅ ${userData.email}: Usuario creado en tabla usuarios`);
    }
    
    // 4. Crear configuraciones por defecto
    const { error: settingsError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: authData.user.id,
        configuraciones: {
          dashboard_layout: 'default',
          notifications: true,
          theme: 'light'
        },
        tema: 'light',
        idioma: 'es',
        notificaciones_email: true
      });
    
    if (settingsError) {
      console.log(`⚠️ ${userData.email}: Error al crear configuraciones (no crítico)`);
    }
    
    return {
      success: true,
      user: authData.user,
      email: userData.email,
      tipo_usuario: userData.tipo_usuario
    };
    
  } catch (error) {
    console.error(`❌ ${userData.email}: Error - ${error.message}`);
    return {
      success: false,
      email: userData.email,
      error: error.message
    };
  }
}

async function executeStep2() {
  console.log('🚀 PASO 2: Creando Usuarios de Prueba');
  console.log('=====================================\n');
  
  // Verificar que el esquema esté ejecutado
  try {
    const { count } = await supabase
      .from('instituciones')
      .select('*', { count: 'exact', head: true });
    
    if (count === null) {
      throw new Error('La tabla instituciones no existe');
    }
    
    console.log(`✅ Esquema verificado: ${count} instituciones encontradas\n`);
  } catch (error) {
    console.error('❌ Error: El esquema no está ejecutado correctamente');
    console.error('🔧 Ejecuta primero el PASO 1: Esquema SQL');
    return { success: false, error: 'Esquema no ejecutado' };
  }
  
  const results = [];
  
  // Crear usuarios uno por uno
  for (const userData of TEST_USERS) {
    const result = await createSingleUser(userData);
    results.push(result);
    
    // Pausa entre creaciones
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Resumen
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('\n📊 RESUMEN DE CREACIÓN:');
  console.log('========================');
  console.log(`✅ Exitosos: ${successful}/${TEST_USERS.length}`);
  console.log(`❌ Fallidos: ${failed}/${TEST_USERS.length}\n`);
  
  if (successful > 0) {
    console.log('👥 USUARIOS CREADOS:');
    results.filter(r => r.success).forEach(result => {
      console.log(`✅ ${result.email} (${result.tipo_usuario})`);
    });
  }
  
  if (failed > 0) {
    console.log('\n❌ ERRORES:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`❌ ${result.email}: ${result.error}`);
    });
  }
  
  console.log('\n📋 CREDENCIALES DE ACCESO:');
  console.log('===========================');
  TEST_USERS.forEach(user => {
    console.log(`📧 ${user.email}`);
    console.log(`🔑 ${user.password}`);
    console.log(`📄 Documento: ${user.documento}`);
    console.log(`👤 Tipo: ${user.tipo_usuario}\n`);
  });
  
  if (successful === TEST_USERS.length) {
    console.log('🎉 ¡Todos los usuarios creados exitosamente!');
    console.log('🎯 PRÓXIMO PASO: Ejecutar PASO 3 - Probar la Nueva Arquitectura');
  } else {
    console.log('⚠️ Algunos usuarios no se pudieron crear. Revisa los errores arriba.');
  }
  
  return {
    success: successful > 0,
    total: TEST_USERS.length,
    successful,
    failed,
    results
  };
}

async function verifyTestUsers() {
  console.log('🔍 Verificando usuarios de prueba...\n');
  
  const verificationResults = [];
  
  for (const userData of TEST_USERS) {
    try {
      // Verificar en tabla usuarios
      const { data: user, error } = await supabase
        .from('usuarios')
        .select('id, documento, nombre, apellido, tipo_usuario, activo')
        .eq('documento', userData.documento)
        .single();
      
      if (error || !user) {
        verificationResults.push({
          email: userData.email,
          exists: false,
          error: error?.message || 'Usuario no encontrado'
        });
      } else {
        verificationResults.push({
          email: userData.email,
          exists: true,
          user: user,
          matches: user.tipo_usuario === userData.tipo_usuario
        });
      }
    } catch (err) {
      verificationResults.push({
        email: userData.email,
        exists: false,
        error: err.message
      });
    }
  }
  
  // Mostrar resultados
  verificationResults.forEach(result => {
    const icon = result.exists ? '✅' : '❌';
    const status = result.exists ? 
      (result.matches ? 'OK' : 'Tipo incorrecto') : 
      'No existe';
    
    console.log(`${icon} ${result.email}: ${status}`);
    if (result.user) {
      console.log(`   👤 ${result.user.nombre} ${result.user.apellido} (${result.user.tipo_usuario})`);
    }
  });
  
  const existingUsers = verificationResults.filter(r => r.exists).length;
  console.log(`\n📊 Usuarios verificados: ${existingUsers}/${TEST_USERS.length}`);
  
  return verificationResults;
}

// Exportar para uso en consola
if (typeof window !== 'undefined') {
  window.step2 = {
    execute: executeStep2,
    verify: verifyTestUsers,
    users: TEST_USERS
  };
  
  console.log('🛠️ PASO 2 disponible en window.step2:');
  console.log('- execute(): Crear usuarios de prueba');
  console.log('- verify(): Verificar usuarios existentes');
  console.log('- users: Ver lista de usuarios');
}

export { executeStep2, verifyTestUsers, TEST_USERS };
