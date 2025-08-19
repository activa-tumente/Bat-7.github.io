/**
 * Componente de diagnóstico para problemas de generación de informes
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import supabase from '../../api/supabaseClient';
import InformesService from '../../services/InformesService';

const DiagnosticoInformes = () => {
  const [loading, setLoading] = useState(false);
  const [diagnostico, setDiagnostico] = useState(null);
  const [solucionando, setSolucionando] = useState(false);

  const ejecutarDiagnostico = async () => {
    setLoading(true);
    setDiagnostico(null);

    try {
      console.log('🔍 INICIANDO DIAGNÓSTICO DE INFORMES...');
      const resultado = {
        funcionRPCExiste: false,
        pacientesConDatos: [],
        tablaInformesExiste: false,
        errores: [],
        recomendaciones: []
      };

      // 1. Verificar si el servicio de informes funciona
      console.log('1️⃣ Verificando servicio de informes...');
      try {
        // Intentar generar un informe de prueba con ID inexistente
        const informeResult = await InformesService.generarInformeCompleto('00000000-0000-0000-0000-000000000000');
        
        if (informeResult.success) {
          resultado.funcionRPCExiste = true;
          console.log('✅ Servicio de informes funciona correctamente');
        } else {
          if (informeResult.error && informeResult.error.includes('Paciente no encontrado')) {
            resultado.funcionRPCExiste = true;
            console.log('✅ Servicio de informes existe y funciona');
          } else {
            resultado.funcionRPCExiste = false;
            resultado.errores.push(`❌ Error en servicio de informes: ${informeResult.error}`);
          }
        }
      } catch (err) {
        resultado.funcionRPCExiste = false;
        resultado.errores.push(`❌ Error verificando función RPC: ${err.message}`);
      }

      // 2. Verificar tabla informes_generados
      console.log('2️⃣ Verificando tabla informes_generados...');
      try {
        const { data: tablaTest, error: errorTabla } = await supabase
          .from('informes_generados')
          .select('id')
          .limit(1);

        if (errorTabla) {
          resultado.tablaInformesExiste = false;
          resultado.errores.push(`❌ Error accediendo tabla informes_generados: ${errorTabla.message}`);
          resultado.recomendaciones.push('🔧 Ejecutar migración: 004_informes_generados.sql');
        } else {
          resultado.tablaInformesExiste = true;
          console.log('✅ Tabla informes_generados existe');
        }
      } catch (err) {
        resultado.tablaInformesExiste = false;
        resultado.errores.push(`❌ Error verificando tabla: ${err.message}`);
      }

      // 3. Verificar pacientes con datos
      console.log('3️⃣ Verificando pacientes con datos...');
      try {
        const { data: pacientesConResultados, error: errorPacientes } = await supabase
          .from('pacientes')
          .select(`
            id,
            nombre,
            apellido,
            resultados:resultados!inner(
              id,
              puntaje_directo,
              percentil,
              aptitudes:aptitud_id(codigo, nombre)
            )
          `)
          .not('resultados.percentil', 'is', null)
          .limit(10);

        if (errorPacientes) {
          resultado.errores.push(`❌ Error obteniendo pacientes: ${errorPacientes.message}`);
        } else {
          resultado.pacientesConDatos = pacientesConResultados || [];
          console.log(`✅ Encontrados ${resultado.pacientesConDatos.length} pacientes con datos`);
        }
      } catch (err) {
        resultado.errores.push(`❌ Error verificando pacientes: ${err.message}`);
      }

      // 4. Generar recomendaciones
      if (resultado.funcionRPCExiste && resultado.tablaInformesExiste && resultado.pacientesConDatos.length > 0) {
        resultado.recomendaciones.push('✅ Sistema listo para generar informes');
        resultado.recomendaciones.push('🎯 Puedes proceder con la generación de informes');
      } else {
        if (!resultado.funcionRPCExiste) {
          resultado.recomendaciones.push('🚨 CRÍTICO: Ejecutar migración de función RPC');
        }
        if (!resultado.tablaInformesExiste) {
          resultado.recomendaciones.push('🚨 CRÍTICO: Ejecutar migración de tabla informes');
        }
        if (resultado.pacientesConDatos.length === 0) {
          resultado.recomendaciones.push('⚠️ No hay pacientes con datos PC disponibles');
        }
      }

      setDiagnostico(resultado);
      console.log('🎯 DIAGNÓSTICO COMPLETADO:', resultado);

    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
      setDiagnostico({
        funcionRPCExiste: false,
        pacientesConDatos: [],
        tablaInformesExiste: false,
        errores: [`Error general: ${error.message}`],
        recomendaciones: ['🔧 Revisar configuración de Supabase']
      });
    } finally {
      setLoading(false);
    }
  };

  const probarGeneracionInforme = async () => {
    if (!diagnostico?.pacientesConDatos?.length) {
      alert('❌ No hay pacientes disponibles para probar');
      return;
    }

    setSolucionando(true);

    try {
      const pacientePrueba = diagnostico.pacientesConDatos[0];
      console.log(`🧪 Probando generación para: ${pacientePrueba.nombre} ${pacientePrueba.apellido}`);

      const informeResult = await InformesService.generarInformeCompleto(pacientePrueba.id);

      if (!informeResult.success) {
        alert(`❌ Error en prueba: ${informeResult.error}`);
        console.error('Error en prueba:', informeResult.error);
      } else {
        alert(`✅ ¡Prueba exitosa! Informe generado con ID: ${informeResult.data.id}`);
        console.log('✅ Prueba exitosa, ID:', informeResult.data.id);
        
        // Reejecutar diagnóstico para actualizar estado
        setTimeout(() => ejecutarDiagnostico(), 1000);
      }
    } catch (err) {
      alert(`❌ Error en prueba: ${err.message}`);
      console.error('Error en prueba:', err);
    } finally {
      setSolucionando(false);
    }
  };

  const mostrarMigracionSQL = () => {
    const sqlMigracion = `-- EJECUTAR EN SUPABASE DASHBOARD > SQL EDITOR

-- Función principal para generar informes
CREATE OR REPLACE FUNCTION generar_informe_directo(
    p_paciente_id UUID,
    p_titulo VARCHAR(255) DEFAULT NULL
)
RETURNS UUID AS $
DECLARE
    informe_id UUID;
    paciente_data JSONB;
    resultados_data JSONB;
    contenido_informe JSONB;
    titulo_generado VARCHAR(255);
    total_resultados INTEGER;
BEGIN
    -- Verificar que el paciente existe
    SELECT jsonb_build_object(
        'id', p.id,
        'nombre', p.nombre,
        'apellido', p.apellido,
        'documento', p.documento,
        'fecha_nacimiento', p.fecha_nacimiento,
        'sexo', p.sexo,
        'nivel_educativo', p.nivel_educativo,
        'institucion', p.institucion
    ) INTO paciente_data
    FROM pacientes p
    WHERE p.id = p_paciente_id;
    
    IF paciente_data IS NULL THEN
        RAISE EXCEPTION 'Paciente no encontrado con ID: %', p_paciente_id;
    END IF;
    
    -- Obtener resultados con PC
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', r.id,
            'puntaje_directo', r.puntaje_directo,
            'percentil', r.percentil,
            'errores', r.errores,
            'tiempo_segundos', r.tiempo_segundos,
            'concentracion', r.concentracion,
            'fecha_evaluacion', r.created_at,
            'aptitud', jsonb_build_object(
                'codigo', a.codigo,
                'nombre', a.nombre,
                'descripcion', a.descripcion
            )
        )
    ), COUNT(*)
    INTO resultados_data, total_resultados
    FROM resultados r
    JOIN aptitudes a ON r.aptitud_id = a.id
    WHERE r.paciente_id = p_paciente_id
    AND r.percentil IS NOT NULL
    ORDER BY r.created_at DESC;
    
    IF total_resultados = 0 THEN
        RAISE EXCEPTION 'No se encontraron resultados con puntajes PC para el paciente';
    END IF;
    
    -- Generar título
    titulo_generado := COALESCE(
        p_titulo, 
        'Informe BAT-7 - ' || (paciente_data->>'nombre') || ' ' || (paciente_data->>'apellido')
    );
    
    -- Construir contenido
    contenido_informe := jsonb_build_object(
        'tipo', 'completo',
        'paciente', paciente_data,
        'resultados', COALESCE(resultados_data, '[]'::jsonb),
        'fecha_generacion', NOW()
    );
    
    -- Insertar informe
    INSERT INTO informes_generados (
        paciente_id,
        tipo_informe,
        titulo,
        descripcion,
        contenido,
        metadatos
    ) VALUES (
        p_paciente_id,
        'completo',
        titulo_generado,
        'Informe generado automáticamente',
        contenido_informe,
        jsonb_build_object('total_resultados', total_resultados)
    ) RETURNING id INTO informe_id;
    
    RETURN informe_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permisos
GRANT EXECUTE ON FUNCTION generar_informe_directo(UUID, VARCHAR) TO authenticated;`;

    // Crear ventana modal con el SQL
    const ventana = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    ventana.document.write(`
      <html>
        <head>
          <title>Migración SQL - generar_informe_directo</title>
          <style>
            body { font-family: monospace; padding: 20px; background: #f5f5f5; }
            pre { background: white; padding: 20px; border-radius: 8px; overflow: auto; }
            h2 { color: #333; }
            .instrucciones { background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h2>🔧 Migración SQL para Función generar_informe_directo</h2>
          <div class="instrucciones">
            <strong>INSTRUCCIONES:</strong><br>
            1. Ve a Supabase Dashboard<br>
            2. Abre SQL Editor<br>
            3. Copia y pega el siguiente código<br>
            4. Ejecuta la consulta<br>
            5. Vuelve a la aplicación y ejecuta el diagnóstico
          </div>
          <pre>${sqlMigracion}</pre>
        </body>
      </html>
    `);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-600 text-white border-b-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4 shadow-md">
              <i className="fas fa-stethoscope text-2xl text-white"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold">
                🔧 Diagnóstico de Informes
              </h2>
              <p className="text-red-100 text-sm">
                Diagnostica y soluciona problemas de generación de informes
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardBody>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={ejecutarDiagnostico}
              disabled={loading}
              className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:from-blue-500 hover:to-indigo-600 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Diagnosticando...
                </>
              ) : (
                <>
                  <i className="fas fa-search mr-2"></i>
                  Ejecutar Diagnóstico
                </>
              )}
            </Button>

            {diagnostico && diagnostico.funcionRPCExiste && (
              <Button
                onClick={probarGeneracionInforme}
                disabled={solucionando}
                className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-600 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {solucionando ? (
                  <>
                    <i className="fas fa-cog fa-spin mr-2"></i>
                    Probando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-flask mr-2"></i>
                    Probar Generación
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={mostrarMigracionSQL}
              className="bg-gradient-to-r from-purple-400 to-violet-500 text-white hover:from-purple-500 hover:to-violet-600 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <i className="fas fa-code mr-2"></i>
              Ver Migración SQL
            </Button>
          </div>

          {diagnostico && (
            <div className="mt-6 space-y-4">
              {/* Estado de la función RPC */}
              <div className={`p-5 rounded-xl border-2 shadow-sm transition-all duration-200 ${
                diagnostico.funcionRPCExiste 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 hover:shadow-md' 
                  : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 hover:shadow-md'
              }`}>
                <div className="flex items-center mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    diagnostico.funcionRPCExiste ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    <i className={`fas ${
                      diagnostico.funcionRPCExiste ? 'fa-check' : 'fa-times'
                    } text-white`}></i>
                  </div>
                  <h4 className={`font-bold text-lg ${
                    diagnostico.funcionRPCExiste ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Función RPC generar_informe_directo
                  </h4>
                </div>
                <p className={`text-sm font-medium ${
                  diagnostico.funcionRPCExiste ? 'text-green-700' : 'text-red-700'
                }`}>
                  {diagnostico.funcionRPCExiste 
                    ? 'La función existe y está disponible' 
                    : 'La función NO EXISTE - Necesita migración'}
                </p>
              </div>

              {/* Estado de la tabla */}
              <div className={`p-5 rounded-xl border-2 shadow-sm transition-all duration-200 ${
                diagnostico.tablaInformesExiste 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 hover:shadow-md' 
                  : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 hover:shadow-md'
              }`}>
                <div className="flex items-center mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    diagnostico.tablaInformesExiste ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    <i className={`fas ${
                      diagnostico.tablaInformesExiste ? 'fa-check' : 'fa-times'
                    } text-white`}></i>
                  </div>
                  <h4 className={`font-bold text-lg ${
                    diagnostico.tablaInformesExiste ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Tabla informes_generados
                  </h4>
                </div>
                <p className={`text-sm font-medium ${
                  diagnostico.tablaInformesExiste ? 'text-green-700' : 'text-red-700'
                }`}>
                  {diagnostico.tablaInformesExiste 
                    ? 'La tabla existe y es accesible' 
                    : 'Error accediendo a la tabla'}
                </p>
              </div>

              {/* Pacientes con datos */}
              <div className={`p-5 rounded-xl border-2 shadow-sm transition-all duration-200 ${
                diagnostico.pacientesConDatos.length > 0 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 hover:shadow-md' 
                  : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 hover:shadow-md'
              }`}>
                <div className="flex items-center mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    diagnostico.pacientesConDatos.length > 0 ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}>
                    <i className={`fas ${
                      diagnostico.pacientesConDatos.length > 0 ? 'fa-users' : 'fa-exclamation-triangle'
                    } text-white`}></i>
                  </div>
                  <h4 className={`font-bold text-lg ${
                    diagnostico.pacientesConDatos.length > 0 ? 'text-blue-800' : 'text-yellow-800'
                  }`}>
                    Pacientes con Datos ({diagnostico.pacientesConDatos.length})
                  </h4>
                </div>
                {diagnostico.pacientesConDatos.length > 0 ? (
                  <div className="space-y-2">
                    {diagnostico.pacientesConDatos.slice(0, 5).map((paciente, index) => {
                      const isFemale = paciente.genero === 'femenino' || paciente.sexo === 'femenino';
                      return (
                        <div key={index} className={`flex items-center p-2 rounded-lg ${
                          isFemale 
                            ? 'bg-pink-50 border border-pink-200' 
                            : 'bg-blue-50 border border-blue-200'
                        }`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                            isFemale ? 'bg-pink-500' : 'bg-blue-500'
                          }`}>
                            <i className={`fas ${isFemale ? 'fa-venus' : 'fa-mars'} text-white text-xs`}></i>
                          </div>
                          <div className="flex-1">
                            <span className={`font-semibold text-sm ${
                              isFemale ? 'text-pink-800' : 'text-blue-800'
                            }`}>
                              {paciente.nombre} {paciente.apellido}
                            </span>
                            <span className={`ml-2 text-xs ${
                              isFemale ? 'text-pink-600' : 'text-blue-600'
                            }`}>
                              ({paciente.resultados.length} tests)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {diagnostico.pacientesConDatos.length > 5 && (
                      <p className="text-sm text-gray-600 text-center mt-2">
                        ... y {diagnostico.pacientesConDatos.length - 5} pacientes más
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm">No se encontraron pacientes con resultados PC</p>
                )}
              </div>

              {/* Errores */}
              {diagnostico.errores.length > 0 && (
                <div className="p-5 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-xl shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-red-500">
                      <i className="fas fa-exclamation-triangle text-white"></i>
                    </div>
                    <h4 className="font-bold text-lg text-red-800">Errores Encontrados</h4>
                  </div>
                  <ul className="space-y-2">
                    {diagnostico.errores.map((error, index) => (
                      <li key={index} className="text-sm text-red-700 bg-white bg-opacity-50 p-2 rounded-lg">
                        <i className="fas fa-times-circle mr-2"></i>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recomendaciones */}
              {diagnostico.recomendaciones.length > 0 && (
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-blue-500">
                      <i className="fas fa-lightbulb text-white"></i>
                    </div>
                    <h4 className="font-bold text-lg text-blue-800">Recomendaciones</h4>
                  </div>
                  <ul className="space-y-2">
                    {diagnostico.recomendaciones.map((recomendacion, index) => (
                      <li key={index} className="text-sm text-blue-700 bg-white bg-opacity-50 p-2 rounded-lg">
                        <i className="fas fa-check-circle mr-2"></i>
                        {recomendacion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default DiagnosticoInformes;