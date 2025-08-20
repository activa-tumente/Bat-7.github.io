import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../../api/supabaseClient'; // Asumiendo la ruta a supabaseClient
import { convertirPdAPC } from '../../utils/baremosUtils'; // Asumiendo la ruta a baremosUtils
import { calculateAge } from '../../utils/dateUtils'; // Asumiendo la ruta a dateUtils
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card'; // Asumiendo la ruta a Card
import PageLoader from '../../components/common/PageLoader'; // Corrected import path

// Contenido de criterios para informe.txt
const interpretacionesAptitudes = {
  V: { 
    descripcion: "V evalúa la destreza para formular y comprobar hipótesis acerca de conceptos e ideas expresados verbalmente. Implica cierto grado de conocimiento léxico y la comprensión semántica de nombres, verbos y adjetivos.",
    altas: [
      "Facilidad para establecer relaciones entre términos lingüísticos.",
      "Nivel alto de pensamiento lógico aplicado a argumentos verbales.",
      "Habilidad para resolver problemas expresados verbalmente, ya sea de forma escrita u oral.",
      "Agilidad con las conexiones semánticas entre conceptos verbales.",
      "Riqueza de vocabulario.",
      "Buena capacidad para comprender y expresar ideas verbalmente de un modo correcto y fluido.",
      "Buen manejo de la información sobre conceptos culturales."
    ],
    bajas: [
      "Dificultad para comprender las relaciones entre términos y la lógica de argumentos verbales.",
      "Limitaciones para expresarse por escrito u oralmente de un modo preciso y ágil.",
      "Poca amplitud de vocabulario.",
      "Posiblemente, nivel bajo de pensamiento lógico.",
      "Posibles limitaciones en la memoria operativa al considerar parcialmente los términos de las analogías."
    ]
  },
  E: { 
    descripcion: "E evalúa la capacidad para visualizar, recordar y transformar mentalmente imágenes visuales en dos y tres dimensiones.",
    altas: [
      "Facilidad para analizar, sintetizar y manipular mentalmente formas, figuras y objetos (rotarlos, plegarlos, invertirlos, desarrollarlos...).",
      "Habilidad para generar, retener, recordar y transformar imágenes visuales.",
      "Destreza para emparejar estímulos viso-espaciales de dos y tres dimensiones y para descomponer un modelo en sus partes constitutivas.",
      "Capacidad normal o superior para percibir la forma, los ángulos, el tamaño y la orientación de los objetos."
    ],
    bajas: [
      "Dificultad para analizar, sintetizar y manipular mentalmente formas, figuras y objetos (rotarlos, plegarlos, invertirlos, desarrollarlos...).",
      "Limitaciones para generar, retener, recordar y transformar imágenes visuales.",
      "Poca capacidad para emparejar estímulos viso-espaciales de dos y tres dimensiones y posibles limitaciones a la hora de descomponer un modelo en partes constitutivas.",
      "Posiblemente, dificultades para percibir la forma, los ángulos, el tamaño y la orientación de los objetos."
    ]
  },
  A: { 
    descripcion: "A evalúa la habilidad para identificar rápida y selectivamente los aspectos relevantes de un estímulo y para ignorar los irrelevantes. Puede interpretarse como una medida de la velocidad de procesamiento.",
    altas: [
      "Un nivel alto en la velocidad del procesamiento de las operaciones mentales simples.",
      "Buena capacidad para atender selectiva y secuencialmente a figuras similares.",
      "Aplicación de estrategias eficaces a la hora de realizar comparaciones visuales.",
      "Habilidad para percibir y discriminar con rapidez la configuración perceptiva de las figuras.",
      "Facilidad para motivarse y mantener la activación ante estímulos repetitivos y monótonos.",
      "Posiblemente, un nivel elevado de memoria de trabajo en relación con patrones visuales.",
      "Aptitud para trabajar deprisa bajo presión de tiempo."
    ],
    bajas: [
      "Baja velocidad del procesamiento de las operaciones mentales simples.",
      "Déficits para atender selectivamente y discriminar entre figuras similares.",
      "Aplicación de estrategias poco eficaces a las comparaciones visuales.",
      "Un nivel de motivación bajo o fatiga en tareas monótonas o repetitivas.",
      "Posiblemente, limitaciones en la memoria de trabajo aplicada a patrones visuales.",
      "Falta de atención y poca conciencia sobre el trabajo bajo presión de tiempo."
    ]
  },
  CON: { 
    descripcion: "CON evalúa la precisión del procesamiento de la información visual independiente de la velocidad. Puede interpretarse como una medida de la calidad del procesamiento.",
    altas: [
      "Buen nivel de concentración ante estímulos monótonos y repetitivos.",
      "Nivel alto de precisión a la hora de percibir y discriminar la configuración perceptiva de las figuras, al margen de la velocidad.",
      "Buena calidad del procesamiento de la información asociada a las operaciones mentales simples.",
      "Posiblemente, un nivel medio o alto de reflexividad."
    ],
    bajas: [
      "Falta de concentración ante estímulos monótonos y repetitivos.",
      "Poca precisión a la hora de percibir y discriminar la configuración perceptiva de las figuras, al margen de la velocidad.",
      "Limitaciones en la calidad del procesamiento de la información asociada a las operaciones mentales simples.",
      "Posiblemente, un nivel alto de impulsividad o poca motivación ante la tarea."
    ]
  },
  R: { 
    descripcion: "R evalúa la capacidad para resolver problemas novedosos aplicando leyes lógicas de tipo deductivo y estableciendo correlatos entre figuras abstractas.",
    altas: [
      "Un nivel alto de razonamiento no verbal de tipo deductivo.",
      "Habilidad para solucionar problemas abstractos y razonar con situaciones novedosas, complejas y poco familiares.",
      "Facilidad para establecer y trabajar con secuencias.",
      "Buena capacidad para identificar y deducir las leyes lógicas que rigen las variaciones seriales de tipo abstracto.",
      "Habilidad para usar la mediación verbal en la formulación y comprobación de hipótesis lógicas.",
      "Destreza para almacenar en la memoria visual a corto plazo el resultado de aplicar secuencias lógicas.",
      "Posiblemente, una buena capacidad para analizar patrones viso-espaciales en términos de percepción de la forma, el tamaño relativo y la posición."
    ],
    bajas: [
      "Un nivel bajo de razonamiento no verbal de tipo hipotético-deductivo.",
      "Limitaciones a la hora de solucionar problemas y enfrentarse a situaciones novedosas, complejas o poco familiares.",
      "Poca capacidad para identificar y deducir secuencias.",
      "Incapacidad para usar estrategias eficaces de mediación verbal en la resolución de problemas simbólicos y abstractos.",
      "Posible dependencia de las instrucciones verbales o falta de flexibilidad para elegir estrategias resolutivas.",
      "Posibles limitaciones en la memoria de trabajo o visual a corto plazo y en el análisis perceptivo de patrones viso-espaciales."
    ]
  },
  N: { 
    descripcion: "N evalúa la capacidad para razonar de modo inductivo o deductivo con conceptos matemáticos en términos de relaciones y propiedades.",
    altas: [
      "Un nivel alto de razonamiento cuantitativo de tipo deductivo e inductivo.",
      "Facilidad para identificar las reglas que gobiernan las relaciones numéricas o formales y la formulación y comprobación de hipótesis sobre esas reglas apoyándose en la mediación verbal.",
      "Buena capacidad analítica para separar un problema en sus partes componentes.",
      "Agilidad para recuperar la información de la memoria a largo plazo.",
      "Buen nivel de conocimiento de cifras, hechos numéricos y operaciones aritméticas."
    ],
    bajas: [
      "Un nivel bajo de razonamiento cuantitativo de tipo deductivo e inductivo.",
      "Dificultades para identificar las reglas que gobiernan las relaciones numéricas o formales y para apoyarse en la mediación verbal para la resolución de problemas.",
      "Limitaciones para separar un problema en sus partes constituyentes.",
      "Posiblemente, carencias en los conocimientos almacenados sobre cifras, hechos numéricos u operaciones aritméticas."
    ]
  },
  M: { 
    descripcion: "M evalúa el grado de comprensión de los principios mecánicos relacionados con el equilibrio y el movimiento de los cuerpos sometidos a cualquier fuerza.",
    altas: [
      "Nivel alto de comprensión de las leyes físico-mecánicas.",
      "Facilidad para representarse mentalmente la trayectoria de los objetos sometidos a una fuerza.",
      "Habilidad para formular y poner a prueba hipótesis sobre la resistencia de los materiales y el desplazamiento y equilibrio de los cuerpos.",
      "Buena comprensión de los problemas expresados de forma gráfica y verbal.",
      "Posiblemente, agilidad a la hora de recuperar la información de la memoria a largo plazo y de percibir y discriminar la configuración perceptiva de las situaciones."
    ],
    bajas: [
      "Poca comprensión de las leyes físico-mecánicas.",
      "Dificultades para representarse mentalmente la trayectoria de los objetos sometidos a una fuerza.",
      "Limitaciones para prever la resistencia de los materiales y el desplazamiento y equilibrio de los cuerpos.",
      "Posible nivel bajo de comprensión de los problemas expresados de forma gráfica y verbal.",
      "Posibles limitaciones para recuperar la información de la memoria a largo plazo y para percibir y discriminar la configuración perceptiva de las situaciones."
    ]
  },
  O: { 
    descripcion: "O evalúa la habilidad en la aplicación del conocimiento almacenado de las reglas ortográficas.",
    altas: [
      "Buen conocimiento y aplicación de las reglas de ortografía.",
      "Buena capacidad para segmentar fonológicamente las palabras en componentes.",
      "Habilidad para realizar una grafía correcta y, probablemente, para expresarse con claridad y precisión.",
      "Facilidad para recuperar la información almacenada en la memoria a largo plazo relacionada con la escritura.",
      "Buen nivel de vocabulario.",
      "Posiblemente, destreza para discriminar visualmente entre estímulos verbales escritos."
    ],
    bajas: [
      "Conocimiento limitado sobre la aplicación de las reglas ortográficas.",
      "Limitaciones para segmentar fonológicamente las palabras en componentes.",
      "Dificultades para recuperar la información almacenada en la memoria a largo plazo relacionada con la escritura.",
      "Dificultad para realizar una grafía correcta y, probablemente, para expresarse con claridad y precisión.",
      "Nivel bajo de vocabulario.",
      "Posibles problemas para discriminar visualmente entre estímulos verbales escritos."
    ]
  }
};

const InformePaciente = () => {
  const { pacienteId } = useParams(); // Asumimos que el ID del paciente vendrá de la URL
  const [paciente, setPaciente] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDatosPaciente = async () => {
      if (!pacienteId) {
        setError('No se proporcionó ID de paciente.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // 1. Obtener datos del paciente
        const { data: pacienteData, error: pacienteError } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id', pacienteId)
          .single();

        if (pacienteError) throw pacienteError;
        setPaciente(pacienteData);

        // 2. Obtener resultados del paciente
        const { data: resultadosData, error: resultadosError } = await supabase
          .from('resultados')
          .select(`
            *,
            aptitudes:aptitud_id (nombre, codigo)
          `)
          .eq('paciente_id', pacienteId);

        if (resultadosError) throw resultadosError;
        
        // Calcular PC para cada resultado si es necesario
        const resultadosConPC = resultadosData.map(r => {
          let pc = r.percentil; // Usar percentil si ya existe
          if (pc === null || pc === undefined || String(pc).toLowerCase() === 'pendiente') {
            if (pacienteData && pacienteData.fecha_nacimiento && r.puntaje_directo !== null && r.aptitudes && r.aptitudes.codigo) {
              const edad = calculateAge(pacienteData.fecha_nacimiento);
              const edadBaremo = `${Math.floor(edad)}-${Math.floor(edad)+1}`;
              // Ajustar para que coincida con las claves de baremos ('12-13', '13-14', etc.)
              // Esta lógica de edadBaremo puede necesitar ajuste según los baremos exactos
              pc = convertirPdAPC(r.puntaje_directo, r.aptitudes.codigo, edadBaremo);
            } else {
              pc = 'N/A por datos incompletos';
            }
          }
          return { ...r, pc_calculado: pc };
        });
        setResultados(resultadosConPC);

      } catch (err) {
        console.error("Error cargando datos del paciente o resultados:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDatosPaciente();
  }, [pacienteId]);

  const getInterpretacion = (codigoAptitud, pc) => {
    const interpretacion = interpretacionesAptitudes[codigoAptitud];
    if (!interpretacion) return { descripcion: '', puntos: ['No hay interpretación disponible.'] };

    // Definir umbrales para PC (ejemplo, ajustar según necesidad)
    if (pc >= 70) return { descripcion: interpretacion.descripcion, puntos: interpretacion.altas, nivel: 'Alto' };
    if (pc <= 30) return { descripcion: interpretacion.descripcion, puntos: interpretacion.bajas, nivel: 'Bajo' };
    // Se podría añadir un caso para 'Promedio'
    return { descripcion: interpretacion.descripcion, puntos: ['Puntuación dentro del promedio.'], nivel: 'Promedio' }; 
  };

  if (loading) return <PageLoader />;
  if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  if (!paciente) return <div className="text-center p-4">No se encontraron datos del paciente.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-700">Informe Psicopedagógico</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-gray-600">Datos del Paciente</h2>
        </CardHeader>
        <CardBody>
          <p><strong>Nombre:</strong> {paciente.nombre} {paciente.apellido}</p>
          <p><strong>Fecha de Nacimiento:</strong> {new Date(paciente.fecha_nacimiento).toLocaleDateString()}</p>
          <p><strong>Edad:</strong> {calculateAge(paciente.fecha_nacimiento)} años</p>
          {/* Añadir más datos relevantes del paciente si es necesario */}
        </CardBody>
      </Card>

      <h2 className="text-2xl font-semibold text-gray-600 mb-4">Resultados de las Aptitudes Evaluadas</h2>
      {resultados.length > 0 ? (
        resultados.map((resultado, index) => {
          const aptitudCodigo = resultado.aptitudes?.codigo;
          const interpretacionData = aptitudCodigo ? getInterpretacion(aptitudCodigo, resultado.pc_calculado) : { descripcion: '', puntos: ['Código de aptitud no encontrado.'], nivel: '' };
          return (
            <Card key={index} className="mb-6">
              <CardHeader>
                <h3 className="text-xl font-semibold text-blue-600">{resultado.aptitudes?.nombre || 'Aptitud Desconocida'} (PC: {resultado.pc_calculado !== null && resultado.pc_calculado !== undefined ? resultado.pc_calculado : 'N/A'}) - Nivel: {interpretacionData.nivel}</h3>
              </CardHeader>
              <CardBody>
                <p className="italic text-gray-600 mb-2">{interpretacionData.descripcion}</p>
                <h4 className="font-semibold mb-1">Puntos Clave:</h4>
                <ul className="list-disc list-inside ml-4 text-sm">
                  {interpretacionData.puntos.map((punto, i) => (
                    <li key={i}>{punto}</li>
                  ))}
                </ul>
              </CardBody>
              <CardFooter className="text-xs text-gray-500">
                Fecha de evaluación: {new Date(resultado.created_at).toLocaleDateString()}
              </CardFooter>
            </Card>
          );
        })
      ) : (
        <p>No hay resultados disponibles para este paciente.</p>
      )}
    </div>
  );
};

export default InformePaciente;