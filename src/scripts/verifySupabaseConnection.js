import supabase from '../api/supabaseClient.js';

/**
 * Script para verificar la conexión con Supabase y la estructura de la base de datos
 */

async function verifyConnection() {
  console.log('🔍 Verificando conexión con Supabase...');
  
  try {
    // Verificar configuración
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('📋 Configuración:');
    console.log(`URL: ${url}`);
    console.log(`Key: ${key ? key.substring(0, 20) + '...' : 'NO DEFINIDA'}`);
    
    if (!url || !key) {
      console.error('❌ Variables de entorno no configuradas correctamente');
      return false;
    }
    
    // Probar conexión básica
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error al conectar con Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Conexión con Supabase exitosa');
    return true;
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
}

async function verifyTables() {
  console.log('\n🗄️ Verificando estructura de tablas...');
  
  const tables = ['usuarios', 'pacientes', 'evaluaciones', 'resultados'];
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Tabla '${table}': ${error.message}`);
      } else {
        console.log(`✅ Tabla '${table}': ${count || 0} registros`);
      }
    } catch (error) {
      console.log(`❌ Tabla '${table}': Error - ${error.message}`);
    }
  }
}

async function verifyUsers() {
  console.log('\n👥 Verificando usuarios existentes...');
  
  try {
    const { data: users, error } = await supabase
      .from('usuarios')
      .select('id, documento, nombre, apellido, rol, activo, fecha_creacion')
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener usuarios:', error.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('⚠️ No hay usuarios en la base de datos');
      console.log('💡 Ejecuta el script createTestUsers.js para crear usuarios de prueba');
      return;
    }

    console.log(`📊 Total de usuarios: ${users.length}`);
    console.log('\n👤 Usuarios registrados:');
    
    users.forEach((user, index) => {
      const status = user.activo ? '🟢' : '🔴';
      const roleIcon = user.rol === 'administrador' ? '👑' : 
                      user.rol === 'psicologo' ? '👨‍⚕️' : '👨‍🎓';
      
      console.log(`${index + 1}. ${status} ${roleIcon} ${user.nombre} ${user.apellido}`);
      console.log(`   Rol: ${user.rol} | Documento: ${user.documento}`);
      console.log(`   Creado: ${new Date(user.fecha_creacion).toLocaleDateString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error);
  }
}

async function testAuth() {
  console.log('\n🔐 Probando autenticación...');
  
  try {
    // Verificar si hay una sesión activa
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('✅ Sesión activa encontrada');
      console.log(`👤 Usuario: ${session.user.email}`);
      
      // Obtener perfil del usuario
      const { data: profile, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.log('⚠️ Usuario autenticado pero sin perfil en tabla usuarios');
      } else {
        console.log(`👤 Perfil: ${profile.nombre} ${profile.apellido} (${profile.rol})`);
      }
    } else {
      console.log('ℹ️ No hay sesión activa');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar autenticación:', error);
  }
}

async function verifyRLS() {
  console.log('\n🔒 Verificando Row Level Security (RLS)...');
  
  try {
    // Intentar acceder a la tabla usuarios sin autenticación
    const { data, error } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.message.includes('RLS') || error.message.includes('policy')) {
        console.log('✅ RLS está activo (esto es bueno para seguridad)');
      } else {
        console.log('⚠️ Error inesperado:', error.message);
      }
    } else {
      console.log('⚠️ RLS podría no estar configurado correctamente');
    }
    
  } catch (error) {
    console.log('⚠️ Error al verificar RLS:', error.message);
  }
}

async function runFullDiagnostic() {
  console.log('🚀 Iniciando diagnóstico completo de Supabase...\n');
  
  const connectionOk = await verifyConnection();
  
  if (!connectionOk) {
    console.log('\n❌ No se puede continuar sin conexión a Supabase');
    return;
  }
  
  await verifyTables();
  await verifyUsers();
  await testAuth();
  await verifyRLS();
  
  console.log('\n✨ Diagnóstico completado');
  console.log('\n📝 Próximos pasos recomendados:');
  console.log('1. Si no hay usuarios, ejecuta: createTestUsers.js');
  console.log('2. Verifica que las políticas RLS estén configuradas');
  console.log('3. Prueba el login en la aplicación');
}

// Funciones disponibles para ejecutar desde la consola
if (typeof window !== 'undefined') {
  window.supabaseDiagnostic = {
    full: runFullDiagnostic,
    connection: verifyConnection,
    tables: verifyTables,
    users: verifyUsers,
    auth: testAuth,
    rls: verifyRLS
  };
  
  console.log('🛠️ Funciones de diagnóstico disponibles en window.supabaseDiagnostic:');
  console.log('- full(): Diagnóstico completo');
  console.log('- connection(): Verificar conexión');
  console.log('- tables(): Verificar tablas');
  console.log('- users(): Verificar usuarios');
  console.log('- auth(): Verificar autenticación');
  console.log('- rls(): Verificar Row Level Security');
}

// Ejecutar automáticamente si se importa
runFullDiagnostic();

export { 
  runFullDiagnostic, 
  verifyConnection, 
  verifyTables, 
  verifyUsers, 
  testAuth, 
  verifyRLS 
};
