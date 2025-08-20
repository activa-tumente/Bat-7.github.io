/**
 * Componente modernizado para verificar y crear informes de pacientes nuevos
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import supabase from '../../api/supabaseClient';
import InformesService from '../../services/InformesService';

const VerificarPacientesNuevos = () => {
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [generandoInformes, setGenerandoInformes] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [informesGenerados, setInformesGenerados] = useState([]);
  const [busquedaIndividual, setBusquedaIndividual] = useState('');
  const [loadingIndividual, setLoadingIndividual] = useState(false);
  const [filtroGenero, setFiltroGenero] = useState('todos');
  const [pacientesSeleccionados, setPacientesSeleccionados] = useState(new Set());

  // Lista de 14 pacientes nuevos
  const pacientesNuevos = [
    'Josué Esteban Barcenas Carrillo',
    'Leandro Emmanuel Castañeda Torres', 
    'Alex Ortiz Martínez',
    'Antonella Pinillos Delgado',
    'Maria Jose Gomez Portilla',
    'Isabella Galvis Lizcano',
    'Jose David Aguilar Sierra',
    'Luciana Suarez Fuentes',
    'Rousey Castellanos Mendez',
    'María Gabriela Jácome Castellanos',
    'Valeria Gómez Moreno',
    'Paulina Bermúdez Durán',
    'Thomas Celis',
    'Salome Bustamante Chinchilla'
  ];

  // Helper functions for better separation of concerns
  const buscarPaciente = async (nombreCompleto) => {
    const [nombre, ...apellidoParts] = nombreCompleto.split(' ');
    const apellido = apellidoParts.join(' ');
    
    console.log(`📋 Buscando: ${nombreCompleto} (Nombre: "${nombre}", Apellido: "${apellido}")`);
    
    // Búsqueda más flexible: probar diferentes combinaciones
    let pacientes = [];
    
    // Intento 1: Búsqueda exacta por nombre Y apellido
    const { data: pacientes1, error: error1 } = await supabase
      .from('pacientes')
      .select('*')
      .ilike('nombre', `%${nombre}%`)
      .ilike('apellido', `%${apellido}%`);
    
    if (pacientes1 && pacientes1.length > 0) {
      pacientes = pacientes1;
    } else {
      // Intento 2: Búsqueda solo por nombre si no encuentra por apellido
      const { data: pacientes2, error: error2 } = await supabase
        .from('pacientes')
        .select('*')
        .ilike('nombre', `%${nombre}%`);
      
      if (pacientes2 && pacientes2.length > 0) {
        pacientes = pacientes2;
      } else {
        // Intento 3: Búsqueda solo por apellido
        const { data: pacientes3, error: error3 } = await supabase
          .from('pacientes')
          .select('*')
          .ilike('apellido', `%${apellido}%`);
        
        if (pacientes3 && pacientes3.length > 0) {
          pacientes = pacientes3;
        }
      }
    }
    
    if (error1) {
      console.log(`   ❌ Error: ${error1.message}`);
      return { error: error1.message, encontrado: false };
    }
    
    console.log(`   🔍 Pacientes encontrados: ${pacientes?.length || 0}`);
    if (pacientes && pacientes.length > 0) {
      pacientes.forEach((p, index) => {
        console.log(`   ${index + 1}. ${p.nombre} ${p.apellido} (Doc: ${p.documento})`);
      });
      
      // Buscar la mejor coincidencia
      let mejorCoincidencia = pacientes[0];
      let mejorPuntaje = 0;
      
      pacientes.forEach(p => {
        const nombrePaciente = `${p.nombre} ${p.apellido}`.toLowerCase();
        const nombreBuscado = nombreCompleto.toLowerCase();
        
        // Calcular puntaje de similitud
        let puntaje = 0;
        if (nombrePaciente.includes(nombreBuscado) || nombreBuscado.includes(nombrePaciente)) {
          puntaje += 10;
        }
        if (p.nombre.toLowerCase().includes(nombre.toLowerCase())) {
          puntaje += 5;
        }
        if (p.apellido.toLowerCase().includes(apellido.toLowerCase())) {
          puntaje += 5;
        }
        
        if (puntaje > mejorPuntaje) {
          mejorPuntaje = puntaje;
          mejorCoincidencia = p;
        }
      });
      
      console.log(`   ✅ Paciente seleccionado: ${mejorCoincidencia.nombre} ${mejorCoincidencia.apellido} (Puntaje: ${mejorPuntaje})`);
      
      return { paciente: mejorCoincidencia, encontrado: true };
    }
    
    return { encontrado: false };
  };

  const obtenerResultadosPaciente = async (pacienteId) => {
    const { data: resultadosTests, error } = await supabase
      .from('resultados')
      .select(`
        *,
        aptitudes (codigo, nombre)
      `)
      .eq('paciente_id', pacienteId);
      
    return { resultadosTests: resultadosTests || [], error };
  };

  // Función para verificar si ya existe un informe para el paciente
  const verificarInformeExistente = async (pacienteId) => {
    try {
      const { data: informeExistente, error } = await supabase
        .from('informes_generados')
        .select('id, fecha_generacion')
        .eq('paciente_id', pacienteId)
        .eq('estado', 'generado')
        .order('fecha_generacion', { ascending: false })
        .limit(1);
        
      if (error) {
        console.error('Error verificando informe existente:', error);
        return { existe: false };
      }
      
      return { 
        existe: informeExistente && informeExistente.length > 0,
        informe: informeExistente?.[0] || null
      };
    } catch (error) {
      console.error('Error en verificación:', error);
      return { existe: false };
    }
  };

  const generarInformeAutomatico = async (pacienteId, nombreCompleto) => {
    console.log(`   📄 Generando informe automáticamente para: ${nombreCompleto}`);
    
    // Verificar si ya existe un informe
    const { existe, informe } = await verificarInformeExistente(pacienteId);
    if (existe) {
      console.log(`   ⚠️ Ya existe un informe para ${nombreCompleto} (ID: ${informe.id})`);
      return {
        paciente: nombreCompleto,
        informeId: informe.id,
        estado: 'ya_existe',
        mensaje: 'Ya existe un informe para este paciente'
      };
    }
    
    try {
      // Primero verificar que el paciente tiene datos suficientes
      const { data: resultadosCheck, error: errorCheck } = await supabase
        .from('resultados')
        .select('id, percentil, aptitudes:aptitud_id(codigo)')
        .eq('paciente_id', pacienteId)
        .not('percentil', 'is', null);

      if (errorCheck) {
        console.error(`   ❌ Error verificando datos: ${errorCheck.message}`);
        return {
          paciente: nombreCompleto,
          informeId: null,
          estado: 'error',
          error: `Error verificando datos: ${errorCheck.message}`
        };
      }

      if (!resultadosCheck || resultadosCheck.length === 0) {
        console.log(`   ⚠️ No hay resultados con PC para: ${nombreCompleto}`);
        return {
          paciente: nombreCompleto,
          informeId: null,
          estado: 'sin_datos',
          error: 'No hay resultados con puntajes PC disponibles'
        };
      }

      console.log(`   📊 Encontrados ${resultadosCheck.length} resultados con PC`);

      // Intentar generar el informe
      try {
        const informeData = await InformesService.generarInformeCompleto(pacienteId);
        
        if (!informeData) {
          return {
            paciente: nombreCompleto,
            informeId: null,
            estado: 'error',
            error: 'No se pudo generar el informe'
          };
        }
        
        return {
          paciente: nombreCompleto,
          informeId: informeData.id,
          estado: 'generado',
          error: null
        };
        
      } catch (error) {
        console.error(`   ❌ Error generando informe: ${error.message}`);
        
        return {
          paciente: nombreCompleto,
          informeId: null,
          estado: 'error',
          error: error.message
        };
      }

      console.log(`   ✅ Informe generado exitosamente con ID: ${informeData}`);
      
      // Verificar que el informe se guardó correctamente
      const { data: informeVerificacion, error: errorVerificacion } = await supabase
        .from('informes_generados')
        .select('id, titulo, metadatos')
        .eq('id', informeData)
        .single();

      if (errorVerificacion) {
        console.error(`   ⚠️ Informe generado pero error en verificación: ${errorVerificacion.message}`);
      } else {
        console.log(`   ✅ Informe verificado: "${informeVerificacion.titulo}"`);
      }

      return {
        paciente: nombreCompleto,
        informeId: informeData,
        estado: 'generado',
        totalResultados: resultadosCheck.length,
        aptitudes: resultadosCheck.map(r => r.aptitudes.codigo).join(', ')
      };
    } catch (err) {
      console.error(`   ❌ Error en generación: ${err.message}`);
      return {
        paciente: nombreCompleto,
        informeId: null,
        estado: 'error',
        error: err.message
      };
    }
  };

  const verificarPacientes = async () => {
    setLoading(true);
    setResultados([]);
    setInformesGenerados([]);

    try {
      console.log('🔍 VERIFICANDO PACIENTES NUEVOS EN SUPABASE');
      const resultadosVerificacion = [];
      const informesCreados = [];

      for (const nombreCompleto of pacientesNuevos) {
        const resultadoBusqueda = await buscarPaciente(nombreCompleto);
        
        if (resultadoBusqueda.error) {
          resultadosVerificacion.push({
            nombre: nombreCompleto,
            encontrado: false,
            error: resultadoBusqueda.error,
            resultados: 0
          });
          continue;
        }
        
        if (resultadoBusqueda.encontrado) {
          const { paciente } = resultadoBusqueda;
          console.log(`   ✅ Encontrado: ${paciente.nombre} ${paciente.apellido}`);
          
          const { resultadosTests } = await obtenerResultadosPaciente(paciente.id);
          const numResultados = resultadosTests.length;
          const puedeGenerarInforme = numResultados > 0;

          resultadosVerificacion.push({
            nombre: nombreCompleto,
            encontrado: true,
            paciente: paciente,
            resultados: numResultados,
            tests: resultadosTests,
            puedeGenerarInforme: puedeGenerarInforme
          });

          console.log(`   📊 Tests: ${numResultados}`);

          // Generar informe automáticamente si tiene datos
          if (puedeGenerarInforme) {
            const resultadoInforme = await generarInformeAutomatico(paciente.id, nombreCompleto);
            informesCreados.push(resultadoInforme);
          }
        } else {
          console.log(`   ❌ No encontrado`);
          resultadosVerificacion.push({
            nombre: nombreCompleto,
            encontrado: false,
            resultados: 0
          });
        }
      }

      setResultados(resultadosVerificacion);
      setInformesGenerados(informesCreados);
      
      // Limpiar selección anterior
      setPacientesSeleccionados(new Set());

      // Mostrar resumen de informes generados
      if (informesCreados.length > 0) {
        const exitosos = informesCreados.filter(i => i.estado === 'generado').length;
        const errores = informesCreados.filter(i => i.estado === 'error').length;
        alert(`📄 Proceso completado:\n✅ ${exitosos} informes generados\n❌ ${errores} errores\n\nLos informes aparecerán en la sección "Informes Generados"`);
      }

    } catch (error) {
      console.error('❌ Error general:', error);
      alert('❌ Error en verificación: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generarInformes = async () => {
    setGenerandoInformes(true);

    try {
      // Filtrar solo los pacientes seleccionados que pueden generar informe
      const pacientesConDatos = resultados.filter(r => 
        r.puedeGenerarInforme && pacientesSeleccionados.has(r.paciente?.id)
      );
      
      if (pacientesConDatos.length === 0) {
        alert('⚠️ No hay pacientes seleccionados para generar informes. Por favor selecciona al menos un paciente.');
        setGenerandoInformes(false);
        return;
      }
      
      console.log(`🎯 Generando informes para ${pacientesConDatos.length} pacientes seleccionados`);

      const informesGenerados = [];
      const errores = [];

      for (const resultado of pacientesConDatos) {
        console.log(`📄 Generando informe para: ${resultado.nombre}`);

        try {
          // Verificar si ya existe un informe
          const { existe, informe } = await verificarInformeExistente(resultado.paciente.id);
          if (existe) {
            console.log(`⚠️ ${resultado.nombre} ya tiene un informe (ID: ${informe.id})`);
            errores.push(`${resultado.nombre}: Ya tiene un informe generado`);
            continue;
          }

          // Verificar datos antes de generar
          const { data: verificacionDatos, error: errorVerificacion } = await supabase
            .from('resultados')
            .select('id, percentil')
            .eq('paciente_id', resultado.paciente.id)
            .not('percentil', 'is', null);

          if (errorVerificacion) {
            console.error(`❌ Error verificando datos para ${resultado.nombre}:`, errorVerificacion);
            errores.push(`${resultado.nombre}: Error verificando datos - ${errorVerificacion.message}`);
            continue;
          }

          if (!verificacionDatos || verificacionDatos.length === 0) {
            console.log(`⚠️ ${resultado.nombre} no tiene resultados con PC`);
            errores.push(`${resultado.nombre}: No tiene resultados con puntajes PC`);
            continue;
          }

          console.log(`📊 ${resultado.nombre}: ${verificacionDatos.length} resultados con PC`);

          // Generar informe
          try {
            const informeData = await InformesService.generarInformeCompleto(resultado.paciente.id);
            
            if (!informeData) {
              errores.push(`${resultado.nombre}: No se pudo generar el informe`);
            } else {
              console.log(`✅ Informe generado para ${resultado.nombre} con ID: ${informeData.id}`);
              exitosos++;
            }
          } catch (error) {
            console.error(`❌ Error generando informe para ${resultado.nombre}:`, error);
            errores.push(`${resultado.nombre}: ${error.message}`);
          }
            informesGenerados.push(`${resultado.nombre} (ID: ${data})`);
          }
        } catch (err) {
          console.error(`❌ Error en ${resultado.nombre}:`, err);
          errores.push(`${resultado.nombre}: ${err.message}`);
        }

        // Pequeña pausa entre generaciones para evitar sobrecarga
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Mostrar resumen detallado
      let mensaje = `📄 Proceso completado:\n`;
      mensaje += `✅ ${informesGenerados.length} informes generados exitosamente\n`;
      mensaje += `❌ ${errores.length} errores\n\n`;

      if (informesGenerados.length > 0) {
        mensaje += `Informes generados:\n${informesGenerados.map(n => `• ${n}`).join('\n')}\n\n`;
      }

      if (errores.length > 0) {
        mensaje += `Errores encontrados:\n${errores.map(e => `• ${e}`).join('\n')}`;
      }

      alert(mensaje);

      // Disparar evento personalizado para notificar a otros componentes
      if (informesGenerados.length > 0) {
        console.log(`📢 [VerificarPacientes] Disparando evento informesGenerados para ${informesGenerados.length} informes`);
        
        // Disparar evento inmediatamente
        window.dispatchEvent(new CustomEvent('informesGenerados', {
          detail: { 
            count: informesGenerados.length,
            timestamp: Date.now(),
            source: 'verificar_pacientes_masivo'
          }
        }));
        
        // Disparar evento adicional después de un pequeño delay para asegurar que se procese
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('informesGenerados', {
            detail: { 
              count: informesGenerados.length,
              timestamp: Date.now(),
              source: 'verificar_pacientes_masivo_delayed'
            }
          }));
        }, 1000);
        
        // Mensaje automático sin confirmación
        setTimeout(() => {
          alert(`✅ PROCESO COMPLETADO:\n\n📄 ${informesGenerados.length} informes generados exitosamente\n\n🔄 Los informes ya están disponibles en:\n• Módulo "Informes Generados"\n• Sección "Informes Faltantes Generados"\n\n💡 Si no los ves inmediatamente, usa el botón "Forzar Actualización" en esos módulos.`);
        }, 1500);
      }

    } catch (error) {
      console.error('❌ Error generando informes:', error);
      alert('❌ Error generando informes: ' + error.message);
    } finally {
      setGenerandoInformes(false);
    }
  };

  const buscarPacienteIndividual = async () => {
    if (!busquedaIndividual.trim()) {
      alert('Por favor ingresa un nombre para buscar');
      return;
    }

    setLoadingIndividual(true);

    try {
      const nombreCompleto = busquedaIndividual.trim();
      const [nombre, ...apellidoParts] = nombreCompleto.split(' ');
      const apellido = apellidoParts.join(' ');

      console.log(`🔍 Buscando paciente individual: ${nombreCompleto}`);

      // Construir query con filtro de género si está seleccionado
      let query = supabase
        .from('pacientes')
        .select('*')
        .or(`nombre.ilike.%${nombre}%,apellido.ilike.%${apellido}%`);

      if (filtroGenero !== 'todos') {
        query = query.eq('genero', filtroGenero);
      }

      const { data: pacientes, error: errorPacientes } = await query;

      if (errorPacientes) {
        alert(`❌ Error buscando paciente: ${errorPacientes.message}`);
        return;
      }

      if (pacientes && pacientes.length > 0) {
        const paciente = pacientes[0];
        console.log(`✅ Paciente encontrado: ${paciente.nombre} ${paciente.apellido}`);

        // Buscar resultados
        const { data: resultadosTests } = await supabase
          .from('resultados')
          .select(`
            *,
            aptitudes (codigo, nombre)
          `)
          .eq('paciente_id', paciente.id);

        const numResultados = resultadosTests ? resultadosTests.length : 0;

        if (numResultados > 0) {
          console.log(`📊 Tests encontrados: ${numResultados}`);

          // Generar informe
          try {
            const informeData = await InformesService.generarInformeCompleto(paciente.id);
            
            if (!informeData) {
              alert(`❌ Error: No se pudo generar el informe`);
            } else {
              alert(`✅ Informe generado exitosamente para ${paciente.nombre} ${paciente.apellido}`);
              setBusquedaIndividual('');
            
            // Disparar evento para notificar a otros componentes
            console.log(`📢 [VerificarPacientes] Disparando evento informesGenerados para búsqueda individual`);
            window.dispatchEvent(new CustomEvent('informesGenerados', {
              detail: { 
                count: 1,
                timestamp: Date.now(),
                source: 'verificar_pacientes_individual'
              }
            }));
            
            // Evento adicional con delay
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('informesGenerados', {
                detail: { 
                  count: 1,
                  timestamp: Date.now(),
                  source: 'verificar_pacientes_individual_delayed'
                }
              }));
            }, 1000);
          }
        } catch (error) {
          console.error('Error generando informe:', error);
          alert(`❌ Error generando informe: ${error.message}`);
        }
            }, 500);
          }
        } else {
          alert(`⚠️ ${paciente.nombre} ${paciente.apellido} no tiene tests completados`);
        }
      } else {
        const generoTexto = filtroGenero === 'todos' ? '' : ` (género: ${filtroGenero})`;
        alert(`❌ No se encontró ningún paciente con el nombre: ${nombreCompleto}${generoTexto}`);
      }

    } catch (error) {
      console.error('❌ Error en búsqueda individual:', error);
      alert('❌ Error en búsqueda: ' + error.message);
    } finally {
      setLoadingIndividual(false);
    }
  };

  // Función específica para verificar los 3 pacientes problemáticos
  const verificarPacientesEspecificos = async () => {
    const pacientesEspecificos = [
      'Maria Jose Gomez Portilla',
      'María Gabriela Jácome Castellanos',
      'Valeria Gómez Moreno'
    ];

    try {
      console.log('🔍 [VerificarPacientes] Verificando pacientes específicos...');
      
      let mensaje = '📊 VERIFICACIÓN DE PACIENTES ESPECÍFICOS:\n\n';
      
      for (const nombreBuscado of pacientesEspecificos) {
        const resultado = await buscarPaciente(nombreBuscado);
        
        if (resultado.encontrado) {
          const paciente = resultado.paciente;
          
          // Verificar resultados
          const { data: resultados } = await supabase
            .from('resultados')
            .select('id, percentil')
            .eq('paciente_id', paciente.id)
            .not('percentil', 'is', null);
            
          // Verificar informe existente
          const { existe, informe } = await verificarInformeExistente(paciente.id);
          
          mensaje += `✅ ${nombreBuscado}:\n`;
          mensaje += `   • Encontrado: ${paciente.nombre} ${paciente.apellido}\n`;
          mensaje += `   • Documento: ${paciente.documento}\n`;
          mensaje += `   • Tests con PC: ${resultados?.length || 0}\n`;
          mensaje += `   • Informe existente: ${existe ? 'SÍ' : 'NO'}\n`;
          if (existe) {
            mensaje += `   • ID Informe: ${informe.id}\n`;
          }
          mensaje += '\n';
        } else {
          mensaje += `❌ ${nombreBuscado}: NO ENCONTRADO\n\n`;
        }
      }
      
      alert(mensaje);
      
    } catch (error) {
      console.error('❌ Error verificando pacientes específicos:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  // Función para verificar qué pacientes existen en la base de datos
  const verificarPacientesEnBD = async () => {
    try {
      console.log('🔍 [VerificarPacientes] Verificando qué pacientes de la lista existen en la BD...');
      
      const { data: todosPacientes, error } = await supabase
        .from('pacientes')
        .select('id, nombre, apellido, documento')
        .order('nombre');
        
      if (error) throw error;
      
      console.log('📋 [VerificarPacientes] Pacientes en la base de datos:');
      todosPacientes.forEach(p => {
        console.log(`   • ${p.nombre} ${p.apellido} (Doc: ${p.documento})`);
      });
      
      // Verificar cuáles de la lista están en la BD
      const coincidencias = [];
      const noEncontrados = [];
      
      for (const nombreBuscado of pacientesNuevos) {
        const [nombre, ...apellidoParts] = nombreBuscado.split(' ');
        const apellido = apellidoParts.join(' ');
        
        const encontrado = todosPacientes.find(p => 
          p.nombre.toLowerCase().includes(nombre.toLowerCase()) &&
          p.apellido.toLowerCase().includes(apellido.toLowerCase())
        );
        
        if (encontrado) {
          coincidencias.push({
            buscado: nombreBuscado,
            encontrado: `${encontrado.nombre} ${encontrado.apellido}`,
            documento: encontrado.documento,
            id: encontrado.id
          });
        } else {
          noEncontrados.push(nombreBuscado);
        }
      }
      
      let mensaje = `📊 VERIFICACIÓN DE PACIENTES EN BASE DE DATOS:\n\n`;
      mensaje += `✅ ENCONTRADOS (${coincidencias.length}):\n`;
      coincidencias.forEach(c => {
        mensaje += `• ${c.buscado} → ${c.encontrado} (Doc: ${c.documento})\n`;
      });
      
      mensaje += `\n❌ NO ENCONTRADOS (${noEncontrados.length}):\n`;
      noEncontrados.forEach(n => {
        mensaje += `• ${n}\n`;
      });
      
      alert(mensaje);
      
    } catch (error) {
      console.error('❌ Error verificando pacientes:', error);
      alert('❌ Error verificando pacientes: ' + error.message);
    }
  };

  // Funciones para manejo de selección múltiple
  const handleSelectPaciente = (pacienteId) => {
    const newSelection = new Set(pacientesSeleccionados);
    if (newSelection.has(pacienteId)) {
      newSelection.delete(pacienteId);
    } else {
      newSelection.add(pacienteId);
    }
    setPacientesSeleccionados(newSelection);
  };

  const handleSelectAllPacientes = () => {
    const pacientesConDatos = resultados.filter(r => r.puedeGenerarInforme);
    const newSelection = new Set(pacientesSeleccionados);
    const allSelected = pacientesConDatos.every(r => newSelection.has(r.paciente?.id));

    if (allSelected) {
      // Deseleccionar todos los que pueden generar informe
      pacientesConDatos.forEach(r => newSelection.delete(r.paciente?.id));
    } else {
      // Seleccionar todos los que pueden generar informe
      pacientesConDatos.forEach(r => newSelection.add(r.paciente?.id));
    }
    setPacientesSeleccionados(newSelection);
  };

  const clearSelection = () => {
    setPacientesSeleccionados(new Set());
  };

  return (
    <Card className="mb-6 border-2 border-indigo-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white border-b-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4 shadow-md">
              <i className="fas fa-user-check text-2xl text-white"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold">
                🔍 Verificar Pacientes Nuevos
              </h2>
              <p className="text-indigo-100 text-sm">
                Verificar datos y generar informes automáticamente para pacientes solicitados
              </p>
            </div>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white hover:text-indigo-200 transition-all duration-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20"
            title={collapsed ? "Expandir módulo" : "Contraer módulo"}
          >
            <i className={`fas ${collapsed ? 'fa-chevron-down' : 'fa-chevron-up'} text-lg`}></i>
          </button>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardBody className="bg-gradient-to-br from-gray-50 to-white">
          <div className="space-y-6">
            {/* Búsqueda colectiva */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-users text-indigo-600 mr-2"></i>
                Verificación Masiva
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={verificarPacientes}
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Verificando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search mr-2"></i>
                      Verificar Lista de Pacientes
                    </>
                  )}
                </Button>

                {resultados.length > 0 && (
                  <>
                    <Button
                      onClick={generarInformes}
                      disabled={generandoInformes || pacientesSeleccionados.size === 0}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md disabled:opacity-50"
                    >
                      {generandoInformes ? (
                        <>
                          <i className="fas fa-cog fa-spin mr-2"></i>
                          Generando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-file-medical mr-2"></i>
                          Generar Informes Seleccionados ({pacientesSeleccionados.size})
                        </>
                      )}
                    </Button>
                    
                    {resultados.filter(r => r.puedeGenerarInforme).length > 0 && (
                      <>
                        <Button
                          onClick={handleSelectAllPacientes}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md"
                        >
                          <i className="fas fa-check-square mr-2"></i>
                          {resultados.filter(r => r.puedeGenerarInforme).every(r => pacientesSeleccionados.has(r.paciente?.id)) 
                            ? 'Deseleccionar Todos' 
                            : 'Seleccionar Todos'
                          }
                        </Button>
                        
                        {pacientesSeleccionados.size > 0 && (
                          <Button
                            onClick={clearSelection}
                            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-md"
                          >
                            <i className="fas fa-times mr-2"></i>
                            Limpiar Selección
                          </Button>
                        )}
                        
                        <Button
                          onClick={verificarPacientesEspecificos}
                          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-md"
                        >
                          <i className="fas fa-user-check mr-2"></i>
                          Verificar 3 Específicos
                        </Button>
                        
                        <Button
                          onClick={verificarPacientesEnBD}
                          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md"
                        >
                          <i className="fas fa-database mr-2"></i>
                          Verificar BD
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Búsqueda individual mejorada */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-user-search text-blue-600 mr-2"></i>
                Búsqueda Individual por Nombre
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={busquedaIndividual}
                    onChange={(e) => setBusquedaIndividual(e.target.value)}
                    placeholder="Ej: María González, Juan Pérez..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    onKeyDown={(e) => e.key === 'Enter' && buscarPacienteIndividual()}
                  />
                  <select
                    value={filtroGenero}
                    onChange={(e) => setFiltroGenero(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  >
                    <option value="todos">Todos los géneros</option>
                    <option value="femenino">👩 Femenino</option>
                    <option value="masculino">👨 Masculino</option>
                  </select>
                  <Button
                    onClick={buscarPacienteIndividual}
                    disabled={loadingIndividual}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md px-6"
                  >
                    {loadingIndividual ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Buscando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search-plus mr-2"></i>
                        Buscar y Generar
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 flex items-center">
                    <i className="fas fa-info-circle mr-2"></i>
                    Busca un paciente específico por nombre, filtra por género y genera su informe automáticamente
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {resultados.length > 0 && (
            <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center text-gray-800">
                  <i className="fas fa-clipboard-list text-green-600 mr-2"></i>
                  Resultados de Verificación
                </h3>
                {resultados.filter(r => r.puedeGenerarInforme).length > 0 && (
                  <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 flex items-center">
                      <i className="fas fa-info-circle mr-2"></i>
                      Selecciona los pacientes para los que deseas generar informes
                    </p>
                  </div>
                )}
              </div>
              {/* Header de la tabla */}
              <div className="bg-gray-100 p-4 rounded-lg mb-4 border border-gray-200">
                <div className="grid grid-cols-12 gap-4 items-center font-semibold text-gray-700 text-sm">
                  <div className="col-span-1 text-center">
                    <i className="fas fa-check-square mr-1"></i>
                    Sel.
                  </div>
                  <div className="col-span-4">
                    <i className="fas fa-user mr-2"></i>
                    Paciente
                  </div>
                  <div className="col-span-2 text-center">
                    <i className="fas fa-search mr-2"></i>
                    Estado
                  </div>
                  <div className="col-span-2 text-center">
                    <i className="fas fa-clipboard-check mr-2"></i>
                    Tests
                  </div>
                  <div className="col-span-3 text-center">
                    <i className="fas fa-file-medical mr-2"></i>
                    Informe
                  </div>
                </div>
              </div>

              {/* Filas de datos */}
              <div className="space-y-2">
                {resultados.map((resultado, index) => {
                  const paciente = resultado.paciente;
                  const isFemale = paciente?.genero === 'femenino';
                  
                  return (
                    <div 
                      key={index}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        resultado.encontrado 
                          ? resultado.puedeGenerarInforme 
                            ? isFemale
                              ? 'bg-gradient-to-r from-pink-50 to-pink-100 border-pink-300' 
                              : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300'
                            : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300'
                          : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Columna 1: Checkbox de selección (1 columna) */}
                        <div className="col-span-1 text-center">
                          {resultado.encontrado && resultado.puedeGenerarInforme ? (
                            <input
                              type="checkbox"
                              checked={pacientesSeleccionados.has(paciente?.id)}
                              onChange={() => handleSelectPaciente(paciente?.id)}
                              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          ) : (
                            <div className="w-5 h-5 bg-gray-200 rounded border border-gray-300 opacity-50"></div>
                          )}
                        </div>

                        {/* Columna 2: Información del Paciente (4 columnas) */}
                        <div className="col-span-4 flex items-center">
                          {resultado.encontrado && paciente ? (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-md ${
                              isFemale ? 'bg-pink-500' : 'bg-blue-500'
                            }`}>
                              <i className={`fas ${isFemale ? 'fa-venus' : 'fa-mars'} text-white`}></i>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-md bg-gray-400">
                              <i className="fas fa-user-slash text-white"></i>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className={`font-semibold text-sm ${
                              resultado.encontrado && paciente
                                ? isFemale ? 'text-pink-800' : 'text-blue-800'
                                : 'text-gray-800'
                            }`}>
                              {resultado.nombre}
                            </div>
                            {resultado.encontrado && paciente && (
                              <div className="text-xs text-gray-600 mt-1">
                                ID: {paciente.id} • {paciente.genero}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Columna 3: Estado (2 columnas) */}
                        <div className="col-span-2 text-center">
                          {resultado.encontrado ? (
                            <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              <i className="fas fa-check-circle mr-1"></i>
                              Encontrado
                            </div>
                          ) : (
                            <div className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                              <i className="fas fa-times-circle mr-1"></i>
                              No encontrado
                            </div>
                          )}
                        </div>

                        {/* Columna 4: Tests (2 columnas) */}
                        <div className="col-span-2 text-center">
                          {resultado.encontrado ? (
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-800">
                                {resultado.resultados}
                              </div>
                              <div className="text-xs text-gray-600">
                                test{resultado.resultados !== 1 ? 's' : ''}
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-400">
                              <i className="fas fa-minus text-lg"></i>
                            </div>
                          )}
                        </div>

                        {/* Columna 5: Estado del Informe (3 columnas) */}
                        <div className="col-span-3 text-center">
                          {resultado.encontrado ? (
                            resultado.puedeGenerarInforme ? (
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium">
                                <i className="fas fa-file-medical mr-2"></i>
                                Listo para informe
                              </div>
                            ) : (
                              <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full text-sm font-medium">
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                Sin tests
                              </div>
                            )
                          ) : (
                            <div className="inline-flex items-center bg-gray-100 text-gray-600 px-3 py-2 rounded-full text-sm font-medium">
                              <i className="fas fa-ban mr-2"></i>
                              No disponible
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 flex items-center mb-4">
                  <i className="fas fa-chart-pie mr-2"></i>
                  Resumen de Verificación
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                    <div className="text-3xl font-bold text-gray-800 mb-1">{resultados.length}</div>
                    <div className="text-sm text-gray-600 font-medium">Total verificados</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-gray-600 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">{resultados.filter(r => r.encontrado).length}</div>
                    <div className="text-sm text-gray-600 font-medium">Encontrados</div>
                    <div className="w-full bg-green-100 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                        style={{width: `${resultados.length > 0 ? (resultados.filter(r => r.encontrado).length / resultados.length) * 100 : 0}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{resultados.filter(r => r.puedeGenerarInforme).length}</div>
                    <div className="text-sm text-gray-600 font-medium">Listos para informe</div>
                    <div className="w-full bg-blue-100 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                        style={{width: `${resultados.length > 0 ? (resultados.filter(r => r.puedeGenerarInforme).length / resultados.length) * 100 : 0}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200 text-center">
                    <div className="text-3xl font-bold text-red-600 mb-1">{resultados.filter(r => !r.encontrado || !r.puedeGenerarInforme).length}</div>
                    <div className="text-sm text-gray-600 font-medium">Con problemas</div>
                    <div className="w-full bg-red-100 rounded-full h-2 mt-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                        style={{width: `${resultados.length > 0 ? (resultados.filter(r => !r.encontrado || !r.puedeGenerarInforme).length / resultados.length) * 100 : 0}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      )}
    </Card>
  );
};

export default VerificarPacientesNuevos;
