import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-toastify';
import TestResultsService from '../../services/testResultsService';

const Verbal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(12 * 60); // 12 minutos en segundos
  const [testStarted, setTestStarted] = useState(false);

  // Obtener patientId del state de navegación
  const patientId = location.state?.patientId;

  // Respuestas correctas para las 32 preguntas (en formato numérico)
  const correctAnswers = {
    1: '4', 2: '1', 3: '4', 4: '2', 5: '2',
    6: '1', 7: '3', 8: '2', 9: '3', 10: '4',
    11: '3', 12: '4', 13: '3', 14: '4', 15: '2',
    16: '3', 17: '3', 18: '2', 19: '3', 20: '2',
    21: '3', 22: '3', 23: '4', 24: '3', 25: '2',
    26: '1', 27: '3', 28: '1', 29: '2', 30: '2',
    31: '1', 32: '1'
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

        const verbalQuestions = [
          // Analogías
          {
            id: 1,
            type: 'analogies',
            text: 'Ciudad es a hombre como colmena es a ...',
            options: [
              { id: 'a', text: 'Hormiga' },
              { id: 'b', text: 'Mosquito' },
              { id: 'c', text: 'Araña' },
              { id: 'd', text: 'Abeja' },
            ],
            correctAnswer: 'd'
          },
          {
            id: 2,
            type: 'analogies',
            text: 'Batido es a batir como zumo es a ...',
            options: [
              { id: 'a', text: 'Exprimir' },
              { id: 'b', text: 'Aplastar' },
              { id: 'c', text: 'Machacar' },
              { id: 'd', text: 'Succionar' },
            ],
            correctAnswer: 'a'
          },
          {
            id: 3,
            type: 'analogies',
            text: 'Consejero es a consejo como cantante es a ...',
            options: [
              { id: 'a', text: 'Fama' },
              { id: 'b', text: 'Éxito' },
              { id: 'c', text: 'Composición' },
              { id: 'd', text: 'Canción' },
            ],
            correctAnswer: 'd'
          },
          {
            id: 4,
            type: 'analogies',
            text: 'Estufa es a calor como nevera es a ...',
            options: [
              { id: 'a', text: 'Temperatura' },
              { id: 'b', text: 'Frío' },
              { id: 'c', text: 'Conservación' },
              { id: 'd', text: 'Congelación' },
            ],
            correctAnswer: 'b'
          },
          {
            id: 5,
            type: 'analogies',
            text: 'Martillo es a clavo como destornillador es a ...',
            options: [
              { id: 'a', text: 'Hierro' },
              { id: 'b', text: 'Tornillo' },
              { id: 'c', text: 'Remache' },
              { id: 'd', text: 'Herramienta' },
            ],
            correctAnswer: 'b'
          },
          {
            id: 6,
            type: 'analogies',
            text: 'Asa es a cesta como pomo es a ...',
            options: [
              { id: 'a', text: 'Puerta' },
              { id: 'b', text: 'Tirador' },
              { id: 'c', text: 'Envase' },
              { id: 'd', text: 'Manillar' },
            ],
            correctAnswer: 'a'
          },
          {
            id: 7,
            type: 'analogies',
            text: 'Líquido es a sopa como sólido es a ...',
            options: [
              { id: 'a', text: 'Comer' },
              { id: 'b', text: 'Bebida' },
              { id: 'c', text: 'Plátano' },
              { id: 'd', text: 'Gaseoso' },
            ],
            correctAnswer: 'c'
          },
          {
            id: 8,
            type: 'analogies',
            text: 'Ballena es a acuático como león es a ...',
            options: [
              { id: 'a', text: 'Carnívoro' },
              { id: 'b', text: 'Terrestre' },
              { id: 'c', text: 'Depredador' },
              { id: 'd', text: 'Devorador' },
            ],
            correctAnswer: 'b'
          },
          {
            id: 9,
            type: 'analogies',
            text: 'Restar es a sumar como arreglar es a ...',
            options: [
              { id: 'a', text: 'Incluir' },
              { id: 'b', text: 'Corregir' },
              { id: 'c', text: 'Estropear' },
              { id: 'd', text: 'Resarcir' },
            ],
            correctAnswer: 'c'
          },
          {
            id: 10,
            type: 'analogies',
            text: 'Más es a menos como después es a ...',
            options: [
              { id: 'a', text: 'Tiempo' },
              { id: 'b', text: 'Siguiente' },
              { id: 'c', text: 'Pronto' },
              { id: 'd', text: 'Antes' },
            ],
            correctAnswer: 'd'
          },
          {
            id: 11,
            type: 'analogies',
            text: 'Fémur es a hueso como corazón es a ...',
            options: [
              { id: 'a', text: 'Glándula' },
              { id: 'b', text: 'Vena' },
              { id: 'c', text: 'Músculo' },
              { id: 'd', text: 'Arteria' },
            ],
            correctAnswer: 'c'
          },
          {
            id: 12,
            type: 'analogies',
            text: 'Cuatro es a cinco como cuadrado es a ...',
            options: [
              { id: 'a', text: 'Triángulo' },
              { id: 'b', text: 'Heptágono' },
              { id: 'c', text: 'Hexágono' },
              { id: 'd', text: 'Pentágono' },
            ],
            correctAnswer: 'd'
          },
          {
            id: 13,
            type: 'analogies',
            text: 'Harina es a trigo como cerveza es a ...',
            options: [
              { id: 'a', text: 'Manzana' },
              { id: 'b', text: 'Patata' },
              { id: 'c', text: 'Cebada' },
              { id: 'd', text: 'Alfalfa' },
            ],
            correctAnswer: 'c'
          },
          {
            id: 14,
            type: 'analogies',
            text: 'Pie es a cuerpo como bombilla es a ...',
            options: [
              { id: 'a', text: 'Ojos' },
              { id: 'b', text: 'Luz' },
              { id: 'c', text: 'Vela' },
              { id: 'd', text: 'Lámpara' },
            ],
            correctAnswer: 'd'
          },
          {
            id: 15,
            type: 'analogies',
            text: 'Excavar es a cavidad como alinear es a ...',
            options: [
              { id: 'a', text: 'Seguido' },
              { id: 'b', text: 'Recta' },
              { id: 'c', text: 'Acodo' },
              { id: 'd', text: 'Ensamblar' },
            ],
            correctAnswer: 'b'
          },
          {
            id: 16,
            type: 'analogies',
            text: 'Harina es a pan como leche es a ...',
            options: [
              { id: 'a', text: 'Vaca' },
              { id: 'b', text: 'Trigo' },
              { id: 'c', text: 'Yogur' },
              { id: 'd', text: 'Agua' },
            ],
            correctAnswer: 'c'
          },
          {
            id: 17,
            type: 'analogies',
            text: 'Círculo es a cuadrado como esfera es a ...',
            options: [
              { id: 'a', text: 'Cuadrilátero' },
              { id: 'b', text: 'Rombo' },
              { id: 'c', text: 'Cubo' },
              { id: 'd', text: 'Circunferencia' },
            ],
            correctAnswer: 'c'
          },
          {
            id: 18,
            type: 'analogies',
            text: 'Bicicleta es a avión como metal es a ...',
            options: [
              { id: 'a', text: 'Solidez' },
              { id: 'b', text: 'Madera' },
              { id: 'c', text: 'Velocidad' },
              { id: 'd', text: 'Fragmento' },
            ],
            correctAnswer: 'b'
          },
          {
            id: 19,
            type: 'analogies',
            text: 'Doctora es a doctor como amazona es a ...',
            options: [
              { id: 'a', text: 'Piloto' },
              { id: 'b', text: 'Modisto' },
              { id: 'c', text: 'Jinete' },
              { id: 'd', text: 'Bailarín' },
            ],
            correctAnswer: 'c'
          },
          {
            id: 20,
            type: 'analogies',
            text: 'Escultor es a estudio como actor es a ...',
            options: [
              { id: 'a', text: 'Arte' },
              { id: 'b', text: 'Escenario' },
              { id: 'c', text: 'Drama' },
              { id: 'd', text: 'Literatura' },
            ],
            correctAnswer: 'b'
          },
          {
            id: 21,
            type: 'analogies',
            text: 'Perder es a ganar como reposo es a ...',
            options: [
              { id: 'a', text: 'Ganancia' },
              { id: 'b', text: 'Descanso' },
              { id: 'c', text: 'Actividad' },
              { id: 'd', text: 'Calma' },
            ],
            correctAnswer: 'c'
          },
          {
            id: 22,
            type: 'analogies',
            text: 'Encubierto es a clandestino como endeble es a ...',
            options: [
              { id: 'a', text: 'Doblado' },
              { id: 'b', text: 'Simple' },
              { id: 'c', text: 'Delicado' },
              { id: 'd', text: 'Comprimido' },
            ],
            correctAnswer: 'c'
          },
          {
            id: 23,
            type: 'analogies',
            text: 'Apocado es a tímido como arrogante es a ...',
            options: [
              { id: 'a', text: 'Listo' },
              { id: 'b', text: 'Humilde' },
              { id: 'c', text: 'Virtuoso' },
              { id: 'd', text: 'Soberbio' },
            ],
            correctAnswer: 'd'
          },
          {
            id: 24,
            type: 'analogies',
            text: 'Rodillo es a masa como torno es a ...',
            options: [
              { id: 'a', text: 'Escayola' },
              { id: 'b', text: 'Goma' },
              { id: 'c', text: 'Arcilla' },
              { id: 'd', text: 'Pintura' },
            ],
            correctAnswer: 'c'
          },
          {
            id: 25,
            type: 'analogies',
            text: 'Hora es a tiempo como litro es a ...',
            options: [
              { id: 'a', text: 'Peso' },
              { id: 'b', text: 'Capacidad' },
              { id: 'c', text: 'Balanza' },
              { id: 'd', text: 'Cantidad' },
            ],
            correctAnswer: 'b'
          },
          {
            id: 26,
            type: 'analogies',
            text: 'Indefenso es a desvalido como enlazado es a ...',
            options: [
              { id: 'a', text: 'Conexo' },
              { id: 'b', text: 'Recorrido' },
              { id: 'c', text: 'Torcido' },
              { id: 'd', text: 'Explorado' },
            ],
            correctAnswer: 'a'
          },
          {
            id: 27,
            type: 'analogies',
            text: 'Reparar es a enmendar como mantener es a ...',
            options: [
              { id: 'a', text: 'Moderar' },
              { id: 'b', text: 'Presumir' },
              { id: 'c', text: 'Proseguir' },
              { id: 'd', text: 'Ayunar' },
            ],
            correctAnswer: 'c'
          },
          {
            id: 28,
            type: 'analogies',
            text: 'Adelantar es a demorar como anticipar es a ...',
            options: [
              { id: 'a', text: 'Aplazar' },
              { id: 'b', text: 'Desistir' },
              { id: 'c', text: 'Proveer' },
              { id: 'd', text: 'Achacar' },
            ],
            correctAnswer: 'a'
          },
          {
            id: 29,
            type: 'analogies',
            text: 'Infinito es a inagotable como vasto es a ...',
            options: [
              { id: 'a', text: 'Expedito' },
              { id: 'b', text: 'Colosal' },
              { id: 'c', text: 'Demorado' },
              { id: 'd', text: 'Confuso' },
            ],
            correctAnswer: 'b'
          },
          {
            id: 30,
            type: 'analogies',
            text: 'Amenazar es a intimidar como articular es a ...',
            options: [
              { id: 'a', text: 'Legislar' },
              { id: 'b', text: 'Pronunciar' },
              { id: 'c', text: 'Afirmar' },
              { id: 'd', text: 'Arquear' },
            ],
            correctAnswer: 'b'
          },
          {
            id: 31,
            type: 'analogies',
            text: 'Agua es a embudo como tierra es a ...',
            options: [
              { id: 'a', text: 'Criba' },
              { id: 'b', text: 'Fresadora' },
              { id: 'c', text: 'Cincel' },
              { id: 'd', text: 'Escariador' },
            ],
            correctAnswer: 'a'
          },
          {
            id: 32,
            type: 'analogies',
            text: 'Prender es a extinguir como juntar es a ...',
            options: [
              { id: 'a', text: 'Separar' },
              { id: 'b', text: 'Unir' },
              { id: 'c', text: 'Apagar' },
              { id: 'd', text: 'Reducir' },
            ],
            correctAnswer: 'a'
          },
        ];

        setQuestions(verbalQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar preguntas:', error);
        toast.error('Error al cargar las preguntas del test');
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleFinishTest = useCallback(async () => {
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

      // Calcular tiempo utilizado (12 minutos - tiempo restante)
      const timeUsed = (12 * 60) - timeLeft;

      // Preparar datos para la página de resultados
      const resultData = {
        correctCount,
        incorrectCount,
        unansweredCount,
        timeUsed,
        totalQuestions,
        testType: 'verbal'
      };

      // Guardar en Supabase si hay un paciente seleccionado
      if (patientId) {
        console.log('🔍 Intentando guardar resultado para paciente:', patientId);
        try {
          await TestResultsService.saveTestResult({
            patientId,
            testType: 'verbal',
            correctCount,
            incorrectCount,
            unansweredCount,
            timeUsed,
            totalQuestions,
            answers,
            errores: incorrectCount
          });
          console.log('✅ Resultado guardado exitosamente en Verbal.jsx');
          toast.success('Resultado guardado correctamente');
        } catch (error) {
          console.error('❌ Error al guardar resultado en Verbal.jsx:', {
            message: error.message,
            stack: error.stack,
            error: error
          });
          toast.error(`Error al guardar: ${error.message}`);
          // Continuar con la navegación aunque falle el guardado
        }
      } else {
        console.warn('⚠️ No hay patientId, no se guardará el resultado');
      }

      toast.success(`Test completado. Has respondido ${answeredQuestions} de ${totalQuestions} preguntas. Respuestas correctas: ${correctCount}`);

      // Redirigir a la página de resultados con los datos
      navigate('/test/results/verbal', { state: resultData });

    } catch (error) {
      console.error('Error al finalizar test:', error);
      toast.error('Error al procesar los resultados del test');
    }
  }, [answers, questions.length, timeLeft, navigate, patientId]);

  // Temporizador
  useEffect(() => {
    if (!testStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Llamar handleFinishTest cuando el tiempo se agote
          setTimeout(() => handleFinishTest(), 0);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, timeLeft, handleFinishTest]);

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'analogies': return 'Analogías';
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
            <i className="fas fa-comments mr-2 text-blue-600"></i>
            Test de Aptitud Verbal
          </h1>
          <p className="text-gray-600">Evaluación de analogías verbales y comprensión de relaciones entre conceptos</p>
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
            <p className="text-gray-500">Cargando test de razonamiento verbal...</p>
          </div>
        </div>
      ) : !testStarted ? (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-800">Razonamiento Verbal: Instrucciones</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">¿Qué es el Razonamiento Verbal?</h3>
                <p className="text-gray-600 mb-2">
                  El razonamiento verbal es la capacidad para comprender y establecer relaciones lógicas entre conceptos expresados mediante palabras. Implica entender analogías, relaciones semánticas y encontrar patrones en expresiones verbales.
                </p>
                <p className="text-gray-600">
                  Esta habilidad es fundamental en el ámbito académico y profesional, siendo especialmente relevante para carreras que requieren pensamiento lógico y analítico.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Instrucciones del Test</h3>
                <p className="text-gray-600 mb-3">
                  A continuación encontrarás frases a las que les falta una palabra que ha sido sustituida por puntos suspensivos. Tu tarea consistirá en descubrir qué palabra falta para que la frase resulte verdadera y con sentido.
                </p>
                <p className="text-gray-600 mb-3">
                  En cada ejercicio se proponen cuatro palabras u opciones de respuesta posibles. Entre las cuatro palabras solamente UNA es la opción correcta, la que completa mejor la frase dotándola de sentido.
                </p>
                <p className="text-gray-600">
                  Las frases tienen la siguiente estructura: "A es a B como C es a D". Deberás identificar la relación entre A y B, y aplicar la misma relación entre C y la palabra que falta (D).
                </p>
              </div>

              <div className="bg-slate-200 p-4 rounded-lg border border-slate-300">
                <h3 className="text-lg font-medium text-orange-700 mb-2">Ejemplos</h3>

                <div className="mb-6">
                  <p className="text-gray-600 mb-3">
                    <strong className="text-blue-600">Ejemplo 1:</strong> <strong>Alto es a bajo como grande es a ...</strong>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="bg-white p-3 rounded border border-gray-200">A. Visible</div>
                    <div className="bg-white p-3 rounded border border-gray-200">B. Gordo</div>
                    <div className="bg-lime-100 p-3 rounded border border-lime-300 font-medium">C. Pequeño</div>
                    <div className="bg-white p-3 rounded border border-gray-200">D. Poco</div>
                  </div>
                  <p className="text-gray-600 mt-3">
                    La respuesta correcta es <strong>C. Pequeño</strong>, porque grande y pequeño se relacionan de la misma forma que alto y bajo: son opuestos.
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 mb-3">
                    <strong className="text-blue-600">Ejemplo 2:</strong> <strong>...?... es a estrella como tierra es a planeta.</strong>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="bg-white p-3 rounded border border-gray-200">A. Luz</div>
                    <div className="bg-white p-3 rounded border border-gray-200">B. Calor</div>
                    <div className="bg-white p-3 rounded border border-gray-200">C. Noche</div>
                    <div className="bg-lime-100 p-3 rounded border border-lime-300 font-medium">D. Sol</div>
                  </div>
                  <p className="text-gray-600 mt-3">
                    La respuesta correcta es <strong>D. Sol</strong>, porque sol y estrella guardan entre sí la misma relación que tierra y planeta: el Sol es una estrella y la Tierra es un planeta. Fíjate igualmente en que cualquiera de las otras opciones no sería correcta; por ejemplo, en la opción B, es cierto que las estrellas producen calor, pero no tiene sentido la misma relación en las dos últimas palabras ("planeta" no produce "tierra").
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Detalles del Test</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>El test consta de 32 preguntas de analogías verbales.</li>
                  <li>Dispondrás de <span className="font-medium">12 minutos</span> para completar todas las preguntas.</li>
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
                      <div className="text-gray-800 mb-6 whitespace-pre-line font-medium">{currentQuestionData.text}</div>
                      <div className="space-y-3">
                        {currentQuestionData.options.map((option) => (
                          <div
                            key={option.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                              answers[currentQuestionData.id] === option.id && option.id === currentQuestionData.correctAnswer
                                ? 'bg-green-100 border-green-500'
                                : answers[currentQuestionData.id] === option.id
                                  ? 'bg-blue-50 border-blue-500'
                                  : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleSelectOption(currentQuestionData.id, option.id)}
                          >
                            <div className="flex items-center">
                              <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                                answers[currentQuestionData.id] === option.id
                                  ? 'bg-blue-500 text-white'
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
                  <div className="grid grid-cols-4 gap-2">
                    {questions.map((question, index) => (
                      <button
                        key={question.id}
                        className={`w-8 h-8 rounded-full font-medium text-sm ${
                          currentQuestion === index
                            ? 'bg-blue-500 text-white'
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
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                      <h3 className="text-sm font-medium text-blue-700 mb-1">Información</h3>
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
      )}
    </div>
  );
};

export default Verbal;