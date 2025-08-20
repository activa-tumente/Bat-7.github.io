import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { getTestImagePath } from '../../utils/assetPaths';
import TestResultsService from '../../services/testResultsService';

const Espacial = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos en segundos
  const [testStarted, setTestStarted] = useState(false);

  // Obtener patientId del state de navegación
  const patientId = location.state?.patientId;

  // Respuestas correctas para las 28 preguntas (convertidas a letras)
  const correctAnswers = {
    1: 'C', 2: 'D', 3: 'B', 4: 'A', 5: 'A',
    6: 'A', 7: 'D', 8: 'B', 9: 'D', 10: 'D',
    11: 'C', 12: 'A', 13: 'D', 14: 'A', 15: 'A',
    16: 'B', 17: 'C', 18: 'A', 19: 'C', 20: 'D',
    21: 'D', 22: 'C', 23: 'D', 24: 'B', 25: 'C',
    26: 'C', 27: 'D', 28: 'C'
  };

  useEffect(() => {
    // Carga de preguntas
    const fetchQuestions = async () => {
      try {
        // Aquí se implementaría la llamada a la API para obtener las preguntas
        // Por ahora usamos datos de ejemplo
        await new Promise(resolve => setTimeout(resolve, 800)); // Simular tiempo de carga

        // Generar las 28 preguntas del test espacial
        const espacialQuestions = Array.from({ length: 28 }, (_, i) => ({
          id: i + 1,
          type: 'spatial',
          imageUrl: getTestImagePath('espacial', `Espacial${i + 1}.png`),
          options: [
            { id: 'A', text: 'Opción A' },
            { id: 'B', text: 'Opción B' },
            { id: 'C', text: 'Opción C' },
            { id: 'D', text: 'Opción D' },
          ],
          correctAnswer: correctAnswers[i + 1]
        }));

        setQuestions(espacialQuestions);
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

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFinishTest = async () => {
    try {
      const answeredQuestions = Object.keys(answers).length;
      const totalQuestions = questions.length;
      const unansweredCount = totalQuestions - answeredQuestions;

      // Calcular respuestas correctas e incorrectas
      let correctCount = 0;
      Object.entries(answers).forEach(([questionId, answer]) => {
        const question = questions.find(q => q.id.toString() === questionId);
        if (question && answer === question.correctAnswer) {
          correctCount++;
        }
      });

      const incorrectCount = answeredQuestions - correctCount;

      // Calcular tiempo utilizado (15 minutos - tiempo restante)
      const timeUsed = (15 * 60) - timeLeft;

      // Preparar datos para la página de resultados
      const resultData = {
        correctCount,
        incorrectCount,
        unansweredCount,
        timeUsed,
        totalQuestions,
        testType: 'espacial'
      };

      // Guardar resultados en Supabase si hay un paciente seleccionado
      if (patientId) {
        try {
          await TestResultsService.saveTestResult({
            patientId,
            testType: 'espacial',
            correctCount,
            incorrectCount,
            unansweredCount,
            timeUsed,
            totalQuestions,
            answers,
            errores: incorrectCount
          });
        } catch (error) {
          console.error('Error al guardar resultado:', error);
          // Continuar con la navegación aunque falle el guardado
        }
      }

      toast.success(`Test completado. Has respondido ${answeredQuestions} de ${totalQuestions} preguntas. Respuestas correctas: ${correctCount}`);

      // Redirigir a la página de resultados con los datos
      navigate('/test/results/espacial', { state: resultData });
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

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'spatial': return 'Razonamiento Espacial';
      default: return type;
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const isAnswered = currentQuestionData ? answers[currentQuestionData.id] : false;

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            <i className="fas fa-cube mr-2 text-indigo-600"></i>
            Test de Aptitud Espacial
          </h1>
          <p className="text-gray-600">Razonamiento espacial con cubos y redes</p>
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
            <p className="text-gray-500">Cargando test de razonamiento espacial...</p>
          </div>
        </div>
      ) : !testStarted ? (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-800">Razonamiento Espacial: Instrucciones</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">¿Qué es el Razonamiento Espacial?</h3>
                <p className="text-gray-600 mb-2">
                  El razonamiento espacial es la capacidad para visualizar y manipular objetos mentalmente en el espacio tridimensional. Implica entender cómo se relacionan las formas y los objetos entre sí, y cómo se transforman cuando cambian de posición o perspectiva.
                </p>
                <p className="text-gray-600">
                  Esta habilidad es fundamental en campos como la arquitectura, ingeniería, diseño, matemáticas y ciencias, siendo especialmente relevante para carreras que requieren visualización y manipulación de objetos en el espacio.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Instrucciones del Test</h3>
                <p className="text-gray-600 mb-3">
                  En este test encontrarás un cubo junto con un modelo desplegado del mismo cubo. En el modelo desplegado falta una cara, marcada con un signo de interrogación (?).
                </p>
                <p className="text-gray-600 mb-3">
                  Tu tarea consistirá en averiguar qué opción (A, B, C o D) debería aparecer en lugar del interrogante para que el modelo desplegado corresponda al cubo cuando se pliega.
                </p>
                <p className="text-gray-600">
                  Para facilitar tu tarea, en el cubo se han representado en color gris los números o letras que se encuentran en las caras de atrás (las que no se ven directamente).
                </p>
              </div>

              <div className="bg-slate-200 p-4 rounded-lg border border-slate-300">
                <h3 className="text-lg font-medium text-indigo-700 mb-2">Ejemplos</h3>

                <div className="mb-6">
                  <p className="text-gray-600 mb-3">
                    <strong className="text-indigo-600">Ejemplo 1:</strong>
                  </p>
                  <div className="flex justify-center mb-3">
                    <img
                      src={getTestImagePath('espacial', 'Modelo Espacial.png')}
                      alt="Ejemplo 1"
                      className="max-w-full h-auto border rounded shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/400x200?text=Ejemplo+1";
                      }}
                    />
                  </div>
                  <p className="text-gray-600 mt-3">
                    La respuesta correcta es <strong>B</strong>. Si se sustituye el interrogante por la letra «h» y se pliegan las caras del modelo hasta formar el cubo, este se corresponde con el que aparece a la izquierda.
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 mb-3">
                    <strong className="text-indigo-600">Ejemplo 2:</strong>
                  </p>
                  <div className="flex justify-center mb-3">
                    <img
                      src={getTestImagePath('espacial', 'Espacial1.png')}
                      alt="Ejemplo 2"
                      className="max-w-full h-auto border rounded shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/400x200?text=Ejemplo+2";
                      }}
                    />
                  </div>
                  <p className="text-gray-600 mt-3">
                    La respuesta correcta es <strong>A</strong>.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Detalles del Test</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>El test consta de 28 preguntas de razonamiento espacial.</li>
                  <li>Dispondrás de <span className="font-medium">15 minutos</span> para completar todas las preguntas.</li>
                  <li>Puedes navegar libremente entre las preguntas y modificar tus respuestas durante el tiempo disponible.</li>
                  <li>Al finalizar el tiempo o al presionar "Finalizar Test", se enviará automáticamente y no podrás realizar más cambios.</li>
                  <li>Cada pregunta tiene el mismo valor, por lo que te recomendamos responder a todas.</li>
                  <li>No se penalizan las respuestas incorrectas, así que intenta responder todas las preguntas.</li>
                  <li>Si terminas antes del tiempo concedido, repasa tus respuestas.</li>
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
                      Pregunta {currentQuestion + 1} de {questions.length}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {currentQuestionData ? getQuestionTypeLabel(currentQuestionData.type) : ''}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {isAnswered ? 'Respondida' : 'Sin responder'}
                  </div>
                </CardHeader>
                <CardBody>
                  {currentQuestionData && (
                    <>
                      <div className="flex justify-center mb-6">
                        <img
                          src={currentQuestionData.imageUrl}
                          alt={`Pregunta ${currentQuestion + 1}`}
                          className="max-w-full h-auto border rounded shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/600x300?text=Imagen+no+disponible";
                          }}
                        />
                      </div>
                      <div className="space-y-3">
                        {currentQuestionData.options.map((option) => (
                          <div
                            key={option.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                              answers[currentQuestionData.id] === option.id
                                ? 'bg-indigo-50 border-indigo-500'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleSelectOption(currentQuestionData.id, option.id)}
                          >
                            <div className="flex items-center">
                              <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                                answers[currentQuestionData.id] === option.id
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {option.id.toUpperCase()}
                              </div>
                              <div className="text-gray-700">{option.text}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardBody>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0}
                  >
                    Anterior
                  </Button>
                  {currentQuestion < questions.length - 1 ? (
                    <Button
                      variant="primary"
                      onClick={handleNextQuestion}
                    >
                      Siguiente
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
            </div>

            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <h2 className="text-md font-medium">Navegación</h2>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1">
                    {questions.map((question, index) => (
                      <button
                        key={question.id}
                        className={`w-8 h-8 rounded-full font-medium text-sm ${
                          currentQuestion === index
                            ? 'bg-indigo-500 text-white'
                            : answers[question.id]
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        onClick={() => setCurrentQuestion(index)}
                        title={`Pregunta ${index + 1}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span>Progreso</span>
                      <span>{Object.keys(answers).length} de {questions.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mb-4">
                      <h3 className="text-sm font-medium text-indigo-700 mb-1">Información</h3>
                      <p className="text-xs text-gray-600 mb-2">
                        Tiempo restante: <span className="font-medium">{formatTime(timeLeft)}</span>
                      </p>
                      <p className="text-xs text-gray-600">
                        Recuerda que al responder una pregunta, puedes cambiar tu respuesta antes de finalizar el test.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full mt-2"
                    onClick={handleFinishTest}
                  >
                    Finalizar Test
                  </Button>
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

export default Espacial;