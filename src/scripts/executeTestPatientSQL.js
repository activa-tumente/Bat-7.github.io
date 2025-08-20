import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ No encontrada');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurada' : '❌ No encontrada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const createTestPatient = async () => {
  try {
    console.log('🚀 Iniciando creación del paciente de prueba Mariana Sanabria Rueda...');

    // 1. Verificar si el paciente ya existe
    const { data: existingPatient } = await supabase
      .from('pacientes')
      .select('id, nombre, apellido')
      .eq('documento', '1234567890')
      .single();

    if (existingPatient) {
      console.log('⚠️ El paciente ya existe:', existingPatient);
      console.log('🔄 Eliminando datos existentes para recrear...');

      // Eliminar resultados existentes
      await supabase
        .from('resultados')
        .delete()
        .eq('paciente_id', existingPatient.id);

      // Eliminar paciente existente
      await supabase
        .from('pacientes')
        .delete()
        .eq('id', existingPatient.id);
    }

    // 2. Crear el paciente (sin campos que no existen)
    const patientData = {
      nombre: 'Mariana',
      apellido: 'Sanabria Rueda',
      documento: '1234567890',
      fecha_nacimiento: '2000-02-25', // Cambiado a una fecha más realista
      genero: 'femenino',
      email: 'marianasanabria@gmail.com',
      telefono: '3001234567'
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

    // 3. Obtener todas las aptitudes disponibles
    const { data: aptitudes, error: aptitudesError } = await supabase
      .from('aptitudes')
      .select('*')
      .order('codigo');

    if (aptitudesError) {
      console.error('❌ Error al obtener aptitudes:', aptitudesError);
      return;
    }

    console.log('📋 Aptitudes encontradas:', aptitudes.length);

    // 4. Crear resultados para cada aptitud
    const testResults = {
      'V': { puntaje_directo: 85, errores: 3, tiempo_segundos: 1200, percentil: 88 }, // Verbal
      'E': { puntaje_directo: 78, errores: 5, tiempo_segundos: 1350, percentil: 82 }, // Espacial
      'A': { puntaje_directo: 92, errores: 2, tiempo_segundos: 900, percentil: 95 },  // Atención
      'R': { puntaje_directo: 88, errores: 4, tiempo_segundos: 1100, percentil: 91 }, // Razonamiento
      'N': { puntaje_directo: 82, errores: 6, tiempo_segundos: 1250, percentil: 85 }, // Numérico
      'M': { puntaje_directo: 75, errores: 8, tiempo_segundos: 1400, percentil: 78 }, // Mecánica
      'O': { puntaje_directo: 90, errores: 1, tiempo_segundos: 800, percentil: 93 }   // Ortografía
    };

    const resultados = [];

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
          percentil: testData.percentil,
          errores: testData.errores,
          tiempo_segundos: testData.tiempo_segundos,
          concentracion: parseFloat(concentracion.toFixed(2))
        };

        resultados.push(resultado);
        console.log(`📊 Preparando resultado para ${aptitud.codigo} (${aptitud.nombre})`);
      }
    }

    // 5. Insertar todos los resultados
    const { data: insertedResults, error: resultsError } = await supabase
      .from('resultados')
      .insert(resultados)
      .select();

    if (resultsError) {
      console.error('❌ Error al crear resultados:', resultsError);
      return;
    }

    console.log('✅ Resultados creados exitosamente:', insertedResults.length);

    // 6. Verificar si el psicólogo ya existe
    const { data: existingPsychologist } = await supabase
      .from('psicologos')
      .select('id, nombre, apellido')
      .eq('documento', '9876543210')
      .single();

    if (!existingPsychologist) {
      // Crear psicólogo asignado
      const psychologistData = {
        nombre: 'Julieta',
        apellido: 'Hernández Herrera',
        documento: '9876543210',
        email: 'julieta.hernandez@bat7.com',
        telefono: '3009876543',
        especialidad: 'Psicología Clínica',
        numero_licencia: 'PSI-2024-001',
        estado: 'activo'
      };

      const { data: psychologist, error: psychError } = await supabase
        .from('psicologos')
        .insert([psychologistData])
        .select()
        .single();

      if (psychError) {
        console.log('⚠️ Error al crear psicólogo:', psychError.message);
      } else {
        console.log('✅ Psicólogo creado exitosamente:', psychologist);
      }
    } else {
      console.log('✅ Psicólogo ya existe:', existingPsychologist);
    }

    console.log('\n🎉 ¡Paciente de prueba creado exitosamente!');
    console.log('📋 Resumen:');
    console.log(`   👤 Paciente: ${patient.nombre} ${patient.apellido}`);
    console.log(`   📧 Email: ${patient.email}`);
    console.log(`   🎂 Fecha de nacimiento: ${patient.fecha_nacimiento}`);
    console.log(`   📊 Tests aplicados: ${insertedResults.length}`);
    console.log(`   🧠 Aptitudes evaluadas: ${aptitudes.map(a => a.codigo).join(', ')}`);
    console.log(`   💼 Documento: ${patient.documento}`);
    console.log(`   👩 Género: ${patient.genero} (aparecerá con barra ROSADA)`);

    return {
      patient,
      results: insertedResults,
      aptitudes
    };

  } catch (error) {
    console.error('💥 Error general:', error);
  }
};

// Ejecutar el script
createTestPatient().then(() => {
  console.log('\n✨ Script completado. Puedes verificar los resultados en la aplicación.');
  process.exit(0);
}).catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});