import React, { createContext, useContext } from 'react';
import { toast as reactToastify } from 'react-toastify';
// Asegurarse de que los estilos estén importados
import 'react-toastify/dist/ReactToastify.css';

// Crear el contexto
export const ToastContext = createContext();

// Proveedor del Toast que utiliza react-toastify internamente
export const ToastProvider = ({ children }) => {
  // Configuración común para todos los toasts
  const commonConfig = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  };

  // Agregar un nuevo toast genérico
  const addToast = (message, type = 'info', duration = 5000) => {
    const config = {
      ...commonConfig,
      autoClose: duration
    };

    switch (type) {
      case 'success':
        return reactToastify.success(message, config);
      case 'error':
        return reactToastify.error(message, config);
      case 'warning':
        return reactToastify.warning(message, config);
      case 'info':
        return reactToastify.info(message, config);
      default:
        return reactToastify(message, config);
    }
  };

  // Eliminar un toast por su ID
  const removeToast = (id) => {
    if (id) {
      reactToastify.dismiss(id);
    }
  };

  // Funciones específicas para cada tipo de toast
  const showSuccess = (message, duration) => addToast(message, 'success', duration);
  const showError = (message, duration) => addToast(message, 'error', duration);
  const showWarning = (message, duration) => addToast(message, 'warning', duration);
  const showInfo = (message, duration) => addToast(message, 'info', duration);

  // Valor del contexto
  const value = {
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    // Exponemos también las funciones originales de react-toastify
    toast: reactToastify
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};

export default ToastContext;