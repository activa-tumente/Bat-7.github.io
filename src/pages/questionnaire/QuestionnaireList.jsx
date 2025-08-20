import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaClock, FaCheckCircle, FaUsers, FaChartBar } from 'react-icons/fa';
import { useRoleBasedAccess } from '../../hooks/useRoleBasedAccess';
import { withAuthProtection } from '../../hoc/withRoleProtection';

/**
 * Página principal de cuestionarios disponibles
 * Muestra diferentes cuestionarios según el rol del usuario
 */
const QuestionnaireList = () => {
  const { userRole, permissions, isStudent, isPsychologist, isAdmin } = useRoleBasedAccess();
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);

  // Datos de ejemplo de cuestionarios
  const mockQuestionnaires = [
    {
      id: 'bat7-verbal',
      title: 'BAT-7 Evaluación Verbal',
      description: 'Evaluación de aptitudes verbales y comprensión lectora',
      duration: 45,
      questions: 60,
      difficulty: 'Intermedio',
      category: 'Aptitud Verbal',
      status: 'available',
      completedBy: 156,
      averageScore: 78,
      icon: FaChartBar,
      color: 'blue'
    },
    {
      id: 'bat7-numerical',
      title: 'BAT-7 Evaluación Numérica',
      description: 'Evaluación de aptitudes numéricas y razonamiento matemático',
      duration: 40,
      questions: 50,
      difficulty: 'Intermedio',
      category: 'Aptitud Numérica',
      status: 'available',
      completedBy: 142,
      averageScore: 72,
      icon: FaChartBar,
      color: 'green'
    },
    {
      id: 'bat7-abstract',
      title: 'BAT-7 Razonamiento Abstracto',
      description: 'Evaluación de capacidad de razonamiento lógico y abstracto',
      duration: 35,
      questions: 40,
      difficulty: 'Avanzado',
      category: 'Razonamiento',
      status: 'available',
      completedBy: 98,
      averageScore: 65,
      icon: FaChartBar,
      color: 'purple'
    },
    {
      id: 'personality-test',
      title: 'Evaluación de Personalidad',
      description: 'Cuestionario de personalidad y características psicológicas',
      duration: 25,
      questions: 120,
      difficulty: 'Básico',
      category: 'Personalidad',
      status: 'available',
      completedBy: 203,
      averageScore: 85,
      icon: FaUsers,
      color: 'orange'
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    const loadQuestionnaires = async () => {
      setLoading(true);
      // Aquí harías la llamada real a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setQuestionnaires(mockQuestionnaires);
      setLoading(false);
    };

    loadQuestionnaires();
  }, []);

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Básico': 'bg-green-100 text-green-800',
      'Intermedio': 'bg-yellow-100 text-yellow-800',
      'Avanzado': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'in-progress':
        return <FaClock className="text-yellow-500" />;
      default:
        return <FaPlay className="text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cuestionarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Cuestionarios Disponibles
          </h1>
          <p className="text-lg text-gray-600">
            {isStudent && "Selecciona un cuestionario para comenzar tu evaluación"}
            {isPsychologist && "Gestiona y revisa los cuestionarios disponibles"}
            {isAdmin && "Administra todos los cuestionarios del sistema"}
          </p>
        </div>

        {/* Estadísticas rápidas para psicólogos y admins */}
        {(isPsychologist || isAdmin) && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaChartBar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Cuestionarios</p>
                  <p className="text-2xl font-bold text-gray-900">{questionnaires.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaUsers className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {questionnaires.reduce((sum, q) => sum + q.completedBy, 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FaClock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(questionnaires.reduce((sum, q) => sum + q.duration, 0) / questionnaires.length)} min
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaCheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Puntuación Media</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(questionnaires.reduce((sum, q) => sum + q.averageScore, 0) / questionnaires.length)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de cuestionarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questionnaires.map((questionnaire) => {
            const IconComponent = questionnaire.icon;
            return (
              <div
                key={questionnaire.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-${questionnaire.color}-100`}>
                      <IconComponent className={`h-6 w-6 text-${questionnaire.color}-600`} />
                    </div>
                    {getStatusIcon(questionnaire.status)}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {questionnaire.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {questionnaire.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duración:</span>
                      <span className="font-medium">{questionnaire.duration} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Preguntas:</span>
                      <span className="font-medium">{questionnaire.questions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Dificultad:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(questionnaire.difficulty)}`}>
                        {questionnaire.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  {(isPsychologist || isAdmin) && (
                    <div className="border-t pt-4 mb-4">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Completado por {questionnaire.completedBy} usuarios</span>
                        <span>Promedio: {questionnaire.averageScore}%</span>
                      </div>
                    </div>
                  )}
                  
                  <Link
                    to={`/questionnaire/${questionnaire.id}`}
                    className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-${questionnaire.color}-600 hover:bg-${questionnaire.color}-700 transition-colors duration-200`}
                  >
                    <FaPlay className="mr-2 h-4 w-4" />
                    {isStudent ? 'Comenzar' : 'Ver Detalles'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default withAuthProtection(QuestionnaireList);
