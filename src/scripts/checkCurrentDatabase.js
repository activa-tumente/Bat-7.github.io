import supabase from '../api/supabaseClient.js';

/**
 * Script para verificar el estado actual de la base de datos
 * Proyecto: ydglduxhgwajqdseqzpy
 */

async function checkDatabaseStructure() {
  console.log('🔍 Verificando estructura actual de la base de datos...');
  console.log('📋 Proyecto ID: ydglduxhgwajqdseqzpy');
  
  try {
    // Verificar conexión
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error de conexión:', sessionError.message);
      return;
    }
    
    console.log('✅ Conexión establecida con Supabase');
    
    // Lista de tablas que esperamos encontrar
    const expectedTables = [
      'usuarios', 'perfiles', 'users', // Tablas de usuarios
      'pacientes', 'patients', // Tablas de pacientes
      'evaluaciones', 'evaluations', // Tablas de evaluaciones
      'resultados', 'results', // Tablas de resultados
      'instituciones', 'institutions', // Tablas de instituciones
      'psicologos', 'psychologists', // Tablas de psicólogos
      'user_settings' // Configuraciones
    ];
    
    console.log('\n🗄️ Verificando tablas existentes...');
    
    const existingTables = [];
    const missingTables = [];
    
    for (const table of expectedTables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          if (error.message.includes('does not exist') || error.message.includes('relation') || error.code === '42P01') {
            missingTables.push(table);
          } else {
            console.log(`⚠️ Tabla '${table}': ${error.message}`);
          }
        } else {
          existingTables.push({ name: table, count: count || 0 });
          console.log(`✅ Tabla '${table}': ${count || 0} registros`);
        }
      } catch (error) {
        missingTables.push(table);
      }
    }
    
    console.log(`\n📊 Resumen:`);
    console.log(`✅ Tablas encontradas: ${existingTables.length}`);
    console.log(`❌ Tablas faltantes: ${missingTables.length}`);
    
    if (existingTables.length > 0) {
      console.log('\n📋 Tablas existentes:');
      existingTables.forEach(table => {
        console.log(`  - ${table.name}: ${table.count} registros`);
      });
    }
    
    if (missingTables.length > 0) {
      console.log('\n❌ Tablas faltantes:');
      missingTables.forEach(table => {
        console.log(`  - ${table}`);
      });
    }
    
    // Verificar usuarios existentes en cualquier tabla de usuarios encontrada
    await checkExistingUsers(existingTables);
    
    // Proporcionar recomendaciones
    console.log('\n💡 Recomendaciones:');
    
    if (existingTables.some(t => t.name === 'usuarios')) {
      console.log('✅ La tabla "usuarios" existe. El sistema debería funcionar correctamente.');
    } else if (existingTables.some(t => t.name === 'perfiles')) {
      console.log('⚠️ Se encontró tabla "perfiles". Considera migrar a "usuarios" o actualizar el AuthContext.');
    } else if (existingTables.some(t => t.name === 'users')) {
      console.log('⚠️ Se encontró tabla "users". Considera crear la tabla "usuarios" o adaptar el código.');
    } else {
      console.log('❌ No se encontró ninguna tabla de usuarios. Ejecuta el script SQL de configuración.');
    }
    
    if (missingTables.includes('usuarios') && missingTables.includes('perfiles') && missingTables.includes('users')) {
      console.log('🚀 Ejecuta el script SQL setup_database.sql para crear la estructura completa.');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

async function checkExistingUsers(existingTables) {
  console.log('\n👥 Verificando usuarios existentes...');
  
  // Buscar en diferentes tablas de usuarios
  const userTables = existingTables.filter(t => 
    ['usuarios', 'perfiles', 'users'].includes(t.name)
  );
  
  if (userTables.length === 0) {
    console.log('❌ No se encontraron tablas de usuarios');
    return;
  }
  
  for (const table of userTables) {
    try {
      console.log(`\n🔍 Verificando tabla: ${table.name}`);
      
      const { data: users, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(10);
      
      if (error) {
        console.log(`❌ Error al consultar ${table.name}: ${error.message}`);
        continue;
      }
      
      if (!users || users.length === 0) {
        console.log(`⚠️ Tabla ${table.name} está vacía`);
        continue;
      }
      
      console.log(`📊 Encontrados ${users.length} usuarios en ${table.name}:`);
      
      users.forEach((user, index) => {
        const email = user.email || 'Sin email';
        const role = user.rol || user.role || user.tipo_usuario || 'Sin rol';
        const name = user.nombre || user.name || user.first_name || 'Sin nombre';
        const doc = user.documento || user.document_id || 'Sin documento';
        
        console.log(`  ${index + 1}. ${name} (${email}) - Rol: ${role} - Doc: ${doc}`);
      });
      
      // Mostrar estructura de la tabla
      if (users.length > 0) {
        console.log(`\n📋 Estructura de ${table.name}:`);
        const columns = Object.keys(users[0]);
        console.log(`  Columnas: ${columns.join(', ')}`);
      }
      
    } catch (error) {
      console.log(`❌ Error al verificar usuarios en ${table.name}:`, error.message);
    }
  }
}

async function checkAuthUsers() {
  console.log('\n🔐 Verificando usuarios en auth.users...');
  
  try {
    // Intentar obtener información del usuario actual
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('ℹ️ No hay usuario autenticado actualmente');
    } else if (user) {
      console.log('✅ Usuario autenticado encontrado:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Creado: ${new Date(user.created_at).toLocaleString()}`);
    }
    
  } catch (error) {
    console.log('⚠️ No se pudo verificar auth.users:', error.message);
  }
}

async function runCompleteCheck() {
  console.log('🚀 Iniciando verificación completa de la base de datos...\n');
  
  await checkDatabaseStructure();
  await checkAuthUsers();
  
  console.log('\n✨ Verificación completada');
  console.log('\n📝 Próximos pasos sugeridos:');
  console.log('1. Si no hay tabla "usuarios", ejecuta setup_database.sql');
  console.log('2. Si hay tabla "perfiles" o "users", considera migrar o adaptar el código');
  console.log('3. Crea usuarios de prueba con createTestUsers.js');
  console.log('4. Verifica la autenticación en la aplicación');
}

// Funciones disponibles para la consola
if (typeof window !== 'undefined') {
  window.checkDatabase = {
    full: runCompleteCheck,
    structure: checkDatabaseStructure,
    users: checkExistingUsers,
    auth: checkAuthUsers
  };
  
  console.log('🛠️ Funciones disponibles en window.checkDatabase:');
  console.log('- full(): Verificación completa');
  console.log('- structure(): Verificar estructura de tablas');
  console.log('- users(): Verificar usuarios existentes');
  console.log('- auth(): Verificar auth.users');
}

// Ejecutar automáticamente
runCompleteCheck();

export { runCompleteCheck, checkDatabaseStructure, checkExistingUsers, checkAuthUsers };
