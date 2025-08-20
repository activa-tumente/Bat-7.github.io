/**
 * Script para solucionar el problema de informes que aparecen eliminados
 * pero siguen mostrándose en la UI
 * 
 * INSTRUCCIONES DE USO:
 * 1. Abrir la aplicación en el navegador
 * 2. Abrir las herramientas de desarrollador (F12)
 * 3. Ir a la pestaña Console
 * 4. Copiar y pegar este script completo
 * 5. Ejecutar: await diagnosticarYSolucionarProblema()
 */

async function diagnosticarYSolucionarProblema() {
  console.log('🔍 INICIANDO DIAGNÓSTICO Y SOLUCIÓN DEL PROBLEMA DE INFORMES');
  console.log('=' .repeat(60));

  // Verificar que estamos en el contexto correcto
  if (typeof window === 'undefined' || !window.supabase) {
    console.error('❌ Este script debe ejecutarse en el navegador con Supabase disponible');
    console.log('💡 Asegúrate de estar en la aplicación web y que Supabase esté cargado');
    return;
  }

  const supabase = window.supabase;

  try {
    // 1. Verificar estado actual de la base de datos
    console.log('\n1️⃣ VERIFICANDO ESTADO ACTUAL DE LA BASE DE DATOS');
    
    const { data: todosLosInformes, error: errorTodos } = await supabase
      .from('informes_generados')
      .select('id, estado, tipo_informe, fecha_generacion, titulo')
      .order('fecha_generacion', { ascending: false });

    if (errorTodos) {
      console.error('❌ Error consultando informes:', errorTodos);
      return;
    }

    console.log(`📊 Total de informes en la base de datos: ${todosLosInformes.length}`);
    
    // Contar por estado
    const conteoEstados = todosLosInformes.reduce((acc, informe) => {
      const estado = informe.estado || 'NULL';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    console.log('📈 Conteo por estado:');
    Object.entries(conteoEstados).forEach(([estado, count]) => {
      console.log(`   ${estado}: ${count}`);
    });

    // 2. Verificar qué consulta usa la UI
    console.log('\n2️⃣ SIMULANDO CONSULTA DE LA UI');
    
    const { data: informesUI, error: errorUI } = await supabase
      .from('informes_generados')
      .select(`
        id,
        titulo,
        descripcion,
        fecha_generacion,
        metadatos,
        contenido,
        pacientes:paciente_id (
          id,
          nombre,
          apellido,
          documento,
          genero
        )
      `)
      .eq('tipo_informe', 'completo')
      .eq('estado', 'generado')
      .order('fecha_generacion', { ascending: false });

    if (errorUI) {
      console.error('❌ Error en consulta UI:', errorUI);
      return;
    }

    console.log(`📱 Informes que debería mostrar la UI: ${informesUI.length}`);

    // 3. Identificar el problema
    console.log('\n3️⃣ IDENTIFICANDO EL PROBLEMA');
    
    const informesEliminados = todosLosInformes.filter(i => i.estado === 'eliminado');
    const informesGenerados = todosLosInformes.filter(i => i.estado === 'generado');
    const informesNulos = todosLosInformes.filter(i => !i.estado);

    console.log(`🗑️  Informes marcados como eliminados: ${informesEliminados.length}`);
    console.log(`✅ Informes marcados como generados: ${informesGenerados.length}`);
    console.log(`❓ Informes con estado NULL: ${informesNulos.length}`);

    // 4. Proponer soluciones
    console.log('\n4️⃣ SOLUCIONES PROPUESTAS');
    
    if (informesEliminados.length > 0 && informesGenerados.length === 0) {
      console.log('🎯 PROBLEMA IDENTIFICADO: Todos los informes están marcados como eliminados');
      console.log('💡 SOLUCIÓN 1: Restaurar algunos informes recientes');
      
      // Preguntar al usuario si quiere restaurar
      const confirmar = confirm(`¿Deseas restaurar los 10 informes más recientes?\n\nEsto cambiará su estado de 'eliminado' a 'generado' para que aparezcan en la UI.`);
      
      if (confirmar) {
        // Obtener los 10 informes más recientes eliminados
        const informesRecientes = informesEliminados
          .sort((a, b) => new Date(b.fecha_generacion) - new Date(a.fecha_generacion))
          .slice(0, 10);

        console.log(`🔄 Restaurando ${informesRecientes.length} informes más recientes...`);
        
        let restaurados = 0;
        for (const informe of informesRecientes) {
          const { error: errorUpdate } = await supabase
            .from('informes_generados')
            .update({ estado: 'generado' })
            .eq('id', informe.id);

          if (errorUpdate) {
            console.error(`❌ Error restaurando informe ${informe.id}:`, errorUpdate);
          } else {
            console.log(`✅ Restaurado: ${informe.titulo || 'Sin título'} (${informe.id})`);
            restaurados++;
          }
        }

        console.log(`\n🎉 RESTAURACIÓN COMPLETADA: ${restaurados} informes restaurados`);
        
        // Verificar resultado
        const { data: verificacion } = await supabase
          .from('informes_generados')
          .select('id')
          .eq('tipo_informe', 'completo')
          .eq('estado', 'generado');

        console.log(`📊 Informes disponibles después de la restauración: ${verificacion?.length || 0}`);
        
        // Disparar evento para recargar la UI
        console.log('🔄 Disparando evento para recargar la UI...');
        window.dispatchEvent(new CustomEvent('informesGenerados', {
          detail: { 
            count: restaurados,
            timestamp: Date.now(),
            source: 'diagnostico_restauracion'
          }
        }));
        
        alert(`✅ Se han restaurado ${restaurados} informes.\n\nLa página debería actualizarse automáticamente.\nSi no se actualiza, recarga la página (F5).`);
      } else {
        console.log('ℹ️ Restauración cancelada por el usuario');
      }
    } else if (informesGenerados.length > 0) {
      console.log('✅ HAY INFORMES DISPONIBLES EN LA BASE DE DATOS');
      console.log('🔍 El problema puede estar en el frontend (caché, estado local, etc.)');
    }

    // 5. Verificar problemas de caché y estado local
    console.log('\n5️⃣ VERIFICANDO PROBLEMAS DE CACHÉ Y ESTADO LOCAL');
    
    // Limpiar localStorage relacionado con informes
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('informe') || key.includes('report') || key.includes('cache'))) {
        keysToRemove.push(key);
      }
    }
    
    if (keysToRemove.length > 0) {
      console.log(`🧹 Limpiando ${keysToRemove.length} entradas de localStorage...`);
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`   Eliminado: ${key}`);
      });
    } else {
      console.log('ℹ️ No se encontraron datos relacionados en localStorage');
    }

    // 6. Sugerencias de mejora
    console.log('\n6️⃣ SUGERENCIAS DE MEJORA DEL CÓDIGO');
    console.log('🔧 PROBLEMAS IDENTIFICADOS EN EL CÓDIGO:');
    console.log('   1. Uso de window.addEventListener en lugar de Context API');
    console.log('   2. Estado local no sincronizado con la base de datos');
    console.log('   3. Falta de invalidación de caché después de eliminaciones');
    console.log('   4. No hay un estado global centralizado para informes');
    
    console.log('\n💡 SOLUCIONES RECOMENDADAS:');
    console.log('   1. Implementar InformesProvider en App.jsx');
    console.log('   2. Usar useInformes hook en lugar de estado local');
    console.log('   3. Implementar invalidación automática de caché');
    console.log('   4. Agregar logs de debugging para rastrear cambios de estado');

    // 7. Acciones inmediatas
    console.log('\n7️⃣ ACCIONES INMEDIATAS RECOMENDADAS');
    console.log('🔄 Para solucionar el problema ahora:');
    console.log('   1. Recargar la página completamente (Ctrl+F5 o Cmd+Shift+R)');
    console.log('   2. Si el problema persiste, ejecutar: location.reload(true)');
    console.log('   3. Verificar que no hay errores en la consola del navegador');

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 DIAGNÓSTICO COMPLETADO');
  console.log('\n💡 Para ejecutar nuevamente: await diagnosticarYSolucionarProblema()');
}

// Función para forzar recarga de datos
async function forzarRecargaDatos() {
  console.log('🔄 FORZANDO RECARGA DE DATOS...');
  
  // Limpiar caché
  localStorage.clear();
  sessionStorage.clear();
  
  // Disparar eventos de recarga
  window.dispatchEvent(new CustomEvent('informesGenerados', {
    detail: { 
      count: 0,
      timestamp: Date.now(),
      source: 'forzar_recarga'
    }
  }));
  
  // Recargar página después de un delay
  setTimeout(() => {
    location.reload(true);
  }, 1000);
}

// Función para verificar estado actual rápido
async function verificarEstadoRapido() {
  if (typeof window === 'undefined' || !window.supabase) {
    console.error('❌ Supabase no disponible');
    return;
  }

  const { data, error } = await window.supabase
    .from('informes_generados')
    .select('estado')
    .eq('tipo_informe', 'completo');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  const conteo = data.reduce((acc, item) => {
    acc[item.estado || 'NULL'] = (acc[item.estado || 'NULL'] || 0) + 1;
    return acc;
  }, {});

  console.log('📊 Estado actual de informes:', conteo);
}

// Hacer funciones disponibles globalmente
if (typeof window !== 'undefined') {
  window.diagnosticarYSolucionarProblema = diagnosticarYSolucionarProblema;
  window.forzarRecargaDatos = forzarRecargaDatos;
  window.verificarEstadoRapido = verificarEstadoRapido;
  
  console.log('🔧 FUNCIONES DISPONIBLES EN LA CONSOLA:');
  console.log('   await diagnosticarYSolucionarProblema() - Diagnóstico completo');
  console.log('   await forzarRecargaDatos() - Forzar recarga');
  console.log('   await verificarEstadoRapido() - Verificación rápida');
}

// Auto-ejecutar verificación rápida si estamos en el navegador
if (typeof window !== 'undefined' && window.supabase) {
  console.log('🚀 Ejecutando verificación rápida automática...');
  verificarEstadoRapido();
}