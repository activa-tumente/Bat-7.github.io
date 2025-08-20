/**
 * Script de diagnóstico para verificar el estado de la base de datos
 * y entender el problema de eliminación de informes
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Configurada' : 'No configurada');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Configurada' : 'No configurada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticarBaseDatos() {
  console.log('🔍 Iniciando diagnóstico de base de datos...');
  console.log('=' .repeat(60));

  try {
    // 1. Verificar conexión a Supabase
    console.log('\n1. 🔗 Verificando conexión a Supabase...');
    const { data: testConnection, error: connectionError } = await supabase
      .from('informes_generados')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('❌ Error de conexión:', connectionError.message);
      return;
    }
    console.log('✅ Conexión exitosa a Supabase');

    // 2. Contar todos los informes por estado
    console.log('\n2. 📊 Contando informes por estado...');
    const { data: informesPorEstado, error: errorEstados } = await supabase
      .from('informes_generados')
      .select('estado')
      .not('estado', 'is', null);

    if (errorEstados) {
      console.error('❌ Error obteniendo estados:', errorEstados.message);
    } else {
      const conteoEstados = informesPorEstado.reduce((acc, informe) => {
        acc[informe.estado] = (acc[informe.estado] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📈 Informes por estado:');
      Object.entries(conteoEstados).forEach(([estado, count]) => {
        console.log(`   ${estado}: ${count}`);
      });
    }

    // 3. Verificar informes "generados" (los que se muestran en la UI)
    console.log('\n3. 👁️ Informes visibles en la UI (estado="generado")...');
    const { data: informesGenerados, error: errorGenerados } = await supabase
      .from('informes_generados')
      .select(`
        id,
        titulo,
        fecha_generacion,
        estado,
        pacientes:paciente_id (
          nombre,
          apellido
        )
      `)
      .eq('tipo_informe', 'completo')
      .eq('estado', 'generado')
      .order('fecha_generacion', { ascending: false })
      .limit(10);

    if (errorGenerados) {
      console.error('❌ Error obteniendo informes generados:', errorGenerados.message);
    } else {
      console.log(`📋 Total de informes visibles: ${informesGenerados.length}`);
      console.log('\n🔍 Primeros 10 informes:');
      informesGenerados.forEach((informe, index) => {
        const paciente = informe.pacientes;
        const nombrePaciente = paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Sin paciente';
        console.log(`   ${index + 1}. ID: ${informe.id} | ${nombrePaciente} | ${informe.fecha_generacion}`);
      });
    }

    // 4. Verificar informes "eliminados"
    console.log('\n4. 🗑️ Informes marcados como eliminados...');
    const { data: informesEliminados, error: errorEliminados } = await supabase
      .from('informes_generados')
      .select(`
        id,
        titulo,
        fecha_generacion,
        estado,
        pacientes:paciente_id (
          nombre,
          apellido
        )
      `)
      .eq('estado', 'eliminado')
      .order('fecha_generacion', { ascending: false })
      .limit(10);

    if (errorEliminados) {
      console.error('❌ Error obteniendo informes eliminados:', errorEliminados.message);
    } else {
      console.log(`🗑️ Total de informes eliminados: ${informesEliminados.length}`);
      if (informesEliminados.length > 0) {
        console.log('\n🔍 Últimos 10 informes eliminados:');
        informesEliminados.forEach((informe, index) => {
          const paciente = informe.pacientes;
          const nombrePaciente = paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Sin paciente';
          console.log(`   ${index + 1}. ID: ${informe.id} | ${nombrePaciente} | ${informe.fecha_generacion}`);
        });
      }
    }

    // 5. Verificar duplicados
    console.log('\n5. 🔄 Verificando duplicados por paciente...');
    const { data: todosPacientes, error: errorPacientes } = await supabase
      .from('informes_generados')
      .select(`
        paciente_id,
        pacientes:paciente_id (
          nombre,
          apellido
        )
      `)
      .eq('estado', 'generado');

    if (errorPacientes) {
      console.error('❌ Error verificando duplicados:', errorPacientes.message);
    } else {
      const conteosPorPaciente = todosPacientes.reduce((acc, informe) => {
        const pacienteId = informe.paciente_id;
        acc[pacienteId] = (acc[pacienteId] || 0) + 1;
        return acc;
      }, {});

      const duplicados = Object.entries(conteosPorPaciente)
        .filter(([_, count]) => count > 1)
        .map(([pacienteId, count]) => {
          const informe = todosPacientes.find(i => i.paciente_id === pacienteId);
          const paciente = informe?.pacientes;
          const nombrePaciente = paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Sin nombre';
          return { pacienteId, count, nombrePaciente };
        });

      if (duplicados.length > 0) {
        console.log(`⚠️ Se encontraron ${duplicados.length} pacientes con informes duplicados:`);
        duplicados.forEach(({ pacienteId, count, nombrePaciente }) => {
          console.log(`   ${nombrePaciente} (ID: ${pacienteId}): ${count} informes`);
        });
      } else {
        console.log('✅ No se encontraron duplicados');
      }
    }

    // 6. Verificar estructura de la tabla
    console.log('\n6. 🏗️ Verificando estructura de la tabla...');
    const { data: estructura, error: errorEstructura } = await supabase
      .rpc('get_table_info', { table_name: 'informes_generados' })
      .single();

    if (errorEstructura) {
      console.log('ℹ️ No se pudo obtener información de estructura (función RPC no disponible)');
    } else {
      console.log('📋 Estructura de tabla obtenida exitosamente');
    }

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error.message);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Diagnóstico completado');
}

// Función para simular eliminación y verificar comportamiento
async function simularEliminacion() {
  console.log('\n🧪 Simulando proceso de eliminación...');
  
  try {
    // Obtener un informe para simular eliminación
    const { data: informeParaTest, error: errorTest } = await supabase
      .from('informes_generados')
      .select('id, pacientes:paciente_id(nombre, apellido)')
      .eq('estado', 'generado')
      .limit(1)
      .single();

    if (errorTest || !informeParaTest) {
      console.log('ℹ️ No hay informes disponibles para simular eliminación');
      return;
    }

    const informeId = informeParaTest.id;
    const paciente = informeParaTest.pacientes;
    const nombrePaciente = paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Sin nombre';
    
    console.log(`🎯 Simulando eliminación del informe ID: ${informeId} (${nombrePaciente})`);
    
    // Simular el proceso de eliminación (solo mostrar lo que haría)
    console.log('📝 Consulta que se ejecutaría:');
    console.log(`   UPDATE informes_generados SET estado = 'eliminado' WHERE id = ${informeId}`);
    
    console.log('⚠️ NOTA: Esta es solo una simulación. No se realizó ningún cambio real.');
    
  } catch (error) {
    console.error('❌ Error en simulación:', error.message);
  }
}

// Ejecutar diagnóstico
async function main() {
  await diagnosticarBaseDatos();
  await simularEliminacion();
}

main().catch(console.error);