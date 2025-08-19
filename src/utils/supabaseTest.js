import supabase from '../api/supabaseClient.js';

/**
 * Función para probar la conexión con Supabase y verificar datos existentes
 */
export const testSupabaseData = async () => {
  console.log('🔍 Probando conexión con Supabase y verificando datos...');
  
  try {
    // 1. Probar conexión básica con pacientes
    console.log('📊 Verificando tabla de pacientes...');
    const { data: patientsCount, error: patientsCountError } = await supabase
      .from('pacientes')
      .select('*', { count: 'exact', head: true });
    
    if (patientsCountError) {
      console.error('❌ Error al contar pacientes:', patientsCountError);
    } else {
      console.log(`✅ Total de pacientes: ${patientsCount.count || 0}`);
    }
    
    // 2. Obtener muestra de pacientes
    const { data: patients, error: patientsError } = await supabase
      .from('pacientes')
      .select('*')
      .limit(5);
    
    if (patientsError) {
      console.error('❌ Error al obtener pacientes:', patientsError);
    } else {
      console.log('👥 Muestra de pacientes:', patients);
    }
    
    // 3. Verificar resultados de evaluaciones
    console.log('📋 Verificando resultados de evaluación...');
    const { data: resultsCount, error: resultsError } = await supabase
      .from('resultados_evaluacion')
      .select('*', { count: 'exact', head: true });
    
    if (resultsError) {
      console.error('❌ Error al contar resultados:', resultsError);
    } else {
      console.log(`✅ Total de resultados de evaluación: ${resultsCount.count || 0}`);
    }
    
    // 4. Obtener muestra de resultados
    const { data: results, error: resultsDataError } = await supabase
      .from('resultados_evaluacion')
      .select('*')
      .limit(3);
    
    if (resultsDataError) {
      console.error('❌ Error al obtener resultados:', resultsDataError);
    } else {
      console.log('📋 Muestra de resultados:', results);
    }
    
    // 5. Verificar instituciones
    console.log('🏢 Verificando instituciones...');
    const { data: institutionsCount, error: institutionsError } = await supabase
      .from('instituciones')
      .select('*', { count: 'exact', head: true });
    
    if (institutionsError) {
      console.error('❌ Error al contar instituciones:', institutionsError);
    } else {
      console.log(`✅ Total de instituciones: ${institutionsCount.count || 0}`);
    }
    
    // 6. Verificar psicólogos
    console.log('👨‍⚕️ Verificando psicólogos...');
    const { data: psychologistsCount, error: psychologistsError } = await supabase
      .from('psicologos')
      .select('*', { count: 'exact', head: true });
    
    if (psychologistsError) {
      console.error('❌ Error al contar psicólogos:', psychologistsError);
    } else {
      console.log(`✅ Total de psicólogos: ${psychologistsCount.count || 0}`);
    }
    
    // 7. Verificar estructura de tablas relacionadas
    console.log('🗂️ Verificando tablas del sistema...');
    const tables = ['pacientes', 'resultados_evaluacion', 'instituciones', 'psicologos', 'usuarios'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Tabla '${table}': Error - ${error.message}`);
        } else {
          console.log(`✅ Tabla '${table}': ${data.count || 0} registros`);
        }
      } catch (err) {
        console.log(`❌ Tabla '${table}': Error inesperado - ${err.message}`);
      }
    }
    
    return {
      success: true,
      data: {
        patientsCount: patientsCount?.count || 0,
        samplePatients: patients || [],
        resultsCount: resultsCount?.count || 0,
        sampleResults: results || [],
        institutionsCount: institutionsCount?.count || 0,
        psychologistsCount: psychologistsCount?.count || 0
      }
    };
    
  } catch (error) {
    console.error('💥 Error inesperado:', error);
    return { success: false, error };
  }
};

/**
 * Función para obtener estadísticas detalladas de pacientes
 */
export const getPatientStats = async () => {
  console.log('📈 Obteniendo estadísticas detalladas de pacientes...');
  
  try {
    // Obtener pacientes con relaciones
    const { data: patientsWithRelations, error } = await supabase
      .from('pacientes')
      .select(`
        *,
        instituciones(id, nombre),
        psicologos(id, nombre, apellidos)
      `)
      .limit(10);
    
    if (error) {
      console.error('❌ Error al obtener pacientes con relaciones:', error);
      return { success: false, error };
    }
    
    console.log('👥 Pacientes con relaciones:', patientsWithRelations);
    
    // Estadísticas por género
    const { data: allPatients, error: genderError } = await supabase
      .from('pacientes')
      .select('genero, fecha_nacimiento')
      .not('genero', 'is', null);
    
    if (!genderError && allPatients) {
      const genderCount = allPatients.reduce((acc, patient) => {
        acc[patient.genero] = (acc[patient.genero] || 0) + 1;
        return acc;
      }, {});
      console.log('📊 Distribución por género:', genderCount);
      
      // Calcular edades
      const currentYear = new Date().getFullYear();
      const ages = allPatients
        .filter(p => p.fecha_nacimiento)
        .map(p => currentYear - new Date(p.fecha_nacimiento).getFullYear());
      
      const avgAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
      console.log('📊 Edad promedio:', Math.round(avgAge));
    }
    
    return {
      success: true,
      data: {
        patientsWithRelations,
        genderStats: allPatients || []
      }
    };
    
  } catch (error) {
    console.error('💥 Error inesperado en estadísticas:', error);
    return { success: false, error };
  }
};

// Función para ejecutar todas las pruebas
export const runAllTests = async () => {
  console.log('🚀 Ejecutando todas las pruebas de Supabase...');
  
  const dataTest = await testSupabaseData();
  const statsTest = await getPatientStats();
  
  return {
    dataTest,
    statsTest
  };
};
