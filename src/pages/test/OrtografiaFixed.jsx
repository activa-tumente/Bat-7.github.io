import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OrtografiaFixed = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(10 * 60); // 10 minutos

  // Preguntas de ejemplo
  const questions = [
    {
      id: 1,
      text: "¿Cuál de las siguientes palabras está escrita correctamente?",
      options: [
        { id: 'A', text: 'Exelente' },
        { id: 'B', text: 'Excelente' },
        { id: 'C', text: 'Ecelente' },
        { id: 'D', text: 'Excellente' }
      ],
      correct: 'B'
    },
    {
      id: 2,
      text: "¿Cuál de las siguientes palabras está escrita correctamente?",
      options: [
        { id: 'A', text: 'Haber' },
        { id: 'B', text: 'Haver' },
        { id: 'C', text: 'Avér' },
        { id: 'D', text: 'Havér' }
      ],
      correct: 'A'
    }
  ];

  const currentQuestionData = questions[currentQuestion];

  // Timer
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleSubmitTest();
    }
  }, [timeRemaining]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (questionId, answerId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitTest = () => {
    console.log('Test enviado:', selectedAnswers);
    navigate('/student/tests');
  };

  const isAnswered = selectedAnswers[currentQuestionData.id] !== undefined;

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            <i className="fas fa-spell-check mr-2 text-green-600"></i>
            Test de Ortografía
          </h1>
          <p className="text-gray-600">Identificación de palabras con errores ortográficos</p>
        </div>
        <div className="text-xl font-mono font-bold text-red-600">
          {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Pregunta {currentQuestion + 1} de {questions.length}
                  </h2>
                  <p className="text-sm text-gray-600">Ortografía</p>
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {isAnswered ? 'Respondida' : 'Sin responder'}
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

export default OrtografiaFixed;
