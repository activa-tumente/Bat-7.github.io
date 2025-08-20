import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaArrowLeft, FaArrowRight, FaFlag, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { withAuthProtection } from '../../hoc/withRoleProtection';
import QuestionItem from './components/QuestionItem';
import ProgressBar from './components/ProgressBar';
import auditLogger from '../../services/auditLogger';
import { usePinValidation } from '../../hooks/usePinValidation';

/**
 * Formulario principal para realizar cuestionarios
 * Maneja la navegación entre preguntas, tiempo y envío de respuestas
 */
const QuestionnaireForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { validateEvaluationStart, consumePin, isLoading: pinLoading, error: pinError } = usePinValidation();
  
  const [questionnaire, setQuestionnaire] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pinValidation, setPinValidation] = useState({
    isValidating: false,
    canStart: false,
    error: null,
    pinInfo: null
  });

  // Datos de ejemplo del cuestionario
  const mockQuestionnaire = {
    id: 'bat7-verbal',
    title: 'BAT-7 Evaluación Verbal',
    description: 'Evaluación de aptitudes verbales y comprensión lectora',
    duration: 45, // minutos
    instructions: [
      'Lee cada pregunta cuidadosamente antes de responder.',
      'Tienes 45 minutos para completar toda la evaluación.',
      'Una vez que envíes tus respuestas, no podrás modificarlas.',
      'Si no estás seguro de una respuesta, puedes marcarla para revisarla después.'
    ],
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: '¿Cuál es el sinónimo más apropiado para la palabra "perspicaz"?',
        options: [
          { id: 'a', text: 'Confuso' },
          { id: 'b', text: 'Astuto' },
          { id: 'c', text: 'Lento' },
          { id: 'd', text: 'Descuidado' }
        ],
        correctAnswer: 'b',
        difficulty: 'medium'
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Complete la analogía: LIBRO es a BIBLIOTECA como CUADRO es a:',
        options: [
          { id: 'a', text: 'Marco' },
          { id: 'b', text: 'Pintura' },
          { id: 'c', text: 'Museo' },
          { id: 'd', text: 'Arte' }
        ],
        correctAnswer: 'c',
        difficulty: 'medium'
      },
      {
        id: 3,
        type: 'text',
        question: 'Escriba una oración usando las palabras "innovación", "tecnología" y "futuro":',
        placeholder: 'Escriba su respuesta aquí...',
        difficulty: 'hard'
      },
      // Agregar más preguntas según sea necesario
    ]
  };

  // Validar pines y cargar cuestionario
  useEffect(() => {
    const validateAndLoad = async () => {
      setLoading(true);
      setPinValidation(prev => ({ ...prev, isValidating: true }));
      
      try {
        // Validar disponibilidad de pines
        const validation = await validateEvaluationStart();
        
        if (!validation.canStart) {
          setPinValidation({
            isValidating: false,
            canStart: false,
            error: validation.error,
            pinInfo: validation.pinInfo
          });
          setLoading(false);
          return;
        }
        
        // Consumir pin y cargar cuestionario
        const consumeResult = await consumePin();
        if (consumeResult.success) {
          setPinValidation({
            isValidating: false,
            canStart: true,
            error: null,
            pinInfo: validation.pinInfo
          });
          
          // Cargar cuestionario
          await new Promise(resolve => setTimeout(resolve, 1000));
          setQuestionnaire(mockQuestionnaire);
          setTimeRemaining(mockQuestionnaire.duration * 60);
          
          auditLogger.logUserAction('questionnaire_started', {
            questionnaireId: id,
            questionnaireName: mockQuestionnaire.title,
            pinConsumed: true,
            remainingPins: validation.pinInfo?.remainingPins
          });
        }
      } catch (error) {
        console.error('Error en validación de pines:', error);
        setPinValidation({
          isValidating: false,
          canStart: false,
          error: 'Error al validar disponibilidad de pines',
          pinInfo: null
        });
        setLoading(false);
      }
    };

    validateAndLoad();
  }, [id, navigate, validateEvaluationStart, consumePin]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || !questionnaire) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, questionnaire]);

  // Formatear tiempo restante
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Manejar respuesta de pregunta
  const handleAnswerChange = useCallback((questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  // Navegar a pregunta anterior
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Navegar a pregunta siguiente
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questionnaire.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Ir a pregunta específica
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Envío automático por tiempo agotado
  const handleAutoSubmit = useCallback(() => {
    auditLogger.logUserAction('questionnaire_auto_submitted', {
      questionnaireId: id,
      reason: 'time_expired',
      answeredQuestions: Object.keys(answers).length,
      totalQuestions: questionnaire?.questions.length
    });
    
    handleSubmit(true);
  }, [id, answers, questionnaire]);

  // Enviar cuestionario
  const handleSubmit = async (isAutoSubmit = false) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Aquí enviarías las respuestas a la API
      const submissionData = {
        questionnaireId: id,
        answers,
        timeSpent: (questionnaire.duration * 60) - timeRemaining,
        isAutoSubmit,
        submittedAt: new Date().toISOString()
      };

      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular envío

      auditLogger.logUserAction('questionnaire_submitted', {
        questionnaireId: id,
        answeredQuestions: Object.keys(answers).length,
        totalQuestions: questionnaire.questions.length,
        timeSpent: submissionData.timeSpent,
        isAutoSubmit
      });

      // Redirigir a resultados
      navigate(`/questionnaire/results/${id}`, {
        state: { submissionData }
      });
    } catch (error) {
      console.error('Error enviando cuestionario:', error);
      auditLogger.error('questionnaire_submission_failed', 'Error al enviar cuestionario', {
        questionnaireId: id,
        error: error.message
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  // Calcular progreso
  const progress = questionnaire ? 
    (Object.keys(answers).length / questionnaire.questions.length) * 100 : 0;

  if (loading || pinValidation.isValidating || pinLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {pinValidation.isValidating || pinLoading 
              ? 'Validando disponibilidad de pines...' 
              : 'Cargando cuestionario...'}
          </p>
        </div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Cuestionario no encontrado
          </h2>
          <button
            onClick={() => navigate('/questionnaire')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questionnaire.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questionnaire.questions.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/questionnaire')}
                className="text-gray-600 hover:text-gray-900"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {questionnaire.title}
                </h1>
                <p className="text-sm text-gray-600">
                  Pregunta {currentQuestionIndex + 1} de {questionnaire.questions.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <FaClock className="h-4 w-4 mr-2" />
                <span className={timeRemaining < 300 ? 'text-red-600 font-bold' : ''}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                <FaCheck className="h-4 w-4 mr-2 inline" />
                Finalizar
              </button>
            </div>
          </div>
          
          <ProgressBar 
            progress={progress}
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={questionnaire.questions.length}
            onQuestionClick={goToQuestion}
            answers={answers}
            questions={questionnaire.questions}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <QuestionItem
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            onAnswerChange={handleAnswerChange}
            questionNumber={currentQuestionIndex + 1}
          />
        </div>

        {/* Navegación */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </button>

          <div className="text-sm text-gray-500">
            {Object.keys(answers).length} de {questionnaire.questions.length} respondidas
          </div>

          {isLastQuestion ? (
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
            >
              <FaCheck className="h-4 w-4 mr-2" />
              Finalizar
            </button>
          ) : (
            <button
              onClick={goToNextQuestion}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Siguiente
              <FaArrowRight className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Finalizar cuestionario?
            </h3>
            <p className="text-gray-600 mb-6">
              Has respondido {Object.keys(answers).length} de {questionnaire.questions.length} preguntas.
              Una vez que envíes tus respuestas, no podrás modificarlas.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuthProtection(QuestionnaireForm);
