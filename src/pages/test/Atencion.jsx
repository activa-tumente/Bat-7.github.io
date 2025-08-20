import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { getTestImagePath } from '../../utils/assetPaths';
import TestResultsService from '../../services/testResultsService';

const Atencion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(8 * 60); // 8 minutos en segundos
  const [testStarted, setTestStarted] = useState(false);

  // Obtener patientId del state de navegación
  const patientId = location.state?.patientId;
  const questionsPerPage = 10; // Mostrar 10 preguntas por página

  // Respuestas correctas para las 80 preguntas del test de atención
  const correctAnswers = {
    1: 3, 2: 3, 3: 2, 4: 1, 5: 2,
    6: 3, 7: 2, 8: 2, 9: 4, 10: 2,
    11: 4, 12: 1, 13: 4, 14: 2, 15: 4,
    16: 2, 17: 2, 18: 3, 19: 2, 20: 3,
    21: 4, 22: 2, 23: 3, 24: 2, 25: 3,
    26: 3, 27: 1, 28: 2, 29: 1, 30: 2,
    31: 3, 32: 3, 33: 4, 34: 1, 35: 4,
    36: 3, 37: 1, 38: 2, 39: 4, 40: 1,
    41: 1, 42: 4, 43: 2, 44: 3, 45: 2,
    46: 1, 47: 2, 48: 3, 49: 1, 50: 3,
    51: 1, 52: 4, 53: 1, 54: 1, 55: 1,
    56: 3, 57: 3, 58: 2, 59: 1, 60: 4,
    61: 4, 62: 3, 63: 2, 64: 3, 65: 2,
    66: 4, 67: 3, 68: 1, 69: 2, 70: 4,
    71: 3, 72: 3, 73: 3, 74: 1, 75: 1,
    76: 2, 77: 2, 78: 4, 79: 1, 80: 1
  };

  useEffect(() => {
    // Carga de preguntas
    const fetchQuestions = async () => {
      try {
        // Aquí se implementaría la llamada a la API para obtener las preguntas
        // Por ahora usamos datos de ejemplo
        await new Promise(resolve => setTimeout(resolve, 800)); // Simular tiempo de carga

        // Generar 80 preguntas del test de atención
        const atencionQuestions = Array.from({ length: 80 }, (_, i) => ({
          id: i + 1,
          type: 'attention',
          imageUrl: getTestImagePath('atencion', `Atencion${i + 1}.png`),
          options: [
            { id: '0', text: '0 veces' },
            { id: '1', text: '1 vez' },
            { id: '2', text: '2 veces' },
            { id: '3', text: '3 veces' },
            { id: '4', text: '4 veces' },
          ],
          correctAnswer: correctAnswers[i + 1] ? correctAnswers[i + 1].toString() : '0' // Valor por defecto si no está en correctAnswers
        }));

        setQuestions(atencionQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar preguntas:', error);
        toast.error('Error al cargar las preguntas del test');
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Temporizador
  useEffect(() => {
    if (!testStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleFinishTest();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, timeLeft]);

  const handleStartTest = () => {
    setTestStarted(true);
    toast.info('Test iniciado. ¡Buena suerte!');
  };

  const handleSelectOption = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * questionsPerPage < questions.length) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0); // Scroll al inicio de la página
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0); // Scroll al inicio de la página
    }
  };

  const handleFinishTest = async () => {
    try {
      const answeredQuestions = Object.keys(answers).length;
      const totalQuestions = questions.length;
      const unansweredCount = totalQuestions - answeredQuestions;

      // Calcular respuestas correctas
      let correctCount = 0;
      Object.entries(answers).forEach(([questionId, answer]) => {
        const question = questions.find(q => q.id.toString() === questionId);
        if (question && answer === question.correctAnswer) {
          correctCount++;
        }
      });

      const incorrectCount = answeredQuestions - correctCount;

      // Calcular tiempo utilizado (8 minutos - tiempo restante)
      const timeUsed = (8 * 60) - timeLeft;

      // Preparar datos para la página de resultados
      const resultData = {
        correctCount,
        incorrectCount,
        unansweredCount,
        timeUsed,
        totalQuestions,
        testType: 'atencion'
      };

      // Guardar en Supabase si hay un paciente seleccionado
      if (patientId) {
        try {
          await TestResultsService.saveTestResult({
            patientId,
            testType: 'atencion',
            correctCount,
            incorrectCount,
            unansweredCount,
            timeUsed,
            totalQuestions,
            answers,
            errores: incorrectCount // Para el cálculo de concentración
          });
        } catch (error) {
          console.error('Error al guardar resultado:', error);
          // Continuar con la navegación aunque falle el guardado
        }
      }

      toast.success(`Test completado. Has respondido ${answeredQuestions} de ${totalQuestions} preguntas. Respuestas correctas: ${correctCount}`);

      // Redirigir a la página de resultados con los datos
      navigate('/test/results/atencion', { state: resultData });

    } catch (error) {
      console.error('Error al finalizar test:', error);
      toast.error('Error al procesar los resultados del test');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Obtener las preguntas para la página actual
  const getCurrentPageQuestions = () => {
    const startIndex = currentPage * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    return questions.slice(startIndex, endIndex);
  };

  // Calcular el número total de páginas
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            <i className="fas fa-eye mr-2 text-purple-600"></i>
            Test de Atención y Concentración
          </h1>
          <p className="text-gray-600">Localización de símbolos específicos</p>
        </div>
        {testStarted && (
          <div className="text-center">
            <div className="text-xl font-mono font-bold text-red-600">
              {formatTime(timeLeft)}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500">Cargando test de atención...</p>
          </div>
        </div>
      ) : !testStarted ? (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-800">Test de Atención: Instrucciones</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">¿Qué es el Test de Atención?</h3>
                <p className="text-gray-600 mb-2">
                  El test de atención evalúa tu capacidad para mantener la concentración y detectar estímulos específicos entre un conjunto de elementos similares. Esta habilidad es fundamental para el aprendizaje, el trabajo y muchas actividades cotidianas.
                </p>
                <p className="text-gray-600">
                  Esta prueba mide específicamente tu atención selectiva, velocidad perceptiva, discriminación visual y capacidad de concentración sostenida.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Instrucciones del Test</h3>
                <p className="text-gray-600 mb-3">
                  Esta prueba trata de evaluar tu rapidez y tu precisión trabajando con símbolos. En cada ejercicio aparece una fila con diferentes símbolos y tu tarea consistirá en localizar cuántas veces aparece uno determinado.
                </p>
                <p className="text-gray-600 mb-3">
                  El símbolo que tienes que localizar es siempre el mismo y se presenta en la parte superior de la página; en cada ejercicio puede aparecer 0, 1, 2, 3 o 4 veces.
                </p>
                <p className="text-gray-600">
                  Deberás seleccionar cuántas veces aparece el símbolo en cada fila (0, 1, 2, 3 o 4) asegurándote de que tu respuesta se corresponda con el número del ejercicio que estás contestando.
                </p>
              </div>

              <div className="bg-slate-200 p-4 rounded-lg border border-slate-300">
                <h3 className="text-lg font-medium text-indigo-700 mb-2">Ejemplos</h3>

                <div className="mb-6">
                  <div className="flex justify-center mb-3">
                    <img
                      src={getTestImagePath('atencion', 'Atencion.png')}
                      alt="Ejemplos de atención"
                      className="max-w-md h-auto border rounded shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300x150?text=Imagen+no+disponible";
                      }}
                    />
                  </div>
                  <p className="text-gray-600 mt-3">
                    <strong className="text-indigo-600">Ejemplo A1:</strong> El símbolo del óvalo aparece una única vez, y es el tercer símbolo de la fila. Por eso la respuesta correcta es <strong>1</strong>.
                  </p>
                  <p className="text-gray-600 mt-2">
                    <strong className="text-indigo-600">Ejemplo A2:</strong> En esta ocasión no hay ningún símbolo que coincida exactamente con el modelo; por tanto la respuesta correcta es <strong>0</strong>.
                  </p>
                  <p className="text-gray-600 mt-2">
                    <strong className="text-indigo-600">Ejemplo A3:</strong> El símbolo del óvalo aparece en dos ocasiones, en primera y quinta posición. Por eso, la respuesta correcta es <strong>2</strong>.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Detalles del Test</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>El test consta de 80 preguntas de atención.</li>
                  <li>Dispondrás de <span className="font-medium">8 minutos</span> para completar todas las preguntas.</li>
                  <li>Las preguntas se presentan en páginas de 10 preguntas cada una.</li>
                  <li>Puedes navegar libremente entre las páginas y modificar tus respuestas durante el tiempo disponible.</li>
                  <li>Al finalizar el tiempo o al presionar "Finalizar Test", se enviará automáticamente y no podrás realizar más cambios.</li>
                  <li>Cada pregunta tiene el mismo valor, por lo que te recomendamos responder a todas.</li>
                  <li>No se penalizan las respuestas incorrectas, así que intenta responder todas las preguntas.</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <h3 className="text-lg font-medium text-yellow-800 mb-1">Importante</h3>
                <p className="text-yellow-700">
                  Una vez iniciado el test, el temporizador no se detendrá. Asegúrate de disponer del tiempo necesario para completarlo sin interrupciones. Encuentra un lugar tranquilo y asegúrate de tener una buena conexión a internet.
                </p>
              </div>
            </div>
          </CardBody>
          <CardFooter className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleStartTest}
              className="px-6 py-2"
            >
              Comenzar Test
            </Button>
          </CardFooter>
        </Card>
      ) : questions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <Card className="mb-6">
                <CardHeader className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-medium">
                      Página {currentPage + 1} de {totalPages}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Preguntas {currentPage * questionsPerPage + 1} - {Math.min((currentPage + 1) * questionsPerPage, questions.length)} de {questions.length}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Tiempo restante: {formatTime(timeLeft)}
                  </div>
                </CardHeader>
            <CardBody>
              <div className="space-y-8">
                {getCurrentPageQuestions().map((question) => (
                  <div key={question.id} className="border-b pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="md:w-3/4">
                        <h3 className="text-md font-medium mb-3">Pregunta {question.id}</h3>
                        <div className="mb-4">
                          <img
                            src={question.imageUrl}
                            alt={`Pregunta ${question.id}`}
                            className="w-full max-w-2xl h-auto border rounded shadow-sm"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/600x100?text=Imagen+no+disponible";
                            }}
                          />
                        </div>
                        <p className="text-gray-600 mb-3">¿Cuántas veces aparece el símbolo modelo en esta fila?</p>
                      </div>
                      <div className="md:w-1/4">
                        <div className="space-y-2">
                          {question.options.map((option) => (
                            <div
                              key={option.id}
                              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                answers[question.id] === option.id
                                  ? 'bg-indigo-50 border-indigo-500'
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => handleSelectOption(question.id, option.id)}
                            >
                              <div className="flex items-center">
                                <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                                  answers[question.id] === option.id
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {option.id}
                                </div>
                                <div className="text-gray-700">{option.text}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
              >
                Página Anterior
              </Button>
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`w-8 h-8 rounded-full text-sm ${
                      currentPage === i
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setCurrentPage(i)}
                  >
                    {i + 1}
                  </button>
                )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 3))}
                {currentPage + 3 < totalPages && <span className="self-center">...</span>}
              </div>
              {currentPage < totalPages - 1 ? (
                <Button
                  variant="primary"
                  onClick={handleNextPage}
                >
                  Página Siguiente
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleFinishTest}
                >
                  Finalizar Test
                </Button>
              )}
            </CardFooter>
          </Card>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Has respondido {Object.keys(answers).length} de {questions.length} preguntas ({Math.round((Object.keys(answers).length / questions.length) * 100)}%)
              </p>
              <div className="w-64 bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleFinishTest}
            >
              Finalizar Test
            </Button>
          </div>
        </div>

        {/* Panel de navegación - lado derecho */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <h2 className="text-md font-medium">Navegación</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1">
                {questions.map((question, index) => {
                  const pageNumber = Math.floor(index / questionsPerPage);
                  const isCurrentPage = pageNumber === currentPage;
                  return (
                    <button
                      key={question.id}
                      className={`w-8 h-8 rounded-full font-medium text-sm ${
                        answers[question.id]
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : isCurrentPage
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => {
                        const targetPage = Math.floor(index / questionsPerPage);
                        setCurrentPage(targetPage);
                      }}
                      title={`Pregunta ${index + 1} - Página ${pageNumber + 1}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-2">
                  Progreso: {Object.keys(answers).length}/{questions.length}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                  ></div>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleFinishTest}
                >
                  Finalizar Test
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
        </>
      ) : (
        <Card>
          <CardBody>
            <div className="py-8 text-center">
              <p className="text-gray-500">No se encontraron preguntas para este test.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/student/tests')}
              >
                Volver a Tests
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default Atencion;