/**
 * @file useInterpretacionesMemoized.js
 * @description Hook personalizado para memoizar cálculos costosos de interpretaciones
 * Optimiza el rendimiento evitando recálculos innecesarios
 */

import { useMemo, useCallback } from 'react';
import InterpretacionesService from '../services/InterpretacionesService';

/**
 * Hook para memoizar interpretaciones de resultados
 * @param {Array} resultados - Array de resultados de evaluación
 * @param {Object} opciones - Opciones de configuración
 * @returns {Object} Interpretaciones memoizadas y funciones utilitarias
 */
export const useInterpretacionesMemoized = (resultados = [], opciones = {}) => {
  const {
    incluirRendimiento = true,
    incluirAcademico = true,
    incluirVocacional = true,
    filtrarAptitudes = null
  } = opciones;

  // Memoizar el procesamiento de resultados básicos
  const resultadosProcesados = useMemo(() => {
    if (!Array.isArray(resultados) || resultados.length === 0) {
      return [];
    }

    return resultados
      .filter(resultado => {
        // Filtrar por aptitudes específicas si se especifica
        if (filtrarAptitudes && Array.isArray(filtrarAptitudes)) {
          return filtrarAptitudes.includes(resultado.aptitud);
        }
        return true;
      })
      .map(resultado => ({
        ...resultado,
        nivelRendimiento: InterpretacionesService.obtenerNivelPorPercentil(resultado.percentil),
        colorNivel: InterpretacionesService.obtenerColorPorPercentil(resultado.percentil)
      }));
  }, [resultados, filtrarAptitudes]);

  // Memoizar interpretaciones cualitativas
  const interpretacionesCualitativas = useMemo(() => {
    const interpretaciones = {};

    resultadosProcesados.forEach(resultado => {
      const aptitud = resultado.aptitud;
      const percentil = resultado.percentil;

      if (percentil !== null && percentil !== undefined) {
        interpretaciones[aptitud] = {
          rendimiento: incluirRendimiento 
            ? InterpretacionesService.obtenerInterpretacionCualitativa(aptitud, percentil, 'rendimiento')
            : null,
          academico: incluirAcademico 
            ? InterpretacionesService.obtenerInterpretacionCualitativa(aptitud, percentil, 'academico')
            : null,
          vocacional: incluirVocacional 
            ? InterpretacionesService.obtenerInterpretacionCualitativa(aptitud, percentil, 'vocacional')
            : null
        };
      }
    });

    return interpretaciones;
  }, [resultadosProcesados, incluirRendimiento, incluirAcademico, incluirVocacional]);

  // Memoizar estadísticas generales
  const estadisticasGenerales = useMemo(() => {
    if (resultadosProcesados.length === 0) {
      return {
        totalAptitudes: 0,
        promedioPercentil: 0,
        aptitudesAltas: [],
        aptitudesBajas: [],
        distribucionNiveles: {}
      };
    }

    const percentiles = resultadosProcesados
      .map(r => r.percentil)
      .filter(p => p !== null && p !== undefined);

    const promedioPercentil = percentiles.length > 0 
      ? percentiles.reduce((sum, p) => sum + p, 0) / percentiles.length 
      : 0;

    const aptitudesAltas = resultadosProcesados
      .filter(r => r.percentil >= 75)
      .map(r => ({
        aptitud: r.aptitud,
        percentil: r.percentil,
        nivel: r.nivelRendimiento
      }));

    const aptitudesBajas = resultadosProcesados
      .filter(r => r.percentil <= 25)
      .map(r => ({
        aptitud: r.aptitud,
        percentil: r.percentil,
        nivel: r.nivelRendimiento
      }));

    // Distribución por niveles de rendimiento
    const distribucionNiveles = resultadosProcesados.reduce((acc, resultado) => {
      const nivel = resultado.nivelRendimiento;
      acc[nivel] = (acc[nivel] || 0) + 1;
      return acc;
    }, {});

    return {
      totalAptitudes: resultadosProcesados.length,
      promedioPercentil: Math.round(promedioPercentil),
      aptitudesAltas,
      aptitudesBajas,
      distribucionNiveles
    };
  }, [resultadosProcesados]);

  // Memoizar recomendaciones basadas en los resultados
  const recomendaciones = useMemo(() => {
    const recomendacionesGeneradas = [];

    // Recomendaciones para aptitudes altas
    estadisticasGenerales.aptitudesAltas.forEach(aptitud => {
      recomendacionesGeneradas.push({
        tipo: 'fortaleza',
        aptitud: aptitud.aptitud,
        mensaje: `Excelente rendimiento en ${aptitud.aptitud}. Se recomienda potenciar esta fortaleza.`,
        prioridad: 'alta'
      });
    });

    // Recomendaciones para aptitudes bajas
    estadisticasGenerales.aptitudesBajas.forEach(aptitud => {
      recomendacionesGeneradas.push({
        tipo: 'mejora',
        aptitud: aptitud.aptitud,
        mensaje: `Se sugiere reforzar las habilidades en ${aptitud.aptitud} mediante práctica específica.`,
        prioridad: 'media'
      });
    });

    // Recomendación general si el promedio es bajo
    if (estadisticasGenerales.promedioPercentil < 30) {
      recomendacionesGeneradas.push({
        tipo: 'general',
        aptitud: 'todas',
        mensaje: 'Se recomienda un plan de desarrollo integral para mejorar el rendimiento general.',
        prioridad: 'alta'
      });
    }

    return recomendacionesGeneradas;
  }, [estadisticasGenerales]);

  // Función para obtener interpretación de una aptitud específica
  const obtenerInterpretacionAptitud = useCallback((aptitud, tipo = 'rendimiento') => {
    return interpretacionesCualitativas[aptitud]?.[tipo] || null;
  }, [interpretacionesCualitativas]);

  // Función para obtener resultados filtrados por nivel
  const obtenerResultadosPorNivel = useCallback((nivel) => {
    return resultadosProcesados.filter(resultado => resultado.nivelRendimiento === nivel);
  }, [resultadosProcesados]);

  // Función para obtener comparación entre aptitudes
  const compararAptitudes = useCallback((aptitud1, aptitud2) => {
    const resultado1 = resultadosProcesados.find(r => r.aptitud === aptitud1);
    const resultado2 = resultadosProcesados.find(r => r.aptitud === aptitud2);

    if (!resultado1 || !resultado2) {
      return null;
    }

    const diferencia = resultado1.percentil - resultado2.percentil;
    
    return {
      aptitud1: {
        nombre: aptitud1,
        percentil: resultado1.percentil,
        nivel: resultado1.nivelRendimiento
      },
      aptitud2: {
        nombre: aptitud2,
        percentil: resultado2.percentil,
        nivel: resultado2.nivelRendimiento
      },
      diferencia,
      interpretacion: Math.abs(diferencia) < 10 
        ? 'Rendimiento similar' 
        : diferencia > 0 
          ? `${aptitud1} supera a ${aptitud2}` 
          : `${aptitud2} supera a ${aptitud1}`
    };
  }, [resultadosProcesados]);

  // Estado de carga
  const isLoading = useMemo(() => {
    return resultados.length > 0 && resultadosProcesados.length === 0;
  }, [resultados.length, resultadosProcesados.length]);

  return {
    // Datos procesados
    resultadosProcesados,
    interpretacionesCualitativas,
    estadisticasGenerales,
    recomendaciones,
    
    // Funciones utilitarias
    obtenerInterpretacionAptitud,
    obtenerResultadosPorNivel,
    compararAptitudes,
    
    // Estado
    isLoading,
    hasData: resultadosProcesados.length > 0
  };
};

export default useInterpretacionesMemoized;