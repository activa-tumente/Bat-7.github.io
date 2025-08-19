// src/pages/test/Resultados.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '../../context/TestContext';
import Loading from '../../components/common/Loading';
import { FaUser, FaVenus, FaMars } from 'react-icons/fa'; // Importar iconos
import RefactoredInformesExample from '../../components/reports/RefactoredInformesExample';
// TestInformesFaltantes component removed - using real data only

// Quitamos temporalmente la importación de recharts
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
//   ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
//   PolarRadiusAxis, Radar
// } from 'recharts';

const ResultadosPage = () => {
  const navigate = useNavigate();
  // Eliminamos la referencia a Redux
  // const user = useSelector(state => state.auth.user);
  const user = null; // Inicialmente establecemos el usuario como null
  const {
    resultados,
    aplicacionId,
    testCompletado, // No parece usarse directamente en el renderizado de esta página
    cargarResultados,
    cargando // Este es el cargando del contexto
  } = useTest();

  // Mantener un estado de carga local para la obtención inicial de datos de esta página
  const [loadingPage, setLoadingPage] = useState(true);
  const [pacienteInfo, setPacienteInfo] = useState(null);
  // const [dataChart, setDataChart] = useState([]); // No se usa para la tabla, se puede quitar si no hay gráficos
  // const [radarData, setRadarData] = useState([]); // No se usa para la tabla, se puede quitar si no hay gráficos
  const [informe, setInforme] = useState({
    fortalezas: [],
    areas_mejora: [],
    recomendaciones: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingPage(true); // Iniciar carga de la página

        if (!resultados && aplicacionId) {
          await cargarResultados(aplicacionId); // Carga resultados del contexto si es necesario
        }

        if (aplicacionId) {
          // TODO: Reemplazar con la llamada real para obtener datos del paciente y la evaluación
          // const { data: aplicacionData, error: aplicacionError } = await supabase
          //   .from('evaluaciones') // o la tabla correspondiente que tenga la fecha y el id del candidato
          //   .select(`
          //     fecha_evaluacion, 
          //     candidatos ( id_candidato, nombre, apellido, sexo /*, otros campos necesarios */ )
          //   `)
          //   .eq('id_evaluacion', aplicacionId)
          //   .single();

          // if (aplicacionError) throw aplicacionError;

          // Datos de ejemplo para desarrollo (simulando la estructura esperada)
          const mockAplicacionData = {
            fecha_evaluacion: '2025-06-12T10:00:00Z', // Simular fecha de evaluación
            candidatos: {
              id_candidato: '367894512', // ID del paciente
              nombre: 'Camila',
              apellido: 'Vargas Vargas',
              sexo: 'Femenino', // Para el avatar
              // edad: 13, // La edad ya se calcula en el backend para los baremos
              // nivel_educativo: 'Secundaria'
            }
          };

          if (mockAplicacionData && mockAplicacionData.candidatos) {
            setPacienteInfo({
              nombreCompleto: `${mockAplicacionData.candidatos.nombre} ${mockAplicacionData.candidatos.apellido}`,
              id_paciente: mockAplicacionData.candidatos.id_candidato,
              sexo: mockAplicacionData.candidatos.sexo, // 'Masculino', 'Femenino', u 'Otro'
              fecha_evaluacion: new Date(mockAplicacionData.fecha_evaluacion).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'long', year: 'numeric'
              }),
              // Otros datos que ya tenías si son necesarios para el informe cualitativo
              // edad: mockAplicacionData.candidatos.edad,
              // nivel: mockAplicacionData.candidatos.nivel_educativo,
            });
          }
        }

        if (resultados) {
          // La preparación de chartData y radarData puede eliminarse si los gráficos no se usan
          // const chartData = [];
          // const radar = [];
          // Object.entries(resultados).forEach(([id, resultado]) => {
          //   chartData.push({
          //     name: resultado.codigo,
          //     PD: resultado.puntuacionDirecta,
          //     PC: resultado.puntuacionCentil,
          //     Interpretacion: resultado.interpretacion
          //   });
          //   radar.push({
          //     subject: resultado.codigo,
          //     A: resultado.puntuacionCentil,
          //     fullMark: 100
          //   });
          // });
          // setDataChart(chartData);
          // setRadarData(radar);
          generarInformeCualitativo(resultados);
        }
      } catch (error) {
        console.error('Error al cargar datos de la página de resultados:', error);
        // Aquí podrías usar un toast para notificar al usuario
      } finally {
        setLoadingPage(false); // Finalizar carga de la página
      }
    };

    fetchData();
  }, [aplicacionId, resultados, cargarResultados]);

  // Función para generar informe cualitativo
  const generarInformeCualitativo = (resultados) => {
    const fortalezas = [];
    const areas_mejora = [];
    const recomendaciones = [];

    // Procesar resultados para identificar fortalezas y áreas de mejora
    Object.entries(resultados).forEach(([id, resultado]) => {
      const { codigo, nombre, puntuacionCentil, interpretacion } = resultado;

      // Interpretar según los percentiles
      if (puntuacionCentil >= 70) {
        fortalezas.push({
          codigo,
          nombre,
          interpretacion: `${interpretacion} (PC: ${puntuacionCentil})`,
          descripcion: getDescripcionAptitud(codigo, true)
        });
      } else if (puntuacionCentil <= 30) {
        areas_mejora.push({
          codigo,
          nombre,
          interpretacion: `${interpretacion} (PC: ${puntuacionCentil})`,
          descripcion: getDescripcionAptitud(codigo, false)
        });
      }
    });

    // Generar recomendaciones basadas en áreas de mejora
    areas_mejora.forEach(area => {
      recomendaciones.push({
        codigo: area.codigo,
        recomendacion: getRecomendacion(area.codigo)
      });
    });

    setInforme({ fortalezas, areas_mejora, recomendaciones });
  };

  // Función para obtener descripción de aptitud
  const getDescripcionAptitud = (codigo, fortaleza) => {
    const descripciones = {
      V: {
        fortaleza: "Alta capacidad para comprender, utilizar y analizar el lenguaje escrito y hablado.",
        debilidad: "Dificultades para comprender conceptos expresados a través de palabras."
      },
      E: {
        fortaleza: "Excelente capacidad para visualizar y manipular mentalmente formas y patrones espaciales.",
        debilidad: "Dificultades para comprender relaciones espaciales y visualizar objetos en diferentes dimensiones."
      },
      A: {
        fortaleza: "Gran capacidad para mantener el foco en tareas específicas, detectando detalles con precisión.",
        debilidad: "Dificultad para mantener la concentración y detectar detalles específicos en tareas que requieren atención sostenida."
      },
      R: {
        fortaleza: "Destacada habilidad para identificar patrones lógicos y resolver problemas mediante el razonamiento.",
        debilidad: "Dificultades para identificar reglas lógicas y establecer inferencias en situaciones nuevas."
      },
      N: {
        fortaleza: "Excelente capacidad para comprender y manipular conceptos numéricos y resolver problemas matemáticos.",
        debilidad: "Dificultades en el manejo de conceptos numéricos y operaciones matemáticas básicas."
      },
      M: {
        fortaleza: "Buena comprensión de principios físicos y mecánicos básicos aplicados a situaciones cotidianas.",
        debilidad: "Dificultades para comprender el funcionamiento de dispositivos mecánicos y principios físicos básicos."
      },
      O: {
        fortaleza: "Excelente dominio de las reglas ortográficas y alta precisión en la escritura.",
        debilidad: "Dificultades con las reglas ortográficas y tendencia a cometer errores en la escritura."
      }
    };

    return descripciones[codigo] ?
      (fortaleza ? descripciones[codigo].fortaleza : descripciones[codigo].debilidad) :
      "No hay descripción disponible.";
  };

  // Función para obtener recomendaciones según el código
  const getRecomendacion = (codigo) => {
    const recomendaciones = {
      V: "Fomentar la lectura diaria y realizar actividades que enriquezcan el vocabulario como juegos de palabras, debates y redacción.",
      E: "Practicar con rompecabezas, ejercicios de rotación mental, dibujo técnico y actividades que involucren navegación espacial.",
      A: "Realizar ejercicios de mindfulness, practicar tareas que requieran concentración por períodos cortos e ir aumentando gradualmente el tiempo.",
      R: "Resolver acertijos lógicos, participar en juegos de estrategia y analizar problemas complejos dividiéndolos en partes más sencillas.",
      N: "Practicar operaciones matemáticas diariamente, resolver problemas aplicados a la vida real y utilizar juegos que involucren cálculos.",
      M: "Construir modelos, experimentar con el funcionamiento de objetos cotidianos y estudiar los principios básicos de la física.",
      O: "Realizar ejercicios de dictado, revisión de textos y practicar la escritura consciente prestando atención a las reglas ortográficas."
    };

    return recomendaciones[codigo] || "No hay recomendaciones específicas disponibles.";
  };

  // Si está cargando (combinar ambos estados de carga)
  if (loadingPage || cargando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading fullScreen={true} message="Cargando resultados..." />
      </div>
    );
  }

  // Si no hay resultados, mostrar mensaje
  if (!resultados || Object.keys(resultados).length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-gray-800">No hay resultados disponibles</h2>
            <p className="mt-2 text-gray-600">
              No se han encontrado resultados para mostrar. Es posible que aún no hayas completado el test o que haya ocurrido un error.
            </p>
            <div className="mt-6">
              <button
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => navigate('/test')}
              >
                Volver a Tests
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar página de resultados
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Resultados Detallados</h1>

        {/* Encabezado del Paciente */} 
        {pacienteInfo && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8 flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-4">
                {pacienteInfo.sexo === 'Femenino' ? 
                  <FaVenus className="text-pink-500 text-5xl" /> :
                  pacienteInfo.sexo === 'Masculino' ? 
                  <FaMars className="text-blue-500 text-5xl" /> :
                  <FaUser className="text-gray-500 text-5xl" />
                }
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{pacienteInfo.nombreCompleto}</h2>
                <p className="text-sm text-gray-600">ID: {pacienteInfo.id_paciente}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-700">Fecha de Evaluación:</p>
              <p className="text-md font-semibold text-gray-800">{pacienteInfo.fecha_evaluacion}</p>
            </div>
          </div>
        )}

        {/* Eliminar la cabecera anterior y los gráficos si no se usan */} 
        {/* <div className="bg-white rounded-lg shadow-md mb-6 p-6"> ... </div> */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"> ... </div> */}

        {/* Tabla de Resultados Optimizada */} 
        {resultados && Object.keys(resultados).length > 0 ? (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puntaje PD
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puntuación T
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Errores
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiempo
                    </th>
                    {/* La columna Interpretación se puede mantener si es útil, o quitar si Puntaje T es suficiente */}
                    {/* <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interpretación
                    </th> */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(resultados).map(([id, resultado]) => (
                    <tr key={id}>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-900">{resultado.nombre || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{resultado.puntuacionDirecta !== undefined ? resultado.puntuacionDirecta : 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {/* Asumiendo que puntuacionCentil es el Puntaje T o Percentil deseado */}
                        <div className="text-sm text-gray-900">{resultado.puntuacionCentil !== undefined ? resultado.puntuacionCentil : 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {/* TODO: Añadir datos reales para Errores cuando estén disponibles en 'resultado' */}
                        <div className="text-sm text-gray-900">{resultado.errores !== undefined ? resultado.errores : 'N/A'}</div> 
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {/* TODO: Añadir datos reales para Tiempo cuando estén disponibles en 'resultado' */}
                        <div className="text-sm text-gray-900">{resultado.tiempo || 'N/A'}</div> 
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${resultado.puntuacionCentil >= 70 ? 'bg-green-100 text-green-800' :
                          resultado.puntuacionCentil <= 30 ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`}
                        >
                          {resultado.interpretacion || 'N/A'}
                        </span>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 text-xs text-gray-500 bg-gray-50 border-t">
              <p><span className="font-medium">Puntaje PD:</span> Puntuación Directa - Número de respuestas correctas.</p>
              <p><span className="font-medium">Puntuación T:</span> Puntuación Transformada (ej. Percentil) - Posición relativa respecto a la población de referencia.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8 text-center">
            <p className="text-gray-600">No hay resultados de pruebas para mostrar para este paciente.</p>
          </div>
        )}

        {/* Informe Cualitativo (se mantiene como estaba o se ajusta según necesidad) */} 
        {(informe.fortalezas.length > 0 || informe.areas_mejora.length > 0 || informe.recomendaciones.length > 0) && (
           <div className="bg-white shadow-lg rounded-lg mb-8">
            <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b text-gray-800">Informe Cualitativo</h2>
            <div className="p-6">
              {/* Fortalezas */} 
              {informe.fortalezas.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-green-700 mb-2">Fortalezas</h3>
                  <div className="space-y-3">
                    {informe.fortalezas.map((fortaleza, index) => (
                      <div key={index} className="bg-green-50 p-3 rounded-md">
                        <div className="font-semibold text-green-800">
                          {fortaleza.nombre}: {fortaleza.interpretacion}
                        </div>
                        <p className="text-sm text-green-700 mt-1">{fortaleza.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Áreas de Mejora */} 
              {informe.areas_mejora.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-red-700 mb-2">Áreas de Mejora</h3>
                  <div className="space-y-3">
                    {informe.areas_mejora.map((area, index) => (
                      <div key={index} className="bg-red-50 p-3 rounded-md">
                        <div className="font-semibold text-red-800">
                          {area.nombre}: {area.interpretacion}
                        </div>
                        <p className="text-sm text-red-700 mt-1">{area.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Recomendaciones */} 
              {informe.recomendaciones.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-blue-700 mb-2">Recomendaciones</h3>
                  <div className="space-y-3">
                    {informe.recomendaciones.map((rec, index) => (
                      <div key={index} className="bg-blue-50 p-3 rounded-md">
                        <div className="font-semibold text-blue-800">{rec.codigo} - {resultados[Object.keys(resultados).find(key => resultados[key].codigo === rec.codigo)]?.nombre}</div>
                        <p className="text-sm text-blue-700 mt-1">{rec.recomendacion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Componente de prueba */}
        <div className="bg-white shadow-lg rounded-lg mb-8">
          <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b text-gray-800">Test de Conexión</h2>
          <div className="p-6">
            {/* TestInformesFaltantes component removed - using real data only */}
          </div>
        </div>

        {/* Sección de Informes Faltantes Generados */}
        <div className="bg-white shadow-lg rounded-lg mb-8">
          <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b text-gray-800">Informes Generados</h2>
          <div className="p-6">
            <RefactoredInformesExample />
          </div>
        </div>

        {/* Acciones (se mantienen como estaban) */} 
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-8">
          <button
            className="px-6 py-3 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-150"
            onClick={() => navigate('/test')} // O a la página de dashboard/lista de pacientes
          >
            Volver
          </button>
          <div className="flex space-x-3">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150"
              onClick={() => window.print()}
            >
              Imprimir Resultados
            </button>
            <button
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150"
              onClick={() => alert('Función de exportar a PDF en desarrollo.')}
            >
              Exportar a PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultadosPage;