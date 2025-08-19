import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { PieChart } from '../../components/charts/PieChart';

const Results = () => {
  const location = useLocation();
  const results = location.state || {
    correctCount: 0,
    incorrectCount: 0,
    unansweredCount: 0,
    timeUsed: 0,
    totalQuestions: 32,
    testType: 'unknown'
  };

  const {
    correctCount,
    incorrectCount,
    unansweredCount,
    timeUsed,
    totalQuestions,
    testType
  } = results;

  // Función para formatear el tiempo (convierte segundos a formato mm:ss)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Datos para el gráfico de resultados
  const chartData = [
    { name: 'Correctas', value: correctCount, color: '#10B981' }, // verde
    { name: 'Incorrectas', value: incorrectCount, color: '#EF4444' }, // rojo
    { name: 'Sin responder', value: unansweredCount, color: '#9CA3AF' } // gris
  ].filter(item => item.value > 0); // Filtrar para incluir solo los valores mayores que 0

  // Si todos los datos fueron filtrados (por ejemplo, si correctCount es 0), mostrar al menos las respuestas correctas
  if (chartData.length === 0) {
    chartData.push({ name: 'Correctas', value: correctCount, color: '#10B981' });
  }

  // Determinar el título del test basado en el tipo
  const getTestTitle = (type) => {
    switch (type) {
      case 'verbal':
        return 'Test de Aptitud Verbal';
      case 'ortografia':
        return 'Test de Ortografía';
      case 'razonamiento':
        return 'Test de Razonamiento';
      case 'atencion':
        return 'Test de Atención';
      case 'espacial':
        return 'Test de Visualización Espacial';
      case 'mecanico':
        return 'Test de Razonamiento Mecánico';
      case 'numerico':
        return 'Test de Razonamiento Numérico';
      default:
        return 'Resultados del Test';
    }
  };

  // Calcular porcentaje de aciertos
  const successPercentage = Math.round((correctCount / totalQuestions) * 100);

  // Determinar el mensaje basado en el porcentaje de aciertos
  const getPerformanceMessage = (percentage) => {
    if (percentage === 100) return 'Excelente desempeño';
    if (percentage >= 90) return 'Excelente desempeño';
    if (percentage >= 75) return 'Muy buen desempeño';
    if (percentage >= 60) return 'Buen desempeño';
    if (percentage >= 50) return 'Desempeño aceptable';
    return 'Necesita mejorar';
  };

  // Obtener el color basado en el porcentaje
  const getPerformanceColor = (percentage) => {
    if (percentage === 100) return 'text-green-600 animate-pulse';
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-green-500';
    if (percentage >= 60) return 'text-blue-500';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Generar recomendaciones basadas en el tipo de test y el desempeño
  const generateRecommendations = (type, percentage) => {
    let recommendations = [];

    if (type === 'ortografia') {
      if (percentage < 60) {
        recommendations = [
          'Repasa las reglas básicas de ortografía, especialmente las reglas de acentuación',
          'Practica la identificación de palabras correctas e incorrectas con ejercicios diarios',
          'Presta especial atención a las letras que suelen causar confusión (b/v, g/j, h)'
        ];
      } else if (percentage < 80) {
        recommendations = [
          'Refuerza tu conocimiento en acentuación, especialmente en palabras agudas, llanas y esdrújulas',
          'Practica con palabras que contengan h, b/v, g/j para mejorar tu precisión',
          'Dedica tiempo a la lectura para familiarizarte con la escritura correcta de las palabras'
        ];
      } else {
        recommendations = [
          'Continúa practicando con palabras poco comunes para expandir tu dominio ortográfico',
          'Profundiza en las excepciones a las reglas de acentuación',
          'Mantén el hábito de lectura para reforzar tu ortografía'
        ];
      }
    } else if (type === 'espacial') {
      if (percentage === 100) {
        recommendations = [
          '¡Felicidades! Has demostrado una capacidad excepcional de razonamiento espacial',
          'Considera explorar campos profesionales como arquitectura, ingeniería, diseño 3D o ciencias que requieran esta habilidad',
          'Tu capacidad para visualizar y manipular objetos mentalmente es extraordinaria',
          'Podrías compartir tus técnicas y estrategias con otros para ayudarles a mejorar sus habilidades espaciales'
        ];
      } else if (percentage < 60) {
        recommendations = [
          'Practica con rompecabezas tridimensionales y juegos de construcción para mejorar tu visualización espacial',
          'Realiza ejercicios de rotación mental, como imaginar objetos desde diferentes ángulos',
          'Intenta dibujar objetos tridimensionales desde diferentes perspectivas',
          'Utiliza aplicaciones o juegos que ejerciten el razonamiento espacial'
        ];
      } else if (percentage < 80) {
        recommendations = [
          'Continúa practicando con ejercicios de visualización espacial más complejos',
          'Intenta resolver problemas de plegado de papel (origami) para mejorar tu comprensión de transformaciones espaciales',
          'Practica con juegos de construcción y ensamblaje que requieran visualización tridimensional',
          'Analiza las preguntas que te resultaron más difíciles para identificar patrones específicos'
        ];
      } else {
        recommendations = [
          'Desafíate con problemas de visualización espacial más avanzados',
          'Explora campos como la geometría tridimensional, el diseño 3D o la arquitectura',
          'Comparte tus conocimientos y estrategias con otros para reforzar tu comprensión',
          'Considera carreras o actividades que aprovechen tu excelente capacidad de razonamiento espacial'
        ];
      }
    } else if (type === 'mecanico') {
      if (percentage === 100) {
        recommendations = [
          '¡Excelente! Has demostrado una comprensión excepcional de principios mecánicos y físicos',
          'Considera carreras en ingeniería mecánica, física aplicada, o diseño industrial',
          'Tu capacidad para analizar sistemas mecánicos y predecir comportamientos es sobresaliente',
          'Podrías explorar campos como robótica, automatización o diseño de maquinaria'
        ];
      } else if (percentage < 60) {
        recommendations = [
          'Repasa los principios básicos de física: fuerzas, palancas, poleas y equilibrio',
          'Practica con ejercicios de mecánica básica y análisis de sistemas simples',
          'Observa cómo funcionan las máquinas simples en la vida cotidiana',
          'Dedica tiempo a entender conceptos como centro de gravedad, resistencia y fricción'
        ];
      } else if (percentage < 80) {
        recommendations = [
          'Profundiza en el estudio de máquinas simples y compuestas',
          'Practica con problemas de equilibrio de fuerzas y análisis de estructuras',
          'Estudia casos prácticos de aplicaciones mecánicas en la industria',
          'Refuerza tu comprensión de principios como ventaja mecánica y eficiencia'
        ];
      } else {
        recommendations = [
          'Explora conceptos avanzados de mecánica y termodinámica',
          'Considera estudiar ingeniería mecánica o campos relacionados',
          'Practica con simulaciones y modelado de sistemas mecánicos complejos',
          'Mantén tu conocimiento actualizado con las últimas tecnologías mecánicas'
        ];
      }
    } else if (type === 'numerico') {
      if (percentage === 100) {
        recommendations = [
          '¡Excelente! Has demostrado una capacidad excepcional en razonamiento numérico',
          'Considera carreras en matemáticas, estadística, ingeniería, economía o ciencias actuariales',
          'Tu habilidad para resolver problemas numéricos complejos es sobresaliente',
          'Podrías explorar campos como análisis de datos, investigación operativa o finanzas cuantitativas'
        ];
      } else if (percentage < 60) {
        recommendations = [
          'Repasa las operaciones básicas: suma, resta, multiplicación y división',
          'Practica con ejercicios de igualdades numéricas y resolución de ecuaciones simples',
          'Dedica tiempo a entender patrones en series numéricas',
          'Refuerza tu comprensión de fracciones, decimales y porcentajes'
        ];
      } else if (percentage < 80) {
        recommendations = [
          'Practica con series numéricas más complejas para identificar patrones',
          'Mejora tu velocidad en cálculo mental y operaciones aritméticas',
          'Estudia problemas de proporcionalidad y regla de tres',
          'Analiza tablas de datos y practica la interpretación de información numérica'
        ];
      } else {
        recommendations = [
          'Desafíate con problemas de matemáticas más avanzados',
          'Explora áreas como álgebra, estadística y análisis de datos',
          'Considera estudiar carreras que requieran fuerte razonamiento cuantitativo',
          'Mantén tu agilidad mental practicando regularmente con ejercicios numéricos'
        ];
      }
    } else {
      // Recomendaciones genéricas para otros tipos de test
      recommendations = [
        'Continúa practicando ejercicios similares para mejorar tu desempeño',
        'Revisa los conceptos básicos relacionados con este tipo de prueba',
        'Analiza las preguntas que te resultaron más difíciles para identificar áreas de mejora'
      ];
    }

    return recommendations;
  };

  const recommendations = generateRecommendations(testType, successPercentage);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{getTestTitle(testType)}</h1>
        <p className="text-gray-600">Resumen de tu desempeño en el test.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de resultados */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Resultados</h2>
          <div className="h-64">
            <PieChart data={chartData} />
          </div>
        </div>

        {/* Detalles y estadísticas */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas</h2>

          <div className="mb-6">
            <div className={`text-3xl font-bold mb-1 ${getPerformanceColor(successPercentage)}`}>
              {successPercentage}%
            </div>
            <p className="text-gray-700 font-medium">{getPerformanceMessage(successPercentage)}</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Respuestas correctas:</span>
              <span className="font-medium text-gray-800">{correctCount} de {totalQuestions}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Respuestas incorrectas:</span>
              <span className="font-medium text-gray-800">{incorrectCount}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Sin responder:</span>
              <span className="font-medium text-gray-800">{unansweredCount}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tiempo utilizado:</span>
              <span className="font-medium text-gray-800">{formatTime(timeUsed)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recomendaciones</h2>
        <ul className="space-y-2">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 mt-0.5">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="ml-2 text-gray-700">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to={`/test/instructions/${testType}`}
          className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Realizar el Test Nuevamente
        </Link>
        <Link
          to="/student/questionnaire"
          className="flex-1 bg-gray-100 text-gray-800 text-center py-3 px-4 rounded-md hover:bg-gray-200 transition-colors"
        >
          Volver a la Lista de Tests
        </Link>
      </div>
    </div>
  );
};

export default Results;