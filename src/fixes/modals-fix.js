/**
 * Script para corregir problemas con modales en la administración
 * 
 * Este script se debe ejecutar en la consola del navegador para diagnosticar
 * y corregir problemas con los modales en la página de administración.
 */

// Función para verificar si los modales están funcionando correctamente
function checkModals() {
  console.log('===== DIAGNÓSTICO DE MODALES =====');
  
  // Verificar si existe el elemento modal-root
  const modalRoot = document.getElementById('modal-root');
  console.log('Modal root existente:', !!modalRoot);
  
  if (!modalRoot) {
    console.log('Creando elemento modal-root...');
    const newModalRoot = document.createElement('div');
    newModalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(newModalRoot);
    console.log('Elemento modal-root creado:', !!document.getElementById('modal-root'));
  }
  
  // Verificar si ReactDOM está disponible
  console.log('ReactDOM disponible:', typeof ReactDOM !== 'undefined');
  
  // Verificar si hay modales abiertos actualmente
  // Corregido: Se utilizan selectores separados para evitar errores de sintaxis
  const fixedElements = document.querySelectorAll('.fixed.inset-0');
  const modalElements = Array.from(fixedElements).filter(el => 
    el.classList.contains('z-50') || 
    el.classList.contains('z-[9999]')
  );
  console.log('Modales abiertos:', modalElements.length);
  
  // Verificar si hay botones para abrir modales y si tienen event listeners
  const addButtons = document.querySelectorAll('button:not([disabled])');
  const blueButtons = Array.from(addButtons).filter(btn => 
    btn.classList.contains('bg-blue-600') || 
    (btn.classList.contains('text-white') && !btn.classList.contains('bg-red'))
  );
  console.log('Botones para nuevos elementos encontrados:', blueButtons.length);
  
  // Si hay botones, verificar que no estén deshabilitados
  if (blueButtons.length > 0) {
    blueButtons.forEach((btn, i) => {
      console.log(`Botón ${i+1}:`, btn.innerText, 'Deshabilitado:', btn.disabled, 'Visible:', isElementVisible(btn));
    });
  }
  
  // Verificar si hay componentes DataTable y si tienen botones de editar
  const tables = document.querySelectorAll('table');
  console.log('Tablas encontradas:', tables.length);
  
  // Verificar si hay botones de acción en las tablas
  // Corregido: Usando selectores separados
  const editButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.getAttribute('aria-label')?.includes('Editar') || 
    btn.getAttribute('title')?.includes('Editar')
  );
  console.log('Botones de editar encontrados:', editButtons.length);
  
  console.log('===== FIN DEL DIAGNÓSTICO =====');
  
  return {
    modalRootExists: !!modalRoot,
    openModals: modalElements.length,
    addButtons: blueButtons.length,
    tables: tables.length,
    actionButtons: editButtons.length
  };
}

// Función para verificar si un elemento es visible
function isElementVisible(element) {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         element.offsetWidth > 0 &&
         element.offsetHeight > 0;
}

// Función para intentar abrir un modal manualmente
function tryOpenModal(tabName) {
  console.log(`Intentando abrir modal en la pestaña ${tabName}...`);
  
  // Buscar el botón "Nuevo/a" según la pestaña
  let buttonText = '';
  
  switch (tabName.toLowerCase()) {
    case 'instituciones':
      buttonText = 'Nueva Institución';
      break;
    case 'psicologos':
      buttonText = 'Nuevo Psicólogo';
      break;
    case 'pacientes':
      buttonText = 'Nuevo Paciente';
      break;
    default:
      console.error('Pestaña no reconocida. Use "instituciones", "psicologos" o "pacientes".');
      return false;
  }
  
  // Buscar el botón por texto aproximado
  const buttons = Array.from(document.querySelectorAll('button'))
    .filter(btn => btn.innerText.includes(buttonText.substring(0, 5)));
  
  if (buttons.length === 0) {
    console.error(`No se encontró el botón "${buttonText}"`);
    return false;
  }
  
  // Simular clic en el botón
  console.log(`Simulando clic en botón "${buttons[0].innerText}"...`);
  buttons[0].click();
  
  // Verificar si se abrió el modal
  setTimeout(() => {
    // Corregido: Usar la misma técnica de verificación de modales abiertos
    const fixedElements = document.querySelectorAll('.fixed.inset-0');
    const modalElements = Array.from(fixedElements).filter(el => 
      el.classList.contains('z-50') || 
      el.classList.contains('z-[9999]')
    );
    console.log('Modales abiertos después del clic:', modalElements.length);
    
    if (modalElements.length > 0) {
      console.log('✅ Modal abierto correctamente.');
    } else {
      console.error('❌ El modal no se abrió. Aplicando solución...');
      fixModalIssues();
    }
  }, 500);
  
  return true;
}

// Función para corregir problemas comunes con modales
function fixModalIssues() {
  console.log('===== APLICANDO SOLUCIONES =====');
  
  // 1. Asegurar que existe el elemento modal-root
  if (!document.getElementById('modal-root')) {
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(modalRoot);
    console.log('1. Elemento modal-root creado.');
  }
  
  // 2. Verificar la propiedad isOpen del componente FormModal
  console.log('2. Verificando componentes FormModal...');
  
  // 3. Forzar actualización de la UI
  console.log('3. Forzando actualización de la UI...');
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 100);
  
  // 4. Sugerir actualizar la aplicación
  console.log('4. Solución recomendada: Actualizar los componentes FormModal y Modal');
  console.log(`
    1. Reemplaza el archivo Modal.jsx con Modal.fix.jsx
    2. Asegúrate de que isModalOpen está correctamente inicializado como false
    3. Verifica que closeModal() esté funcionando correctamente
    4. Asegúrate de que React y ReactDOM sean de la misma versión
  `);
  
  console.log('===== FIN DE SOLUCIONES =====');
}

// Función principal para diagnosticar y solucionar problemas de modales
function fixModalsInAdminPanel() {
  try {
    const diagnosis = checkModals();
    
    if (diagnosis.modalRootExists && diagnosis.addButtons > 0 && diagnosis.tables > 0) {
      console.log('El panel de administración parece estar cargado correctamente.');
      console.log('Intentando detectar la pestaña activa...');
      
      // Detectar la pestaña activa
      const tabElements = document.querySelectorAll('[role="tab"]');
      let activeTab = null;
      
      tabElements.forEach(tab => {
        // Simplificar la detección de pestaña activa
        const isActive = tab.getAttribute('aria-selected') === 'true' || 
                        tab.classList.contains('border-indigo-500') || 
                        tab.classList.contains('bg-indigo-600');
        
        if (isActive) {
          activeTab = tab.innerText.trim();
        }
      });
      
      if (activeTab) {
        console.log(`Pestaña activa detectada: ${activeTab}`);
        tryOpenModal(activeTab);
      } else {
        console.log('No se pudo detectar la pestaña activa. Intentando con "Instituciones"...');
        tryOpenModal('instituciones');
      }
    } else {
      console.error('Se detectaron problemas con el panel de administración:');
      if (!diagnosis.modalRootExists) console.error('- No existe el elemento modal-root');
      if (diagnosis.addButtons === 0) console.error('- No se encontraron botones para abrir modales');
      if (diagnosis.tables === 0) console.error('- No se encontraron tablas de datos');
      
      fixModalIssues();
    }
    
    return {
      runDiagnosis: checkModals,
      tryOpenModal: tryOpenModal,
      fixIssues: fixModalIssues
    };
  } catch (error) {
    console.error('Error al ejecutar el diagnóstico de modales:', error);
    // Intento de reparación básica a pesar del error
    if (!document.getElementById('modal-root')) {
      const modalRoot = document.createElement('div');
      modalRoot.setAttribute('id', 'modal-root');
      document.body.appendChild(modalRoot);
      console.log('Elemento modal-root creado a pesar del error.');
    }
    return {
      runDiagnosis: () => console.log('Diagnóstico deshabilitado debido a errores previos'),
      tryOpenModal: () => console.log('Apertura manual deshabilitada debido a errores previos'),
      fixIssues: fixModalIssues
    };
  }
}

// Ejecutar la función y exportar utilidades para uso en consola
let modalUtils;
try {
  modalUtils = fixModalsInAdminPanel();
} catch (error) {
  console.error('Error al inicializar herramientas de modales:', error);
  // Crear funciones de diagnóstico mínimas
  modalUtils = {
    runDiagnosis: () => console.log('Diagnóstico no disponible debido a errores de inicialización'),
    tryOpenModal: () => console.log('Apertura manual no disponible debido a errores de inicialización'),
    fixIssues: fixModalIssues
  };
}

// Exportar utilidades para uso en consola
window.modalUtils = modalUtils;

console.log(`
===== INSTRUCCIONES =====
Las utilidades de diagnóstico de modales están disponibles en window.modalUtils:
- window.modalUtils.runDiagnosis(): Ejecutar diagnóstico
- window.modalUtils.tryOpenModal('instituciones'): Intentar abrir un modal
- window.modalUtils.fixIssues(): Aplicar soluciones
===== FIN INSTRUCCIONES =====
`);
