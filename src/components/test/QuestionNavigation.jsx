import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente que muestra una navegación de preguntas por números
 * @param {number} currentQuestion - Índice de la pregunta actual (empezando desde 0)
 * @param {number} totalQuestions - Número total de preguntas
 * @param {object} answeredQuestions - Objeto con las preguntas respondidas {id: respuesta}
 * @param {function} onNavigate - Función a ejecutar cuando se selecciona una pregunta
 */
const QuestionNavigation = ({ 
  currentQuestion, 
  totalQuestions, 
  answeredQuestions, 
  onNavigate,
  progress,
  timeRemaining,
  formatTime
}) => {
  // Crear un array con los números de preguntas
  const questionNumbers = Array.from({ length: totalQuestions }, (_, i) => i + 1);
  
  // Calcular el número de preguntas respondidas
  const answeredCount = Object.keys(answeredQuestions).length;
  
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-800 pb-3 border-b border-gray-200 mb-4">Navegación</h3>
      
      <div className="grid grid-cols-4 gap-2 mb-6">
        {questionNumbers.map(number => {
          // Determinar si la pregunta ha sido respondida
          const isAnswered = answeredQuestions[number] !== undefined;
          // Determinar si es la pregunta actual
          const isActive = currentQuestion === number - 1;
          
          return (
            <button
              key={number}
              className={`w-full h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-500 text-white' 
                  : isAnswered 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => onNavigate(number - 1)}
            >
              {number}
            </button>
          );
        })}
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progreso</span>
          <span>{answeredCount} de {totalQuestions}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full" 
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <h4 className="text-blue-700 font-medium mb-1">Información</h4>
        <p className="text-sm text-gray-700 mb-2">Tiempo restante: {formatTime(timeRemaining)}</p>
        <p className="text-xs text-gray-600">
          Recuerda que al responder una pregunta, puedes cambiar tu respuesta antes de finalizar el test.
        </p>
      </div>
      
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors"
        onClick={() => onNavigate('finish')}
      >
        Finalizar Test
      </button>
    </div>
  );
};

QuestionNavigation.propTypes = {
  currentQuestion: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  answeredQuestions: PropTypes.object.isRequired,
  onNavigate: PropTypes.func.isRequired,
  progress: PropTypes.number,
  timeRemaining: PropTypes.number.isRequired,
  formatTime: PropTypes.func.isRequired
};

export default QuestionNavigation;