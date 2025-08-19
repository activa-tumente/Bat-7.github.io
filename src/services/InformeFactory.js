/**
 * @file InformeFactory.js
 * @description Factory pattern para la generación de diferentes tipos de informes
 * Centraliza la lógica de creación y configuración de informes
 */

import InformesService from './InformesService';
import InterpretacionesService from './InterpretacionesService';

/**
 * Tipos de informes disponibles
 */
export const TIPOS_INFORME = {
  COMPLETO: 'completo',
  INDIVIDUAL: 'individual',
  RESUMEN: 'resumen',
  COMPARATIVO: 'comparativo'
};

/**
 * Configuraciones por defecto para cada tipo de informe
 */
const CONFIGURACIONES_DEFAULT = {
  [TIPOS_INFORME.COMPLETO]: {
    incluirInterpretaciones: true,
    incluirGraficos: true,
    incluirRecomendaciones: true,
    incluirAnalisisCualitativo: true,
    formato: 'profesional'
  },
  [TIPOS_INFORME.INDIVIDUAL]: {
    incluirInterpretaciones: true,
    incluirGraficos: false,
    incluirRecomendaciones: true,
    incluirAnalisisCualitativo: false,
    formato: 'basico'
  },
  [TIPOS_INFORME.RESUMEN]: {
    incluirInterpretaciones: false,
    incluirGraficos: true,
    incluirRecomendaciones: false,
    incluirAnalisisCualitativo: false,
    formato: 'compacto'
  },
  [TIPOS_INFORME.COMPARATIVO]: {
    incluirInterpretaciones: true,
    incluirGraficos: true,
    incluirRecomendaciones: true,
    incluirAnalisisCualitativo: true,
    formato: 'comparativo'
  }
};

/**
 * Factory para crear informes según el tipo especificado
 */
class InformeFactory {
  /**
   * Crea un informe según el tipo especificado
   * @param {string} tipo - Tipo de informe (TIPOS_INFORME)
   * @param {Object} datos - Datos necesarios para generar el informe
   * @param {Object} opciones - Opciones adicionales para personalizar el informe
   * @returns {Promise<Object>} Informe generado
   */
  static async crearInforme(tipo, datos, opciones = {}) {
    const configuracion = {
      ...CONFIGURACIONES_DEFAULT[tipo],
      ...opciones
    };

    switch (tipo) {
      case TIPOS_INFORME.COMPLETO:
        return await this._crearInformeCompleto(datos, configuracion);
      
      case TIPOS_INFORME.INDIVIDUAL:
        return await this._crearInformeIndividual(datos, configuracion);
      
      case TIPOS_INFORME.RESUMEN:
        return await this._crearInformeResumen(datos, configuracion);
      
      case TIPOS_INFORME.COMPARATIVO:
        return await this._crearInformeComparativo(datos, configuracion);
      
      default:
        throw new Error(`Tipo de informe no válido: ${tipo}`);
    }
  }

  /**
   * Crea un informe completo
   * @private
   */
  static async _crearInformeCompleto(datos, configuracion) {
    const { pacienteId, titulo, descripcion } = datos;
    
    return await InformesService.generarInformeCompleto(
      pacienteId,
      titulo || `Informe Completo BAT-7`,
      descripcion || 'Informe psicológico completo con interpretaciones cualitativas',
      configuracion.incluirInterpretaciones
    );
  }

  /**
   * Crea un informe individual
   * @private
   */
  static async _crearInformeIndividual(datos, configuracion) {
    const { resultadoId, titulo, descripcion } = datos;
    
    return await InformesService.generarInformeIndividual(
      resultadoId,
      titulo || `Informe Individual BAT-7`,
      descripcion || 'Informe de resultado individual'
    );
  }

  /**
   * Crea un informe resumen
   * @private
   */
  static async _crearInformeResumen(datos, configuracion) {
    const { pacienteId, resultados } = datos;
    
    // Generar estadísticas resumidas
    const estadisticas = this._calcularEstadisticasResumen(resultados);
    
    return {
      tipo: 'resumen',
      paciente_id: pacienteId,
      estadisticas,
      fecha_generacion: new Date().toISOString(),
      configuracion
    };
  }

  /**
   * Crea un informe comparativo
   * @private
   */
  static async _crearInformeComparativo(datos, configuracion) {
    const { pacienteId, resultadosComparar } = datos;
    
    // Lógica para comparar múltiples evaluaciones
    const comparacion = this._generarComparacion(resultadosComparar);
    
    return {
      tipo: 'comparativo',
      paciente_id: pacienteId,
      comparacion,
      fecha_generacion: new Date().toISOString(),
      configuracion
    };
  }

  /**
   * Calcula estadísticas resumidas
   * @private
   */
  static _calcularEstadisticasResumen(resultados) {
    if (!resultados || resultados.length === 0) {
      return {
        total_tests: 0,
        promedio_percentil: 0,
        aptitudes_altas: [],
        aptitudes_bajas: []
      };
    }

    const percentiles = resultados.map(r => r.percentil).filter(p => p !== null);
    const promedioPercentil = percentiles.reduce((sum, p) => sum + p, 0) / percentiles.length;
    
    const aptitudesAltas = resultados
      .filter(r => r.percentil >= 75)
      .map(r => r.aptitud);
    
    const aptitudesBajas = resultados
      .filter(r => r.percentil <= 25)
      .map(r => r.aptitud);

    return {
      total_tests: resultados.length,
      promedio_percentil: Math.round(promedioPercentil),
      aptitudes_altas: aptitudesAltas,
      aptitudes_bajas: aptitudesBajas
    };
  }

  /**
   * Genera comparación entre múltiples evaluaciones
   * @private
   */
  static _generarComparacion(resultadosComparar) {
    // Implementar lógica de comparación
    return {
      tendencias: [],
      mejoras: [],
      areas_atencion: []
    };
  }

  /**
   * Obtiene la configuración por defecto para un tipo de informe
   * @param {string} tipo - Tipo de informe
   * @returns {Object} Configuración por defecto
   */
  static obtenerConfiguracionDefault(tipo) {
    return { ...CONFIGURACIONES_DEFAULT[tipo] };
  }

  /**
   * Valida los datos necesarios para generar un informe
   * @param {string} tipo - Tipo de informe
   * @param {Object} datos - Datos a validar
   * @returns {boolean} True si los datos son válidos
   */
  static validarDatos(tipo, datos) {
    switch (tipo) {
      case TIPOS_INFORME.COMPLETO:
        return datos.pacienteId !== undefined;
      
      case TIPOS_INFORME.INDIVIDUAL:
        return datos.resultadoId !== undefined;
      
      case TIPOS_INFORME.RESUMEN:
        return datos.pacienteId !== undefined && Array.isArray(datos.resultados);
      
      case TIPOS_INFORME.COMPARATIVO:
        return datos.pacienteId !== undefined && Array.isArray(datos.resultadosComparar);
      
      default:
        return false;
    }
  }
}

export default InformeFactory;