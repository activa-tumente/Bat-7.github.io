import supabase from '../api/supabaseClient';
import { toast } from 'react-toastify';

/**
 * Servicio mejorado para manejar la conversión automática PD a PC usando funciones de Supabase
 * Incluye validación robusta, manejo de errores y optimizaciones de rendimiento
 */
export class SupabaseConversionService {

  // Cache para baremos y configuraciones
  static _cache = {
    baremos: null,
    funcionesDisponibles: null,
    lastCheck: null
  };

  // Configuración de cache (5 minutos)
  static CACHE_DURATION = 5 * 60 * 1000;

  /**
   * Validar parámetros de entrada para conversión
   */
  static _validarParametrosConversion(puntajeDirecto, aptitudCodigo, edad) {
    const errores = [];

    if (typeof puntajeDirecto !== 'number' || puntajeDirecto < 0 || puntajeDirecto > 100) {
      errores.push('Puntaje directo debe ser un número entre 0 y 100');
    }

    if (!aptitudCodigo || typeof aptitudCodigo !== 'string' || aptitudCodigo.length === 0) {
      errores.push('Código de aptitud es requerido');
    }

    if (typeof edad !== 'number' || edad < 6 || edad > 18) {
      errores.push('Edad debe ser un número entre 6 y 18 años');
    }

    return errores;
  }

  /**
   * Limpiar cache cuando sea necesario
   */
  static _limpiarCache() {
    this._cache = {
      baremos: null,
      funcionesDisponibles: null,
      lastCheck: null
    };
  }

  /**
   * Verificar si el cache es válido
   */
  static _esCacheValido() {
    return this._cache.lastCheck && 
           (Date.now() - this._cache.lastCheck) < this.CACHE_DURATION;
  }

  /**
   * Ejecutar la función de recálculo de percentiles en Supabase
   */
  static async recalcularTodosLosPercentiles() {
    try {
      const { data, error } = await supabase.rpc('recalcular_todos_los_percentiles');
      
      if (error) {
        console.error('Error al recalcular percentiles:', error);
        toast.error('Error al recalcular percentiles en Supabase');
        return { success: false, error };
      }

      const resultadosActualizados = data || 0;
      console.log(`Recálculo completado: ${resultadosActualizados} resultados actualizados`);
      
      if (resultadosActualizados > 0) {
        toast.success(`Se actualizaron ${resultadosActualizados} resultados con sus percentiles`);
      } else {
        toast.info('No hay resultados pendientes de conversión');
      }

      return { success: true, count: resultadosActualizados };

    } catch (error) {
      console.error('Error en recálculo de percentiles:', error);
      toast.error('Error al ejecutar el recálculo de percentiles');
      return { success: false, error };
    }
  }

  /**
   * Probar la función de conversión PD a PC con valores específicos
   * Incluye validación robusta de parámetros
   */
  static async probarConversion(puntajeDirecto, aptitudCodigo, edad) {
    try {
      // Validar parámetros de entrada
      const erroresValidacion = this._validarParametrosConversion(puntajeDirecto, aptitudCodigo, edad);
      if (erroresValidacion.length > 0) {
        const mensajeError = `Parámetros inválidos: ${erroresValidacion.join(', ')}`;
        console.error(mensajeError);
        toast.error(mensajeError);
        return { success: false, error: { message: mensajeError }, validationErrors: erroresValidacion };
      }

      // Ejecutar conversión
      const { data, error } = await supabase.rpc('convertir_pd_a_pc', {
        p_puntaje_directo: puntajeDirecto,
        p_aptitud_codigo: aptitudCodigo.toUpperCase(), // Normalizar código
        p_edad: Math.round(edad) // Asegurar que sea entero
      });

      if (error) {
        console.error('Error al probar conversión:', error);
        toast.error(`Error en conversión: ${error.message || 'Error desconocido'}`);
        return { success: false, error };
      }

      // Validar resultado
      if (data === null || data === undefined) {
        const mensaje = `No se pudo calcular percentil para PD=${puntajeDirecto}, aptitud=${aptitudCodigo}, edad=${edad}`;
        console.warn(mensaje);
        toast.warning(mensaje);
        return { success: false, error: { message: mensaje } };
      }

      // Validar que el percentil esté en rango válido
      if (typeof data !== 'number' || data < 1 || data > 99) {
        const mensaje = `Percentil fuera de rango válido (1-99): ${data}`;
        console.warn(mensaje);
        toast.warning(mensaje);
        return { success: false, error: { message: mensaje } };
      }

      console.log(`✅ Conversión exitosa: PD ${puntajeDirecto} (${aptitudCodigo}, ${edad} años) → PC ${data}`);
      return { success: true, percentil: data };

    } catch (error) {
      console.error('Error en prueba de conversión:', error);
      toast.error(`Error inesperado en conversión: ${error.message}`);
      return { success: false, error };
    }
  }



  /**
   * Convertir múltiples resultados en lote para mejor rendimiento
   */
  static async convertirResultadosEnLote(resultadoIds, mostrarProgreso = true) {
    try {
      if (!Array.isArray(resultadoIds) || resultadoIds.length === 0) {
        toast.warning('No se proporcionaron resultados para convertir');
        return { success: false, error: 'Lista de resultados vacía' };
      }

      console.log(`🔄 Iniciando conversión en lote de ${resultadoIds.length} resultados...`);
      
      const resultados = {
        exitosos: [],
        fallidos: [],
        total: resultadoIds.length
      };

      // Procesar en lotes de 10 para evitar sobrecarga
      const TAMANO_LOTE = 10;
      const lotes = [];
      
      for (let i = 0; i < resultadoIds.length; i += TAMANO_LOTE) {
        lotes.push(resultadoIds.slice(i, i + TAMANO_LOTE));
      }

      for (let i = 0; i < lotes.length; i++) {
        const lote = lotes[i];
        
        if (mostrarProgreso) {
          console.log(`📊 Procesando lote ${i + 1}/${lotes.length} (${lote.length} resultados)`);
        }

        // Procesar lote en paralelo
        const promesasLote = lote.map(async (resultadoId) => {
          try {
            const resultado = await this.forzarConversionResultado(resultadoId);
            if (resultado.success) {
              resultados.exitosos.push({ id: resultadoId, resultado: resultado.resultado });
            } else {
              resultados.fallidos.push({ id: resultadoId, error: resultado.error });
            }
          } catch (error) {
            resultados.fallidos.push({ id: resultadoId, error });
          }
        });

        await Promise.all(promesasLote);
        
        // Pequeña pausa entre lotes para no sobrecargar la base de datos
        if (i < lotes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const porcentajeExito = (resultados.exitosos.length / resultados.total * 100).toFixed(1);
      
      console.log(`✅ Conversión en lote completada: ${resultados.exitosos.length}/${resultados.total} exitosos (${porcentajeExito}%)`);
      
      if (resultados.exitosos.length > 0) {
        toast.success(`Conversión completada: ${resultados.exitosos.length}/${resultados.total} resultados convertidos`);
      }
      
      if (resultados.fallidos.length > 0) {
        console.warn(`⚠️ ${resultados.fallidos.length} conversiones fallaron:`, resultados.fallidos);
        toast.warning(`${resultados.fallidos.length} conversiones fallaron`);
      }

      return {
        success: resultados.exitosos.length > 0,
        resultados,
        porcentajeExito: parseFloat(porcentajeExito)
      };

    } catch (error) {
      console.error('❌ Error en conversión en lote:', error);
      toast.error('Error en conversión en lote');
      return { success: false, error };
    }
  }

  /**
   * Configurar la conversión automática para nuevos resultados
   */
  static async configurarConversionAutomatica() {
    try {
      // Recalcular percentiles existentes
      const recalculo = await this.recalcularTodosLosPercentiles();
      
      if (recalculo.success) {
        toast.success('Conversión automática configurada correctamente');
        return true;
      } else {
        toast.error('Error al configurar la conversión automática');
        return false;
      }

    } catch (error) {
      console.error('Error al configurar conversión automática:', error);
      toast.error('Error al configurar la conversión automática');
      return false;
    }
  }

  /**
   * Obtener estadísticas de conversión
   */
  static async obtenerEstadisticasConversion() {
    try {
      // Contar resultados con y sin percentil
      const { data: conPercentil, error: error1 } = await supabase
        .from('resultados')
        .select('id', { count: 'exact' })
        .not('percentil', 'is', null);

      const { data: sinPercentil, error: error2 } = await supabase
        .from('resultados')
        .select('id', { count: 'exact' })
        .is('percentil', null);

      if (error1 || error2) {
        console.error('Error al obtener estadísticas:', error1 || error2);
        return null;
      }

      const estadisticas = {
        totalResultados: (conPercentil?.length || 0) + (sinPercentil?.length || 0),
        conPercentil: conPercentil?.length || 0,
        sinPercentil: sinPercentil?.length || 0,
        porcentajeConvertido: ((conPercentil?.length || 0) / ((conPercentil?.length || 0) + (sinPercentil?.length || 0)) * 100).toFixed(1)
      };

      return estadisticas;

    } catch (error) {
      console.error('Error al obtener estadísticas de conversión:', error);
      return null;
    }
  }

  /**
   * Forzar conversión de un resultado específico
   */
  static async forzarConversionResultado(resultadoId) {
    try {
      // Obtener el resultado específico
      const { data: resultado, error: errorGet } = await supabase
        .from('resultados')
        .select(`
          id,
          puntaje_directo,
          aptitudes:aptitud_id (codigo),
          pacientes:paciente_id (fecha_nacimiento)
        `)
        .eq('id', resultadoId)
        .single();

      if (errorGet || !resultado) {
        console.error('Error al obtener resultado:', errorGet);
        return { success: false, error: errorGet };
      }

      // Calcular edad
      const fechaNacimiento = new Date(resultado.pacientes.fecha_nacimiento);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      const mes = hoy.getMonth() - fechaNacimiento.getMonth();
      
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
      }

      // Convertir usando la función de Supabase
      const conversion = await this.probarConversion(
        resultado.puntaje_directo,
        resultado.aptitudes.codigo,
        edad
      );

      if (!conversion.success) {
        return { success: false, error: 'Error en conversión' };
      }

      // Actualizar el resultado con el percentil calculado
      const { data: actualizado, error: errorUpdate } = await supabase
        .from('resultados')
        .update({
          percentil: conversion.percentil,
          updated_at: new Date().toISOString()
        })
        .eq('id', resultadoId)
        .select()
        .single();

      if (errorUpdate) {
        console.error('Error al actualizar resultado:', errorUpdate);
        return { success: false, error: errorUpdate };
      }

      console.log(`Resultado ${resultadoId} actualizado: PD ${resultado.puntaje_directo} → PC ${conversion.percentil}`);
      toast.success(`Conversión completada: PC ${conversion.percentil}`);
      
      return { success: true, resultado: actualizado };

    } catch (error) {
      console.error('Error al forzar conversión:', error);
      return { success: false, error };
    }
  }

  /**
   * Verificar integridad de los baremos en Supabase
   */
  static async verificarBaremos() {
    try {
      const { data: baremos, error } = await supabase
        .from('baremos')
        .select('factor, baremo_grupo, count(*)')
        .group('factor, baremo_grupo');

      if (error) {
        console.error('Error al verificar baremos:', error);
        return { success: false, error };
      }

      console.log('Baremos disponibles:', baremos);
      return { success: true, baremos };

    } catch (error) {
      console.error('Error al verificar baremos:', error);
      return { success: false, error };
    }
  }
}

export default SupabaseConversionService;
