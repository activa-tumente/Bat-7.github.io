import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const verifyTestData = async () => {
  try {
    console.log('🔍 Verificando datos del paciente de prueba...');

    // 1. Verificar que el paciente existe
    const { data: patient, error: patientError } = await supabase
      .from('pacientes')
      .select('*')
      .eq('documento', '1234567890')
      .single();

    if (patientError) {
      console.error('❌ Error al buscar paciente:', patientError);
      return;
    }

    console.log('✅ Paciente encontrado:', {
      id: patient.id,
      nombre: patient.nombre,
      apellido: patient.apellido,
      genero: patient.genero,
      documento: patient.documento
    });

    // 2. Verificar resultados
    const { data: results, error: resultsError } = await supabase
      .from('resultados')
      .select(`
        id,
        puntaje_directo,
        percentil,
        errores,
        tiempo_segundos,
        concentracion,
        aptitudes:aptitud_id (
          codigo,
          nombre
        )
      `)
      .eq('paciente_id', patient.id)
      .order('aptitudes(codigo)');

    if (resultsError) {
      console.error('❌ Error al buscar resultados:', resultsError);
      return;
    }

    console.log('✅ Resultados encontrados:', results.length);
    
    results.forEach(result => {
      console.log(`   📊 ${result.aptitudes.codigo} (${result.aptitudes.nombre}):`, {
        PD: result.puntaje_directo,
        PC: result.percentil,
        errores: result.errores,
        tiempo: `${Math.floor(result.tiempo_segundos / 60)}:${String(result.tiempo_segundos % 60).padStart(2, '0')}`,
        concentracion: `${result.concentracion}%`
      });
    });

    // 3. Verificar aptitudes disponibles
    const { data: aptitudes, error: aptitudesError } = await supabase
      .from('aptitudes')
      .select('*')
      .order('codigo');

    if (aptitudesError) {
      console.error('❌ Error al buscar aptitudes:', aptitudesError);
      return;
    }

    console.log('✅ Aptitudes disponibles:', aptitudes.length);
    aptitudes.forEach(apt => {
      console.log(`   🧠 ${apt.codigo}: ${apt.nombre}`);
    });

    // 4. Calcular estadísticas
    const promedioPC = results.reduce((sum, r) => sum + r.percentil, 0) / results.length;
    const totalErrores = results.reduce((sum, r) => sum + r.errores, 0);
    const tiempoTotal = results.reduce((sum, r) => sum + r.tiempo_segundos, 0);

    console.log('\n📈 Estadísticas del paciente:');
    console.log(`   🎯 Promedio PC: ${Math.round(promedioPC)}`);
    console.log(`   ❌ Total errores: ${totalErrores}`);
    console.log(`   ⏱️ Tiempo total: ${Math.floor(tiempoTotal / 60)} minutos`);
    console.log(`   🎨 Color de barra: ${patient.genero === 'femenino' ? 'ROSADA 💗' : 'AZUL 💙'}`);

    console.log('\n🎉 ¡Datos verificados exitosamente!');
    console.log('📝 El paciente Mariana Sanabria Rueda está listo para pruebas.');
    console.log('🌐 Puedes verla en: http://localhost:3010/admin/reports');

    return {
      patient,
      results,
      aptitudes,
      stats: {
        promedioPC: Math.round(promedioPC),
        totalErrores,
        tiempoTotal
      }
    };

  } catch (error) {
    console.error('💥 Error general:', error);
  }
};

// Ejecutar el script
verifyTestData().then(() => {
  console.log('\n✨ Verificación completada.');
  process.exit(0);
}).catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
