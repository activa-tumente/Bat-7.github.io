import React from 'react';
import { FaCheck, FaFlag, FaClock } from 'react-icons/fa';

/**
 * Componente de barra de progreso para cuestionarios
 * Muestra el progreso general y permite navegación rápida entre preguntas
 */
const ProgressBar = ({ 
  progress, 
  currentQuestion, 
  totalQuestions, 
  onQuestionClick,
  answers = {},
  questions = [],
  flaggedQuestions = [],
  showQuestionNumbers = true,
  compact = false
}) => {
  
  const getQuestionStatus = (questionIndex) => {
    const question = questions[questionIndex];
    if (!question) return 'unanswered';
    
    const isAnswered = answers[question.id] !== undefined && answers[question.id] !== '';
    const isFlagged = flaggedQuestions.includes(question.id);
    const isCurrent = questionIndex === currentQuestion - 1;
    
    if (isCurrent) return 'current';
    if (isAnswered) return 'answered';
    if (isFlagged) return 'flagged';
    return 'unanswered';
  };

  const getStatusColor = (status) => {
    const colors = {
      current: 'bg-blue-500 text-white border-blue-500',
      answered: 'bg-green-500 text-white border-green-500',
      flagged: 'bg-yellow-500 text-white border-yellow-500',
      unanswered: 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
    };
    return colors[status] || colors.unanswered;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'answered':
        return <FaCheck className="h-3 w-3" />;
      case 'flagged':
        return <FaFlag className="h-3 w-3" />;
      case 'current':
        return <FaClock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progreso</span>
          <span>{Math.round(progress)}% completado</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span>Pregunta {currentQuestion} de {totalQuestions}</span>
          <span>{Object.keys(answers).length} respondidas</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Barra de progreso principal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="font-medium">Progreso general</span>
          <span className="font-medium">{Math.round(progress)}% completado</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Pregunta {currentQuestion} de {totalQuestions}</span>
          <span>{Object.keys(answers).length} de {totalQuestions} respondidas</span>
        </div>
      </div>

      {/* Navegación por preguntas */}
      {showQuestionNumbers && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Navegación rápida</h4>
            
            {/* Leyenda */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Respondida</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Actual</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Marcada</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>Pendiente</span>
              </div>
            </div>
          </div>
          
          {/* Grid de preguntas */}
          <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 gap-2">
            {Array.from({ length: totalQuestions }, (_, index) => {
              const questionNumber = index + 1;
              const status = getQuestionStatus(index);
              const statusColor = getStatusColor(status);
              const statusIcon = getStatusIcon(status);
              
              return (
                <button
                  key={questionNumber}
                  onClick={() => onQuestionClick && onQuestionClick(index)}
                  className={`
                    relative w-8 h-8 rounded-lg border-2 text-xs font-medium transition-all duration-200 
                    flex items-center justify-center
                    ${statusColor}
                    ${onQuestionClick ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}
                    ${status === 'current' ? 'ring-2 ring-blue-300 ring-offset-1' : ''}
                  `}
                  title={`Pregunta ${questionNumber} - ${status === 'answered' ? 'Respondida' : status === 'current' ? 'Actual' : status === 'flagged' ? 'Marcada' : 'Pendiente'}`}
                >
                  {statusIcon || questionNumber}
                  
                  {/* Indicador de pregunta actual */}
                  {status === 'current' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {Object.keys(answers).length}
          </div>
          <div className="text-xs text-gray-500">Respondidas</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-600">
            {flaggedQuestions.length}
          </div>
          <div className="text-xs text-gray-500">Marcadas</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-gray-600">
            {totalQuestions - Object.keys(answers).length}
          </div>
          <div className="text-xs text-gray-500">Pendientes</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
