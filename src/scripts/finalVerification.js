import supabase from '../api/supabaseClient.js';

/**
 * Script de verificación final para confirmar que toda la implementación funciona
 */

const VERIFICATION_TESTS = [
  {
    name: 'Conexión a Supabase',
    test: async () => {
      const { data, error } = await supabase.auth.getSession();
      return { success: !error, message: error?.message || 'Conexión exitosa' };
    }
  },
  {
    name: 'Tabla instituciones',
    test: async () => {
      const { count, error } = await supabase
        .from('instituciones')
        .select('*', { count: 'exact', head: true });
      return { 
        success: !error, 
        message: error?.message || `${count || 0} instituciones encontradas`,
        count 
      };
    }
  },
  {
    name: 'Tabla usuarios',
    test: async () => {
      const { count, error } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });
      return { 
        success: !error, 
        message: error?.message || `${count || 0} usuarios encontrados`,
        count 
      };
    }
  },
  {
    name: 'Tabla candidatos',
    test: async () => {
      const { count, error } = await supabase
        .from('candidatos')
        .select('*', { count: 'exact', head: true });
      return { 
        success: !error, 
        message: error?.message || `${count || 0} candidatos encontrados`,
        count 
      };
    }
  },
  {
    name: 'Función RPC get_email_by_documento',
    test: async () => {
      try {
        const { data, error } = await supabase.rpc('get_email_by_documento', { 
          p_documento: '12345678' 
        });
        return { 
          success: !error, 
          message: error?.message || `Función RPC funcional: ${data || 'sin resultado'}` 
        };
      } catch (err) {
        return { success: false, message: `Error: ${err.message}` };
      }
    }
  },
  {
    name: 'Políticas RLS en usuarios',
    test: async () => {
      try {
        // Intentar acceder sin autenticación debería fallar
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .limit(1);
        
        // Si no hay error, RLS podría no estar configurado
        if (!error) {
          return { 
            success: false, 
            message: 'RLS podría no estar configurado (acceso sin autenticación)' 
          };
        }
        
        // Si hay error relacionado con RLS, está funcionando
        if (error.message.includes('RLS') || error.message.includes('policy')) {
          return { success: true, message: 'RLS está activo y funcionando' };
        }
        
        return { success: false, message: `Error inesperado: ${error.message}` };
      } catch (err) {
        return { success: false, message: `Error: ${err.message}` };
      }
    }
  },
  {
    name: 'Usuarios de prueba',
    test: async () => {
      const testEmails = ['admin@bat7.test', 'psicologo@bat7.test', 'candidato@bat7.test'];
      let foundUsers = 0;
      
      for (const email of testEmails) {
        try {
          const { data } = await supabase
            .from('usuarios')
            .select('tipo_usuario')
            .eq('id', 'dummy'); // Esto fallará por RLS, pero nos dice si la tabla existe
        } catch (err) {
          // Esperamos que falle por RLS
        }
      }
      
      // Verificar de otra manera - contar usuarios totales
      const { count } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });
      
      return { 
        success: count >= 3, 
        message: `${count || 0} usuarios en total (esperamos al menos 3)` 
      };
    }
  }
];

async function runVerificationTest(test) {
  try {
    console.log(`🔄 Probando: ${test.name}...`);
    const result = await test.test();
    
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${test.name}: ${result.message}`);
    
    return result;
  } catch (error) {
    console.log(`❌ ${test.name}: Error - ${error.message}`);
    return { success: false, message: error.message };
  }
}

async function runFullVerification() {
  console.log('🚀 Iniciando verificación final del sistema BAT-7...');
  console.log('================================================\n');
  
  const results = [];
  
  for (const test of VERIFICATION_TESTS) {
    const result = await runVerificationTest(test);
    results.push({ name: test.name, ...result });
    
    // Pausa entre tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Resumen
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log('\n📊 RESUMEN DE VERIFICACIÓN:');
  console.log('============================');
  console.log(`✅ Exitosos: ${successful}/${total}`);
  console.log(`❌ Fallidos: ${total - successful}/${total}`);
  
  if (successful === total) {
    console.log('\n🎉 ¡VERIFICACIÓN COMPLETADA CON ÉXITO!');
    console.log('El sistema está listo para usar.');
  } else {
    console.log('\n⚠️ VERIFICACIÓN INCOMPLETA');
    console.log('Algunos tests fallaron. Revisa los errores arriba.');
  }
  
  // Próximos pasos
  console.log('\n🎯 PRÓXIMOS PASOS RECOMENDADOS:');
  
  if (successful < total) {
    console.log('1. Ejecutar el esquema SQL en Supabase si no se ha hecho');
    console.log('2. Crear usuarios de prueba si no existen');
    console.log('3. Verificar configuración de RLS');
  } else {
    console.log('1. ✅ Probar login en la aplicación');
    console.log('2. ✅ Verificar dashboard dinámico');
    console.log('3. ✅ Probar gestión de candidatos');
    console.log('4. ✅ Limpiar archivos antiguos');
  }
  
  return {
    total,
    successful,
    failed: total - successful,
    results,
    allPassed: successful === total
  };
}

async function quickHealthCheck() {
  console.log('⚡ Verificación rápida de salud del sistema...');
  
  const criticalTests = [
    VERIFICATION_TESTS[0], // Conexión
    VERIFICATION_TESTS[1], // Instituciones
    VERIFICATION_TESTS[2], // Usuarios
  ];
  
  let allGood = true;
  
  for (const test of criticalTests) {
    const result = await runVerificationTest(test);
    if (!result.success) {
      allGood = false;
    }
  }
  
  if (allGood) {
    console.log('✅ Sistema básico funcionando correctamente');
  } else {
    console.log('❌ Problemas detectados en el sistema básico');
  }
  
  return allGood;
}

async function verifyUserTypes() {
  console.log('\n👥 Verificando tipos de usuarios...');
  
  try {
    const { data: users, error } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .limit(10);
    
    if (error) {
      console.log('❌ No se pueden verificar tipos de usuarios (probablemente por RLS)');
      return false;
    }
    
    const userTypes = [...new Set(users.map(u => u.tipo_usuario))];
    console.log(`📋 Tipos de usuario encontrados: ${userTypes.join(', ')}`);
    
    const expectedTypes = ['Administrador', 'Psicólogo', 'Candidato'];
    const hasAllTypes = expectedTypes.every(type => userTypes.includes(type));
    
    if (hasAllTypes) {
      console.log('✅ Todos los tipos de usuario están presentes');
    } else {
      console.log('⚠️ Faltan algunos tipos de usuario');
    }
    
    return hasAllTypes;
  } catch (error) {
    console.log('❌ Error al verificar tipos de usuarios:', error.message);
    return false;
  }
}

// Funciones disponibles para la consola
if (typeof window !== 'undefined') {
  window.finalVerification = {
    full: runFullVerification,
    quick: quickHealthCheck,
    userTypes: verifyUserTypes,
    tests: VERIFICATION_TESTS
  };
  
  console.log('🛠️ Funciones de verificación disponibles en window.finalVerification:');
  console.log('- full(): Verificación completa');
  console.log('- quick(): Verificación rápida');
  console.log('- userTypes(): Verificar tipos de usuarios');
}

export { 
  runFullVerification, 
  quickHealthCheck, 
  verifyUserTypes, 
  VERIFICATION_TESTS 
};
