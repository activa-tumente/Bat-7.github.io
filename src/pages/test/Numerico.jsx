import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { numericoQuestions } from './data/numericoQuestions';
import TextoTachado from '../../components/test/TextoTachado';
import TestResultsService from '../../services/testResultsService';

const Numerico = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutos en segundos
  const [isCompleted, setIsCompleted] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  // Obtener patientId del state de navegación
  const patientId = location.state?.patientId;
  const allQuestions = numericoQuestions;

  // Enviar test
  const handleSubmit = useCallback(async () => {
    try {
      const answeredQuestions = Object.keys(answers).length;
      const totalQuestions = allQuestions.length;
      const unansweredCount = totalQuestions - answeredQuestions;

      // Calcular respuestas correctas
      let correctCount = 0;
      Object.entries(answers).forEach(([questionId, answerIndex]) => {
        const question = allQuestions.find(q => q.id.toString() === questionId);
        if (question && parseInt(answerIndex) === question.correct) {
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
        testType: 'numerico'
      };

      // Guardar en Supabase si hay un paciente seleccionado
      if (patientId) {
        try {
          await TestResultsService.saveTestResult({
            patientId,
            testType: 'numerico',
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
      navigate('/test/results/numerico', { state: resultData });

    } catch (error) {
      console.error('Error al finalizar test:', error);
      toast.error('Error al procesar los resultados del test');
    }
  }, [answers, allQuestions, timeLeft, navigate, patientId]);

  // Timer effect
  useEffect(() => {
    if (testStarted && timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      // Llamar handleSubmit cuando el tiempo se agote
      setTimeout(() => handleSubmit(), 0);
    }
  }, [timeLeft, isCompleted, testStarted, handleSubmit]);

  // Formatear tiempo
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Manejar selección de respuesta
  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  // Navegar entre preguntas
  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const handleStartTest = () => {
    setTestStarted(true);
  };

  // Calcular puntuación
  const calculateScore = () => {
    let correct = 0;
    allQuestions.forEach(q => {
      if (answers[q.id] === q.correct) {
        correct++;
      }
    });
    return { correct, total: allQuestions.length };
  };



  const currentQ = allQuestions[currentQuestion];

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            <i className="fas fa-calculator mr-2 text-teal-600"></i>
            Test de Aptitud Numérica
          </h1>
          <p className="text-gray-600">Resolución de igualdades, series numéricas y análisis de tablas de datos</p>
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
            <h2 className="text-xl font-semibold text-gray-800">Aptitud Numérica: Instrucciones</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">Instrucciones</h3>
                <p className="text-gray-600 mb-4">
                  En esta prueba encontrarás distintos ejercicios numéricos que tendrás que resolver. Para ello tendrás que analizar la información que se presenta y determinar qué debe aparecer en lugar del interrogante. Cuando lo hayas decidido, deberás marcar la letra de la opción correspondiente (A, B, C, D o E), asegurándote de que coincida con el ejercicio que estás contestando. Ten en cuenta que en este ejercicio hay 5 posibles opciones de respuesta.
                </p>
              </div>

              {/* Tipo 1: Igualdades Numéricas */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-blue-800 mb-3">Tipo 1: Igualdades Numéricas</h4>
                <p className="text-gray-700 mb-4">
                  En un primer tipo de ejercicios aparecerá una igualdad numérica en la que se ha sustituido uno de los elementos por un interrogante (?). Tu tarea consistirá en averiguar qué valor numérico debe aparecer en lugar del interrogante para que se cumpla la igualdad.
                </p>

                <div className="bg-white border border-gray-300 rounded p-4 mb-3">
                  <h5 className="font-medium text-gray-800 mb-2">Ejemplo N1: ¿Qué número debe aparecer en lugar del interrogante (?) para que se cumpla la igualdad?</h5>
                  <div className="bg-gray-100 p-3 rounded text-center mb-3">
                    <span className="text-xl font-mono">16 - 4 = ? + 2</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    <div className="bg-gray-100 p-2 rounded text-center">A. 8</div>
                    <div className="bg-green-100 border-2 border-green-500 p-2 rounded text-center font-medium">B. 10</div>
                    <div className="bg-gray-100 p-2 rounded text-center">C. 12</div>
                    <div className="bg-gray-100 p-2 rounded text-center">D. 14</div>
                    <div className="bg-gray-100 p-2 rounded text-center">E. 16</div>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Solución:</strong> La primera parte de la igualdad, 16 – 4, da lugar a 12. Para que en la segunda parte se obtenga el mismo resultado sería necesario sustituir el interrogante por 10, quedando la igualdad como 16 – 4 = 10 + 2. Por tanto, la respuesta correcta es <strong>B</strong>.
                  </p>
                </div>
              </div>

              {/* Tipo 2: Series Numéricas */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-green-800 mb-3">Tipo 2: Series Numéricas</h4>
                <p className="text-gray-700 mb-4">
                  En otros ejercicios tendrás que observar una serie de números ordenados de acuerdo con una ley y determinar cuál debe continuar la serie ocupando el lugar del interrogante.
                </p>

                <div className="bg-white border border-gray-300 rounded p-4 mb-3">
                  <h5 className="font-medium text-gray-800 mb-2">Ejemplo N2: ¿Qué número debe aparecer en lugar del interrogante (?) de modo que continúe la serie?</h5>
                  <div className="bg-gray-100 p-3 rounded text-center mb-3">
                    <span className="text-xl font-mono">3 • 5 • 6 • 8 • 9 • 11 • 12 • 14 • ?</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    <div className="bg-gray-100 p-2 rounded text-center">A. 13</div>
                    <div className="bg-green-100 border-2 border-green-500 p-2 rounded text-center font-medium">B. 15</div>
                    <div className="bg-gray-100 p-2 rounded text-center">C. 16</div>
                    <div className="bg-gray-100 p-2 rounded text-center">D. 18</div>
                    <div className="bg-gray-100 p-2 rounded text-center">E. 20</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded mb-3">
                    <div className="text-center text-sm font-mono">
                      3 → 5 → 6 → 8 → 9 → 11 → 12 → 14 → ?<br/>
                      <span className="text-blue-600">+2 +1 +2 +1 +2 +1 +2 +1</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Solución:</strong> En este ejemplo la serie combina aumentos de 2 unidades y de 1 unidad (+2, +1, +2, +1...). Como puede observarse, en el lugar del interrogante debe aumentarse 1 unidad con respecto al número anterior, por lo que el número que continuaría la serie sería el 15. Por tanto, la respuesta correcta es <strong>B</strong>.
                  </p>
                </div>
              </div>

              {/* Tipo 3: Tablas de Datos */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-purple-800 mb-3">Tipo 3: Tablas de Datos</h4>
                <p className="text-gray-700 mb-4">
                  Finalmente, en un tercer tipo de ejercicios, aparecen tablas en las que un valor se ha sustituido intencionadamente por un interrogante (?) y otros valores han sido borrados (&lt;&lt;&gt;&gt;). Tu tarea consistirá en averiguar el número que debería aparecer en lugar del interrogante.
                </p>

                <div className="bg-white border border-gray-300 rounded p-4 mb-3">
                  <h5 className="font-medium text-gray-800 mb-2">Ejemplo N3: De acuerdo con los datos de la tabla, ¿qué número debe aparecer en lugar del interrogante (?)?</h5>

                  <div className="mb-4">
                    <h6 className="text-center font-medium mb-3">Puntos obtenidos en la compra</h6>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-3 py-2 text-left">Artículo</th>
                            <th className="border border-gray-300 px-3 py-2 text-center">Unidades</th>
                            <th className="border border-gray-300 px-3 py-2 text-center">Puntos/Unidad</th>
                            <th className="border border-gray-300 px-3 py-2 text-center">Total puntos</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 px-3 py-2">Jabón</td>
                            <td className="border border-gray-300 px-3 py-2 text-center">10</td>
                            <td className="border border-gray-300 px-3 py-2 text-center font-bold text-red-600">?</td>
                            <td className="border border-gray-300 px-3 py-2 text-center">30</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 px-3 py-2">Aceite</td>
                            <td className="border border-gray-300 px-3 py-2 text-center">20</td>
                            <td className="border border-gray-300 px-3 py-2 text-center">2</td>
                            <td className="border border-gray-300 px-3 py-2 text-center"><span className="line-through">40</span></td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-3 py-2 font-bold" colSpan="3">Total</td>
                            <td className="border border-gray-300 px-3 py-2 text-center font-bold">70</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2 mb-3">
                    <div className="bg-green-100 border-2 border-green-500 p-2 rounded text-center font-medium">A. 3</div>
                    <div className="bg-gray-100 p-2 rounded text-center">B. 5</div>
                    <div className="bg-gray-100 p-2 rounded text-center">C. 10</div>
                    <div className="bg-gray-100 p-2 rounded text-center">D. 40</div>
                    <div className="bg-gray-100 p-2 rounded text-center">E. 60</div>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Solución:</strong> A partir de los datos de la tabla sabemos que se han comprado 10 unidades de jabón y que se han obtenido 30 puntos, por lo que se puede deducir que el valor del interrogante es igual a 3 (10 unidades × 3 puntos/unidad = 30 puntos). Por tanto, la respuesta correcta es <strong>A</strong>. Fíjate que en este ejemplo no es necesario calcular el valor que ha sido borrado para obtener el valor del interrogante, pero en otros ejercicios sí será necesario calcular todos o algunos de estos valores para alcanzar la solución.
                  </p>
                </div>
              </div>

              {/* Instrucciones Finales */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">Instrucciones para el Test</h4>
                <p className="text-gray-700 mb-4">
                  Cuando comience la prueba encontrarás más ejercicios como estos. El tiempo máximo para su realización es de <strong>20 minutos</strong>, por lo que deberás trabajar rápidamente, esforzándote al máximo en encontrar la respuesta correcta.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-4">
                  <li>Si en algún ejercicio no estás completamente seguro de cuál puede ser, elige la opción que creas que es más correcta de las cinco que aparecen.</li>
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
                  Pregunta {currentQuestion + 1} de {allQuestions.length}
                </h2>
                <p className="text-sm text-gray-500">
                  {currentQ.type === 'equality' ? 'Igualdades Numéricas' :
                   currentQ.type === 'series' ? 'Series Numéricas' : 'Tablas de Datos'}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {answers[currentQ.id] !== undefined ? 'Respondida' : 'Sin responder'}
              </div>
            </CardHeader>
            <CardBody>
              {/* Pregunta */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 mb-4">
                  {currentQ.type === 'equality' && '¿Qué número debe aparecer en lugar del interrogante (?) para que se cumpla la igualdad?'}
                  {currentQ.type === 'series' && '¿Qué número debe aparecer en lugar del interrogante (?) de modo que continúe la serie?'}
                  {currentQ.type === 'table' && '¿Qué número debe aparecer en lugar del interrogante (?) a partir de los datos de la tabla?'}
                </h4>

                {currentQ.type === 'table' ? (
                  <div>
                    <h5 className="font-medium mb-3">{currentQ.question}</h5>
                    <div className="overflow-x-auto mb-4">
                      <table className="min-w-full border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            {currentQ.tableData.headers.map((header, index) => (
                              <th key={index} className="border border-gray-300 px-3 py-2 text-center font-medium">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {currentQ.tableData.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="border border-gray-300 px-3 py-2 text-center">
                                  {cell === '(dato borrado)' ? <TextoTachado /> : cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-gray-700 mb-4">{currentQ.questionText}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <span className="text-xl font-mono">{currentQ.question}</span>
                  </div>
                )}
              </div>

              {/* Opciones de respuesta */}
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      answers[currentQ.id] === index
                        ? 'bg-blue-50 border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleAnswerSelect(currentQ.id, index)}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                        answers[currentQ.id] === index
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="text-gray-700">{option}</div>
                    </div>
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
              {currentQuestion < allQuestions.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={() => goToQuestion(Math.min(allQuestions.length - 1, currentQuestion + 1))}
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
                {allQuestions.map((_, index) => (
                  <button
                    key={index}
                    className={`w-8 h-8 rounded-full font-medium text-sm ${
                      currentQuestion === index
                        ? 'bg-blue-500 text-white'
                        : answers[allQuestions[index].id] !== undefined
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
                  <span>{Object.keys(answers).length} de {allQuestions.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(Object.keys(answers).length / allQuestions.length) * 100}%` }}
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

export default Numerico;