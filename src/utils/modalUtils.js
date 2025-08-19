/**
 * Utilidades para manejar modales en la aplicación
 * Este archivo proporciona funciones para asegurar que los modales funcionen correctamente
 */

/**
 * Prepara el elemento modal-root para mostrar un modal
 * @returns {HTMLElement} El elemento modal-root
 */
export const prepareModalRoot = () => {
  // Verificar si ya existe el elemento modal-root
  let modalRoot = document.getElementById('modal-root');

  // Si no existe, crear uno nuevo
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(modalRoot);
    console.log('Modal root creado correctamente');
  }

  // Asegurar que esté directamente en el body
  if (modalRoot.parentElement !== document.body) {
    // Eliminar primero del padre actual si existe
    try {
      if (modalRoot.parentElement) {
        modalRoot.parentElement.removeChild(modalRoot);
      }
    } catch (e) {
      console.warn('Error al reubicar modal-root:', e);
      // Si falla, crear uno nuevo
      modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
    }
    // Añadir al body
    document.body.appendChild(modalRoot);
  }

  // Configurar estilos para asegurar posición correcta
  modalRoot.style.position = 'relative';
  modalRoot.style.zIndex = '9999';
  
  // Limpiar cualquier contenido residual que pueda bloquear
  if (modalRoot.innerHTML.trim() !== '') {
    console.log('Limpiando contenido residual de modal-root');
    modalRoot.innerHTML = '';
  }

  return modalRoot;
};

/**
 * Limpia el elemento modal-root después de cerrar un modal
 * Esta función ya no debería usarse para eliminar el elemento modal-root
 * sino solo para limpiar su contenido cuando sea necesario
 */
export const cleanupModalRoot = () => {
  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    // Solo limpiar el contenido, no eliminar el elemento
    modalRoot.innerHTML = '';
  }
};

/**
 * Verifica si hay elementos fixed que puedan estar bloqueando los modales
 * @param {boolean} removeBlockingElements Si es true, intenta eliminar los elementos bloqueantes
 * @returns {Array} Lista de elementos fixed encontrados
 */
export const checkForBlockingElements = (removeBlockingElements = false) => {
  console.log('Verificando elementos bloqueantes...');

  // Buscar elementos fixed que puedan estar bloqueando
  const fixedElements = document.querySelectorAll('.fixed.inset-0');

  if (fixedElements.length > 0) {
    console.warn(`Se encontraron ${fixedElements.length} elementos fixed que podrían estar bloqueando los modales`);

    // Si se solicita, intentar eliminar elementos bloqueantes
    if (removeBlockingElements) {
      fixedElements.forEach(el => {
        // Solo eliminar si no parece ser un modal activo (no tiene z-index alto)
        const zIndex = window.getComputedStyle(el).zIndex;
        if (zIndex !== '9999' && zIndex !== '999' && zIndex !== '99999') {
          console.warn('Eliminando elemento fixed potencialmente bloqueante:', el);
          el.remove();
        }
      });
    }
  }

  return Array.from(fixedElements);
};

/**
 * Fuerza una actualización de la UI
 */
export const forceUIUpdate = () => {
  console.log('Forzando actualización de la UI...');

  // Disparar evento de resize para forzar actualización
  window.dispatchEvent(new Event('resize'));

  // Forzar reflow
  document.body.getBoundingClientRect();
};

/**
 * Función completa para corregir problemas con modales
 * @returns {Object} Resultado de la corrección
 */
export const fixModalIssues = () => {
  console.log('Aplicando correcciones a modales...');

  try {
    // 1. Preparar modal-root
    const modalRoot = prepareModalRoot();

    // 2. Verificar y eliminar elementos bloqueantes
    const blockingElements = checkForBlockingElements(true);

    // 3. Forzar actualización de la UI
    forceUIUpdate();

    // 4. Verificar ReactDOM
    const reactDOMAvailable = typeof ReactDOM !== 'undefined' && typeof ReactDOM.createPortal === 'function';

    if (!reactDOMAvailable) {
      console.warn('ReactDOM o ReactDOM.createPortal no está disponible. Los modales pueden no funcionar correctamente.');

      // Intentar cargar el script de corrección de ReactDOM
      try {
        // Verificar si ya existe el script
        const existingScript = document.querySelector('script[src*="load-react-dom.js"]');
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = '/src/fixes/load-react-dom.js';
          script.async = true;
          document.body.appendChild(script);
          console.log('Script de corrección de ReactDOM cargado.');
        } else {
          console.log('Script de corrección de ReactDOM ya está cargado.');
        }
      } catch (e) {
        console.error('Error al cargar script de ReactDOM:', e);
      }
    }

    // 5. Verificar si hay modales duplicados
    const modalElements = document.querySelectorAll('[role="dialog"]');
    if (modalElements.length > 1) {
      console.warn(`Se encontraron ${modalElements.length} modales activos. Esto puede causar problemas.`);

      // Mantener solo el último modal
      for (let i = 0; i < modalElements.length - 1; i++) {
        try {
          modalElements[i].remove();
          console.log(`Modal duplicado ${i+1} eliminado.`);
        } catch (e) {
          console.error(`Error al eliminar modal duplicado ${i+1}:`, e);
        }
      }
    }

    return {
      success: true,
      message: 'Correcciones de modales aplicadas',
      details: {
        modalRoot: !!modalRoot,
        blockingElementsRemoved: blockingElements.length > 0,
        reactDOMAvailable,
        duplicateModalsRemoved: modalElements.length > 1
      }
    };
  } catch (error) {
    console.error('Error al aplicar correcciones de modales:', error);

    // Intento de recuperación básica
    try {
      // Asegurar que existe el elemento modal-root
      if (!document.getElementById('modal-root')) {
        const fallbackRoot = document.createElement('div');
        fallbackRoot.id = 'modal-root';
        document.body.appendChild(fallbackRoot);
        console.log('Elemento modal-root creado como recuperación básica');
      }

      return {
        success: false,
        message: 'Error al aplicar correcciones completas, se aplicó recuperación básica',
        details: error.message || 'Error desconocido'
      };
    } catch (fallbackError) {
      return {
        success: false,
        message: 'Error crítico al aplicar correcciones de modales',
        details: error.message || 'Error desconocido'
      };
    }
  }
};

export default {
  prepareModalRoot,
  cleanupModalRoot,
  checkForBlockingElements,
  forceUIUpdate,
  fixModalIssues
};
