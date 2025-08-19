import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { getTestImagePath } from '../../utils/assetPaths';
import TestResultsService from '../../services/testResultsService';

const Razonamiento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutos en segundos
  const [testStarted, setTestStarted] = useState(false);

  // Obtener patientId del state de navegación
  const patientId = location.state?.patientId;

  // Respuestas correctas para las 32 preguntas (en formato numérico)
  const correctAnswers = {
    1: '4', 2: '4', 3: '4', 4: '3', 5: '2',
    6: '4', 7: '3', 8: '3', 9: '1', 10: '4',
    11: '3', 12: '1', 13: '2', 14: '2', 15: '3',
    16: '2', 17: '1', 18: '3', 19: '3', 20: '4',
    21: '3', 22: '2', 23: '2', 24: '1', 25: '3',
    26: '1', 27: '1', 28: '1', 29: '3', 30: '4',
    31: '3', 32: '2'
  };

  // Mapeo entre números y letras
  const numberToLetter = {
    '1': 'a',
    '2': 'b',
    '3': 'c',
    '4': 'd'
  };

  // Mapeo entre letras y números
  const letterToNumber = {
    'a': '1',
    'b': '2',
    'c': '3',
    'd': '4'
  };

  useEffect(() => {
    // Carga de preguntas
    const fetchQuestions = async () => {
      try {
        // Aquí se implementaría la llamada a la API para obtener las preguntas
        // Por ahora usamos datos de ejemplo
        await new Promise(resolve => setTimeout(resolve, 800)); // Simular tiempo de carga

        // Crear las preguntas de razonamiento
        const razonamientoQuestions = Array.from({ length: 32 }, (_, index) => ({
          id: index + 1,
          type: 'series',
          // No hay texto en estas preguntas, solo imágenes
          imagePath: getTestImagePath('razonamiento', `Racionamiento${index + 1}.png`),
          options: [
            { id: 'a', text: 'Opción A' },
            { id: 'b', text: 'Opción B' },
            { id: 'c', text: 'Opción C' },
            { id: 'd', text: 'Opción D' },
          ],
          correctAnswer: numberToLetter[correctAnswers[index + 1]]
        }));

        setQuestions(razonamientoQuestions);
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

      // Calcular respuestas correctas e incorrectas usando las respuestas correctas definidas
      let correctCount = 0;
      Object.entries(answers).forEach(([questionId, answer]) => {
        // Convertir la respuesta de letra a número para comparar con las respuestas correctas
        const numericAnswer = letterToNumber[answer];
        if (correctAnswers[questionId] === numericAnswer) {
          correctCount++;
        }
      });

      const incorrectCount = answeredQuestions - correctCount;

      // Calcular tiempo utilizado (20 minutos - tiempo restante)
      const timeUsed = (20 * 60) - timeLeft;

      // Preparar datos para la página de resultados
      const resultData = {
        correctCount,
        incorrectCount,
        unansweredCount,
        timeUsed,
        totalQuestions,
        testType: 'razonamiento'
      };

      // Guardar resultados en Supabase si hay un paciente seleccionado
      if (patientId) {
        try {
          await TestResultsService.saveTestResult({
            patientId,
            testType: 'razonamiento',
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
      navigate('/test/results/razonamiento', { state: resultData });
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
      case 'series': return 'Series';
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
            <i className="fas fa-puzzle-piece mr-2 text-amber-600"></i>
            Test de Razonamiento
          </h1>
          <p className="text-gray-600">Continuar series lógicas de figuras</p>
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
            <p className="text-gray-500">Cargando test de razonamiento...</p>
          </div>
        </div>
      ) : !testStarted ? (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-800">Razonamiento: Instrucciones</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">¿Qué es el Razonamiento?</h3>
                <p className="text-gray-600 mb-2">
                  El razonamiento es la capacidad para identificar patrones, relaciones y reglas lógicas en series de figuras o dibujos. Esta habilidad es fundamental para resolver problemas, tomar decisiones y aprender nuevos conceptos.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Instrucciones del Test</h3>
                <p className="text-gray-600 mb-3">
                  En esta prueba se trabaja con series de figuras o dibujos, ordenados de acuerdo con una ley. Tu tarea consistirá en averiguar la ley que ordena las figuras y elegir entre las opciones de respuesta la que continúa la serie.
                </p>
                <p className="text-gray-600 mb-3">
                  En todos los ejercicios se presenta la serie en la parte superior y las opciones de respuesta en la parte inferior. Cuando hayas decidido qué opción es la única correcta, selecciona la letra correspondiente (A, B, C o D).
                </p>
              </div>

              <div className="bg-slate-200 p-4 rounded-lg border border-slate-300">
                <h3 className="text-lg font-medium text-orange-700 mb-2">Ejemplos</h3>

                <div className="mb-6">
                  <p className="text-gray-600 mb-3">
                    <strong className="text-blue-600">Ejemplo R1:</strong>
                  </p>
                  <div className="flex justify-center mb-4">
                    <img src="/assets/images/razonamiento/R1.png" alt="Ejemplo R1" className="max-w-full h-auto" />
                  </div>
                  <p className="text-gray-600 mt-3">
                    En este ejemplo se presenta una figura que va girando 90 grados hacia la derecha de una casilla a otra. ¿Cuál debería ser la próxima figura de la serie?
                  </p>
                  <p className="text-gray-600 mt-3">
                    La respuesta correcta es la <strong>D</strong>.
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 mb-3">
                    <strong className="text-blue-600">Ejemplo R2:</strong>
                  </p>
                  <div className="flex justify-center mb-4">
                    <img src="/assets/images/razonamiento/R2.png" alt="Ejemplo R2" className="max-w-full h-auto" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Detalles del Test</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>El test consta de 32 preguntas de series lógicas.</li>
                  <li>Dispondrás de <span className="font-medium">20 minutos</span> para completar todas las preguntas.</li>
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
              className="px-6 py-2 bg-amber-600 hover:bg-amber-700"
            >
              Comenzar Test
            </Button>
          </CardFooter>
        </Card>
      ) : (
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
                          src={currentQuestionData.imagePath}
                          alt={`Pregunta ${currentQuestionData.id}`}
                          className="max-w-full h-auto"
                        />
                      </div>
                      <div className="space-y-3">
                        {currentQuestionData.options.map((option) => (
                          <div
                            key={option.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                              answers[currentQuestionData.id] === option.id
                                ? 'bg-amber-50 border-amber-500'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleSelectOption(currentQuestionData.id, option.id)}
                          >
                            <div className="flex items-center">
                              <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                                answers[currentQuestionData.id] === option.id
                                  ? 'bg-amber-500 text-white'
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
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      Siguiente
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleFinishTest}
                      className="bg-amber-600 hover:bg-amber-700"
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
                  <div className="grid grid-cols-4 gap-2">
                    {questions.map((question, index) => (
                      <button
                        key={question.id}
                        className={`w-8 h-8 rounded-full font-medium text-sm ${
                          currentQuestion === index
                            ? 'bg-amber-500 text-white'
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
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mb-4">
                      <h3 className="text-sm font-medium text-amber-700 mb-1">Información</h3>
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
                    className="w-full mt-2 bg-amber-600 hover:bg-amber-700"
                    onClick={handleFinishTest}
                  >
                    Finalizar Test
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Razonamiento;