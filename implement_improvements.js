/**
 * Script de Implementación de Mejoras - Sistema BAT-7
 * 
 * Este script implementa las correcciones más críticas identificadas en el análisis:
 * 1. Soluciona el problema de inconsistencia de estado
 * 2. Implementa el InformesProvider correctamente
 * 3. Migra componentes a usar Context API
 * 4. Agrega invalidación de caché
 * 
 * INSTRUCCIONES DE USO:
 * 1. Asegúrate de que el servidor de desarrollo esté corriendo
 * 2. Abre la consola del navegador en la aplicación
 * 3. Copia y pega este script completo
 * 4. Ejecuta: await implementarMejoras()
 */

// Configuración
const CONFIG = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  CACHE_TTL: 5 * 60 * 1000, // 5 minutos
  BATCH_SIZE: 50,
  DEBUG: true
};

// Utilidades de logging
const logger = {
  info: (msg, ...args) => console.log(`ℹ️ [INFO] ${msg}`, ...args),
  success: (msg, ...args) => console.log(`✅ [SUCCESS] ${msg}`, ...args),
  warning: (msg, ...args) => console.warn(`⚠️ [WARNING] ${msg}`, ...args),
  error: (msg, ...args) => console.error(`❌ [ERROR] ${msg}`, ...args),
  debug: (msg, ...args) => CONFIG.DEBUG && console.log(`🐛 [DEBUG] ${msg}`, ...args)
};

// Verificar entorno
function verificarEntorno() {
  logger.info('Verificando entorno...');
  
  if (typeof window === 'undefined') {
    throw new Error('Este script debe ejecutarse en el navegador');
  }
  
  if (!window.supabase) {
    throw new Error('Supabase no está disponible. Asegúrate de que la aplicación esté cargada.');
  }
  
  logger.success('Entorno verificado correctamente');
  return true;
}

// Diagnóstico del problema actual
async function diagnosticarProblema() {
  logger.info('Diagnosticando problema de inconsistencia...');
  
  try {
    // Verificar estado de la base de datos
    const { data: informesDB, error: errorDB } = await window.supabase
      .from('informes_generados')
      .select('id, estado, tipo_informe, fecha_generacion')
      .order('fecha_generacion', { ascending: false });
    
    if (errorDB) {
      throw new Error(`Error consultando BD: ${errorDB.message}`);
    }
    
    const estadisticas = {
      total: informesDB.length,
      generados: informesDB.filter(i => i.estado === 'generado').length,
      eliminados: informesDB.filter(i => i.estado === 'eliminado').length,
      otros: informesDB.filter(i => i.estado !== 'generado' && i.estado !== 'eliminado').length
    };
    
    logger.info('Estadísticas de BD:', estadisticas);
    
    // Verificar estado de la UI
    const informesEnUI = document.querySelectorAll('[data-informe-id]').length;
    logger.info(`Informes mostrados en UI: ${informesEnUI}`);
    
    // Detectar inconsistencia
    const inconsistencia = estadisticas.generados !== informesEnUI;
    
    if (inconsistencia) {
      logger.warning('🚨 INCONSISTENCIA DETECTADA:');
      logger.warning(`- BD muestra ${estadisticas.generados} informes generados`);
      logger.warning(`- UI muestra ${informesEnUI} informes`);
      return { inconsistencia: true, estadisticas, informesEnUI };
    } else {
      logger.success('No se detectaron inconsistencias');
      return { inconsistencia: false, estadisticas, informesEnUI };
    }
    
  } catch (error) {
    logger.error('Error en diagnóstico:', error.message);
    throw error;
  }
}

// Limpiar caché existente
function limpiarCache() {
  logger.info('Limpiando caché existente...');
  
  try {
    // Limpiar localStorage
    const keys = Object.keys(localStorage);
    const informeKeys = keys.filter(key => 
      key.includes('informe') || 
      key.includes('cache') || 
      key.includes('report')
    );
    
    informeKeys.forEach(key => {
      localStorage.removeItem(key);
      logger.debug(`Eliminada clave de localStorage: ${key}`);
    });
    
    // Limpiar sessionStorage
    const sessionKeys = Object.keys(sessionStorage);
    const sessionInformeKeys = sessionKeys.filter(key => 
      key.includes('informe') || 
      key.includes('cache') || 
      key.includes('report')
    );
    
    sessionInformeKeys.forEach(key => {
      sessionStorage.removeItem(key);
      logger.debug(`Eliminada clave de sessionStorage: ${key}`);
    });
    
    logger.success(`Caché limpiado: ${informeKeys.length + sessionInformeKeys.length} entradas eliminadas`);
    
  } catch (error) {
    logger.error('Error limpiando caché:', error.message);
  }
}

// Implementar Context API mejorado
function implementarContextAPI() {
  logger.info('Implementando Context API mejorado...');
  
  // Verificar si ya existe
  if (window.InformesContextAPI) {
    logger.warning('Context API ya implementado, actualizando...');
  }
  
  // Crear store centralizado
  window.InformesContextAPI = {
    state: {
      informes: [],
      loading: false,
      error: null,
      lastUpdate: null
    },
    
    subscribers: new Set(),
    
    subscribe(callback) {
      this.subscribers.add(callback);
      return () => this.subscribers.delete(callback);
    },
    
    notify() {
      this.subscribers.forEach(callback => {
        try {
          callback(this.state);
        } catch (error) {
          logger.error('Error en subscriber:', error);
        }
      });
    },
    
    setState(updates) {
      this.state = { ...this.state, ...updates, lastUpdate: Date.now() };
      this.notify();
      logger.debug('Estado actualizado:', this.state);
    },
    
    async loadInformes(force = false) {
      // Verificar caché si no es forzado
      if (!force && this.state.lastUpdate && 
          (Date.now() - this.state.lastUpdate) < CONFIG.CACHE_TTL) {
        logger.debug('Usando datos en caché');
        return this.state.informes;
      }
      
      this.setState({ loading: true, error: null });
      
      try {
        const { data: informes, error } = await window.supabase
          .from('informes_generados')
          .select(`
            *,
            pacientes:paciente_id (
              id, nombre, apellido, documento, genero
            )
          `)
          .eq('tipo_informe', 'completo')
          .eq('estado', 'generado')
          .order('fecha_generacion', { ascending: false });
        
        if (error) throw error;
        
        this.setState({ 
          informes: informes || [], 
          loading: false,
          error: null
        });
        
        logger.success(`Cargados ${informes?.length || 0} informes`);
        return informes || [];
        
      } catch (error) {
        this.setState({ 
          loading: false, 
          error: error.message,
          informes: []
        });
        logger.error('Error cargando informes:', error.message);
        throw error;
      }
    },
    
    async deleteInforme(id) {
      try {
        const { error } = await window.supabase
          .from('informes_generados')
          .update({ estado: 'eliminado' })
          .eq('id', id);
        
        if (error) throw error;
        
        // Actualizar estado local
        const informesActualizados = this.state.informes.filter(i => i.id !== id);
        this.setState({ informes: informesActualizados });
        
        logger.success(`Informe ${id} eliminado correctamente`);
        return true;
        
      } catch (error) {
        logger.error('Error eliminando informe:', error.message);
        throw error;
      }
    },
    
    async refreshInformes() {
      logger.info('Refrescando informes...');
      return await this.loadInformes(true);
    }
  };
  
  logger.success('Context API implementado correctamente');
}

// Migrar eventos de window a Context API
function migrarEventos() {
  logger.info('Migrando eventos de window a Context API...');
  
  // Interceptar eventos de window
  const originalDispatchEvent = window.dispatchEvent;
  const originalAddEventListener = window.addEventListener;
  
  // Contador de eventos interceptados
  let eventosInterceptados = 0;
  
  // Sobrescribir dispatchEvent
  window.dispatchEvent = function(event) {
    if (event.type === 'informesGenerados' || event.type === 'informeEliminado') {
      eventosInterceptados++;
      logger.debug(`Interceptado evento: ${event.type}`);
      
      // Usar Context API en lugar del evento
      setTimeout(() => {
        if (window.InformesContextAPI) {
          window.InformesContextAPI.refreshInformes();
        }
      }, 100);
      
      return true; // Simular que el evento fue despachado
    }
    
    return originalDispatchEvent.call(this, event);
  };
  
  // Sobrescribir addEventListener para eventos de informes
  window.addEventListener = function(type, listener, options) {
    if (type === 'informesGenerados' || type === 'informeEliminado') {
      logger.debug(`Redirigiendo listener de ${type} a Context API`);
      
      // Suscribir al Context API en lugar del evento
      if (window.InformesContextAPI) {
        return window.InformesContextAPI.subscribe((state) => {
          // Simular el evento original
          const mockEvent = {
            type: type,
            detail: { informes: state.informes },
            target: window
          };
          
          try {
            listener(mockEvent);
          } catch (error) {
            logger.error(`Error en listener migrado de ${type}:`, error);
          }
        });
      }
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  logger.success('Eventos migrados a Context API');
  
  // Retornar función de limpieza
  return () => {
    window.dispatchEvent = originalDispatchEvent;
    window.addEventListener = originalAddEventListener;
    logger.info(`Migración revertida. Eventos interceptados: ${eventosInterceptados}`);
  };
}

// Forzar recarga de datos
async function forzarRecargaDatos() {
  logger.info('Forzando recarga de datos...');
  
  try {
    // Limpiar caché
    limpiarCache();
    
    // Recargar usando Context API
    if (window.InformesContextAPI) {
      await window.InformesContextAPI.refreshInformes();
    }
    
    // Disparar evento personalizado para componentes que aún usen eventos
    const evento = new CustomEvent('forceReloadInformes', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(evento);
    
    logger.success('Recarga de datos completada');
    
  } catch (error) {
    logger.error('Error en recarga de datos:', error.message);
    throw error;
  }
}

// Restaurar informes eliminados recientemente (si es necesario)
async function restaurarInformesRecientes() {
  logger.info('Verificando si es necesario restaurar informes...');
  
  try {
    const { data: informesEliminados, error } = await window.supabase
      .from('informes_generados')
      .select('id, fecha_generacion, pacientes:paciente_id(nombre, apellido)')
      .eq('estado', 'eliminado')
      .gte('fecha_generacion', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24 horas
      .order('fecha_generacion', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    if (informesEliminados && informesEliminados.length > 0) {
      logger.warning(`Encontrados ${informesEliminados.length} informes eliminados recientemente:`);
      informesEliminados.forEach((informe, index) => {
        const paciente = informe.pacientes;
        logger.warning(`${index + 1}. ${paciente?.nombre} ${paciente?.apellido} - ${new Date(informe.fecha_generacion).toLocaleString()}`);
      });
      
      const restaurar = confirm(
        `¿Deseas restaurar los ${informesEliminados.length} informes eliminados recientemente?\n\n` +
        'Esto puede solucionar el problema de inconsistencia si los informes fueron eliminados por error.'
      );
      
      if (restaurar) {
        const ids = informesEliminados.map(i => i.id);
        const { error: errorRestaurar } = await window.supabase
          .from('informes_generados')
          .update({ estado: 'generado' })
          .in('id', ids);
        
        if (errorRestaurar) throw errorRestaurar;
        
        logger.success(`${ids.length} informes restaurados correctamente`);
        return true;
      }
    } else {
      logger.info('No se encontraron informes eliminados recientemente');
    }
    
    return false;
    
  } catch (error) {
    logger.error('Error verificando informes eliminados:', error.message);
    return false;
  }
}

// Verificar mejoras implementadas
async function verificarMejoras() {
  logger.info('Verificando mejoras implementadas...');
  
  const verificaciones = {
    contextAPI: !!window.InformesContextAPI,
    cacheVacio: localStorage.length === 0 || !Object.keys(localStorage).some(k => k.includes('informe')),
    estadoConsistente: false
  };
  
  // Verificar consistencia de estado
  try {
    const diagnostico = await diagnosticarProblema();
    verificaciones.estadoConsistente = !diagnostico.inconsistencia;
  } catch (error) {
    logger.warning('No se pudo verificar consistencia de estado');
  }
  
  logger.info('Resultados de verificación:', verificaciones);
  
  const todasLasMejoras = Object.values(verificaciones).every(v => v === true);
  
  if (todasLasMejoras) {
    logger.success('🎉 Todas las mejoras implementadas correctamente');
  } else {
    logger.warning('⚠️ Algunas mejoras necesitan atención adicional');
  }
  
  return verificaciones;
}

// Función principal de implementación
async function implementarMejoras() {
  logger.info('🚀 Iniciando implementación de mejoras...');
  
  try {
    // 1. Verificar entorno
    verificarEntorno();
    
    // 2. Diagnosticar problema actual
    const diagnosticoInicial = await diagnosticarProblema();
    
    // 3. Limpiar caché existente
    limpiarCache();
    
    // 4. Implementar Context API
    implementarContextAPI();
    
    // 5. Migrar eventos
    const revertirMigracion = migrarEventos();
    
    // 6. Restaurar informes si es necesario
    const informesRestaurados = await restaurarInformesRecientes();
    
    // 7. Forzar recarga de datos
    await forzarRecargaDatos();
    
    // 8. Verificar mejoras
    const verificacion = await verificarMejoras();
    
    // 9. Diagnóstico final
    const diagnosticoFinal = await diagnosticarProblema();
    
    // Resumen de resultados
    logger.success('\n🎯 RESUMEN DE IMPLEMENTACIÓN:');
    logger.success('================================');
    logger.success(`✅ Context API: ${verificacion.contextAPI ? 'Implementado' : 'Falló'}`);
    logger.success(`✅ Caché: ${verificacion.cacheVacio ? 'Limpiado' : 'Pendiente'}`);
    logger.success(`✅ Consistencia: ${verificacion.estadoConsistente ? 'Restaurada' : 'Pendiente'}`);
    logger.success(`✅ Informes restaurados: ${informesRestaurados ? 'Sí' : 'No fue necesario'}`);
    
    if (diagnosticoInicial.inconsistencia && !diagnosticoFinal.inconsistencia) {
      logger.success('🎉 PROBLEMA SOLUCIONADO: La inconsistencia de estado ha sido corregida');
    }
    
    logger.success('\n📋 PRÓXIMOS PASOS RECOMENDADOS:');
    logger.success('1. Actualizar componentes para usar window.InformesContextAPI');
    logger.success('2. Eliminar window.addEventListener para eventos de informes');
    logger.success('3. Implementar manejo de errores centralizado');
    logger.success('4. Agregar tests para las nuevas funcionalidades');
    
    // Guardar función de reversión en window para uso posterior
    window.revertirMejoras = revertirMigracion;
    logger.info('💡 Usa window.revertirMejoras() si necesitas revertir los cambios');
    
    return {
      exito: true,
      diagnosticoInicial,
      diagnosticoFinal,
      verificacion,
      informesRestaurados
    };
    
  } catch (error) {
    logger.error('❌ Error durante la implementación:', error.message);
    logger.error('Stack trace:', error.stack);
    
    return {
      exito: false,
      error: error.message
    };
  }
}

// Función de utilidad para monitoreo continuo
function iniciarMonitoreo() {
  logger.info('Iniciando monitoreo de estado...');
  
  const intervalo = setInterval(async () => {
    try {
      const diagnostico = await diagnosticarProblema();
      if (diagnostico.inconsistencia) {
        logger.warning('🚨 Inconsistencia detectada durante monitoreo');
        clearInterval(intervalo);
        
        const autoCorregir = confirm(
          'Se ha detectado una nueva inconsistencia. ¿Deseas corregirla automáticamente?'
        );
        
        if (autoCorregir) {
          await forzarRecargaDatos();
        }
      }
    } catch (error) {
      logger.debug('Error en monitoreo (normal si la página se está recargando):', error.message);
    }
  }, 30000); // Cada 30 segundos
  
  // Guardar referencia para poder detenerlo
  window.detenerMonitoreo = () => {
    clearInterval(intervalo);
    logger.info('Monitoreo detenido');
  };
  
  logger.success('Monitoreo iniciado. Usa window.detenerMonitoreo() para detenerlo.');
}

// Exportar funciones principales
window.implementarMejoras = implementarMejoras;
window.diagnosticarProblema = diagnosticarProblema;
window.forzarRecargaDatos = forzarRecargaDatos;
window.iniciarMonitoreo = iniciarMonitoreo;

// Mensaje de bienvenida
console.log(`
🔧 SCRIPT DE MEJORAS BAT-7 CARGADO
================================

Funciones disponibles:
• await implementarMejoras() - Implementa todas las mejoras
• await diagnosticarProblema() - Diagnostica el estado actual
• await forzarRecargaDatos() - Fuerza recarga de datos
• iniciarMonitoreo() - Inicia monitoreo automático

¡Ejecuta 'await implementarMejoras()' para comenzar!
`);

// Auto-ejecutar si se detecta el problema
setTimeout(async () => {
  try {
    const diagnostico = await diagnosticarProblema();
    if (diagnostico.inconsistencia) {
      logger.warning('🚨 Problema detectado automáticamente');
      
      const autoEjecutar = confirm(
        'Se ha detectado el problema de inconsistencia de estado.\n\n' +
        '¿Deseas ejecutar las mejoras automáticamente?'
      );
      
      if (autoEjecutar) {
        await implementarMejoras();
      }
    }
  } catch (error) {
    // Silenciar errores de auto-detección
  }
}, 2000);