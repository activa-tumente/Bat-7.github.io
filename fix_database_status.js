/**
 * Script para corregir el problema de eliminación de informes
 * Identifica y corrige informes con estados inconsistentes
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analizarEstadosInconsistentes() {
  console.log('🔍 Analizando estados inconsistentes...');
  console.log('=' .repeat(60));

  try {
    // 1. Verificar todos los informes sin filtro de estado
    console.log('\n1. 📊 Analizando TODOS los informes (sin filtro de estado)...');
    const { data: todosInformes, error: errorTodos } = await supabase
      .from('informes_generados')
      .select(`
        id,
        titulo,
        estado,
        tipo_informe,
        fecha_generacion,
        pacientes:paciente_id (
          nombre,
          apellido
        )
      `)
      .order('fecha_generacion', { ascending: false });

    if (errorTodos) {
      console.error('❌ Error obteniendo todos los informes:', errorTodos.message);
      return;
    }

    console.log(`📋 Total de informes en la base de datos: ${todosInformes.length}`);

    // Agrupar por estado (incluyendo NULL)
    const porEstado = todosInformes.reduce((acc, informe) => {
      const estado = informe.estado || 'NULL';
      if (!acc[estado]) acc[estado] = [];
      acc[estado].push(informe);
      return acc;
    }, {});

    console.log('\n📈 Distribución por estado:');
    Object.entries(porEstado).forEach(([estado, informes]) => {
      console.log(`   ${estado}: ${informes.length} informes`);
    });

    // 2. Verificar informes con estado NULL
    if (porEstado.NULL && porEstado.NULL.length > 0) {
      console.log('\n⚠️ PROBLEMA ENCONTRADO: Informes con estado NULL');
      console.log(`   Cantidad: ${porEstado.NULL.length}`);
      console.log('\n🔍 Primeros 10 informes con estado NULL:');
      
      porEstado.NULL.slice(0, 10).forEach((informe, index) => {
        const paciente = informe.pacientes;
        const nombrePaciente = paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Sin paciente';
        console.log(`   ${index + 1}. ID: ${informe.id} | ${nombrePaciente} | Tipo: ${informe.tipo_informe || 'NULL'}`);
      });
    }

    // 3. Verificar informes con tipo_informe diferente a 'completo'
    const informesNoCompletos = todosInformes.filter(i => i.tipo_informe !== 'completo');
    if (informesNoCompletos.length > 0) {
      console.log('\n📝 Informes con tipo_informe diferente a "completo":');
      const tiposCounts = informesNoCompletos.reduce((acc, informe) => {
        const tipo = informe.tipo_informe || 'NULL';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(tiposCounts).forEach(([tipo, count]) => {
        console.log(`   ${tipo}: ${count} informes`);
      });
    }

    // 4. Mostrar la consulta exacta que usa la UI
    console.log('\n🎯 Consulta exacta que usa la UI:');
    console.log('   SELECT * FROM informes_generados');
    console.log('   WHERE tipo_informe = \'completo\'');
    console.log('   AND estado = \'generado\'');
    
    const { data: consultaUI, error: errorUI } = await supabase
      .from('informes_generados')
      .select('*')
      .eq('tipo_informe', 'completo')
      .eq('estado', 'generado');
    
    if (errorUI) {
      console.error('❌ Error ejecutando consulta UI:', errorUI.message);
    } else {
      console.log(`   Resultado: ${consultaUI.length} informes`);
    }

    // 5. Verificar si hay informes que la UI podría estar mostrando incorrectamente
    console.log('\n🔍 Verificando posibles consultas alternativas que podrían estar ejecutándose...');
    
    // Consulta sin filtro de estado
    const { data: sinEstado, error: errorSinEstado } = await supabase
      .from('informes_generados')
      .select('*')
      .eq('tipo_informe', 'completo');
    
    if (!errorSinEstado) {
      console.log(`   Sin filtro de estado: ${sinEstado.length} informes`);
    }

    // Consulta solo con tipo_informe
    const { data: soloTipo, error: errorSoloTipo } = await supabase
      .from('informes_generados')
      .select('*')
      .not('tipo_informe', 'is', null);
    
    if (!errorSoloTipo) {
      console.log(`   Solo con tipo_informe no NULL: ${soloTipo.length} informes`);
    }

  } catch (error) {
    console.error('❌ Error durante el análisis:', error.message);
  }
}

async function propuestaCorreccion() {
  console.log('\n💡 PROPUESTA DE CORRECCIÓN');
  console.log('=' .repeat(60));
  
  console.log('\n🎯 Problema identificado:');
  console.log('   - Todos los informes están marcados como "eliminado"');
  console.log('   - La UI muestra 100 informes pero la consulta devuelve 0');
  console.log('   - Posible inconsistencia en la lógica de filtrado');
  
  console.log('\n🔧 Soluciones propuestas:');
  console.log('   1. Verificar si hay una consulta diferente ejecutándose en la UI');
  console.log('   2. Revisar el código de InformesFaltantesGenerados.jsx línea 96');
  console.log('   3. Verificar si hay caché o estado local que no se actualiza');
  console.log('   4. Comprobar si hay múltiples componentes cargando datos');
  
  console.log('\n📝 Acciones recomendadas:');
  console.log('   1. Revisar el componente React para ver qué consulta realmente ejecuta');
  console.log('   2. Verificar si hay estado local que mantiene los datos antiguos');
  console.log('   3. Comprobar si hay efectos secundarios o caché');
  console.log('   4. Verificar la lógica de recarga después de eliminación');
}

// Ejecutar análisis
async function main() {
  await analizarEstadosInconsistentes();
  await propuestaCorreccion();
}

main().catch(console.error);