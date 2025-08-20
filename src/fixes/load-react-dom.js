/**
 * Script para asegurar que ReactDOM está disponible para los modales
 * Este script debe incluirse en la página antes de que se carguen los modales
 */

(function() {
  console.log('Iniciando verificación de ReactDOM...');

  // Importar ReactDOM directamente si está disponible
  try {
    // Intentar importar ReactDOM desde react-dom
    if (typeof window.ReactDOM === 'undefined') {
      console.warn('ReactDOM no está disponible en window. Intentando importarlo...');

      // Intentar usar require si está disponible (entorno Node.js/CommonJS)
      if (typeof require === 'function') {
        try {
          window.ReactDOM = require('react-dom');
          console.log('ReactDOM importado correctamente mediante require');
        } catch (e) {
          console.error('Error al importar ReactDOM mediante require:', e);
        }
      }

      // Si aún no está disponible, intentar usar React como fallback
      if (typeof window.ReactDOM === 'undefined' && typeof window.React !== 'undefined') {
        console.warn('Usando React como base para ReactDOM...');

        // Si React tiene createPortal, usarlo
        if (typeof window.React.createPortal === 'function') {
          window.ReactDOM = {
            ...window.React,
            createPortal: window.React.createPortal,
            render: window.React.render || function() {
              console.warn('ReactDOM.render no está disponible, usando fallback');
            },
            unmountComponentAtNode: window.React.unmountComponentAtNode || function() {
              console.warn('ReactDOM.unmountComponentAtNode no está disponible, usando fallback');
            },
            findDOMNode: window.React.findDOMNode || function() {
              console.warn('ReactDOM.findDOMNode no está disponible, usando fallback');
            },
            version: window.React.version
          };
          console.log('ReactDOM creado con React.createPortal');
        }
        // Si React no tiene createPortal, crear una implementación básica
        else {
          window.ReactDOM = {
            ...window.React,
            createPortal: function(children, container) {
              // Implementación mejorada que intenta agregar los children al container
              try {
                if (container && typeof container.appendChild === 'function' && children) {
                  // Si children es un elemento DOM, intentar agregarlo directamente
                  if (children.nodeType === 1) {
                    container.appendChild(children);
                  }
                }
              } catch (e) {
                console.error('Error en createPortal fallback:', e);
              }
              return children;
            },
            version: window.React.version
          };
          console.log('ReactDOM creado con implementación básica de createPortal');
        }
      }
      // Si no hay React disponible, crear un objeto vacío con funciones esenciales
      else if (typeof window.ReactDOM === 'undefined') {
        window.ReactDOM = {
          createPortal: function(children, container) {
            console.warn('ReactDOM no disponible, usando fallback para createPortal');
            return children;
          },
          render: function() {
            console.warn('ReactDOM no disponible, usando fallback para render');
          },
          unmountComponentAtNode: function() {
            console.warn('ReactDOM no disponible, usando fallback para unmountComponentAtNode');
          },
          findDOMNode: function() {
            console.warn('ReactDOM no disponible, usando fallback para findDOMNode');
          },
          version: '0.0.0 (fallback)'
        };
        console.warn('ReactDOM no está disponible. Se ha creado un objeto de reemplazo básico.');
      }
    } else {
      console.log('ReactDOM ya está disponible:', window.ReactDOM.version);
    }
  } catch (error) {
    console.error('Error al configurar ReactDOM:', error);
  }

  // Verificar si el elemento modal-root existe
  try {
    let modalRoot = document.getElementById('modal-root');

    if (!modalRoot) {
      console.log('Elemento modal-root no encontrado, creando uno nuevo...');
      modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
      console.log('Elemento modal-root creado correctamente');
    } else {
      console.log('Elemento modal-root encontrado');

      // Asegurar que esté directamente en el body
      if (modalRoot.parentElement !== document.body) {
        console.warn('modal-root no está directamente en el body, reubicando...');
        // Eliminar primero del padre actual para evitar duplicados
        if (modalRoot.parentElement) {
          try {
            modalRoot.parentElement.removeChild(modalRoot);
          } catch (e) {
            console.error('Error al eliminar modal-root del padre actual:', e);
            // Si falla, crear uno nuevo
            modalRoot = document.createElement('div');
            modalRoot.id = 'modal-root';
          }
        }
        // Añadir al body
        document.body.appendChild(modalRoot);
        console.log('modal-root reubicado correctamente en el body');
      }
    }

    // Configurar estilos para asegurar que esté en primer plano
    modalRoot.style.position = 'relative';
    modalRoot.style.zIndex = '9999';

    // Limpiar cualquier contenido residual
    if (modalRoot.children.length > 0) {
      console.warn('modal-root contiene elementos residuales, limpiando...');
      modalRoot.innerHTML = '';
    }
  } catch (error) {
    console.error('Error al configurar modal-root:', error);

    // Intento de recuperación
    try {
      // Eliminar cualquier modal-root existente que pueda estar causando problemas
      const existingRoots = document.querySelectorAll('#modal-root');
      if (existingRoots.length > 0) {
        console.warn(`Se encontraron ${existingRoots.length} elementos modal-root, eliminando...`);
        existingRoots.forEach(root => {
          try {
            root.parentElement.removeChild(root);
          } catch (e) {
            console.error('Error al eliminar modal-root existente:', e);
          }
        });
      }

      // Crear un nuevo elemento como último recurso
      const fallbackRoot = document.createElement('div');
      fallbackRoot.id = 'modal-root';
      fallbackRoot.style.position = 'relative';
      fallbackRoot.style.zIndex = '9999';
      document.body.appendChild(fallbackRoot);
      console.log('Elemento modal-root creado como fallback');
    } catch (fallbackError) {
      console.error('Error crítico al crear modal-root fallback:', fallbackError);
    }
  }

  // Verificar si hay elementos .fixed que puedan estar bloqueando
  const fixedElements = document.querySelectorAll('.fixed.inset-0');
  if (fixedElements.length > 0) {
    console.warn(`Se encontraron ${fixedElements.length} elementos fixed que podrían estar bloqueando los modales`);
    // No eliminarlos automáticamente, pero advertir sobre su presencia
  }

  console.log('Verificación de ReactDOM completada');
})();
