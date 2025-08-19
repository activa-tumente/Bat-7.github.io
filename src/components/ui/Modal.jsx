import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { prepareModalRoot } from '../../utils/modalUtils';

// Verificar si ReactDOM está disponible y tiene createPortal
if (typeof ReactDOM === 'undefined' || typeof ReactDOM.createPortal !== 'function') {
  console.error('ReactDOM o ReactDOM.createPortal no está disponible. Los modales pueden no funcionar correctamente.');
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnClickOutside = true
}) => {
  const modalRef = useRef(null);

  // Obtener la referencia al modal-root una sola vez al abrir el modal
  const modalRootRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Preparar el elemento modal-root y guardar la referencia
      modalRootRef.current = prepareModalRoot();

      // Prevenir scroll y configurar listener de escape
      document.body.style.overflow = 'hidden';

      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);

      // Mejorar accesibilidad enfocando el modal
      setTimeout(() => {
        const modalElement = document.querySelector('[role="dialog"]');
        if (modalElement) {
          modalElement.focus();
        }
      }, 50);

      return () => {
        // Cleanup
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
        // No eliminar el modal-root, solo limpiar su contenido si es necesario
      };
    }
  }, [isOpen, onClose]);

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  // Manejar clic fuera del modal
  const handleOutsideClick = (e) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Tamaños del modal
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-full mx-4'
  };

  // Crear el contenido del modal
  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black bg-opacity-70 flex items-center justify-center"
      onClick={handleOutsideClick}
      style={{ overflow: 'auto', backdropFilter: 'blur(2px)' }}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-xl shadow-2xl overflow-hidden w-full ${sizeClasses[size]} mx-auto transform transition-all duration-200 ease-in-out`}
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()} // Evitar que los clics dentro del modal lo cierren
        tabIndex="-1" // Hacer que el modal sea focusable
      >
        {/* Encabezado del modal */}
        <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200 bg-white rounded-full p-1 hover:bg-red-50"
            onClick={onClose}
            aria-label="Cerrar"
          >
            {/* Icono de cierre integrado para no depender de react-icons */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="px-6 py-5 overflow-y-auto bg-white" style={{ maxHeight: 'calc(85vh - 70px)' }}>
          {children}
        </div>
      </div>
    </div>
  );

  // Usar ReactDOM.createPortal para renderizar el modal en el portal
  try {
    // Usar la referencia guardada al modal-root, reforzando la preparación
    const modalRoot = modalRootRef.current || prepareModalRoot();
    
    // Verificar que ReactDOM esté disponible
    if (typeof ReactDOM === 'undefined' || typeof ReactDOM.createPortal !== 'function') {
      console.warn('ReactDOM o ReactDOM.createPortal no está disponible. Intentando soluciones alternativas...');
      
      // Intentar cargar el script de corrección de ReactDOM si no está ya cargado
      const existingScript = document.querySelector('script[src*="load-react-dom.js"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = '/src/fixes/load-react-dom.js';
        script.async = true;
        document.body.appendChild(script);
        console.log('Script de corrección de ReactDOM cargado.');
      }
      
      // Implementación de fallback en caso de que ReactDOM no esté disponible
      // Insertar directamente en el modalRoot
      if (modalRoot) {
        // Limpiar contenido existente
        modalRoot.innerHTML = '';
        
        // Crear un elemento div para contener el modal
        const container = document.createElement('div');
        container.className = 'modal-container';
        modalRoot.appendChild(container);
        
        // Renderizar el contenido del modal en el container
        // Esto es un fallback simple cuando no podemos usar React
        return modalContent;
      }
      return modalContent;
    }

    // Usar ReactDOM.createPortal para renderizar el modal en el portal
    return ReactDOM.createPortal(modalContent, modalRoot);
  } catch (error) {
    // En caso de cualquier error, renderizar directamente como último recurso
    console.error('Error al usar ReactDOM.createPortal:', error);
    
    // Aplicar corrección de emergencia desde fix-modals.js
    try {
      const script = document.createElement('script');
      script.src = '/fix-modals.js';
      script.async = true;
      document.body.appendChild(script);
      console.log('Script de corrección de emergencia cargado.');
    } catch (e) {
      console.error('Error al cargar script de corrección de emergencia:', e);
    }
    
    return modalContent;
  }
};

export default Modal;
