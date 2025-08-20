import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaDownload, 
  FaShare, 
  FaChartBar,
  FaArrowLeft,
  FaFlag,
  FaTrophy
} from 'react-icons/fa';
import { withAuthProtection } from '../../hoc/withRoleProtection';
import { useRoleBasedAccess } from '../../hooks/useRoleBasedAccess';
import QuestionItem from './components/QuestionItem';
import ProgressBar from './components/ProgressBar';

/**
 * Página de resultados del cuestionario
 * Muestra puntuación, análisis detallado y revisión de respuestas
 */
const QuestionnaireResults = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isStudent, isPsychologist, isAdmin } = useRoleBasedAccess();
  
  const [results, setResults] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [showDetailedReview, setShowDetailedReview] = useState(false);
  const [loading, setLoading] = useState(true);

  // Datos de ejemplo de resultados
  const mockResults = {
    id: 'result-123',
    questionnaireId: id,
    userId: 'user-456',
    score: 78,
    maxScore: 100,
    correctAnswers: 47,
    totalQuestions: 60,
    timeSpent: 2340, // segundos
    completedAt: new Date().toISOString(),
    answers: {
      1: 'b', // correcto
      2: 'c', // correcto
      3: 'La innovación tecnológica definirá el futuro de nuestra sociedad.', // texto libre
      // ... más respuestas
    },
    analysis: {
      categoryScores: {
        'Aptitud Verbal': { score: 82, maxScore: 100, questions: 20 },
        'Comprensión Lectora': { score: 75, maxScore: 100, questions: 25 },
        'Vocabulario': { score: 80, maxScore: 100, questions: 15 }
      },
      difficultyAnalysis: {
        easy: { correct: 18, total: 20, percentage: 90 },
        medium: { correct: 22, total: 30, percentage: 73 },
        hard: { correct: 7, total: 10, percentage: 70 }
      },
      strengths: [
        'Excelente comprensión de vocabulario técnico',
        'Buena capacidad de análisis textual',
        'Razonamiento lógico sólido'
      ],
      improvements: [
        'Mejorar velocidad de lectura',
        'Practicar analogías complejas',
        'Ampliar vocabulario académico'
      ]
    },
    percentile: 85, // Percentil respecto a otros usuarios
    grade: 'B+',
    passed: true
  };

  const mockQuestionnaire = {
    id: 'bat7-verbal',
    title: 'BAT-7 Evaluación Verbal',
    description: 'Evaluación de aptitudes verbales y comprensión lectora',
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
        explanation: 'Perspicaz significa que tiene agudeza mental para comprender las cosas, similar a astuto.',
        category: 'Vocabulario',
        difficulty: 'medium'
      },
      // ... más preguntas
    ]
  };

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      try {
        // Obtener datos del estado de navegación o de la API
        const submissionData = location.state?.submissionData;
        
        if (submissionData) {
          // Usar datos de la sesión actual
          setResults(mockResults);
        } else {
          // Cargar desde API
          await new Promise(resolve => setTimeout(resolve, 1000));
          setResults(mockResults);
        }
        
        setQuestionnaire(mockQuestionnaire);
      } catch (error) {
        console.error('Error cargando resultados:', error);
        navigate('/questionnaire');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [id, location.state, navigate]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'text-green-600',
      'A': 'text-green-600',
      'B+': 'text-blue-600',
      'B': 'text-blue-600',
      'C+': 'text-yellow-600',
      'C': 'text-yellow-600',
      'D': 'text-orange-600',
      'F': 'text-red-600'
    };
    return colors[grade] || 'text-gray-600';
  };

  const downloadResults = () => {
    // Implementar descarga de resultados en PDF
    console.log('Descargando resultados...');
  };

  const shareResults = () => {
    // Implementar compartir resultados
    console.log('Compartiendo resultados...');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (!results || !questionnaire) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Resultados no encontrados
          </h2>
          <Link
            to="/questionnaire"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Volver a cuestionarios
          </Link>
        </div>
      </div>
    );
  }

  const scorePercentage = (results.score / results.maxScore) * 100;
  const accuracyPercentage = (results.correctAnswers / results.totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/questionnaire')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft className="h-5 w-5 mr-2" />
              Volver a cuestionarios
            </button>
            
            <div className="flex space-x-3">
              {(isPsychologist || isAdmin) && (
                <>
                  <button
                    onClick={shareResults}
                    className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <FaShare className="h-4 w-4 mr-2" />
                    Compartir
                  </button>
                  <button
                    onClick={downloadResults}
                    className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    <FaDownload className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </button>
                </>
              )}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Resultados: {questionnaire.title}
          </h1>
          <p className="text-gray-600">
            Completado el {new Date(results.completedAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Resumen de resultados */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Puntuación principal */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-6">
              <div className={`text-6xl font-bold mb-2 ${getGradeColor(results.grade)}`}>
                {results.grade}
              </div>
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {results.score} / {results.maxScore} puntos
              </div>
              <div className="text-lg text-gray-600">
                {scorePercentage.toFixed(1)}% de puntuación
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {results.correctAnswers}
                </div>
                <div className="text-sm text-gray-600">Correctas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {results.totalQuestions - results.correctAnswers}
                </div>
                <div className="text-sm text-gray-600">Incorrectas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {accuracyPercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Precisión</div>
              </div>
            </div>
          </div>

          {/* Estadísticas adicionales */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <FaClock className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Tiempo</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(results.timeSpent)}
              </div>
              <div className="text-sm text-gray-600">
                Tiempo total utilizado
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <FaTrophy className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Percentil</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {results.percentile}%
              </div>
              <div className="text-sm text-gray-600">
                Mejor que el {results.percentile}% de usuarios
              </div>
            </div>

            <div className={`rounded-lg shadow-sm p-6 ${results.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center">
                {results.passed ? (
                  <FaCheckCircle className="h-6 w-6 text-green-600 mr-3" />
                ) : (
                  <FaTimesCircle className="h-6 w-6 text-red-600 mr-3" />
                )}
                <div>
                  <div className={`font-semibold ${results.passed ? 'text-green-900' : 'text-red-900'}`}>
                    {results.passed ? 'Aprobado' : 'No Aprobado'}
                  </div>
                  <div className={`text-sm ${results.passed ? 'text-green-700' : 'text-red-700'}`}>
                    {results.passed ? 'Felicitaciones por tu resultado' : 'Puedes intentarlo nuevamente'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Análisis por categorías */}
        {results.analysis && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Análisis por Categorías
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(results.analysis.categoryScores).map(([category, data]) => {
                const percentage = (data.score / data.maxScore) * 100;
                return (
                  <div key={category} className="text-center">
                    <h3 className="font-medium text-gray-900 mb-2">{category}</h3>
                    <div className="relative w-24 h-24 mx-auto mb-2">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${percentage * 2.51} 251`}
                          className="text-blue-600"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {data.score} / {data.maxScore} puntos
                    </div>
                    <div className="text-xs text-gray-500">
                      {data.questions} preguntas
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fortalezas y áreas de mejora */}
        {results.analysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaCheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Fortalezas
              </h3>
              <ul className="space-y-2">
                {results.analysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaFlag className="h-5 w-5 text-yellow-600 mr-2" />
                Áreas de Mejora
              </h3>
              <ul className="space-y-2">
                {results.analysis.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Revisión detallada */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Revisión Detallada
            </h2>
            <button
              onClick={() => setShowDetailedReview(!showDetailedReview)}
              className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700"
            >
              <FaChartBar className="h-4 w-4 mr-2" />
              {showDetailedReview ? 'Ocultar' : 'Mostrar'} detalles
            </button>
          </div>

          {showDetailedReview && (
            <div className="space-y-8">
              {questionnaire.questions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-8 last:border-b-0">
                  <QuestionItem
                    question={question}
                    answer={results.answers[question.id]}
                    onAnswerChange={() => {}} // No editable en resultados
                    questionNumber={index + 1}
                    showCorrectAnswer={true}
                    isReview={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones finales */}
        <div className="mt-8 text-center space-x-4">
          <Link
            to="/questionnaire"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50"
          >
            Volver a Cuestionarios
          </Link>
          
          {isStudent && (
            <Link
              to={`/questionnaire/${id}`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Intentar Nuevamente
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuthProtection(QuestionnaireResults);
