// src/context/TestContext.jsx
import React, { createContext, useContext, useReducer, useState, useEffect } from 'react';
import supabase from '../api/supabaseClient';

// Estado inicial
const initialState = {
  testId: null,
  aplicacionId: null,
  subtestActual: null,
  subtests: [],
  itemActual: 0,
  respuestas: {},
  tiempoInicio: null,
  tiempoRestante: null,
  puntuacionDirecta: {},
  puntuacionCentil: {},
  cargando: false,
  error: null,
  testCompletado: false,
  resultados: null,
};

// Tipos de acciones
const actionTypes = {
  INICIAR_TEST: 'INICIAR_TEST',
  CAMBIAR_SUBTEST: 'CAMBIAR_SUBTEST',
  SIGUIENTE_ITEM: 'SIGUIENTE_ITEM',
  ANTERIOR_ITEM: 'ANTERIOR_ITEM',
  REGISTRAR_RESPUESTA: 'REGISTRAR_RESPUESTA',
  ACTUALIZAR_TIEMPO: 'ACTUALIZAR_TIEMPO',
  COMPLETAR_SUBTEST: 'COMPLETAR_SUBTEST',
  COMPLETAR_TEST: 'COMPLETAR_TEST',
  ESTABLECER_CARGANDO: 'ESTABLECER_CARGANDO',
  ESTABLECER_ERROR: 'ESTABLECER_ERROR',
  REINICIAR_TEST: 'REINICIAR_TEST',
  CARGAR_RESULTADOS: 'CARGAR_RESULTADOS',
};

// Reducer para manejar el estado
const testReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.INICIAR_TEST:
      return {
        ...state,
        testId: action.payload.testId,
        aplicacionId: action.payload.aplicacionId,
        subtests: action.payload.subtests,
        subtestActual: action.payload.subtestInicial,
        tiempoInicio: Date.now(),
        tiempoRestante: action.payload.tiempoLimite,
        cargando: false,
        error: null,
      };

    case actionTypes.CAMBIAR_SUBTEST:
      return {
        ...state,
        subtestActual: action.payload.subtest,
        itemActual: 0,
        tiempoInicio: Date.now(),
        tiempoRestante: action.payload.tiempoLimite,
      };

    case actionTypes.SIGUIENTE_ITEM:
      return {
        ...state,
        itemActual: state.itemActual + 1,
      };

    case actionTypes.ANTERIOR_ITEM:
      return {
        ...state,
        itemActual: Math.max(0, state.itemActual - 1),
      };

    case actionTypes.REGISTRAR_RESPUESTA:
      return {
        ...state,
        respuestas: {
          ...state.respuestas,
          [action.payload.subtestId]: {
            ...(state.respuestas[action.payload.subtestId] || {}),
            [action.payload.itemId]: {
              respuesta: action.payload.respuesta,
              correcta: action.payload.correcta,
              tiempo: action.payload.tiempo,
            },
          },
        },
      };

    case actionTypes.ACTUALIZAR_TIEMPO:
      return {
        ...state,
        tiempoRestante: action.payload.tiempoRestante,
      };

    case actionTypes.COMPLETAR_SUBTEST:
      return {
        ...state,
        puntuacionDirecta: {
          ...state.puntuacionDirecta,
          [action.payload.subtestId]: action.payload.puntuacion,
        },
      };

    case actionTypes.COMPLETAR_TEST:
      return {
        ...state,
        testCompletado: true,
        puntuacionCentil: action.payload.puntuacionCentil,
        resultados: action.payload.resultados,
      };

    case actionTypes.ESTABLECER_CARGANDO:
      return {
        ...state,
        cargando: action.payload,
      };

    case actionTypes.ESTABLECER_ERROR:
      return {
        ...state,
        error: action.payload,
        cargando: false,
      };

    case actionTypes.REINICIAR_TEST:
      return initialState;

    case actionTypes.CARGAR_RESULTADOS:
      return {
        ...state,
        resultados: action.payload,
      };

    default:
      return state;
  }
};

// Crear contexto
const TestContext = createContext();

// Hook personalizado para usar el contexto
export const useTest = () => useContext(TestContext);

// Proveedor del contexto
export const TestProvider = ({ children }) => {
  const [state, dispatch] = useReducer(testReducer, initialState);
  const [intervalId, setIntervalId] = useState(null);

  // Efecto para manejar el temporizador
  useEffect(() => {
    if (state.tiempoRestante && state.tiempoRestante > 0 && !state.testCompletado) {
      // Iniciar el temporizador
      const id = setInterval(() => {
        dispatch({
          type: actionTypes.ACTUALIZAR_TIEMPO,
          payload: {
            tiempoRestante: Math.max(0, state.tiempoRestante - 1),
          },
        });
      }, 1000);

      setIntervalId(id);

      // Limpiar el intervalo cuando el componente se desmonte
      return () => clearInterval(id);
    } else if (state.tiempoRestante === 0 && intervalId) {
      // Detener el temporizador cuando el tiempo se agote
      clearInterval(intervalId);
      setIntervalId(null);

      // Lógica para cuando el tiempo se agota
      // Automáticamente completar el subtest actual
      completarSubtest(state.subtestActual.id);
    }
  }, [state.tiempoRestante, state.testCompletado, state.subtestActual]);

  // Función para iniciar un test
  const iniciarTest = async (testId, pacienteId) => {
    try {
      dispatch({ type: actionTypes.ESTABLECER_CARGANDO, payload: true });

      // MODO DESARROLLO: Datos de prueba para evitar peticiones a Supabase
      const testData = {
        id: "1",
        nombre: "Batería de Aptitudes",
        descripcion: "Evaluación completa de aptitudes cognitivas",
        tiempo_total: 120
      };

      const subtestsData = [
        {
          id: "s1",
          test_id: "1",
          nombre: "Aptitud Verbal",
          codigo: "V",
          orden: 1,
          tiempo_limite: 15,
          total_items: 30,
          descripcion: "Evaluación de comprensión verbal"
        },
        {
          id: "s2",
          test_id: "1",
          nombre: "Aptitud Numérica",
          codigo: "N",
          orden: 2,
          tiempo_limite: 20,
          total_items: 25,
          descripcion: "Evaluación de capacidad numérica"
        },
        {
          id: "s3",
          test_id: "1",
          nombre: "Aptitud Espacial",
          codigo: "E",
          orden: 3,
          tiempo_limite: 15,
          total_items: 20,
          descripcion: "Evaluación de razonamiento espacial"
        }
      ];

      const aplicacionData = {
        id: "a1",
        paciente_id: pacienteId || "p1",
        test_id: testId || "1",
        fecha_inicio: new Date().toISOString(),
        estado: "en_progreso"
      };

      // Usar primer subtest como inicial
      const subtestInicial = subtestsData[0];

      dispatch({
        type: actionTypes.INICIAR_TEST,
        payload: {
          testId: testId || "1",
          aplicacionId: aplicacionData.id,
          subtests: subtestsData,
          subtestInicial,
          tiempoLimite: subtestInicial.tiempo_limite * 60, // Convertir minutos a segundos
        },
      });

      return true;
    } catch (error) {
      dispatch({
        type: actionTypes.ESTABLECER_ERROR,
        payload: `Error al iniciar el test: ${error.message}`,
      });
      return false;
    }
  };

  // Función para cambiar a otro subtest
  const cambiarSubtest = async (subtestId) => {
    try {
      const subtest = state.subtests.find((s) => s.id === subtestId);

      if (!subtest) {
        throw new Error('Subtest no encontrado');
      }

      // Guardar las respuestas del subtest actual antes de cambiar
      await guardarRespuestas();

      // Cambiar al nuevo subtest
      dispatch({
        type: actionTypes.CAMBIAR_SUBTEST,
        payload: {
          subtest,
          tiempoLimite: subtest.tiempo_limite * 60, // Convertir minutos a segundos
        },
      });

      return true;
    } catch (error) {
      dispatch({
        type: actionTypes.ESTABLECER_ERROR,
        payload: `Error al cambiar de subtest: ${error.message}`,
      });
      return false;
    }
  };

  // Función para registrar una respuesta
  const registrarRespuesta = (itemId, respuesta, correcta = false) => {
    try {
      dispatch({
        type: actionTypes.REGISTRAR_RESPUESTA,
        payload: {
          subtestId: state.subtestActual.id,
          itemId,
          respuesta,
          correcta,
          tiempo: Date.now() - state.tiempoInicio,
        },
      });

      // Avanzar automáticamente al siguiente ítem
      if (state.itemActual < state.subtestActual.total_items - 1) {
        dispatch({ type: actionTypes.SIGUIENTE_ITEM });
      }

      return true;
    } catch (error) {
      dispatch({
        type: actionTypes.ESTABLECER_ERROR,
        payload: `Error al registrar respuesta: ${error.message}`,
      });
      return false;
    }
  };

  // Función para guardar las respuestas en la base de datos
  const guardarRespuestas = async () => {
    try {
      // MODO DESARROLLO: Simular guardado sin hacer llamadas a Supabase
      console.log('DESARROLLO: Simulando guardado de respuestas');
      return true;
    } catch (error) {
      dispatch({
        type: actionTypes.ESTABLECER_ERROR,
        payload: `Error al guardar respuestas: ${error.message}`,
      });
      return false;
    }
  };

  // Función para completar un subtest y calcular puntuación
  const completarSubtest = async (subtestId) => {
    try {
      await guardarRespuestas();

      // Calcular puntuación directa para el subtest
      const respuestasSubtest = state.respuestas[subtestId] || {};
      const puntuacion = Object.values(respuestasSubtest).reduce(
        (total, resp) => total + (resp.correcta ? 1 : 0),
        0
      );

      dispatch({
        type: actionTypes.COMPLETAR_SUBTEST,
        payload: {
          subtestId,
          puntuacion,
        },
      });

      // MODO DESARROLLO: Omitir guardado en base de datos
      console.log('DESARROLLO: Simulando guardado de resultado para subtest', subtestId);

      return puntuacion;
    } catch (error) {
      dispatch({
        type: actionTypes.ESTABLECER_ERROR,
        payload: `Error al completar subtest: ${error.message}`,
      });
      return null;
    }
  };

  // Función para convertir PD a PC usando baremos
  const convertirPDaPC = async (subtestId, puntuacionDirecta, pacienteId) => {
    try {
      // MODO DESARROLLO: Simular conversión sin db
      console.log('DESARROLLO: Simulando conversión PD a PC');

      // Datos de ejemplo para simular la conversión
      const pcSimulado = Math.min(99, Math.max(1, puntuacionDirecta * 3 + 10));
      return pcSimulado;
    } catch (error) {
      console.error('Error al convertir PD a PC:', error);
      return 50; // Valor por defecto en caso de error
    }
  };

  // Función para completar el test completo
  const completarTest = async (pacienteId) => {
    try {
      dispatch({ type: actionTypes.ESTABLECER_CARGANDO, payload: true });

      // Completar el último subtest si no está completado
      if (state.subtestActual) {
        await completarSubtest(state.subtestActual.id);
      }

      // MODO DESARROLLO: Datos simulados para pruebas
      const puntuacionCentil = {};
      const resultados = {};

      // Crear resultados simulados para cada subtest
      for (const subtest of state.subtests) {
        const subtestId = subtest.id;
        // Usar puntuación directa real si existe, o generar una aleatoria
        const pd = state.puntuacionDirecta[subtestId] || Math.floor(Math.random() * 25) + 5;
        // Simular puntuación centil
        const pc = Math.min(99, Math.max(1, pd * 3 + 10));

        puntuacionCentil[subtestId] = pc;

        resultados[subtestId] = {
          nombre: subtest.nombre,
          codigo: subtest.codigo,
          puntuacionDirecta: pd,
          puntuacionCentil: pc,
          interpretacion: interpretarPuntuacion(pc),
        };
      }

      console.log('DESARROLLO: Test completado con datos simulados');

      // Actualizar el estado global
      dispatch({
        type: actionTypes.COMPLETAR_TEST,
        payload: {
          puntuacionCentil,
          resultados,
        },
      });

      return resultados;
    } catch (error) {
      dispatch({
        type: actionTypes.ESTABLECER_ERROR,
        payload: `Error al completar el test: ${error.message}`,
      });
      return null;
    } finally {
      dispatch({ type: actionTypes.ESTABLECER_CARGANDO, payload: false });
    }
  };

  // Función para interpretar puntuaciones centiles
  const interpretarPuntuacion = (pc) => {
    if (pc >= 90) return 'Muy alto';
    if (pc >= 70) return 'Alto';
    if (pc >= 30) return 'Medio';
    if (pc >= 10) return 'Bajo';
    return 'Muy bajo';
  };

  // Función para cargar resultados de un test ya completado
  const cargarResultados = async (aplicacionId) => {
    try {
      dispatch({ type: actionTypes.ESTABLECER_CARGANDO, payload: true });

      // MODO DESARROLLO: Datos simulados para pruebas
      console.log('DESARROLLO: Cargando resultados simulados');

      const resultados = {
        's1': {
          nombre: 'Aptitud Verbal',
          codigo: 'V',
          puntuacionDirecta: 22,
          puntuacionCentil: 76,
          interpretacion: 'Alto'
        },
        's2': {
          nombre: 'Aptitud Numérica',
          codigo: 'N',
          puntuacionDirecta: 18,
          puntuacionCentil: 65,
          interpretacion: 'Medio'
        },
        's3': {
          nombre: 'Aptitud Espacial',
          codigo: 'E',
          puntuacionDirecta: 15,
          puntuacionCentil: 55,
          interpretacion: 'Medio'
        }
      };

      dispatch({
        type: actionTypes.CARGAR_RESULTADOS,
        payload: resultados,
      });

      return resultados;
    } catch (error) {
      dispatch({
        type: actionTypes.ESTABLECER_ERROR,
        payload: `Error al cargar resultados: ${error.message}`,
      });
      return null;
    } finally {
      dispatch({ type: actionTypes.ESTABLECER_CARGANDO, payload: false });
    }
  };

  // Función para reiniciar el test
  const reiniciarTest = () => {
    dispatch({ type: actionTypes.REINICIAR_TEST });
  };

  // Valores a proveer en el contexto
  const value = {
    ...state,
    iniciarTest,
    cambiarSubtest,
    registrarRespuesta,
    completarSubtest,
    completarTest,
    cargarResultados,
    reiniciarTest,
  };

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
};

export default TestContext;