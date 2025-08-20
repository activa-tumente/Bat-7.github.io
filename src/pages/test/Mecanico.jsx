import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { getTestImagePath } from '../../utils/assetPaths';
import TestResultsService from '../../services/testResultsService';

const Mecanico = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [testStarted, setTestStarted] = useState(false);

  // Obtener patientId del state de navegación
  const patientId = location.state?.patientId;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(12 * 60); // 12 minutos en segundos
  const [testCompleted, setTestCompleted] = useState(false);

  // Preguntas del test
  const questions = [
    {
      id: 1,
      question: "¿Qué tipo de polea podrá subir MÁS peso sin vencerse?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico1.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 0 // A
    },
    {
      id: 2,
      question: "¿Qué estante es MENOS resistente?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico2.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 2 // C
    },
    {
      id: 3,
      question: "¿Qué tipo de listones permite mover la carga con MENOS esfuerzo?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico3.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 0 // A
    },
    {
      id: 4,
      question: "Si el viento sopla en la dirección indicada, ¿hacia dónde tendríamos que golpear la bola para acercarla MÁS al hoyo?",
      subtitle: "",
      image: "/assets/images/mecanico/mecanico4.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 1 // B
    },
    {
      id: 5,
      question: "¿En qué zona (A, B o C) es MÁS probable que se rompan las cuerdas al colocar la carga?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico5.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 1 // B
    },
    {
      id: 6,
      question: "¿De qué recipiente saldrá el líquido con MÁS fuerza?",
      subtitle: "",
      image: "/assets/images/mecanico/mecanico6.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 2 // C
    },
    {
      id: 7,
      question: "¿Cuál de estos tres recipientes llenos de agua pesa MENOS?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico7.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 3 // D
    },
    {
      id: 8,
      question: "¿Qué torno deberá dar MÁS vueltas para enrollar los mismos metros de cuerda?",
      subtitle: "",
      image: "/assets/images/mecanico/mecanico8.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 3 // D
    },
    {
      id: 9,
      question: "¿Hacia qué dirección (A, B, C o D) está soplando el viento?",
      subtitle: "",
      image: "/assets/images/mecanico/mecanico9.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 1 // B
    },
    {
      id: 10,
      question: "¿Cuál de estos tres tejados es MÁS probable que se rompa en caso de nevada?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico10.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 0 // A
    },
    {
      id: 11,
      question: "¿A cuál de estas personas le costará MÁS esfuerzo trasladar la carga?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico11.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 2 // C
    },
    {
      id: 12,
      question: "¿Con qué bomba se inflará MÁS lentamente un colchón flotador?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico12.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 2 // C
    },
    {
      id: 13,
      question: "¿En qué caso se debe ejercer MENOS fuerza en el punto indicado por la flecha para sujetar el mismo peso?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico13.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 0 // A
    },
    {
      id: 14,
      question: "Si al frenar la bicicleta solo se usan los frenos delanteros, ¿hacia qué dirección será impulsado el ciclista?",
      subtitle: "",
      image: "/assets/images/mecanico/mecanico14.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 3 // D
    },
    {
      id: 15,
      question: "¿Cuál de estos tres pesos (A, B o C) pesa MENOS?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico15.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 3 // D
    },
    {
      id: 16,
      question: "¿Qué columna será MÁS resistente en caso de terremoto?",
      subtitle: "",
      image: "/assets/images/mecanico/mecanico16.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 1 // B
    },
    {
      id: 17,
      question: "¿Qué micrófono tiene MENOS probabilidad de caerse ante un golpe?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico17.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 0 // A
    },
    {
      id: 18,
      question: "¿Qué trayectoria (A, B o C) debe seguir el nadador para cruzar el río con MENOS esfuerzo?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico18.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 1 // B
    },
    {
      id: 19,
      question: "¿En qué punto es necesario ejercer MÁS fuerza para cerrar la puerta?",
      subtitle: "",
      image: "/assets/images/mecanico/mecanico19.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 0 // A
    },
    {
      id: 20,
      question: "¿En qué caso habrá que ejercer MENOS fuerza para levantar las ruedas delanteras del carro?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico20.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 2 // C
    },
    {
      id: 21,
      question: "¿Qué coche ofrece MENOS resistencia al aire?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico21.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 2 // C
    },
    {
      id: 22,
      question: "¿Cómo debe agarrarse la persona a la roca para que no la arrastre la corriente?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico22.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 2 // C
    },
    {
      id: 23,
      question: "Si tenemos estas tres linternas, ¿cuál iluminará un área MAYOR?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico23.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 2 // C
    },
    {
      id: 24,
      question: "¿Qué coche es MENOS probable que vuelque?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico24.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 2 // C
    },
    {
      id: 25,
      question: "¿En qué punto alcanzará MÁS velocidad el paracaidista?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico25.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 2 // C
    },
    {
      id: 26,
      question: "Si dejáramos tan solo UNO de los bloques (A, B, C o D), ¿con cuál se mantendría la estructura en equilibrio?",
      subtitle: "",
      image: "/assets/images/mecanico/mecanico26.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 2 // C
    },
    {
      id: 27,
      question: "¿Hacia qué zona de la cápsula será impulsado el astronauta cuando la máquina gire en el sentido indicado por la flecha?",
      subtitle: "",
      image: "/assets/images/mecanico/mecanico27.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 1 // B
    },
    {
      id: 28,
      question: "Si colgamos el peso de esta forma, ¿por cuál de los puntos (A, B o C) es MENOS probable que se rompa la madera?",
      subtitle: "(Si no hay diferencia, marca D).",
      image: "/assets/images/mecanico/mecanico28.png",
      options: ["A", "B", "C", "D"],
      correctAnswer: 2 // C
    }
  ];

  // Temporizador
  useEffect(() => {
    let timer;
    if (testStarted && !testCompleted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, testCompleted, timeLeft]);

  // Formatear tiempo
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Iniciar test
  const handleStartTest = () => {
    setTestStarted(true);
  };

  // Seleccionar respuesta
  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  // Navegar a pregunta específica
  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  // Enviar test
  const handleSubmit = async () => {
    try {
      setTestCompleted(true);

      // Calcular respuestas
      const answeredQuestions = Object.keys(answers).length;
      const totalQuestions = questions.length;
      const unansweredCount = totalQuestions - answeredQuestions;

      // Calcular respuestas correctas e incorrectas
      let correctCount = 0;
      questions.forEach(question => {
        if (answers[question.id] === question.correctAnswer) {
          correctCount++;
        }
      });

      const incorrectCount = answeredQuestions - correctCount;

      // Calcular tiempo utilizado (12 minutos - tiempo restante)
      const timeUsed = (12 * 60) - timeLeft;

      // Preparar datos para la página de resultados
      const resultData = {
        correctCount,
        incorrectCount,
        unansweredCount,
        timeUsed,
        totalQuestions,
        testType: 'mecanico'
      };

      // Guardar resultados en Supabase si hay un paciente seleccionado
      if (patientId) {
        try {
          await TestResultsService.saveTestResult({
            patientId,
            testType: 'mecanico',
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
      navigate('/test/results/mecanico', { state: resultData });
    } catch (error) {
      console.error('Error al finalizar test:', error);
      toast.error('Error al procesar los resultados del test');
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            <i className="fas fa-cogs mr-2 text-orange-600"></i>
            Test de Aptitud Mecánica
          </h1>
          <p className="text-gray-600">Evalúa tu comprensión de principios mecánicos y físicos básicos</p>
        </div>
        {testStarted && (
          <div className="text-center">
            <div className="text-xl font-mono font-bold text-red-600">
              {formatTime(timeLeft)}
            </div>
          </div>
        )}
      </div>

      {!testStarted ? (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-800">Aptitud Mecánica: Instrucciones</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              {/* Sección de aceptación */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-800 mb-3">Confirmación</h3>
                <p className="text-gray-700 mb-4">
                  He leído y acepto las instrucciones. Entiendo que una vez iniciado el test no podré pausarlo y deberé completarlo en su totalidad.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">Instrucciones</h3>
                <p className="text-gray-600 mb-4">
                  En esta prueba aparecen varios tipos de situaciones sobre las cuales se te harán algunas preguntas.
                </p>
                <p className="text-gray-600 mb-4">
                  Lee atentamente cada pregunta, observa el dibujo y elige cuál de las opciones es la más adecuada.
                </p>
                <p className="text-gray-600 mb-4">
                  Recuerda que solo existe <strong>UNA opción correcta</strong>. Cuando hayas decidido qué opción es, marca la letra correspondiente (A, B, C o D), asegurándote de que coincida con el número del ejercicio que estás contestando.
                </p>
              </div>

              {/* Ejemplo M1 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-blue-800 mb-3">Ejemplo M1</h4>
                <p className="text-gray-700 mb-4 font-medium">
                  ¿Cuál de las tres botellas podría quitarse sin que se cayera la bandeja?<br/>
                  <span className="text-sm text-gray-600">(Si no hay diferencia, marca D).</span>
                </p>

                <div className="bg-white border border-gray-300 rounded p-4 mb-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 text-center">
                    <img
                      src="/assets/images/mecanico/m1.png"
                      alt="Ejemplo M1 - Bandeja en equilibrio"
                      className="max-w-full h-auto mx-auto"
                      style={{ maxHeight: '300px' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="text-gray-500 text-sm" style={{ display: 'none' }}>
                      [Imagen no disponible: Bandeja en equilibrio con 3 botellas]
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="bg-gray-100 p-2 rounded text-center">A</div>
                    <div className="bg-gray-100 p-2 rounded text-center">B</div>
                    <div className="bg-green-100 border-2 border-green-500 p-2 rounded text-center font-medium">C</div>
                    <div className="bg-gray-100 p-2 rounded text-center">D</div>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Solución:</strong> En este ejemplo se presenta una bandeja en equilibrio sobre una mesa y encima de ella 3 botellas. Si se quitase la botella A o la botella B, la bandeja perdería el equilibrio y caería al suelo; si quitáramos la botella C la bandeja se mantendría en equilibrio. Por lo tanto, la solución al ejemplo M1 es <strong>C</strong>.
                  </p>
                </div>
              </div>

              {/* Ejemplo M2 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-green-800 mb-3">Ejemplo M2</h4>
                <p className="text-gray-700 mb-4 font-medium">
                  Si los tres vehículos se están desplazando a 70 km/h, ¿cuál va MÁS rápido?<br/>
                  <span className="text-sm text-gray-600">(Si no hay diferencia, marca D).</span>
                </p>

                <div className="bg-white border border-gray-300 rounded p-4 mb-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 text-center">
                    <img
                      src="/assets/images/mecanico/m2.png"
                      alt="Ejemplo M2 - Tres vehículos a 70 km/h"
                      className="max-w-full h-auto mx-auto"
                      style={{ maxHeight: '300px' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="text-gray-500 text-sm" style={{ display: 'none' }}>
                      [Imagen no disponible: Tres vehículos a 70 km/h]
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="bg-gray-100 p-2 rounded text-center">A</div>
                    <div className="bg-gray-100 p-2 rounded text-center">B</div>
                    <div className="bg-gray-100 p-2 rounded text-center">C</div>
                    <div className="bg-green-100 border-2 border-green-500 p-2 rounded text-center font-medium">D</div>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Solución:</strong> Al desplazarse los tres vehículos a la misma velocidad (70 km/h), los tres van igual de rápido. Por lo tanto, la solución a este ejemplo es la opción <strong>D</strong> (no hay diferencia).
                  </p>
                </div>
              </div>

              {/* Instrucciones Finales */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">Instrucciones para el Test</h4>
                <p className="text-gray-700 mb-4">
                  El tiempo máximo para la realización de esta prueba es de <strong>12 minutos</strong>, por lo que deberás trabajar rápidamente, esforzándote al máximo en encontrar la respuesta correcta.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-4">
                  <li>Si en algún ejercicio no estás completamente seguro de cuál puede ser, elige la opción que creas que es más correcta de las que aparecen.</li>
                  <li><strong>No se penalizará el error</strong>, así que intenta responder todas las preguntas.</li>
                  <li>Si terminas antes del tiempo concedido, repasa tus respuestas, pero NO continúes con las demás pruebas.</li>
                  <li>Puedes navegar libremente entre las preguntas durante el tiempo disponible.</li>
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
      ) : (

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Card className="mb-6">
            <CardHeader className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium">
                  Pregunta {currentQuestion + 1} de {questions.length}
                </h2>
                <p className="text-sm text-gray-500">
                  Aptitud Mecánica
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {answers[currentQ.id] !== undefined ? 'Respondida' : 'Sin responder'}
              </div>
            </CardHeader>
            <CardBody>
              {/* Pregunta */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 mb-2">
                  {currentQ.question}
                </h4>
                {currentQ.subtitle && (
                  <p className="text-sm text-gray-600 mb-4">{currentQ.subtitle}</p>
                )}

                {/* Imagen */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center">
                  <img
                    src={currentQ.image}
                    alt={`Pregunta ${currentQ.id}`}
                    className="max-w-full h-auto mx-auto"
                    style={{ maxHeight: '400px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="text-gray-500 text-sm" style={{ display: 'none' }}>
                    [Imagen no disponible: {currentQ.image}]
                  </div>
                </div>
              </div>

              {/* Opciones de respuesta */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {currentQ.options.map((option, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors text-center ${
                      answers[currentQ.id] === index
                        ? 'bg-blue-50 border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleAnswerSelect(currentQ.id, index)}
                  >
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full mx-auto mb-2 ${
                      answers[currentQ.id] === index
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {option}
                    </div>
                    <div className="text-sm text-gray-600">Opción {option}</div>
                  </div>
                ))}
              </div>

            </CardBody>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => goToQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Anterior
              </Button>
              {currentQuestion < questions.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={() => goToQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                >
                  Finalizar Test
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Panel de navegación - lado derecho */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <h2 className="text-md font-medium">Navegación</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-4 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    className={`w-8 h-8 rounded-full font-medium text-sm ${
                      currentQuestion === index
                        ? 'bg-blue-500 text-white'
                        : answers[questions[index].id] !== undefined
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => goToQuestion(index)}
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
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                  <h3 className="text-sm font-medium text-blue-700 mb-1">Información</h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Tiempo restante: <span className="font-medium">{formatTime(timeLeft)}</span>
                  </p>
                  <p className="text-xs text-gray-600">
                    Observa cuidadosamente cada imagen antes de responder. Puedes cambiar tu respuesta antes de finalizar el test.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full mt-2"
                onClick={handleSubmit}
              >
                Finalizar Test
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
};

export default Mecanico;