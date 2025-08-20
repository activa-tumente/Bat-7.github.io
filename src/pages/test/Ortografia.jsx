import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTimer } from '../../hooks/useTimer';
import QuestionNavigation from '../../components/test/QuestionNavigation';
import { toast } from 'react-toastify';
import TestResultsService from '../../services/testResultsService';

const Ortografia = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testCompleted, setTestCompleted] = useState(false);
  const { timeRemaining, startTimer, stopTimer, formatTime } = useTimer(10 * 60); // 10 minutos en segundos

  // Obtener patientId del state de navegación
  const patientId = location.state?.patientId;

  // Iniciar el temporizador cuando el componente se monte
  useEffect(() => {
    startTimer();

    // Limpieza al desmontar
    return () => {
      stopTimer();
    };
  }, [startTimer, stopTimer]);

  // Verificar si el tiempo ha terminado
  useEffect(() => {
    if (timeRemaining === 0) {
      handleSubmitTest();
    }
  }, [timeRemaining]);

  // Datos de ejemplo para el test de ortografía
  const questions = [
    {
      id: 1,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "reloj" },
        { id: "B", text: "reciclaje" },
        { id: "C", text: "reyna" },
        { id: "D", text: "nube" }
      ],
      correctAnswer: "C" // reyna (correcto: reina)
    },
    {
      id: 2,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "hola" },
        { id: "B", text: "Zoo" },
        { id: "C", text: "ambos" },
        { id: "D", text: "vallena" }
      ],
      correctAnswer: "D" // vallena (correcto: ballena)
    },
    {
      id: 3,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "adibinar" },
        { id: "B", text: "inmediato" },
        { id: "C", text: "gestar" },
        { id: "D", text: "anchoa" }
      ],
      correctAnswer: "A" // adibinar (correcto: adivinar)
    },
    {
      id: 4,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "herrero" },
        { id: "B", text: "saver" },
        { id: "C", text: "cerrar" },
        { id: "D", text: "honrado" }
      ],
      correctAnswer: "B" // saver (correcto: saber)
    },
    {
      id: 5,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "éxtasis" },
        { id: "B", text: "cesta" },
        { id: "C", text: "ademas" },
        { id: "D", text: "llevar" }
      ],
      correctAnswer: "C" // ademas (correcto: además)
    },
    {
      id: 6,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "avión" },
        { id: "B", text: "abrir" },
        { id: "C", text: "favor" },
        { id: "D", text: "espionage" }
      ],
      correctAnswer: "D" // espionage (correcto: espionaje)
    },
    {
      id: 7,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "insecto" },
        { id: "B", text: "jota" },
        { id: "C", text: "habrigo" },
        { id: "D", text: "extraño" }
      ],
      correctAnswer: "C" // habrigo (correcto: abrigo)
    },
    {
      id: 8,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "hacha" },
        { id: "B", text: "oler" },
        { id: "C", text: "polbo" },
        { id: "D", text: "abril" }
      ],
      correctAnswer: "C" // polbo (correcto: polvo)
    },
    {
      id: 9,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "amartillar" },
        { id: "B", text: "desacer" },
        { id: "C", text: "exageración" },
        { id: "D", text: "humildad" }
      ],
      correctAnswer: "B" // desacer (correcto: deshacer)
    },
    {
      id: 10,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "bendige" },
        { id: "B", text: "bifurcación" },
        { id: "C", text: "amarrar" },
        { id: "D", text: "país" }
      ],
      correctAnswer: "A" // bendige (correcto: bendice)
    },
    {
      id: 11,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "horrible" },
        { id: "B", text: "llacimiento" },
        { id: "C", text: "inmóvil" },
        { id: "D", text: "enredar" }
      ],
      correctAnswer: "B" // llacimiento (correcto: yacimiento o nacimiento)
    },
    {
      id: 12,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "zebra" },
        { id: "B", text: "impaciente" },
        { id: "C", text: "alrededor" },
        { id: "D", text: "mayor" }
      ],
      correctAnswer: "A" // zebra (correcto: cebra)
    },
    {
      id: 13,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "hormona" },
        { id: "B", text: "jirafa" },
        { id: "C", text: "desván" },
        { id: "D", text: "enpañar" }
      ],
      correctAnswer: "D" // enpañar (correcto: empañar)
    },
    {
      id: 14,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "abdicar" },
        { id: "B", text: "area" },
        { id: "C", text: "ombligo" },
        { id: "D", text: "extinguir" }
      ],
      correctAnswer: "B" // area (correcto: área)
    },
    {
      id: 15,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "júbilo" },
        { id: "B", text: "lúz" },
        { id: "C", text: "quince" },
        { id: "D", text: "hilera" }
      ],
      correctAnswer: "B" // lúz (correcto: luz)
    },
    {
      id: 16,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "inexorable" },
        { id: "B", text: "coraje" },
        { id: "C", text: "ingerir" },
        { id: "D", text: "hunir" }
      ],
      correctAnswer: "D" // hunir (correcto: unir)
    },
    {
      id: 17,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "aereo" },
        { id: "B", text: "conserje" },
        { id: "C", text: "drástico" },
        { id: "D", text: "ataviar" }
      ],
      correctAnswer: "A" // aereo (correcto: aéreo)
    },
    {
      id: 18,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "grave" },
        { id: "B", text: "abrumar" },
        { id: "C", text: "contración" },
        { id: "D", text: "enmienda" }
      ],
      correctAnswer: "C" // contración (correcto: contracción)
    },
    {
      id: 19,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "hay" },
        { id: "B", text: "gemido" },
        { id: "C", text: "carácter" },
        { id: "D", text: "harpón" }
      ],
      correctAnswer: "D" // harpón (correcto: arpón)
    },
    {
      id: 20,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "embarcar" },
        { id: "B", text: "ambiguo" },
        { id: "C", text: "arroyo" },
        { id: "D", text: "esotérico" }
      ],
      correctAnswer: "D" // adaptado para evitar ambigüedad
    },
    {
      id: 21,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "léntamente" },
        { id: "B", text: "utopía" },
        { id: "C", text: "aprensivo" },
        { id: "D", text: "irascible" }
      ],
      correctAnswer: "A" // léntamente (correcto: lentamente)
    },
    {
      id: 22,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "desahogar" },
        { id: "B", text: "córnea" },
        { id: "C", text: "convenido" },
        { id: "D", text: "azúl" }
      ],
      correctAnswer: "D" // azúl (correcto: azul)
    },
    {
      id: 23,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "próspero" },
        { id: "B", text: "fué" },
        { id: "C", text: "regencia" },
        { id: "D", text: "pelaje" }
      ],
      correctAnswer: "B" // fué (correcto: fue)
    },
    {
      id: 24,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "savia" },
        { id: "B", text: "ciénaga" },
        { id: "C", text: "andamiage" },
        { id: "D", text: "inmediatamente" }
      ],
      correctAnswer: "C" // andamiage (correcto: andamiaje)
    },
    {
      id: 25,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "traspié" },
        { id: "B", text: "urón" },
        { id: "C", text: "embellecer" },
        { id: "D", text: "vasija" }
      ],
      correctAnswer: "B" // urón (correcto: hurón)
    },
    {
      id: 26,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "río" },
        { id: "B", text: "barar" },
        { id: "C", text: "hiena" },
        { id: "D", text: "buhardilla" }
      ],
      correctAnswer: "B" // barar (correcto: varar)
    },
    {
      id: 27,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "sátira" },
        { id: "B", text: "crujir" },
        { id: "C", text: "subrayar" },
        { id: "D", text: "extrategia" }
      ],
      correctAnswer: "D" // extrategia (correcto: estrategia)
    },
    {
      id: 28,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "dátil" },
        { id: "B", text: "imágen" },
        { id: "C", text: "geranio" },
        { id: "D", text: "anteojo" }
      ],
      correctAnswer: "B" // imágen (correcto: imagen)
    },
    {
      id: 29,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "incisivo" },
        { id: "B", text: "baya" },
        { id: "C", text: "impío" },
        { id: "D", text: "arnes" }
      ],
      correctAnswer: "D" // arnes (correcto: arnés)
    },
    {
      id: 30,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "jersey" },
        { id: "B", text: "berengena" },
        { id: "C", text: "exhibir" },
        { id: "D", text: "atestar" }
      ],
      correctAnswer: "B" // berengena (correcto: berenjena)
    },
    {
      id: 31,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "versátil" },
        { id: "B", text: "hogaza" },
        { id: "C", text: "vadear" },
        { id: "D", text: "hurraca" }
      ],
      correctAnswer: "D" // hurraca (correcto: urraca)
    },
    {
      id: 32,
      text: "Identifica la palabra mal escrita:",
      options: [
        { id: "A", text: "exacerbar" },
        { id: "B", text: "leído" },
        { id: "C", text: "hayar" },
        { id: "D", text: "hostil" }
      ],
      correctAnswer: "C" // hayar (correcto: hallar)
    }
  ];

  // Manejar la selección de respuestas
  const handleSelectAnswer = (questionId, answerId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  // Navegar a una pregunta específica
  const handleNavigateToQuestion = (questionIndex) => {
    if (questionIndex === 'finish') {
      handleSubmitTest();
    } else {
      setCurrentQuestion(questionIndex);
    }
  };

  // Navegar a la pregunta anterior
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Navegar a la pregunta siguiente
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Enviar el test
  const handleSubmitTest = async () => {
    try {
      stopTimer();
      setTestCompleted(true);

      // Calcular estadísticas
      const answeredQuestions = Object.keys(selectedAnswers).length;
      const totalQuestions = questions.length;
      const unansweredCount = totalQuestions - answeredQuestions;

      // Calcular respuestas correctas
      let correctCount = 0;
      Object.entries(selectedAnswers).forEach(([questionId, selectedOption]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        if (question && question.correctAnswer === selectedOption) {
          correctCount++;
        }
      });

      const incorrectCount = answeredQuestions - correctCount;
      const timeUsed = 10 * 60 - timeRemaining;

      // Preparar datos para la página de resultados
      const resultData = {
        correctCount,
        incorrectCount,
        unansweredCount,
        timeUsed,
        totalQuestions,
        testType: 'ortografia'
      };

      // Guardar resultados en Supabase si hay un paciente seleccionado
      if (patientId) {
        try {
          await TestResultsService.saveTestResult({
             patientId,
             testType: 'ortografia',
             correctCount,
             incorrectCount,
             unansweredCount,
             timeUsed,
             totalQuestions,
             answers: selectedAnswers,
             errores: incorrectCount
           });
        } catch (error) {
          console.error('Error al guardar resultado:', error);
          // Continuar con la navegación aunque falle el guardado
        }
      }

      toast.success(`Test completado. Has respondido ${answeredQuestions} de ${totalQuestions} preguntas. Respuestas correctas: ${correctCount}`);

      // Redirigir a la página de resultados
      navigate('/test/results/ortografia', { state: resultData });
    } catch (error) {
      console.error('Error al finalizar test:', error);
      toast.error('Error al procesar los resultados del test');
    }
  };

  // Calcular el progreso
  const progress = (Object.keys(selectedAnswers).length / questions.length) * 100;

  // Renderizar pregunta actual
  const currentQuestionData = questions[currentQuestion];

  // Determinar si la pregunta actual ha sido respondida
  const isAnswered = selectedAnswers[currentQuestionData.id] !== undefined;

  // Función para obtener el status de respuesta
  const getAnswerStatus = () => {
    if (isAnswered) {
      return "Respondida";
    }
    return "Sin responder";
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            <i className="fas fa-spell-check mr-2 text-green-600"></i>
            Test de Ortografía
          </h1>
          <p className="text-gray-600">Identificación de palabras con errores ortográficos</p>
        </div>
        <div className="text-center">
          <div className="text-xl font-mono font-bold text-red-600">
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Pregunta {currentQuestion + 1} de {questions.length}</h2>
                <p className="text-sm text-gray-600">Ortografía</p>
              </div>
              <div className="text-sm font-medium text-gray-500">
                {getAnswerStatus()}
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-lg font-medium text-gray-800 mb-6">
              {currentQuestionData.text}
            </p>

            <div className="space-y-3">
              {currentQuestionData.options.map(option => (
                <button
                  key={option.id}
                  className={`w-full text-left p-4 rounded-lg border ${
                    selectedAnswers[currentQuestionData.id] === option.id
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectAnswer(currentQuestionData.id, option.id)}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full border mr-3 ${
                      selectedAnswers[currentQuestionData.id] === option.id
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'text-gray-500 border-gray-300'
                    }`}>
                      {option.id}
                    </div>
                    <span className="text-gray-800 font-medium">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              className={`px-4 py-2 rounded-md ${
                currentQuestion === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Anterior
            </button>
            <button
              onClick={currentQuestion < questions.length - 1 ? handleNextQuestion : handleSubmitTest}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {currentQuestion < questions.length - 1 ? 'Siguiente' : 'Finalizar Test'}
            </button>
          </div>
        </div>
        </div>

        {/* Panel de navegación - lado derecho */}
        <div>
          <div className="bg-white rounded-lg shadow border border-gray-200 sticky top-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-md font-medium">Navegación</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    className={`w-8 h-8 rounded-full font-medium text-sm ${
                      currentQuestion === index
                        ? 'bg-blue-500 text-white'
                        : selectedAnswers[questions[index].id] !== undefined
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
                  <span>{Object.keys(selectedAnswers).length} de {questions.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(Object.keys(selectedAnswers).length / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-6">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                  <h3 className="text-sm font-medium text-blue-700 mb-1">Información</h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Tiempo restante: <span className="font-medium">{formatTime(timeRemaining)}</span>
                  </p>
                  <p className="text-xs text-gray-600">
                    Recuerda que al responder una pregunta, puedes cambiar tu respuesta antes de finalizar el test.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSubmitTest}
                className="w-full mt-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Finalizar Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ortografia;