/**
 * Pruebas manuales para el servicio enhancedSupabaseService
 * Este archivo contiene funciones que pueden ejecutarse manualmente
 * para verificar el funcionamiento de las operaciones CRUD.
 */

import enhancedSupabaseService from '../services/enhancedSupabaseService';
import supabase from '../api/supabaseClient';

// Función auxiliar para imprimir resultados
const printResult = (operation, entity, result) => {
  console.log(`\n--- ${operation} ${entity} ---`);
  if (result.error) {
    console.error(`Error: ${result.error.message}`);
    console.error(result.error.original);
  } else {
    console.log('Éxito!');
    console.log(result.data);
    if (result.isOffline) {
      console.log('(Operación realizada en modo offline)');
    }
  }
};

// Función para ejecutar pruebas de instituciones
export const testInstituciones = async () => {
  console.log('\n=== PRUEBAS DE INSTITUCIONES ===');
  
  // Obtener instituciones
  const getResult = await enhancedSupabaseService.getInstitutions();
  printResult('GET', 'instituciones', getResult);
  
  // Crear institución
  const createResult = await enhancedSupabaseService.createInstitution({
    nombre: `Test Institución ${Date.now()}`,
    direccion: 'Dirección de prueba',
    telefono: '123456789'
  });
  printResult('CREATE', 'institución', createResult);
  
  if (createResult.data && !createResult.error) {
    const id = createResult.data.id;
    
    // Actualizar institución
    const updateResult = await enhancedSupabaseService.updateInstitution(id, {
      nombre: `${createResult.data.nombre} (Actualizada)`,
      direccion: 'Dirección actualizada'
    });
    printResult('UPDATE', 'institución', updateResult);
    
    // Eliminar institución
    const deleteResult = await enhancedSupabaseService.deleteInstitution(id);
    printResult('DELETE', 'institución', deleteResult);
  }
  
  return 'Pruebas de instituciones completadas';
};

// Función para ejecutar pruebas de psicólogos
export const testPsicologos = async () => {
  console.log('\n=== PRUEBAS DE PSICÓLOGOS ===');
  
  // Obtener instituciones para asociar el psicólogo
  const instResult = await enhancedSupabaseService.getInstitutions();
  if (!instResult.data || instResult.data.length === 0) {
    console.error('No hay instituciones disponibles para crear psicólogo');
    return 'Error: No hay instituciones disponibles';
  }
  
  // Obtener psicólogos
  const getResult = await enhancedSupabaseService.getPsychologists();
  printResult('GET', 'psicólogos', getResult);
  
  // Crear usuario para el psicólogo
  const timestamp = Date.now();
  const email = `test.psicologo.${timestamp}@example.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'Temporal123!',
    options: {
      data: {
        rol: 'psicologo',
        nombre_completo: `Test Psicólogo ${timestamp}`
      }
    }
  });
  
  if (authError) {
    console.error('Error al crear usuario para psicólogo:', authError);
    return 'Error al crear usuario para psicólogo';
  }
  
  // Crear psicólogo
  const createResult = await enhancedSupabaseService.createPsychologist({
    nombre: `Test`,
    apellidos: `Psicólogo ${timestamp}`,
    email,
    documento_identidad: `DOC-${timestamp}`,
    telefono: '987654321',
    institucion_id: instResult.data[0].id,
    usuario_id: authData.user.id
  });
  printResult('CREATE', 'psicólogo', createResult);
  
  if (createResult.data && !createResult.error) {
    const id = createResult.data.id;
    
    // Actualizar psicólogo
    const updateResult = await enhancedSupabaseService.updatePsychologist(id, {
      nombre: `Test (Actualizado)`,
      apellidos: `Psicólogo ${timestamp}`,
      documento_identidad: `DOC-${timestamp}-UPD`,
      telefono: '987654322'
    });
    printResult('UPDATE', 'psicólogo', updateResult);
    
    // Eliminar psicólogo
    const deleteResult = await enhancedSupabaseService.deletePsychologist(id);
    printResult('DELETE', 'psicólogo', deleteResult);
  }
  
  return 'Pruebas de psicólogos completadas';
};

// Función para ejecutar pruebas de pacientes
export const testPacientes = async () => {
  console.log('\n=== PRUEBAS DE PACIENTES ===');
  
  // Obtener instituciones para asociar el paciente
  const instResult = await enhancedSupabaseService.getInstitutions();
  if (!instResult.data || instResult.data.length === 0) {
    console.error('No hay instituciones disponibles para crear paciente');
    return 'Error: No hay instituciones disponibles';
  }
  
  // Obtener psicólogos para asociar el paciente (opcional)
  const psicoResult = await enhancedSupabaseService.getPsychologists();
  const psicoId = psicoResult.data && psicoResult.data.length > 0 ? psicoResult.data[0].id : null;
  
  // Obtener pacientes
  const getResult = await enhancedSupabaseService.getPatients();
  printResult('GET', 'pacientes', getResult);
  
  // Crear paciente
  const timestamp = Date.now();
  const createResult = await enhancedSupabaseService.createPatient({
    nombre: `Test Paciente ${timestamp}`,
    fecha_nacimiento: '2000-01-01',
    genero: 'Masculino',
    institucion_id: instResult.data[0].id,
    psicologo_id: psicoId,
    notas: 'Paciente de prueba'
  });
  printResult('CREATE', 'paciente', createResult);
  
  if (createResult.data && !createResult.error) {
    const id = createResult.data.id;
    
    // Actualizar paciente
    const updateResult = await enhancedSupabaseService.updatePatient(id, {
      nombre: `Test Paciente ${timestamp} (Actualizado)`,
      fecha_nacimiento: '2000-02-02',
      notas: 'Paciente de prueba actualizado'
    });
    printResult('UPDATE', 'paciente', updateResult);
    
    // Eliminar paciente
    const deleteResult = await enhancedSupabaseService.deletePatient(id);
    printResult('DELETE', 'paciente', deleteResult);
  }
  
  return 'Pruebas de pacientes completadas';
};

// Función para ejecutar pruebas de sincronización
export const testSincronizacion = async () => {
  console.log('\n=== PRUEBAS DE SINCRONIZACIÓN ===');
  
  // Obtener estado de sincronización
  const statusResult = enhancedSupabaseService.getSyncStatus();
  console.log('Estado de sincronización:');
  console.log(`Total operaciones pendientes: ${statusResult.pendingCount}`);
  console.log('Conteo por tipo:', statusResult.counts.byType);
  console.log('Conteo por entidad:', statusResult.counts.byEntity);
  console.log('Último intento de sincronización:', new Date(statusResult.lastSyncAttempt || 0).toLocaleString());
  
  if (statusResult.pendingCount > 0) {
    console.log('\nOperaciones pendientes:');
    statusResult.operations.forEach((op, index) => {
      console.log(`${index + 1}. ${op.type} ${op.entity} - ${op.name || op.id} (${new Date(op.timestamp).toLocaleString()})`);
    });
    
    // Sincronizar operaciones pendientes
    console.log('\nSincronizando operaciones pendientes...');
    const syncResult = await enhancedSupabaseService.syncPendingOperations();
    console.log(`Sincronización completada. Éxito: ${syncResult.success}, Sincronizadas: ${syncResult.syncedCount}, Errores: ${syncResult.errors.length}`);
    
    if (syncResult.errors.length > 0) {
      console.log('\nErrores de sincronización:');
      syncResult.errors.forEach((err, index) => {
        console.log(`${index + 1}. ${err.operation.type} ${err.operation.entity} - ${err.error.message}`);
      });
    }
  }
  
  return 'Pruebas de sincronización completadas';
};

// Función principal para ejecutar todas las pruebas
export const runAllTests = async () => {
  try {
    console.log('Iniciando pruebas del servicio enhancedSupabaseService...');
    
    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Error: Usuario no autenticado. Inicie sesión antes de ejecutar las pruebas.');
      return 'Error: Usuario no autenticado';
    }
    
    console.log(`Usuario autenticado: ${user.email}`);
    
    // Ejecutar pruebas
    await testInstituciones();
    await testPsicologos();
    await testPacientes();
    await testSincronizacion();
    
    console.log('\nPruebas completadas!');
    return 'Todas las pruebas completadas con éxito';
  } catch (error) {
    console.error('Error al ejecutar pruebas:', error);
    return `Error al ejecutar pruebas: ${error.message}`;
  }
};

// Exportar objeto con todas las funciones de prueba
export default {
  runAllTests,
  testInstituciones,
  testPsicologos,
  testPacientes,
  testSincronizacion
};
