// src/scripts/runSetupTestUsers.js
import { setupTestUsers } from './setupTestUsers';

/**
 * Script ejecutable para verificar y crear usuarios de prueba en Supabase
 */
console.log('Iniciando verificación y creación de usuarios de prueba...');

setupTestUsers()
  .then(results => {
    console.log('\nResumen de resultados:');
    console.log('====================');
    
    // Mostrar resultados por usuario
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.email}: ${result.message}`);
    });
    
    // Estadísticas
    const existingUsers = results.filter(r => r.exists).length;
    const createdUsers = results.filter(r => r.created).length;
    const failedUsers = results.filter(r => !r.success).length;
    
    console.log('\nEstadísticas:');
    console.log(`- Usuarios existentes: ${existingUsers}`);
    console.log(`- Usuarios creados: ${createdUsers}`);
    console.log(`- Usuarios con error: ${failedUsers}`);
    
    if (failedUsers === 0) {
      console.log('\n✅ Todos los usuarios de prueba están configurados correctamente.');
    } else {
      console.log('\n⚠️ Algunos usuarios no pudieron ser configurados. Revise los errores anteriores.');
    }
  })
  .catch(error => {
    console.error('\n❌ Error en el script:', error);
  })
  .finally(() => {
    console.log('\nScript finalizado');
  });