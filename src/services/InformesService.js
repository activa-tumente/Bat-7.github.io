/**
 * @file InformesService.js
 * @description Servicio para gestionar informes de evaluaciones psicológicas
 */

import supabase from '../api/supabaseClient';
import { toast } from 'react-toastify';
import { calculateAge } from '../utils/dateUtils';
import InterpretacionesService from './InterpretacionesService';
import pinControlService from './pin/ImprovedPinControlService';

const InformesService = {
  /**
   * Obtener informes de un paciente específico
   * @param {string} pacienteId - ID del paciente
   * @returns {Promise<Array>} Lista de informes del paciente
   */
  async obtenerInformesPaciente(pacienteId) {
    try {
      console.log('📋 [InformesService] Obteniendo informes para paciente:', pacienteId);
      
      const { data, error } = await supabase
        .from('informes_generados')
        .select(`
          *,
          pacientes (
            id,
            nombre,
            apellido,
            documento,
            fecha_nacimiento
          )
        `)
        .eq('paciente_id', pacienteId)
        .order('fecha_generacion', { ascending: false });

      if (error) {
        console.error('❌ [InformesService] Error obteniendo informes:', error);
        throw error;
      }

      console.log('✅ [InformesService] Informes obtenidos:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ [InformesService] Error en obtenerInformesPaciente:', error);
      toast.error('Error al cargar los informes del paciente');
      throw error;
    }
  },

  /**
   * Obtener un informe específico por ID
   * @param {string} informeId - ID del informe
   * @returns {Promise<Object>} Datos del informe
   */
  async obtenerInforme(informeId) {
    try {
      console.log('🔍 [InformesService] Obteniendo informe:', informeId);
      
      const { data, error } = await supabase
        .from('informes_generados')
        .select(`
          *,
          pacientes (
            id,
            nombre,
            apellido,
            documento,
            fecha_nacimiento,
            genero,
            institucion_id
          )
        `)
        .eq('id', informeId)
        .single();

      if (error) {
        console.error('❌ [InformesService] Error obteniendo informe:', error);
        throw error;
      }

      // Calcular edad si existe fecha de nacimiento
      if (data && data.pacientes && data.pacientes.fecha_nacimiento) {
        data.pacientes.edad = calculateAge(data.pacientes.fecha_nacimiento);
      }
      
      console.log('✅ [InformesService] Informe obtenido:', data);
      return data;
    } catch (error) {
      console.error('❌ [InformesService] Error en obtenerInforme:', error);
      toast.error('Error al cargar el informe');
      throw error;
    }
  },

  /**
   * Generar informe completo para un paciente con interpretaciones cualitativas
   * @param {string} pacienteId - ID del paciente
   * @param {string} titulo - Título personalizado del informe
   * @param {string} descripcion - Descripción del informe
   * @param {boolean} incluirInterpretaciones - Incluir interpretaciones cualitativas detalladas
   * @returns {Promise<string>} ID del informe generado
   */
  async generarInformeCompleto(pacienteId, titulo = null, descripcion = null, incluirInterpretaciones = true) {
    try {
      console.log('📊 [InformesService] Generando informe completo para paciente:', pacienteId);
      
      // Obtener datos del paciente
      const { data: paciente, error: pacienteError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', pacienteId)
        .single();

      if (pacienteError) {
        throw pacienteError;
      }

      // Calcular edad si existe fecha de nacimiento
      if (paciente && paciente.fecha_nacimiento) {
        paciente.edad = calculateAge(paciente.fecha_nacimiento);
      }

      // Obtener resultados del paciente
      const { data: resultados, error: resultadosError } = await supabase
        .from('resultados')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false });

      if (resultadosError) {
        throw resultadosError;
      }

      // Generar interpretaciones cualitativas si se solicita
      let interpretacionesCualitativas = null;
      if (incluirInterpretaciones && resultados && resultados.length > 0) {
        try {
          interpretacionesCualitativas = await this._generarInterpretacionesCualitativas(resultados);
        } catch (error) {
          console.warn('⚠️ [InformesService] Error generando interpretaciones cualitativas:', error);
          // Continuar sin interpretaciones cualitativas
        }
      }

      // Estructurar contenido del informe
      const contenido = {
        paciente: paciente,
        resultados: resultados || [],
        estadisticas: this._calcularEstadisticas(resultados || []),
        evaluacion: this._generarEvaluacion(resultados || []),
        interpretacionesCualitativas
      };

      // Crear registro del informe
      const { data: informe, error: informeError } = await supabase
        .from('informes_generados')
        .insert({
          paciente_id: pacienteId,
          tipo_informe: 'completo',
          titulo: titulo || `Informe Completo - ${paciente.nombre} ${paciente.apellido}`,
          descripcion: descripcion || 'Informe completo de evaluación psicológica',
          contenido: contenido,
          estado: 'generado',
          fecha_generacion: new Date().toISOString(),
          metadatos: {
            version: '2.0',
            generado_por: 'sistema',
            total_resultados: resultados?.length || 0,
            incluye_interpretaciones: !!interpretacionesCualitativas
          }
        })
        .select()
        .single();

      if (informeError) {
        throw informeError;
      }

      // --- INICIO DE LA LÓGICA DE CONSUMO DE PINES ---
      // Consumir pin automáticamente si el paciente tiene psicólogo asignado
      try {
        if (paciente.psicologo_id) {
          // 1. Buscar la última sesión finalizada para este paciente que aún no ha consumido un pin
          const { data: session, error: sessionError } = await supabase
            .from('test_sessions')
            .select('id, paciente_id, fecha_fin')
            .eq('paciente_id', pacienteId)
            .eq('estado', 'finalizado')
            .is('pin_consumed_at', null) // Busca sesiones que no han consumido pin
            .order('fecha_fin', { ascending: false })
            .limit(1)
            .single();

          if (session) {
            // 2. Intentar consumir el pin
            await pinControlService.consumePin(
              paciente.psicologo_id,
              pacienteId,
              session.id,
              informe.id
            );

            // 3. Si el consumo fue exitoso, marcar la sesión para no volver a cobrarla
            await supabase
              .from('test_sessions')
              .update({ pin_consumed_at: new Date().toISOString() })
              .eq('id', session.id);

            console.log('✅ [InformesService] Pin consumido automáticamente para informe:', informe.id);
            toast.info('Se ha consumido 1 pin para generar el informe.');
          } else {
            console.warn('⚠️ [InformesService] No se encontró sesión finalizada pendiente de consumo para paciente:', pacienteId);
          }
        }
      } catch (pinError) {
        console.error('❌ [InformesService] Error al consumir pin para informe:', pinError);
        // Si no hay pines disponibles, eliminar el informe creado y lanzar error
        if (pinError.message.includes('No hay pines disponibles') || pinError.message.includes('Sin pines')) {
          await supabase.from('informes_generados').delete().eq('id', informe.id);
          throw new Error(`No se puede generar el informe: ${pinError.message}`);
        }
        // Para otros errores, solo advertir pero continuar
        console.warn('⚠️ [InformesService] Error al consumir pin, pero continuando con la generación del informe');
      }
      // --- FIN DE LA LÓGICA DE CONSUMO DE PINES ---

      console.log('✅ [InformesService] Informe completo generado:', informe.id);
      toast.success('Informe completo generado exitosamente');
      return informe.id;
    } catch (error) {
      console.error('❌ [InformesService] Error generando informe completo:', error);
      toast.error('Error al generar el informe completo');
      throw error;
    }
  },

  /**
   * Generar informe individual para un resultado específico
   * @param {string} resultadoId - ID del resultado
   * @param {string} titulo - Título personalizado del informe
   * @param {string} descripcion - Descripción del informe
   * @returns {Promise<string>} ID del informe generado
   */
  async generarInformeIndividual(resultadoId, titulo = null, descripcion = null) {
    try {
      console.log('📄 [InformesService] Generando informe individual para resultado:', resultadoId);
      
      // Obtener resultado específico con datos del paciente
      const { data: resultado, error: resultadoError } = await supabase
        .from('resultados')
        .select(`
          *,
          pacientes (
            id,
            nombre,
            apellido,
            documento,
            fecha_nacimiento,
            genero,
            institucion
          )
        `)
        .eq('id', resultadoId)
        .single();

      if (resultadoError) {
        throw resultadoError;
      }

      // Calcular edad si existe fecha de nacimiento
      if (resultado && resultado.pacientes && resultado.pacientes.fecha_nacimiento) {
        resultado.pacientes.edad = calculateAge(resultado.pacientes.fecha_nacimiento);
      }

      // Estructurar contenido del informe
      const contenido = {
        paciente: resultado.pacientes,
        resultados: [resultado],
        estadisticas: this._calcularEstadisticas([resultado]),
        evaluacion: this._generarEvaluacion([resultado])
      };

      // Crear registro del informe
      const { data: informe, error: informeError } = await supabase
        .from('informes_generados')
        .insert({
          paciente_id: resultado.paciente_id,
          tipo_informe: 'individual',
          titulo: titulo || `Informe Individual - ${resultado.pacientes.nombre} ${resultado.pacientes.apellido}`,
          descripcion: descripcion || 'Informe individual de evaluación psicológica',
          contenido: contenido,
          estado: 'generado',
          fecha_generacion: new Date().toISOString(),
          metadatos: {
            version: '1.0',
            generado_por: 'sistema',
            resultado_id: resultadoId
          }
        })
        .select()
        .single();

      if (informeError) {
        throw informeError;
      }

      // --- INICIO DE LA LÓGICA DE CONSUMO DE PINES ---
      // Consumir pin automáticamente si el paciente tiene psicólogo asignado
      try {
        // Obtener el psicólogo del paciente
        const { data: pacienteCompleto, error: pacienteError } = await supabase
          .from('pacientes')
          .select('psicologo_id')
          .eq('id', resultado.paciente_id)
          .single();

        if (!pacienteError && pacienteCompleto?.psicologo_id) {
          // 1. Buscar la última sesión finalizada para este paciente que aún no ha consumido un pin
          const { data: session, error: sessionError } = await supabase
            .from('test_sessions')
            .select('id, paciente_id, fecha_fin')
            .eq('paciente_id', resultado.paciente_id)
            .eq('estado', 'finalizado')
            .is('pin_consumed_at', null) // Busca sesiones que no han consumido pin
            .order('fecha_fin', { ascending: false })
            .limit(1)
            .single();

          if (session) {
            // 2. Intentar consumir el pin
            await pinControlService.consumePin(
              pacienteCompleto.psicologo_id,
              resultado.paciente_id,
              session.id,
              informe.id
            );

            // 3. Si el consumo fue exitoso, marcar la sesión para no volver a cobrarla
            await supabase
              .from('test_sessions')
              .update({ pin_consumed_at: new Date().toISOString() })
              .eq('id', session.id);

            console.log('✅ [InformesService] Pin consumido automáticamente para informe individual:', informe.id);
            toast.info('Se ha consumido 1 pin para generar el informe.');
          } else {
            console.warn('⚠️ [InformesService] No se encontró sesión finalizada pendiente de consumo para paciente:', resultado.paciente_id);
          }
        }
      } catch (pinError) {
        console.error('❌ [InformesService] Error al consumir pin para informe individual:', pinError);
        // Si no hay pines disponibles, eliminar el informe creado y lanzar error
        if (pinError.message.includes('No hay pines disponibles') || pinError.message.includes('Sin pines')) {
          await supabase.from('informes_generados').delete().eq('id', informe.id);
          throw new Error(`No se puede generar el informe: ${pinError.message}`);
        }
        // Para otros errores, solo advertir pero continuar
        console.warn('⚠️ [InformesService] Error al consumir pin, pero continuando con la generación del informe');
      }
      // --- FIN DE LA LÓGICA DE CONSUMO DE PINES ---

      console.log('✅ [InformesService] Informe individual generado:', informe.id);
      toast.success('Informe individual generado exitosamente');
      return informe.id;
    } catch (error) {
      console.error('❌ [InformesService] Error generando informe individual:', error);
      toast.error('Error al generar el informe individual');
      throw error;
    }
  },

  /**
   * Archivar un informe
   * @param {string} informeId - ID del informe
   * @returns {Promise<void>}
   */
  async archivarInforme(informeId) {
    try {
      console.log('📦 [InformesService] Archivando informe:', informeId);
      
      const { error } = await supabase
        .from('informes_generados')
        .update({ 
          estado: 'archivado',
          fecha_archivado: new Date().toISOString()
        })
        .eq('id', informeId);

      if (error) {
        throw error;
      }

      console.log('✅ [InformesService] Informe archivado exitosamente');
      toast.success('Informe archivado exitosamente');
    } catch (error) {
      console.error('❌ [InformesService] Error archivando informe:', error);
      toast.error('Error al archivar el informe');
      throw error;
    }
  },

  /**
   * Eliminar un informe
   * @param {string} informeId - ID del informe
   * @returns {Promise<void>}
   */
  async eliminarInforme(informeId) {
    try {
      console.log('🗑️ [InformesService] Eliminando informe:', informeId);
      
      const { error } = await supabase
        .from('informes_generados')
        .delete()
        .eq('id', informeId);

      if (error) {
        throw error;
      }

      console.log('✅ [InformesService] Informe eliminado exitosamente');
      toast.success('Informe eliminado exitosamente');
    } catch (error) {
      console.error('❌ [InformesService] Error eliminando informe:', error);
      toast.error('Error al eliminar el informe');
      throw error;
    }
  },

  /**
   * Obtener todos los informes del sistema
   * @returns {Promise<Array>} Lista de todos los informes
   */
  async obtenerTodosLosInformes() {
    try {
      console.log('📋 [InformesService] Obteniendo todos los informes');
      
      const { data, error } = await supabase
        .from('informes_generados')
        .select(`
          *,
          pacientes (
            id,
            nombre,
            apellido,
            documento
          )
        `)
        .order('fecha_generacion', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('✅ [InformesService] Todos los informes obtenidos:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ [InformesService] Error obteniendo todos los informes:', error);
      toast.error('Error al cargar los informes');
      throw error;
    }
  },

  /**
   * Calcular estadísticas básicas de los resultados
   * @private
   * @param {Array} resultados - Array de resultados
   * @returns {Object} Estadísticas calculadas
   */
  _calcularEstadisticas(resultados) {
    if (!resultados || resultados.length === 0) {
      return {
        total_evaluaciones: 0,
        promedio_percentiles: {},
        aptitudes_destacadas: [],
        areas_mejora: []
      };
    }

    const aptitudes = ['verbal', 'espacial', 'atencion_concentracion', 'razonamiento', 'numerica', 'mecanica', 'ortografia'];
    const promedios = {};
    const totales = {};
    
    // Calcular promedios por aptitud
    aptitudes.forEach(aptitud => {
      const valores = resultados
        .map(r => r.percentiles?.[aptitud])
        .filter(v => v !== null && v !== undefined && !isNaN(v));
      
      if (valores.length > 0) {
        promedios[aptitud] = valores.reduce((sum, val) => sum + val, 0) / valores.length;
        totales[aptitud] = valores.length;
      }
    });

    // Identificar aptitudes destacadas (percentil > 75)
    const aptitudesDestacadas = Object.entries(promedios)
      .filter(([_, promedio]) => promedio > 75)
      .map(([aptitud, promedio]) => ({ aptitud, promedio: Math.round(promedio) }));

    // Identificar áreas de mejora (percentil < 25)
    const areasMejora = Object.entries(promedios)
      .filter(([_, promedio]) => promedio < 25)
      .map(([aptitud, promedio]) => ({ aptitud, promedio: Math.round(promedio) }));

    return {
      total_evaluaciones: resultados.length,
      promedio_percentiles: Object.fromEntries(
        Object.entries(promedios).map(([k, v]) => [k, Math.round(v)])
      ),
      aptitudes_destacadas: aptitudesDestacadas,
      areas_mejora: areasMejora,
      fecha_primera_evaluacion: resultados[resultados.length - 1]?.fecha_evaluacion,
      fecha_ultima_evaluacion: resultados[0]?.fecha_evaluacion
    };
  },

  /**
   * Generar interpretaciones cualitativas completas usando el nuevo sistema
   * @private
   * @param {Array} resultados - Array de resultados
   * @returns {Promise<Object>} Interpretaciones cualitativas
   */
  async _generarInterpretacionesCualitativas(resultados) {
    try {
      // Preparar datos para el servicio de interpretaciones
      const resultadosAptitudes = resultados.map(resultado => ({
        aptitud_codigo: resultado.aptitud_id,
        percentil: resultado.percentiles?.verbal || resultado.percentil,
        puntaje_directo: resultado.puntaje_directo,
        interpretacion: resultado.interpretacion
      }));

      // Generar resumen cualitativo completo
      const resumenCualitativo = await InterpretacionesService.generarResumenCualitativo(
        resultadosAptitudes
      );

      return resumenCualitativo;
    } catch (error) {
      console.error('Error al generar interpretaciones cualitativas:', error);
      throw error;
    }
  },

  /**
   * Generar evaluación cualitativa básica
   * @private
   * @param {Array} resultados - Array de resultados
   * @returns {Object} Evaluación generada
   */
  _generarEvaluacion(resultados) {
    if (!resultados || resultados.length === 0) {
      return {
        resumen: 'No hay resultados disponibles para evaluar.',
        recomendaciones: [],
        observaciones: []
      };
    }

    const estadisticas = this._calcularEstadisticas(resultados);
    const recomendaciones = [];
    const observaciones = [];

    // Generar recomendaciones basadas en estadísticas
    if (estadisticas.aptitudes_destacadas.length > 0) {
      recomendaciones.push(
        `Potenciar las aptitudes destacadas: ${estadisticas.aptitudes_destacadas.map(a => a.aptitud).join(', ')}`
      );
    }

    if (estadisticas.areas_mejora.length > 0) {
      recomendaciones.push(
        `Trabajar en las áreas de mejora: ${estadisticas.areas_mejora.map(a => a.aptitud).join(', ')}`
      );
    }

    // Generar observaciones
    if (resultados.length > 1) {
      observaciones.push('Se observa un historial de evaluaciones que permite analizar la evolución.');
    }

    const resumen = `Evaluación basada en ${estadisticas.total_evaluaciones} evaluación${estadisticas.total_evaluaciones !== 1 ? 'es' : ''}. 
${estadisticas.aptitudes_destacadas.length > 0 ? `Aptitudes destacadas: ${estadisticas.aptitudes_destacadas.length}. ` : ''}
${estadisticas.areas_mejora.length > 0 ? `Áreas de mejora identificadas: ${estadisticas.areas_mejora.length}.` : ''}`;

    return {
      resumen: resumen.trim(),
      recomendaciones,
      observaciones
    };
  },

  /**
   * Generar informe automáticamente cuando se completa un test
   * @param {string} pacienteId - ID del paciente
   * @param {string} resultadoId - ID del resultado recién creado
   * @returns {Promise<string|null>} ID del informe generado o null si ya existe
   */
  async generarInformeAutomatico(pacienteId, resultadoId = null) {
    try {
      console.log('🤖 [InformesService] Generando informe automático para paciente:', pacienteId);
      
      // Verificar si ya existe un informe para este paciente
      const { data: informeExistente, error: errorVerificacion } = await supabase
        .from('informes_generados')
        .select('id')
        .eq('paciente_id', pacienteId)
        .eq('tipo_informe', 'completo')
        .eq('estado', 'generado')
        .single();

      if (errorVerificacion && errorVerificacion.code !== 'PGRST116') {
        throw errorVerificacion;
      }

      // Si ya existe un informe, no generar otro
      if (informeExistente) {
        console.log('ℹ️ [InformesService] Ya existe un informe para este paciente:', informeExistente.id);
        return null;
      }

      // Obtener datos del paciente
      const { data: paciente, error: pacienteError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', pacienteId)
        .single();

      if (pacienteError) {
        throw pacienteError;
      }

      // Generar informe completo automáticamente
      const informeId = await this.generarInformeCompleto(
        pacienteId,
        `Informe Automático BAT-7 - ${paciente.nombre} ${paciente.apellido}`,
        'Informe generado automáticamente al completar la evaluación'
      );

      console.log('✅ [InformesService] Informe automático generado:', informeId);
      return informeId;
    } catch (error) {
      console.error('❌ [InformesService] Error generando informe automático:', error);
      // No lanzar error para no interrumpir el flujo principal
      return null;
    }
  },

  /**
   * Verificar si un paciente necesita informe automático
   * @param {string} pacienteId - ID del paciente
   * @returns {Promise<boolean>} True si necesita informe
   */
  async necesitaInformeAutomatico(pacienteId) {
    try {
      // Verificar si tiene resultados pero no tiene informe
      const { data: resultados, error: errorResultados } = await supabase
        .from('resultados')
        .select('id')
        .eq('paciente_id', pacienteId);

      if (errorResultados) {
        throw errorResultados;
      }

      if (!resultados || resultados.length === 0) {
        return false; // No tiene resultados
      }

      // Verificar si ya tiene informe
      const { data: informe, error: errorInforme } = await supabase
        .from('informes_generados')
        .select('id')
        .eq('paciente_id', pacienteId)
        .eq('tipo_informe', 'completo')
        .eq('estado', 'generado')
        .single();

      if (errorInforme && errorInforme.code !== 'PGRST116') {
        throw errorInforme;
      }

      return !informe; // Necesita informe si no tiene uno
    } catch (error) {
      console.error('❌ [InformesService] Error verificando necesidad de informe:', error);
      return false;
    }
  }
};

export default InformesService;