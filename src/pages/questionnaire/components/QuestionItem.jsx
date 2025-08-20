import React from 'react';
import { FaFlag, FaRegFlag } from 'react-icons/fa';

/**
 * Componente para renderizar una pregunta individual
 * Soporta diferentes tipos de preguntas: multiple-choice, text, boolean
 */
const QuestionItem = ({ 
  question, 
  answer, 
  onAnswerChange, 
  questionNumber,
  showCorrectAnswer = false,
  isReview = false 
}) => {
  const handleOptionChange = (optionId) => {
    onAnswerChange(question.id, optionId);
  };

  const handleTextChange = (event) => {
    onAnswerChange(question.id, event.target.value);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      easy: 'Fácil',
      medium: 'Intermedio',
      hard: 'Difícil'
    };
    return labels[difficulty] || 'Sin clasificar';
  };

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {question.options.map((option) => {
        const isSelected = answer === option.id;
        const isCorrect = showCorrectAnswer && option.id === question.correctAnswer;
        const isWrong = showCorrectAnswer && isSelected && option.id !== question.correctAnswer;
        
        let optionClasses = `
          relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
          ${isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }
          ${isCorrect ? 'border-green-500 bg-green-50' : ''}
          ${isWrong ? 'border-red-500 bg-red-50' : ''}
          ${isReview ? 'cursor-default' : ''}
        `;

        return (
          <label key={option.id} className={optionClasses}>
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.id}
              checked={isSelected}
              onChange={() => !isReview && handleOptionChange(option.id)}
              className="sr-only"
              disabled={isReview}
            />
            
            <div className={`
              flex-shrink-0 w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center
              ${isSelected 
                ? 'border-blue-500 bg-blue-500' 
                : 'border-gray-300'
              }
              ${isCorrect ? 'border-green-500 bg-green-500' : ''}
              ${isWrong ? 'border-red-500 bg-red-500' : ''}
            `}>
              {(isSelected || isCorrect) && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </div>
            
            <div className="flex-1">
              <span className={`
                text-sm font-medium
                ${isSelected ? 'text-blue-900' : 'text-gray-900'}
                ${isCorrect ? 'text-green-900' : ''}
                ${isWrong ? 'text-red-900' : ''}
              `}>
                {option.text}
              </span>
            </div>
            
            {showCorrectAnswer && isCorrect && (
              <div className="flex-shrink-0 ml-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Correcta
                </span>
              </div>
            )}
            
            {showCorrectAnswer && isWrong && (
              <div className="flex-shrink-0 ml-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Incorrecta
                </span>
              </div>
            )}
          </label>
        );
      })}
    </div>
  );

  const renderTextInput = () => (
    <div className="space-y-4">
      <textarea
        value={answer || ''}
        onChange={handleTextChange}
        placeholder={question.placeholder || 'Escriba su respuesta aquí...'}
        disabled={isReview}
        className={`
          w-full p-4 border-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${isReview 
            ? 'bg-gray-50 border-gray-200 cursor-default' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        rows={6}
      />
      
      {answer && (
        <div className="text-sm text-gray-500">
          Caracteres: {answer.length}
        </div>
      )}
    </div>
  );

  const renderBooleanChoice = () => (
    <div className="space-y-3">
      {[
        { id: 'true', text: 'Verdadero' },
        { id: 'false', text: 'Falso' }
      ].map((option) => {
        const isSelected = answer === option.id;
        const isCorrect = showCorrectAnswer && option.id === question.correctAnswer;
        const isWrong = showCorrectAnswer && isSelected && option.id !== question.correctAnswer;
        
        return (
          <label
            key={option.id}
            className={`
              relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
              ${isSelected 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${isCorrect ? 'border-green-500 bg-green-50' : ''}
              ${isWrong ? 'border-red-500 bg-red-50' : ''}
              ${isReview ? 'cursor-default' : ''}
            `}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.id}
              checked={isSelected}
              onChange={() => !isReview && handleOptionChange(option.id)}
              className="sr-only"
              disabled={isReview}
            />
            
            <div className={`
              flex-shrink-0 w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center
              ${isSelected 
                ? 'border-blue-500 bg-blue-500' 
                : 'border-gray-300'
              }
              ${isCorrect ? 'border-green-500 bg-green-500' : ''}
              ${isWrong ? 'border-red-500 bg-red-500' : ''}
            `}>
              {(isSelected || isCorrect) && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </div>
            
            <span className={`
              text-sm font-medium
              ${isSelected ? 'text-blue-900' : 'text-gray-900'}
              ${isCorrect ? 'text-green-900' : ''}
              ${isWrong ? 'text-red-900' : ''}
            `}>
              {option.text}
            </span>
          </label>
        );
      })}
    </div>
  );

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple-choice':
        return renderMultipleChoice();
      case 'text':
        return renderTextInput();
      case 'boolean':
        return renderBooleanChoice();
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            Tipo de pregunta no soportado: {question.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header de la pregunta */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">
              {questionNumber}
            </span>
            
            {question.difficulty && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                {getDifficultyLabel(question.difficulty)}
              </span>
            )}
            
            {question.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {question.category}
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
            {question.question}
          </h3>
          
          {question.context && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{question.context}</p>
            </div>
          )}
        </div>
        
        {!isReview && (
          <button
            className="ml-4 p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
            title="Marcar para revisar"
          >
            <FaRegFlag className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Contenido de la pregunta */}
      <div className="mt-6">
        {renderQuestionContent()}
      </div>

      {/* Información adicional para revisión */}
      {showCorrectAnswer && question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Explicación:</h4>
          <p className="text-sm text-blue-800">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionItem;
