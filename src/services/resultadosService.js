/**
 * @file resultadosService.js
 * @description Servicio para manejar los datos de la tabla 'resultados' de Supabase
 * Adaptado a la nueva estructura de la base de datos
 */

import supabase from '../api/supabaseClient';
import pinControlService from './pinControlService';

class ResultadosService {
  /**
   * Obtiene todos los resultados de un paciente específico
   * @param {string} pacienteId - ID del paciente
   * @returns {Promise<Array>} Array de resultados con información de aptitudes
   */
  static async getResultadosByPaciente(pacienteId) {
    try {
      const { data, error } = await supabase
        .from('resultados')
        .select(`
          *,
          pacientes (
            id,
            nombre,
            apellido,
            documento,
            genero,
            fecha_nacimiento,
            created_at
          ),
          aptitudes (
            id,
            codigo,
            nombre,
            descripcion
          )
        `)
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo resultados:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error en getResultadosByPaciente:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas completas de un paciente
   * @param {string} pacienteId - ID del paciente
   * @returns {Promise<Object>} Objeto con estadísticas del paciente
   */
  static async getEstadisticasPaciente(pacienteId) {
    try {
      const resultados = await this.getResultadosByPaciente(pacienteId);
      
      if (resultados.length === 0) {
        return {
          totalTests: 0,
          averagePercentile: 0,
          averageDirectScore: 0,
          totalErrors: 0,
          averageErrors: 0,
          totalTimeSeconds: 0,
          averageTimeSeconds: 0,
          concentracionPromedio: 0,
          lastTestDate: null,
          patientInfo: null
        };
      }

      const totalTests = resultados.length;
      const totalPercentile = resultados.reduce((sum, r) => sum + (r.percentil || 0), 0);
      const totalDirectScore = resultados.reduce((sum, r) => sum + (r.puntaje_directo || 0), 0);
      const totalErrors = resultados.reduce((sum, r) => sum + (r.errores || 0), 0);
      const totalTime = resultados.reduce((sum, r) => sum + (r.tiempo_segundos || 0), 0);
      const totalConcentracion = resultados.reduce((sum, r) => sum + (r.concentracion || 0), 0);

      return {
        totalTests,
        averagePercentile: Math.round(totalPercentile / totalTests),
        averageDirectScore: Math.round(totalDirectScore / totalTests),
        totalErrors,
        averageErrors: totalErrors / totalTests,
        totalTimeSeconds: totalTime,
        averageTimeSeconds: totalTime / totalTests,
        concentracionPromedio: totalConcentracion / totalTests,
        lastTestDate: resultados[0]?.created_at,
        patientInfo: resultados[0]?.pacientes,
        resultadosPorAptitud: this.agruparPorAptitud(resultados)
      };
    } catch (error) {
      console.error('Error en getEstadisticasPaciente:', error);
      throw error;
    }
  }

  /**
   * Agrupa los resultados por aptitud
   * @param {Array} resultados - Array de resultados
   * @returns {Object} Resultados agrupados por aptitud
   */
  static agruparPorAptitud(resultados) {
    const agrupados = {};
    
    resultados.forEach(resultado => {
      const aptitudCodigo = resultado.aptitudes?.codigo;
      if (aptitudCodigo) {
        if (!agrupados[aptitudCodigo]) {
          agrupados[aptitudCodigo] = {
            aptitud: resultado.aptitudes,
            resultados: [],
            promedios: {
              percentil: 0,
              puntajeDirecto: 0,
              errores: 0,
              tiempo: 0,
              concentracion: 0
            }
          };
        }
        agrupados[aptitudCodigo].resultados.push(resultado);
      }
    });

    // Calcular promedios por aptitud
    Object.keys(agrupados).forEach(codigo => {
      const grupo = agrupados[codigo];
      const count = grupo.resultados.length;
      
      grupo.promedios = {
        percentil: Math.round(grupo.resultados.reduce((sum, r) => sum + (r.percentil || 0), 0) / count),
        puntajeDirecto: Math.round(grupo.resultados.reduce((sum, r) => sum + (r.puntaje_directo || 0), 0) / count),
        errores: grupo.resultados.reduce((sum, r) => sum + (r.errores || 0), 0) / count,
        tiempo: grupo.resultados.reduce((sum, r) => sum + (r.tiempo_segundos || 0), 0) / count,
        concentracion: grupo.resultados.reduce((sum, r) => sum + (r.concentracion || 0), 0) / count
      };
    });

    return agrupados;
  }

  /**
   * Inserta un nuevo resultado en la base de datos
   * @param {Object} resultado - Datos del resultado
   * @param {string} testSessionId - ID de la sesión de test (opcional)
   * @returns {Promise<Object>} Resultado insertado
   */
  static async insertarResultado(resultado, testSessionId = null) {
    try {
      const { data, error } = await supabase
        .from('resultados')
        .insert([
          {
            paciente_id: resultado.paciente_id,
            aptitud_id: resultado.aptitud_id,
            puntaje_directo: resultado.puntaje_directo,
            percentil: resultado.percentil,
            interpretacion: resultado.interpretacion,
            tiempo_segundos: resultado.tiempo_segundos,
            respuestas: resultado.respuestas,
            concentracion: resultado.concentracion,
            errores: resultado.errores || 0,
            percentil_compared: resultado.percentil_compared,
            respuestas_correctas: resultado.respuestas_correctas,
            respuestas_incorrectas: resultado.respuestas_incorrectas,
            respuestas_sin_contestar: resultado.respuestas_sin_contestar,
            total_preguntas: resultado.total_preguntas
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error insertando resultado:', error);
        throw error;
      }

      // Consumir pin automáticamente si el paciente tiene psicólogo asignado
      try {
        // Obtener el psicólogo del paciente
        const { data: paciente, error: pacienteError } = await supabase
          .from('pacientes')
          .select('psicologo_id')
          .eq('id', resultado.paciente_id)
          .single();

        if (!pacienteError && paciente?.psicologo_id) {
          await pinControlService.consumePin(
            paciente.psicologo_id,
            resultado.paciente_id,
            testSessionId,
            null
          );
          console.log('✅ [ResultadosService] Pin consumido automáticamente para resultado:', data.id);
        }
      } catch (pinError) {
        console.warn('⚠️ [ResultadosService] Error al consumir pin para resultado:', pinError);
        // No interrumpir el flujo si hay error con los pines
      }

      return data;
    } catch (error) {
      console.error('Error en insertarResultado:', error);
      throw error;
    }
  }

  /**
   * Actualiza un resultado existente
   * @param {string} resultadoId - ID del resultado
   * @param {Object} datosActualizados - Datos a actualizar
   * @returns {Promise<Object>} Resultado actualizado
   */
  static async actualizarResultado(resultadoId, datosActualizados) {
    try {
      const { data, error } = await supabase
        .from('resultados')
        .update({
          ...datosActualizados,
          updated_at: new Date().toISOString()
        })
        .eq('id', resultadoId)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando resultado:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error en actualizarResultado:', error);
      throw error;
    }
  }

  /**
   * Elimina un resultado
   * @param {string} resultadoId - ID del resultado
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  static async eliminarResultado(resultadoId) {
    try {
      const { error } = await supabase
        .from('resultados')
        .delete()
        .eq('id', resultadoId);

      if (error) {
        console.error('Error eliminando resultado:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error en eliminarResultado:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los resultados con paginación
   * @param {number} page - Página actual
   * @param {number} limit - Límite de resultados por página
   * @param {Object} filtros - Filtros opcionales
   * @returns {Promise<Object>} Resultados paginados
   */
  static async getResultadosPaginados(page = 1, limit = 10, filtros = {}) {
    try {
      let query = supabase
        .from('resultados')
        .select(`
          *,
          pacientes (
            id,
            nombre,
            apellido,
            documento
          ),
          aptitudes (
            id,
            codigo,
            nombre
          )
        `, { count: 'exact' });

      // Aplicar filtros
      if (filtros.paciente_id) {
        query = query.eq('paciente_id', filtros.paciente_id);
      }
      if (filtros.aptitud_id) {
        query = query.eq('aptitud_id', filtros.aptitud_id);
      }
      if (filtros.fecha_desde) {
        query = query.gte('created_at', filtros.fecha_desde);
      }
      if (filtros.fecha_hasta) {
        query = query.lte('created_at', filtros.fecha_hasta);
      }

      // Aplicar paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query
        .range(from, to)
        .order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('Error obteniendo resultados paginados:', error);
        throw error;
      }

      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error en getResultadosPaginados:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas generales del sistema
   * @returns {Promise<Object>} Estadísticas generales
   */
  static async getEstadisticasGenerales() {
    try {
      // Obtener conteos básicos
      const { data: resultados, error: errorResultados } = await supabase
        .from('resultados')
        .select('*');

      if (errorResultados) {
        throw errorResultados;
      }

      const { data: pacientes, error: errorPacientes } = await supabase
        .from('pacientes')
        .select('id');

      if (errorPacientes) {
        throw errorPacientes;
      }

      const totalResultados = resultados?.length || 0;
      const totalPacientes = pacientes?.length || 0;
      
      if (totalResultados === 0) {
        return {
          totalResultados: 0,
          totalPacientes,
          promedioTestsPorPaciente: 0,
          percentilPromedio: 0,
          puntajeDirectoPromedio: 0,
          erroresPromedio: 0,
          tiempoPromedioMinutos: 0
        };
      }

      const totalPercentiles = resultados.reduce((sum, r) => sum + (r.percentil || 0), 0);
      const totalPuntajesDirectos = resultados.reduce((sum, r) => sum + (r.puntaje_directo || 0), 0);
      const totalErrores = resultados.reduce((sum, r) => sum + (r.errores || 0), 0);
      const totalTiempo = resultados.reduce((sum, r) => sum + (r.tiempo_segundos || 0), 0);

      return {
        totalResultados,
        totalPacientes,
        promedioTestsPorPaciente: totalPacientes > 0 ? (totalResultados / totalPacientes).toFixed(1) : 0,
        percentilPromedio: Math.round(totalPercentiles / totalResultados),
        puntajeDirectoPromedio: Math.round(totalPuntajesDirectos / totalResultados),
        erroresPromedio: (totalErrores / totalResultados).toFixed(1),
        tiempoPromedioMinutos: Math.round(totalTiempo / totalResultados / 60)
      };
    } catch (error) {
      console.error('Error en getEstadisticasGenerales:', error);
      throw error;
    }
  }

  /**
   * Busca resultados por criterios específicos
   * @param {Object} criterios - Criterios de búsqueda
   * @returns {Promise<Array>} Resultados que coinciden con los criterios
   */
  static async buscarResultados(criterios) {
    try {
      let query = supabase
        .from('resultados')
        .select(`
          *,
          pacientes (
            id,
            nombre,
            apellido,
            documento
          ),
          aptitudes (
            id,
            codigo,
            nombre,
            descripcion
          )
        `);

      // Aplicar criterios de búsqueda
      if (criterios.nombrePaciente) {
        query = query.ilike('pacientes.nombre', `%${criterios.nombrePaciente}%`);
      }
      if (criterios.documentoPaciente) {
        query = query.eq('pacientes.documento', criterios.documentoPaciente);
      }
      if (criterios.codigoAptitud) {
        query = query.eq('aptitudes.codigo', criterios.codigoAptitud);
      }
      if (criterios.percentilMinimo) {
        query = query.gte('percentil', criterios.percentilMinimo);
      }
      if (criterios.percentilMaximo) {
        query = query.lte('percentil', criterios.percentilMaximo);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error buscando resultados:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error en buscarResultados:', error);
      throw error;
    }
  }
}

export default ResultadosService;