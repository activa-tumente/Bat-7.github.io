/**
 * @file InformesContext.jsx
 * @description Context API para el manejo global del estado de informes
 * Proporciona estado centralizado y acciones para la gestión de informes
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';
import InformeFactory, { TIPOS_INFORME } from '../services/InformeFactory';
import { toast } from 'react-toastify';

// Estados posibles para los informes
const ESTADOS_INFORME = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Acciones del reducer
const ACCIONES = {
  SET_LOADING: 'SET_LOADING',
  SET_SUCCESS: 'SET_SUCCESS',
  SET_ERROR: 'SET_ERROR',
  RESET_STATE: 'RESET_STATE',
  ADD_INFORME: 'ADD_INFORME',
  UPDATE_INFORME: 'UPDATE_INFORME',
  REMOVE_INFORME: 'REMOVE_INFORME',
  SET_INFORME_ACTUAL: 'SET_INFORME_ACTUAL',
  CLEAR_INFORME_ACTUAL: 'CLEAR_INFORME_ACTUAL'
};

// Estado inicial
const estadoInicial = {
  estado: ESTADOS_INFORME.IDLE,
  informes: [],
  informeActual: null,
  error: null,
  loading: false
};

// Reducer para manejar el estado de informes
function informesReducer(state, action) {
  switch (action.type) {
    case ACCIONES.SET_LOADING:
      return {
        ...state,
        loading: true,
        estado: ESTADOS_INFORME.LOADING,
        error: null
      };

    case ACCIONES.SET_SUCCESS:
      return {
        ...state,
        loading: false,
        estado: ESTADOS_INFORME.SUCCESS,
        error: null
      };

    case ACCIONES.SET_ERROR:
      return {
        ...state,
        loading: false,
        estado: ESTADOS_INFORME.ERROR,
        error: action.payload
      };

    case ACCIONES.RESET_STATE:
      return {
        ...state,
        estado: ESTADOS_INFORME.IDLE,
        error: null,
        loading: false
      };

    case ACCIONES.ADD_INFORME:
      return {
        ...state,
        informes: [...state.informes, action.payload]
      };

    case ACCIONES.UPDATE_INFORME:
      return {
        ...state,
        informes: state.informes.map(informe =>
          informe.id === action.payload.id ? action.payload : informe
        )
      };

    case ACCIONES.REMOVE_INFORME:
      return {
        ...state,
        informes: state.informes.filter(informe => informe.id !== action.payload)
      };

    case ACCIONES.SET_INFORME_ACTUAL:
      return {
        ...state,
        informeActual: action.payload
      };

    case ACCIONES.CLEAR_INFORME_ACTUAL:
      return {
        ...state,
        informeActual: null
      };

    default:
      return state;
  }
}

// Crear el contexto
const InformesContext = createContext();

// Hook personalizado para usar el contexto
export const useInformes = () => {
  const context = useContext(InformesContext);
  if (!context) {
    throw new Error('useInformes debe ser usado dentro de un InformesProvider');
  }
  return context;
};

// Provider del contexto
export const InformesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(informesReducer, estadoInicial);

  // Acción para generar un informe
  const generarInforme = useCallback(async (tipo, datos, opciones = {}) => {
    try {
      dispatch({ type: ACCIONES.SET_LOADING });

      // Validar datos antes de generar
      if (!InformeFactory.validarDatos(tipo, datos)) {
        throw new Error('Datos insuficientes para generar el informe');
      }

      const informe = await InformeFactory.crearInforme(tipo, datos, opciones);
      
      dispatch({ type: ACCIONES.ADD_INFORME, payload: informe });
      dispatch({ type: ACCIONES.SET_INFORME_ACTUAL, payload: informe });
      dispatch({ type: ACCIONES.SET_SUCCESS });

      toast.success('Informe generado exitosamente');
      return informe;
    } catch (error) {
      console.error('Error al generar informe:', error);
      dispatch({ type: ACCIONES.SET_ERROR, payload: error.message });
      toast.error(`Error al generar informe: ${error.message}`);
      throw error;
    }
  }, []);

  // Acción para cargar informes existentes
  const cargarInformes = useCallback(async (pacienteId) => {
    try {
      dispatch({ type: ACCIONES.SET_LOADING });
      
      // Aquí se podría integrar con InformesService para cargar informes existentes
      // const informes = await InformesService.obtenerInformesPaciente(pacienteId);
      
      dispatch({ type: ACCIONES.SET_SUCCESS });
    } catch (error) {
      console.error('Error al cargar informes:', error);
      dispatch({ type: ACCIONES.SET_ERROR, payload: error.message });
      toast.error(`Error al cargar informes: ${error.message}`);
    }
  }, []);

  // Acción para actualizar un informe
  const actualizarInforme = useCallback((informe) => {
    dispatch({ type: ACCIONES.UPDATE_INFORME, payload: informe });
  }, []);

  // Acción para eliminar un informe
  const eliminarInforme = useCallback((informeId) => {
    dispatch({ type: ACCIONES.REMOVE_INFORME, payload: informeId });
    toast.success('Informe eliminado');
  }, []);

  // Acción para establecer el informe actual
  const establecerInformeActual = useCallback((informe) => {
    dispatch({ type: ACCIONES.SET_INFORME_ACTUAL, payload: informe });
  }, []);

  // Acción para limpiar el informe actual
  const limpiarInformeActual = useCallback(() => {
    dispatch({ type: ACCIONES.CLEAR_INFORME_ACTUAL });
  }, []);

  // Acción para resetear el estado
  const resetearEstado = useCallback(() => {
    dispatch({ type: ACCIONES.RESET_STATE });
  }, []);

  // Selector para obtener informes por tipo
  const obtenerInformesPorTipo = useCallback((tipo) => {
    return state.informes.filter(informe => informe.tipo === tipo);
  }, [state.informes]);

  // Selector para obtener estadísticas de informes
  const obtenerEstadisticasInformes = useCallback(() => {
    const totalInformes = state.informes.length;
    const informesPorTipo = Object.values(TIPOS_INFORME).reduce((acc, tipo) => {
      acc[tipo] = state.informes.filter(informe => informe.tipo === tipo).length;
      return acc;
    }, {});

    return {
      total: totalInformes,
      porTipo: informesPorTipo
    };
  }, [state.informes]);

  // Valor del contexto
  const value = {
    // Estado
    ...state,
    
    // Acciones
    generarInforme,
    cargarInformes,
    actualizarInforme,
    eliminarInforme,
    establecerInformeActual,
    limpiarInformeActual,
    resetearEstado,
    
    // Selectores
    obtenerInformesPorTipo,
    obtenerEstadisticasInformes,
    
    // Constantes
    TIPOS_INFORME,
    ESTADOS_INFORME
  };

  return (
    <InformesContext.Provider value={value}>
      {children}
    </InformesContext.Provider>
  );
};

// PropTypes
InformesProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default InformesContext;