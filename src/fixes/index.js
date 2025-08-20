/**
 * Soluciones para problemas en la aplicación
 * Este archivo exporta todas las soluciones disponibles
 */

// Importar soluciones
import { fixAdminTables, syncTables, runAllFixes } from './fix-admin-tables';
import '../components/ui/Modal'; // Importar Modal actualizado

// Scripts para cargar en el navegador
import './load-react-dom'; // Asegurar que ReactDOM está disponible
import './modals-fix'; // Utilidades para diagnosticar y corregir modales

/**
 * Función principal para aplicar todas las soluciones
 * @returns {Promise<object>} Resultado de la operación
 */
export const applyAllFixes = async () => {
  console.log('Aplicando todas las soluciones...');
  
  // 1. Crear elemento modal-root si no existe
  if (!document.getElementById('modal-root')) {
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(modalRoot);
    console.log('Elemento modal-root creado.');
  }
  
  // 2. Verificar que ReactDOM esté disponible
  if (typeof ReactDOM === 'undefined' && typeof React !== 'undefined') {
    // Si React está disponible, usarlo como fallback
    window.ReactDOM = {
      ...window.React,
      createPortal: window.React.createPortal || ((children, container) => {
        // Portal simple si createPortal no está disponible
        console.warn('React.createPortal no disponible, usando implementación básica');
        // Devolver el children tal cual, no es un portal real pero evita errores
        return children;
      })
    };
    console.log('ReactDOM creado a partir de React como solución temporal.');
  }
  
  // 3. Ejecutar corrección de tablas en Supabase
  let tablesResult = { success: false, message: 'No ejecutado' };
  try {
    console.log('Ejecutando corrección de tablas en Supabase...');
    tablesResult = await runAllFixes();
    console.log('Resultado de corrección de tablas:', tablesResult.success ? 'Éxito' : 'Error');
  } catch (error) {
    console.error('Error al corregir tablas en Supabase:', error);
    tablesResult = { 
      success: false, 
      message: 'Error inesperado', 
      details: error.message || 'Error desconocido'
    };
  }
  
  return {
    success: true,
    message: 'Soluciones aplicadas',
    details: {
      modalRoot: !!document.getElementById('modal-root'),
      reactDOM: typeof ReactDOM !== 'undefined',
      tables: tablesResult
    }
  };
};

// Exportar utilidades individuales
export {
  fixAdminTables,
  syncTables,
  runAllFixes
};

// Exponer utilidades para uso en consola del navegador
if (typeof window !== 'undefined') {
  window.adminFixes = {
    applyAllFixes,
    fixAdminTables,
    syncTables,
    runAllFixes
  };

  // Ejecutar un diagnóstico inicial
  console.log('Ejecutando diagnóstico inicial...');
  if (!document.getElementById('modal-root')) {
    console.warn('Elemento modal-root no encontrado. Los modales pueden no funcionar correctamente.');
  }
  if (typeof ReactDOM === 'undefined') {
    console.warn('ReactDOM no está disponible. Los modales pueden no funcionar correctamente.');
  }
}

// Exportar por defecto
export default {
  applyAllFixes,
  fixAdminTables,
  syncTables,
  runAllFixes
};
