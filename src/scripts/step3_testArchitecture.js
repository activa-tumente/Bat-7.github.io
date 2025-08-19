/**
 * PASO 3: Probar la Nueva Arquitectura
 * Ejecuta tests automatizados para verificar funcionalidades
 */

import supabase from '../api/supabaseClient.js';

const ARCHITECTURE_TESTS = [
  {
    name: 'Login con Email',
    test: async () => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'admin@bat7.test',
          password: 'Admin123!'
        });
        
        if (error) throw error;
        
        // Verificar que el usuario tiene datos en la tabla usuarios
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('tipo_usuario, nombre')
          .eq('id', data.user.id)
          .single();
        
        if (userError) throw userError;
        
        // Cerrar sesión
        await supabase.auth.signOut();
        
        return {
          success: true,
          message: `Login exitoso: ${userData.nombre} (${userData.tipo_usuario})`
        };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
  },
  {
    name: 'Login con Documento (RPC)',
    test: async () => {
      try {
        // Probar función RPC
        const { data: email, error: rpcError } = await supabase.rpc(
          'get_email_by_documento',
          { p_documento: '12345678' }
        );
        
        if (rpcError) throw rpcError;
        if (!email) throw new Error('No se encontró email para el documento');
        
        // Probar login con el email obtenido
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: 'Admin123!'
        });
        
        if (error) throw error;
        
        await supabase.auth.signOut();
        
        return {
          success: true,
          message: `RPC funcional: documento 12345678 → ${email}`
        };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
  },
  {
    name: 'Políticas RLS - Usuarios',
    test: async () => {
      try {
        // Sin autenticación, debería fallar
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .limit(1);
        
        if (!error) {
          return { 
            success: false, 
            message: 'RLS no está funcionando (acceso sin autenticación)' 
          };
        }
        
        // Con autenticación, debería funcionar
        await supabase.auth.signInWithPassword({
          email: 'admin@bat7.test',
          password: 'Admin123!'
        });
        
        const { data: authData, error: authError } = await supabase
          .from('usuarios')
          .select('tipo_usuario')
          .limit(1);
        
        await supabase.auth.signOut();
        
        if (authError) throw authError;
        
        return {
          success: true,
          message: 'RLS funcionando correctamente'
        };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
  },
  {
    name: 'Tabla Candidatos - Estructura',
    test: async () => {
      try {
        // Login como admin para acceder
        await supabase.auth.signInWithPassword({
          email: 'admin@bat7.test',
          password: 'Admin123!'
        });
        
        const { count, error } = await supabase
          .from('candidatos')
          .select('*', { count: 'exact', head: true });
        
        await supabase.auth.signOut();
        
        if (error) throw error;
        
        return {
          success: true,
          message: `Tabla candidatos accesible: ${count || 0} registros`
        };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
  },
  {
    name: 'Relaciones entre Tablas',
    test: async () => {
      try {
        await supabase.auth.signInWithPassword({
          email: 'admin@bat7.test',
          password: 'Admin123!'
        });
        
        // Verificar relación usuarios-instituciones
        const { data, error } = await supabase
          .from('usuarios')
          .select(`
            nombre,
            tipo_usuario,
            instituciones:institucion_id (
              nombre,
              tipo_institucion
            )
          `)
          .limit(1);
        
        await supabase.auth.signOut();
        
        if (error) throw error;
        
        return {
          success: true,
          message: 'Relaciones entre tablas funcionando'
        };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
  },
  {
    name: 'Triggers de Actualización',
    test: async () => {
      try {
        await supabase.auth.signInWithPassword({
          email: 'admin@bat7.test',
          password: 'Admin123!'
        });
        
        // Obtener usuario actual
        const { data: currentUser } = await supabase
          .from('usuarios')
          .select('id, fecha_actualizacion')
          .limit(1)
          .single();
        
        if (!currentUser) throw new Error('No se encontró usuario para probar');
        
        const oldDate = currentUser.fecha_actualizacion;
        
        // Actualizar usuario
        await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
        
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({ ultimo_acceso: new Date().toISOString() })
          .eq('id', currentUser.id);
        
        if (updateError) throw updateError;
        
        // Verificar que fecha_actualizacion cambió
        const { data: updatedUser } = await supabase
          .from('usuarios')
          .select('fecha_actualizacion')
          .eq('id', currentUser.id)
          .single();
        
        await supabase.auth.signOut();
        
        const dateChanged = new Date(updatedUser.fecha_actualizacion) > new Date(oldDate);
        
        return {
          success: dateChanged,
          message: dateChanged ? 
            'Triggers de actualización funcionando' : 
            'Triggers no están actualizando fechas'
        };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
  }
];

async function executeStep3() {
  console.log('🚀 PASO 3: Probando la Nueva Arquitectura');
  console.log('==========================================\n');
  
  const results = [];
  
  for (const test of ARCHITECTURE_TESTS) {
    console.log(`🔄 Ejecutando: ${test.name}...`);
    
    const result = await test.test();
    results.push({ name: test.name, ...result });
    
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${test.name}: ${result.message}\n`);
    
    // Pausa entre tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Resumen
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('📊 RESUMEN DE TESTS:');
  console.log('====================');
  console.log(`✅ Exitosos: ${successful}/${ARCHITECTURE_TESTS.length}`);
  console.log(`❌ Fallidos: ${failed}/${ARCHITECTURE_TESTS.length}\n`);
  
  if (failed > 0) {
    console.log('❌ TESTS FALLIDOS:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`• ${result.name}: ${result.message}`);
    });
    console.log('');
  }
  
  if (successful === ARCHITECTURE_TESTS.length) {
    console.log('🎉 ¡Todos los tests pasaron exitosamente!');
    console.log('✅ La nueva arquitectura está funcionando correctamente');
    console.log('🎯 PRÓXIMO PASO: Ejecutar PASO 4 - Limpieza de Archivos');
  } else {
    console.log('⚠️ Algunos tests fallaron. Revisa la configuración.');
    console.log('🔧 Posibles soluciones:');
    console.log('• Verificar que el esquema SQL se ejecutó completamente');
    console.log('• Verificar que los usuarios de prueba se crearon');
    console.log('• Revisar políticas RLS en Supabase');
  }
  
  return {
    success: successful === ARCHITECTURE_TESTS.length,
    total: ARCHITECTURE_TESTS.length,
    successful,
    failed,
    results
  };
}

async function testLoginFlow() {
  console.log('🔐 Probando flujo completo de login...\n');
  
  const testCredentials = [
    { email: 'admin@bat7.test', password: 'Admin123!', documento: '12345678' },
    { email: 'psicologo@bat7.test', password: 'Psico123!', documento: '87654321' },
    { email: 'candidato@bat7.test', password: 'Candidato123!', documento: '11223344' }
  ];
  
  for (const creds of testCredentials) {
    try {
      console.log(`🔄 Probando login: ${creds.email}...`);
      
      // Test 1: Login con email
      const { data: emailLogin, error: emailError } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password
      });
      
      if (emailError) throw emailError;
      
      // Obtener datos del usuario
      const { data: userData } = await supabase
        .from('usuarios')
        .select('nombre, apellido, tipo_usuario')
        .eq('id', emailLogin.user.id)
        .single();
      
      console.log(`✅ Login con email: ${userData.nombre} ${userData.apellido} (${userData.tipo_usuario})`);
      
      await supabase.auth.signOut();
      
      // Test 2: Login con documento (simulado)
      const { data: emailFromDoc } = await supabase.rpc('get_email_by_documento', {
        p_documento: creds.documento
      });
      
      if (emailFromDoc === creds.email) {
        console.log(`✅ RPC documento: ${creds.documento} → ${emailFromDoc}`);
      } else {
        console.log(`❌ RPC documento: esperado ${creds.email}, obtenido ${emailFromDoc}`);
      }
      
    } catch (error) {
      console.log(`❌ Error con ${creds.email}: ${error.message}`);
    }
    
    console.log('');
  }
}

async function testDashboardData() {
  console.log('📊 Probando datos del dashboard...\n');
  
  try {
    // Login como admin
    await supabase.auth.signInWithPassword({
      email: 'admin@bat7.test',
      password: 'Admin123!'
    });
    
    // Obtener estadísticas
    const [institutionsResult, usersResult, candidatesResult] = await Promise.all([
      supabase.from('instituciones').select('*', { count: 'exact', head: true }),
      supabase.from('usuarios').select('*', { count: 'exact', head: true }),
      supabase.from('candidatos').select('*', { count: 'exact', head: true })
    ]);
    
    console.log('📈 ESTADÍSTICAS DEL SISTEMA:');
    console.log(`🏢 Instituciones: ${institutionsResult.count || 0}`);
    console.log(`👥 Usuarios: ${usersResult.count || 0}`);
    console.log(`🎓 Candidatos: ${candidatesResult.count || 0}`);
    
    await supabase.auth.signOut();
    
    return {
      instituciones: institutionsResult.count || 0,
      usuarios: usersResult.count || 0,
      candidatos: candidatesResult.count || 0
    };
    
  } catch (error) {
    console.log(`❌ Error obteniendo estadísticas: ${error.message}`);
    return null;
  }
}

// Exportar para uso en consola
if (typeof window !== 'undefined') {
  window.step3 = {
    execute: executeStep3,
    testLogin: testLoginFlow,
    testDashboard: testDashboardData,
    tests: ARCHITECTURE_TESTS
  };
  
  console.log('🛠️ PASO 3 disponible en window.step3:');
  console.log('- execute(): Ejecutar todos los tests');
  console.log('- testLogin(): Probar flujo de login');
  console.log('- testDashboard(): Probar datos del dashboard');
}

export { executeStep3, testLoginFlow, testDashboardData, ARCHITECTURE_TESTS };
