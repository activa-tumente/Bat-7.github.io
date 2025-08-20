import supabase from '../api/supabaseClient';
import { convertirPdAPC } from '../utils/baremosUtils';

/**
 * Servicio para la conversión automática de PD a PC usando baremos
 */
export class BaremosService {
  
  /**
   * Calcular la edad en años a partir de la fecha de nacimiento
   */
  static calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return null;
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  /**
   * Determinar el grupo de edad para los baremos
   */
  static determinarGrupoEdad(edad) {
    if (edad === 12) {
      return "12-13";
    } else if (edad === 13 || edad === 14) {
      return "13-14";
    } else {
      console.warn(`Edad ${edad} fuera del rango de baremos (12-14 años)`);
      return null;
    }
  }

  /**
   * Convertir PD a PC automáticamente
   */
  static async convertirPdAPC(pd, aptitudCodigo, pacienteId) {
    try {
      // Obtener información del paciente
      const { data: paciente, error: errorPaciente } = await supabase
        .from('pacientes')
        .select('fecha_nacimiento')
        .eq('id', pacienteId)
        .single();

      if (errorPaciente) {
        console.error('Error al obtener paciente:', errorPaciente);
        return null;
      }

      // Calcular edad
      const edad = this.calcularEdad(paciente.fecha_nacimiento);
      if (!edad) {
        console.warn('No se pudo calcular la edad del paciente');
        return null;
      }

      // Convertir usando los baremos
      const pc = convertirPdAPC(pd, aptitudCodigo, edad);
      
      return {
        pc,
        edad,
        grupoEdad: this.determinarGrupoEdad(edad),
        pd
      };

    } catch (error) {
      console.error('Error en conversión PD a PC:', error);
      return null;
    }
  }

  /**
   * Actualizar resultado con PC calculado
   */
  static async actualizarResultadoConPC(resultadoId, pc) {
    try {
      const { data, error } = await supabase
        .from('resultados')
        .update({
          percentil: pc,
          updated_at: new Date().toISOString()
        })
        .eq('id', resultadoId)
        .select();

      if (error) {
        console.error('Error al actualizar resultado con PC:', error);
        return null;
      }

      return data[0];
    } catch (error) {
      console.error('Error al actualizar resultado:', error);
      return null;
    }
  }

  /**
   * Procesar conversión automática al guardar resultado
   */
  static async procesarConversionAutomatica(resultadoId, pd, aptitudCodigo, pacienteId) {
    try {
      // Convertir PD a PC
      const conversion = await this.convertirPdAPC(pd, aptitudCodigo, pacienteId);
      
      if (!conversion) {
        console.warn('No se pudo realizar la conversión PD a PC');
        return null;
      }

      // Actualizar el resultado con el PC calculado
      const resultadoActualizado = await this.actualizarResultadoConPC(
        resultadoId,
        conversion.pc,
        conversion.edad,
        conversion.grupoEdad
      );

      console.log(`Conversión automática completada: PD ${pd} → PC ${conversion.pc} (Edad: ${conversion.edad}, Baremo: ${conversion.grupoEdad})`);
      
      return resultadoActualizado;

    } catch (error) {
      console.error('Error en procesamiento de conversión automática:', error);
      return null;
    }
  }

  /**
   * Obtener interpretación cualitativa del percentil
   */
  static obtenerInterpretacionPC(pc) {
    if (pc >= 98) return { nivel: 'Muy Alto', color: 'text-green-700', bg: 'bg-green-100' };
    if (pc >= 85) return { nivel: 'Alto', color: 'text-blue-700', bg: 'bg-blue-100' };
    if (pc >= 70) return { nivel: 'Medio-Alto', color: 'text-indigo-700', bg: 'bg-indigo-100' };
    if (pc >= 31) return { nivel: 'Medio', color: 'text-gray-700', bg: 'bg-gray-100' };
    if (pc >= 16) return { nivel: 'Medio-Bajo', color: 'text-yellow-700', bg: 'bg-yellow-100' };
    if (pc >= 3) return { nivel: 'Bajo', color: 'text-orange-700', bg: 'bg-orange-100' };
    return { nivel: 'Muy Bajo', color: 'text-red-700', bg: 'bg-red-100' };
  }

  /**
   * Recalcular todos los PC para un paciente específico
   */
  static async recalcularPCPaciente(pacienteId) {
    try {
      // Obtener todos los resultados del paciente sin PC
      const { data: resultados, error } = await supabase
        .from('resultados')
        .select(`
          id,
          puntaje_directo,
          aptitudes:aptitud_id (codigo)
        `)
        .eq('paciente_id', pacienteId)
        .is('percentil', null);

      if (error) {
        console.error('Error al obtener resultados:', error);
        return false;
      }

      let procesados = 0;
      for (const resultado of resultados) {
        const conversion = await this.procesarConversionAutomatica(
          resultado.id,
          resultado.puntaje_directo,
          resultado.aptitudes?.codigo,
          pacienteId
        );
        
        if (conversion) {
          procesados++;
        }
      }

      console.log(`Recálculo completado: ${procesados}/${resultados.length} resultados procesados`);
      return true;

    } catch (error) {
      console.error('Error en recálculo de PC:', error);
      return false;
    }
  }
}

export default BaremosService;
