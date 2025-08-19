import supabase from '../api/supabaseClient.js';

/**
 * Script para crear el paciente de prueba Mariana Sanabria Rueda
 * y generar resultados de tests para todas las aptitudes
 */

const createTestPatient = async () => {
  try {
    console.log('🚀 Iniciando creación del paciente de prueba...');

    // 1. Crear el paciente
    const patientData = {
      nombre: 'Mariana',
      apellido: 'Sanabria Rueda',
      documento: '1234567890',
      fecha_nacimiento: '2025-02-25',
      genero: 'femenino',
      email: 'marianasanabria@gmail.com',
      telefono: '3001234567',
      direccion: 'Calle 123 #45-67',
      ciudad: 'Bogotá',
      estado: 'activo',
      created_at: new Date().toISOString()
    };

    console.log('📝 Creando paciente:', patientData);

    const { data: patient, error: patientError } = await supabase
      .from('pacientes')
      .insert([patientData])
      .select()
      .single();

    if (patientError) {
      console.error('❌ Error al crear paciente:', patientError);
      return;
    }

    console.log('✅ Paciente creado exitosamente:', patient);

    // 2. Obtener todas las aptitudes disponibles
    const { data: aptitudes, error: aptitudesError } = await supabase
      .from('aptitudes')
      .select('*')
      .order('codigo');

    if (aptitudesError) {
      console.error('❌ Error al obtener aptitudes:', aptitudesError);
      return;
    }

    console.log('📋 Aptitudes encontradas:', aptitudes.length);

    // 3. Crear resultados para cada aptitud
    const resultados = [];
    const testResults = {
      'V': { puntaje_directo: 85, errores: 3, tiempo_segundos: 1200 }, // Verbal
      'E': { puntaje_directo: 78, errores: 5, tiempo_segundos: 1350 }, // Espacial
      'A': { puntaje_directo: 92, errores: 2, tiempo_segundos: 900 },  // Atención
      'R': { puntaje_directo: 88, errores: 4, tiempo_segundos: 1100 }, // Razonamiento
      'N': { puntaje_directo: 82, errores: 6, tiempo_segundos: 1250 }, // Numérico
      'M': { puntaje_directo: 75, errores: 8, tiempo_segundos: 1400 }, // Mecánica
      'O': { puntaje_directo: 90, errores: 1, tiempo_segundos: 800 }   // Ortografía
    };

    for (const aptitud of aptitudes) {
      const testData = testResults[aptitud.codigo];
      if (testData) {
        // Calcular concentración
        const concentracion = testData.puntaje_directo > 0 ? 
          ((testData.puntaje_directo / (testData.puntaje_directo + testData.errores)) * 100) : 0;

        const resultado = {
          paciente_id: patient.id,
          aptitud_id: aptitud.id,
          puntaje_directo: testData.puntaje_directo,
          percentil: Math.min(99, Math.max(1, testData.puntaje_directo + Math.floor(Math.random() * 10))), // Percentil simulado
          errores: testData.errores,
          tiempo_segundos: testData.tiempo_segundos,
          concentracion: parseFloat(concentracion.toFixed(2)),
          nivel_educativo: 'E', // Escolar
          created_at: new Date().toISOString()
        };

        resultados.push(resultado);
        console.log(`📊 Preparando resultado para ${aptitud.codigo} (${aptitud.nombre}):`, resultado);
      }
    }

    // 4. Insertar todos los resultados
    const { data: insertedResults, error: resultsError } = await supabase
      .from('resultados')
      .insert(resultados)
      .select();

    if (resultsError) {
      console.error('❌ Error al crear resultados:', resultsError);
      return;
    }

    console.log('✅ Resultados creados exitosamente:', insertedResults.length);

    // 5. Crear psicólogo asignado
    const psychologistData = {
      nombre: 'Julieta',
      apellido: 'Hernández Herrera',
      documento: '9876543210',
      email: 'julieta.hernandez@bat7.com',
      telefono: '3009876543',
      especialidad: 'Psicología Clínica',
      numero_licencia: 'PSI-2024-001',
      estado: 'activo',
      created_at: new Date().toISOString()
    };

    const { data: psychologist, error: psychError } = await supabase
      .from('psicologos')
      .insert([psychologistData])
      .select()
      .single();

    if (psychError) {
      console.log('⚠️ Psicólogo ya existe o error al crear:', psychError.message);
    } else {
      console.log('✅ Psicólogo creado exitosamente:', psychologist);
    }

    console.log('\n🎉 ¡Paciente de prueba creado exitosamente!');
    console.log('📋 Resumen:');
    console.log(`   👤 Paciente: ${patient.nombre} ${patient.apellido}`);
    console.log(`   📧 Email: ${patient.email}`);
    console.log(`   🎂 Fecha de nacimiento: ${patient.fecha_nacimiento}`);
    console.log(`   📊 Tests aplicados: ${insertedResults.length}`);
    console.log(`   🧠 Aptitudes evaluadas: ${aptitudes.map(a => a.codigo).join(', ')}`);

    return {
      patient,
      results: insertedResults,
      aptitudes,
      psychologist
    };

  } catch (error) {
    console.error('💥 Error general:', error);
  }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestPatient();
}

export default createTestPatient;
