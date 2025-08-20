import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import supabase from '../../api/supabaseClient';
import { toast } from 'react-toastify';
import TestCard from './components/TestCard';
import PageHeader from '../../components/ui/PageHeader';
import { FaClipboardList } from 'react-icons/fa';
import { TestProgressChart } from '../../components/charts/TestProgressChart';
import TestResultsCharts from '../../components/charts/TestResultsCharts';
import { PieChart } from '../../components/charts/PieChart';
import { useNoAuth as useAuth } from '../../context/NoAuthContext';
import { usePatientSession } from '../../context/PatientSessionContext';
import PatientSessionIndicator from '../../components/test/PatientSessionIndicator';
import SessionControlService from '../../services/SessionControlService';

// Mapeo de códigos de test a códigos de aptitud
const TEST_APTITUDE_MAP = {
  'verbal': 'V',
  'espacial': 'E',
  'atencion': 'A',
  'razonamiento': 'R',
  'numerico': 'N',
  'mecanico': 'M',
  'ortografia': 'O'
};

// Componente para mostrar resultados detallados expandibles
const DetailedTestResult = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalQuestions = (result.respuestas_correctas || 0) + (result.respuestas_incorrectas || 0) + (result.respuestas_sin_contestar || 0);
  const correctPercentage = totalQuestions > 0 ? Math.round(((result.respuestas_correctas || 0) / totalQuestions) * 100) : 0;

  const chartData = [
    { name: 'Correctas', value: result.respuestas_correctas || 0, color: '#10B981' },
    { name: 'Incorrectas', value: result.respuestas_incorrectas || 0, color: '#EF4444' },
    { name: 'Sin Responder', value: result.respuestas_sin_contestar || 0, color: '#6B7280' }
  ];

  const getTestColor = (codigo) => {
    const colors = {
      'V': '#3B82F6', // Azul
      'E': '#6366F1', // Índigo
      'A': '#EF4444', // Rojo
      'R': '#F59E0B', // Ámbar
      'N': '#14B8A6', // Teal
      'M': '#64748B', // Slate
      'O': '#10B981'  // Verde
    };
    return colors[codigo] || '#6B7280';
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Botón expandible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center">
          <span 
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white mr-3"
            style={{ backgroundColor: getTestColor(result.aptitudes?.codigo) }}
          >
            {result.aptitudes?.codigo || 'N/A'}
          </span>
          <div>
            <h4 className="text-lg font-semibold text-gray-800">
              {result.aptitudes?.nombre || 'Test'}
            </h4>
            <p className="text-sm text-gray-500">
              {new Date(result.created_at).toLocaleDateString('es-ES')} • PD: {result.puntaje_directo || 0}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Detalle</span>
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-400`}></i>
        </div>
      </button>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico circular */}
            <div className="flex flex-col items-center">
              <h5 className="text-lg font-semibold text-gray-800 mb-4">Resultados</h5>
              <div className="w-48 h-48">
                <PieChart 
                  data={chartData}
                  width={192}
                  height={192}
                  centerText={`${correctPercentage}%`}
                  centerSubtext="Aciertos"
                />
              </div>
            </div>

            {/* Estadísticas detalladas */}
            <div>
              <h5 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas</h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Respuestas correctas</span>
                  </div>
                  <span className="font-semibold text-gray-800">{result.respuestas_correctas || 0} de {totalQuestions}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Respuestas incorrectas</span>
                  </div>
                  <span className="font-semibold text-gray-800">{result.respuestas_incorrectas || 0}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Sin responder</span>
                  </div>
                  <span className="font-semibold text-gray-800">{result.respuestas_sin_contestar || 0}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-blue-700 font-medium">Tiempo utilizado</span>
                  <span className="font-semibold text-blue-800">{formatTime(result.tiempo_segundos || 0)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-purple-700 font-medium">Puntaje Directo</span>
                  <span className="font-bold text-purple-800 text-lg">{result.puntaje_directo || 0}</span>
                </div>
              </div>

              {/* Recomendaciones */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h6 className="text-sm font-semibold text-blue-800 mb-2">
                  <i className="fas fa-lightbulb mr-1"></i>
                  Recomendaciones
                </h6>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-600 mr-2 mt-0.5 text-xs"></i>
                    Continúa practicando ejercicios similares para mejorar tu desempeño
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-600 mr-2 mt-0.5 text-xs"></i>
                    Revisa los conceptos básicos relacionados con este tipo de prueba
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-600 mr-2 mt-0.5 text-xs"></i>
                    Analiza las preguntas que te resultaron más difíciles para identificar áreas de mejora
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Questionnaire = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Usar el contexto de sesión del paciente
  const {
    selectedPatient,
    selectedLevel,
    isSessionActive,
    completedTests,
    startPatientSession,
    endPatientSession,
    markTestCompleted,
    isTestCompleted,
    updateSelectedLevel,
    hasActiveSession
  } = usePatientSession();

  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [testToRepeat, setTestToRepeat] = useState(null);
  
  // Estados para filtros avanzados
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    genero: '',
    nivel_educativo: '',
    edad_min: '',
    edad_max: ''
  });

  // Función para obtener el ID de aptitud por código de test
  const getAptitudeId = async (testType) => {
    try {
      const aptitudeCode = TEST_APTITUDE_MAP[testType];
      if (!aptitudeCode) {
        throw new Error(`Tipo de test no reconocido: ${testType}`);
      }

      const { data, error } = await supabase
        .from('aptitudes')
        .select('id')
        .eq('codigo', aptitudeCode)
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error al obtener ID de aptitud:', error);
      throw error;
    }
  };

  // Función para verificar si un test ya fue completado (ahora viene del contexto)

  // Función para actualizar tests completados (ahora usa el contexto)
  const updateCompletedTests = () => {
    if (!results || results.length === 0) {
      return;
    }

    results.forEach(result => {
      if (result.aptitudes?.codigo) {
        // Encontrar el test correspondiente al código de aptitud
        const testId = Object.keys(TEST_APTITUDE_MAP).find(
          key => TEST_APTITUDE_MAP[key] === result.aptitudes.codigo
        );
        if (testId) {
          markTestCompleted(testId);
        }
      }
    });
  };

  // Función para manejar repetición de test
  const handleRepeatTest = (test) => {
    setTestToRepeat(test);
    setShowRepeatModal(true);
  };

  // Función para confirmar repetición de test
  const confirmRepeatTest = async () => {
    if (!testToRepeat || !selectedPatient) return;

    try {
      // Eliminar resultado anterior
      const aptitudeId = await getAptitudeId(testToRepeat.id);

      const { error } = await supabase
        .from('resultados')
        .delete()
        .eq('paciente_id', selectedPatient.id)
        .eq('aptitud_id', aptitudeId);

      if (error) throw error;

      // Actualizar resultados
      await fetchPatientResults(selectedPatient.id);

      toast.success('Resultado anterior eliminado. Puedes realizar el test nuevamente.');

      // Navegar al test
      navigate(`/test/instructions/${testToRepeat.id}`, {
        state: { patientId: selectedPatient.id }
      });

    } catch (error) {
      console.error('Error al eliminar resultado anterior:', error);
      toast.error('Error al preparar la repetición del test');
    } finally {
      setShowRepeatModal(false);
      setTestToRepeat(null);
    }
  };

  // Cargar pacientes al montar el componente
  useEffect(() => {
    fetchPatients();
  }, []);

  // Cargar resultados cuando se selecciona un paciente
  useEffect(() => {
    if (selectedPatient) {
      fetchPatientResults(selectedPatient.id);
    }
  }, [selectedPatient]);

  // Actualizar tests completados cuando cambian los resultados
  useEffect(() => {
    updateCompletedTests();
  }, [results]);

  // Manejar paciente seleccionado desde navegación
  useEffect(() => {
    if (location.state?.selectedPatient && patients.length > 0) {
      const patientFromNav = location.state.selectedPatient;
      if (patientFromNav.id) {
        const patient = patients.find(p => p.id === patientFromNav.id);
        if (patient) {
          setSelectedPatient(patient);
        }
      }
    }
  }, [location.state, patients]);

  // Función para obtener pacientes de Supabase
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pacientes')
        .select(`
          id,
          nombre,
          apellido,
          documento,
          email,
          genero,
          fecha_nacimiento,
          nivel_educativo,
          ocupacion
        `)
        .order('nombre', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error al cargar pacientes:', error.message);
      toast.error('Error al cargar la lista de pacientes');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener resultados del paciente
  const fetchPatientResults = async (patientId) => {
    try {
      setLoadingResults(true);
      const { data, error } = await supabase
        .from('resultados')
        .select(`
          *,
          aptitudes:aptitud_id (
            codigo,
            nombre,
            descripcion
          )
        `)
        .eq('paciente_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error al cargar resultados:', error.message);
      toast.error('Error al cargar los resultados del paciente');
    } finally {
      setLoadingResults(false);
    }
  };

  // Función para calcular edad
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Filtrar pacientes según el término de búsqueda y filtros avanzados
  const filteredPatients = patients.filter(patient => {
    // Filtro por término de búsqueda
    const searchMatch = !searchTerm || (
      patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.documento && patient.documento.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Filtro por género
    const genderMatch = !filters.genero || patient.genero === filters.genero;

    // Filtro por nivel educativo
    const educationMatch = !filters.nivel_educativo || patient.nivel_educativo === filters.nivel_educativo;

    // Filtro por edad
    const age = calculateAge(patient.fecha_nacimiento);
    const ageMinMatch = !filters.edad_min || (age !== null && age >= parseInt(filters.edad_min));
    const ageMaxMatch = !filters.edad_max || (age !== null && age <= parseInt(filters.edad_max));

    return searchMatch && genderMatch && educationMatch && ageMinMatch && ageMaxMatch;
  });

  // Función para seleccionar un paciente
  const handleSelectPatient = (patient) => {
    // Iniciar sesión del paciente usando el contexto
    startPatientSession(patient, selectedLevel);
    setSearchTerm(`${patient.nombre} ${patient.apellido}`);
    toast.success(`Paciente ${patient.nombre} ${patient.apellido} seleccionado para evaluación`);
  };

  // Función para limpiar la selección
  const handleClearSelection = () => {
    setSelectedPatient(null);
    setSearchTerm('');
    setResults([]);
  };

  // Función para manejar cambios en filtros
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Función para limpiar todos los filtros
  const handleClearFilters = () => {
    setFilters({
      genero: '',
      nivel_educativo: '',
      edad_min: '',
      edad_max: ''
    });
    setSearchTerm('');
  };

  // Determinar si el usuario es candidato
  const isCandidato = user?.tipo_usuario === 'estudiante' || user?.rol === 'estudiante';

  // Calcular estadísticas de progreso
  const getProgressStats = () => {
    const totalTests = testsByLevel[selectedLevel]?.length || 0;
    const completedCount = completedTests.length || 0;
    const pendingCount = totalTests - completedCount;
    const progressPercentage = totalTests > 0 ? Math.round((completedCount / totalTests) * 100) : 0;

    return {
      total: totalTests,
      completed: completedCount,
      pending: pendingCount,
      percentage: progressPercentage
    };
  };

  // Obtener mensaje dinámico según el progreso
  const getProgressMessage = (percentage) => {
    if (percentage === 0) return "¡Comienza tu evaluación! Selecciona un test para empezar.";
    if (percentage < 25) return "¡Buen comienzo! Continúa con los siguientes tests.";
    if (percentage < 50) return "¡Vas por buen camino! Ya completaste una cuarta parte.";
    if (percentage < 75) return "¡Excelente progreso! Estás a mitad de camino.";
    if (percentage < 100) return "¡Casi terminas! Solo faltan algunos tests más.";
    return "¡Felicitaciones! Has completado todos los tests disponibles.";
  };

  // Función para finalizar la evaluación
  const handleFinishTest = async () => {
    if (!selectedPatient) return;

    const confirmFinish = window.confirm(
      '¿Estás seguro de que deseas terminar la evaluación completa? Esta acción cerrará la sesión actual.'
    );

    if (!confirmFinish) return;

    try {
      console.log('🏁 Finalizando evaluación para paciente:', selectedPatient.id);

      // Marcar la evaluación como finalizada en la base de datos
      const { error: updateError } = await supabase
        .from('pacientes')
        .update({ 
          evaluacion_finalizada: true,
          fecha_finalizacion: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPatient.id);

      if (updateError) {
        console.error('Error al marcar evaluación como finalizada:', updateError);
        throw updateError;
      }

      // Finalizar sesión activa si existe
      if (activeSession) {
        await SessionControlService.finishSession(activeSession.id, user);
        console.log('✅ Sesión finalizada:', activeSession.id);
      }

      // Limpiar estado de sesión
      setActiveSession(null);
      setSessionId(null);

      toast.success('Evaluación finalizada correctamente. Ahora puedes generar el informe desde la sección de Resultados.');

      // Finalizar sesión del paciente usando el contexto
      endPatientSession();

      // Limpiar estados locales
      setSearchTerm('');
      setResults([]);

      // Redirigir según el rol
      if (isCandidato) {
        navigate('/home');
      }

    } catch (error) {
      console.error('❌ Error al finalizar evaluación:', error);
      toast.error('Error al finalizar la evaluación: ' + error.message);
    }
  };

  // Cargar sesión activa cuando se selecciona un paciente
  useEffect(() => {
    if (selectedPatient) {
      loadActiveSession();
    }
  }, [selectedPatient]);

  const loadActiveSession = async () => {
    try {
      const session = await SessionControlService.getActiveSession(selectedPatient.id);
      setActiveSession(session);
      setSessionId(session?.id);
    } catch (error) {
      console.error('Error cargando sesión activa:', error);
    }
  };

  // Calcular concentración
  const calculateConcentration = (atencionResult, errores) => {
    if (!atencionResult || atencionResult === 0) return 0;
    return ((atencionResult / (atencionResult + errores)) * 100).toFixed(2);
  };

  // Obtener resultado por código de aptitud
  const getResultByCode = (code) => {
    return results.find(result => result.aptitudes?.codigo === code);
  };

  // Configuración de niveles educativos
  const educationalLevels = {
    E: {
      code: 'E',
      name: 'Nivel E (Escolar)',
      subtitle: 'Estudiantes Básicos',
      description: 'Tests diseñados para estudiantes de educación básica y media',
      icon: 'fas fa-graduation-cap',
      color: 'green',
      bgClass: 'bg-green-50',
      borderClass: 'border-green-200',
      textClass: 'text-green-700',
      iconBg: 'bg-green-100',
      available: true
    },
    M: {
      code: 'M',
      name: 'Nivel M (Media)',
      subtitle: 'Media Vocacional',
      description: 'Tests para estudiantes de educación media vocacional y técnica',
      icon: 'fas fa-tools',
      color: 'blue',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200',
      textClass: 'text-blue-700',
      iconBg: 'bg-blue-100',
      available: false
    },
    S: {
      code: 'S',
      name: 'Nivel S (Superior)',
      subtitle: 'Selección Laboral',
      description: 'Tests para selección de personal y evaluación profesional',
      icon: 'fas fa-briefcase',
      color: 'purple',
      bgClass: 'bg-purple-50',
      borderClass: 'border-purple-200',
      textClass: 'text-purple-700',
      iconBg: 'bg-purple-100',
      available: false
    }
  };

  // Tests disponibles por nivel
  const testsByLevel = {
    E: [
      {
        id: 'verbal',
        title: 'Aptitud Verbal',
        description: 'Evaluación de analogías verbales y comprensión de relaciones entre conceptos',
        time: 12,
        questions: 32,
        iconClass: 'fas fa-comments',
        bgClass: 'bg-blue-100',
        textClass: 'text-blue-600',
        buttonColor: 'blue',
        abbreviation: 'V'
      },
      {
        id: 'espacial',
        title: 'Aptitud Espacial',
        description: 'Razonamiento espacial con cubos y redes geométricas',
        time: 15,
        questions: 28,
        iconClass: 'fas fa-cube',
        bgClass: 'bg-indigo-100',
        textClass: 'text-indigo-600',
        buttonColor: 'indigo',
        abbreviation: 'E'
      },
      {
        id: 'atencion',
        title: 'Atención',
        description: 'Rapidez y precisión en la localización de símbolos específicos',
        time: 8,
        questions: 80,
        iconClass: 'fas fa-eye',
        bgClass: 'bg-red-100',
        textClass: 'text-red-600',
        buttonColor: 'red',
        abbreviation: 'A'
      },
      {
        id: 'razonamiento',
        title: 'Razonamiento',
        description: 'Continuar series lógicas de figuras y patrones',
        time: 20,
        questions: 32,
        iconClass: 'fas fa-puzzle-piece',
        bgClass: 'bg-amber-100',
        textClass: 'text-amber-600',
        buttonColor: 'amber',
        abbreviation: 'R'
      },
      {
        id: 'numerico',
        title: 'Aptitud Numérica',
        description: 'Resolución de igualdades, series numéricas y análisis de datos',
        time: 20,
        questions: 30,
        iconClass: 'fas fa-calculator',
        bgClass: 'bg-teal-100',
        textClass: 'text-teal-600',
        buttonColor: 'teal',
        abbreviation: 'N'
      },
      {
        id: 'mecanico',
        title: 'Aptitud Mecánica',
        description: 'Comprensión de principios físicos y mecánicos básicos',
        time: 12,
        questions: 28,
        iconClass: 'fas fa-cogs',
        bgClass: 'bg-slate-100',
        textClass: 'text-slate-600',
        buttonColor: 'slate',
        abbreviation: 'M'
      },
      {
        id: 'ortografia',
        title: 'Ortografía',
        description: 'Identificación de palabras con errores ortográficos',
        time: 10,
        questions: 32,
        iconClass: 'fas fa-spell-check',
        bgClass: 'bg-green-100',
        textClass: 'text-green-600',
        buttonColor: 'green',
        abbreviation: 'O'
      }
    ],
    M: [
      // Tests para nivel Media (pendientes de desarrollo)
    ],
    S: [
      // Tests para nivel Superior (pendientes de desarrollo)
    ]
  };

  return (
    <div>
      {/* Header Section with Standardized Style */}
      <PageHeader
        title={
          <span>
            <span className="text-red-600">BAT-7</span>{' '}
            <span className="text-blue-600">Batería de Aptitudes</span>
          </span>
        }
        subtitle="Selecciona un paciente para ver sus resultados y aplicar nuevos tests"
        icon={FaClipboardList}
      />

      <div className="container mx-auto px-4 py-8">

        {/* Indicador de Sesión Activa */}
        <PatientSessionIndicator className="mb-6" />

        {/* Selección de Nivel Educativo */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            <i className="fas fa-layer-group mr-2 text-indigo-600"></i>
            Seleccionar Nivel de Evaluación
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">
            Elige el nivel educativo apropiado para la evaluación del paciente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {Object.values(educationalLevels).map((level) => (
            <div
              key={level.code}
              onClick={() => level.available && updateSelectedLevel(level.code)}
              className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                selectedLevel === level.code
                  ? `${level.borderClass} ${level.bgClass} shadow-lg ring-2 ring-${level.color}-300`
                  : level.available
                    ? `border-gray-200 bg-white hover:${level.bgClass} hover:${level.borderClass} shadow-md`
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
              }`}
            >
              {/* Badge de disponibilidad */}
              <div className="absolute top-3 right-3">
                {level.available ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <i className="fas fa-check-circle mr-1"></i>
                    Disponible
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <i className="fas fa-clock mr-1"></i>
                    En desarrollo
                  </span>
                )}
              </div>

              {/* Icono del nivel */}
              <div className={`inline-flex items-center justify-center w-16 h-16 ${level.iconBg} rounded-full mb-4`}>
                <i className={`${level.icon} text-2xl ${level.textClass}`}></i>
              </div>

              {/* Información del nivel */}
              <div className="text-center">
                <h3 className={`text-lg font-bold mb-1 ${selectedLevel === level.code ? level.textClass : 'text-gray-900'}`}>
                  📗 {level.name}
                </h3>
                <p className={`text-sm font-medium mb-2 ${selectedLevel === level.code ? level.textClass : 'text-gray-600'}`}>
                  {level.subtitle}
                </p>
                <p className={`text-sm ${selectedLevel === level.code ? level.textClass : 'text-gray-500'}`}>
                  {level.description}
                </p>
              </div>

              {/* Indicador de selección */}
              {selectedLevel === level.code && (
                <div className="absolute inset-0 rounded-xl border-2 border-transparent">
                  <div className={`absolute top-2 left-2 w-6 h-6 ${level.iconBg} rounded-full flex items-center justify-center`}>
                    <i className={`fas fa-check text-sm ${level.textClass}`}></i>
                  </div>
                </div>
              )}

              {/* Información adicional para niveles no disponibles */}
              {!level.available && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-600 text-center">
                    <i className="fas fa-info-circle mr-1"></i>
                    Este nivel estará disponible próximamente
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Información del nivel seleccionado */}
        {selectedLevel && (
          <div className="mt-6 max-w-3xl mx-auto">
            <div className={`p-4 rounded-lg ${educationalLevels[selectedLevel].bgClass} ${educationalLevels[selectedLevel].borderClass} border`}>
              <div className="flex items-center justify-center">
                <div className={`w-8 h-8 ${educationalLevels[selectedLevel].iconBg} rounded-full flex items-center justify-center mr-3`}>
                  <i className={`${educationalLevels[selectedLevel].icon} ${educationalLevels[selectedLevel].textClass}`}></i>
                </div>
                <div className="text-center">
                  <p className={`font-medium ${educationalLevels[selectedLevel].textClass}`}>
                    Nivel seleccionado: {educationalLevels[selectedLevel].name}
                  </p>
                  <p className={`text-sm ${educationalLevels[selectedLevel].textClass} opacity-80`}>
                    {testsByLevel[selectedLevel].length} tests disponibles para este nivel
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Búsqueda de Paciente */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            <i className="fas fa-search mr-3 text-blue-600"></i>
            Buscar Paciente
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              showFilters 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className={`fas fa-filter mr-2 ${showFilters ? 'text-white' : 'text-gray-500'}`}></i>
            {showFilters ? 'Ocultar Filtros' : 'Filtros Avanzados'}
          </button>
        </div>
        
        {/* Barra de búsqueda principal */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, documento o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
          />
          <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          
          {(searchTerm || Object.values(filters).some(f => f)) && (
            <button
              onClick={() => {
                handleClearSelection();
                handleClearFilters();
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200"
              title="Limpiar búsqueda y filtros"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {/* Filtros avanzados */}
        {showFilters && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-4 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              <i className="fas fa-sliders-h mr-2 text-blue-600"></i>
              Filtros Avanzados
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por género */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-venus-mars mr-1 text-pink-500"></i>
                  Género
                </label>
                <select
                  value={filters.genero}
                  onChange={(e) => handleFilterChange('genero', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Filtro por nivel educativo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-graduation-cap mr-1 text-green-500"></i>
                  Nivel Educativo
                </label>
                <select
                  value={filters.nivel_educativo}
                  onChange={(e) => handleFilterChange('nivel_educativo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="primaria">Primaria</option>
                  <option value="secundaria">Secundaria</option>
                  <option value="bachillerato">Bachillerato</option>
                  <option value="tecnico">Técnico</option>
                  <option value="universitario">Universitario</option>
                  <option value="posgrado">Posgrado</option>
                </select>
              </div>

              {/* Filtro por edad mínima */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-calendar-alt mr-1 text-orange-500"></i>
                  Edad Mínima
                </label>
                <input
                  type="number"
                  placeholder="Ej: 18"
                  value={filters.edad_min}
                  onChange={(e) => handleFilterChange('edad_min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="120"
                />
              </div>

              {/* Filtro por edad máxima */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-calendar-check mr-1 text-purple-500"></i>
                  Edad Máxima
                </label>
                <input
                  type="number"
                  placeholder="Ej: 65"
                  value={filters.edad_max}
                  onChange={(e) => handleFilterChange('edad_max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="120"
                />
              </div>
            </div>

            {/* Botón para limpiar filtros */}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleClearFilters}
                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                <i className="fas fa-eraser mr-2"></i>
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}

        {/* Contador de resultados */}
        {(searchTerm || Object.values(filters).some(f => f)) && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <i className="fas fa-info-circle mr-2"></i>
              Se encontraron <span className="font-semibold">{filteredPatients.length}</span> paciente(s) que coinciden con los criterios de búsqueda
            </p>
          </div>
        )}

        {/* Lista de pacientes filtrados */}
        {searchTerm && !selectedPatient && (
          <div className="mt-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {loading ? (
              <div className="p-4 text-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Cargando pacientes...
              </div>
            ) : filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {patient.nombre} {patient.apellido}
                      </p>
                      <p className="text-sm text-gray-500">
                        {patient.documento && `Doc: ${patient.documento}`}
                        {patient.email && ` • ${patient.email}`}
                      </p>
                    </div>
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No se encontraron pacientes que coincidan con la búsqueda
              </div>
            )}
          </div>
        )}
      </div>

      {/* Información del Paciente Seleccionado */}
      {selectedPatient && (
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              <i className="fas fa-user-check mr-2 text-green-600"></i>
              Paciente Seleccionado
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mx-auto"></div>
          </div>

          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-blue-100 overflow-hidden max-w-5xl mx-auto">
            {/* Header de la tarjeta */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-user text-white"></i>
                  </div>
                  Información del Paciente
                </h3>
                <button
                  onClick={handleClearSelection}
                  className="text-white hover:text-red-200 transition-colors duration-200 p-2 rounded-full hover:bg-white hover:bg-opacity-10"
                  title="Deseleccionar paciente"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Contenido de la tarjeta */}
            <div className="p-6">
              {/* Información principal */}
              <div className="flex items-start space-x-6 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {selectedPatient.nombre.charAt(0)}{selectedPatient.apellido.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-800 mb-1">
                    {selectedPatient.nombre} {selectedPatient.apellido}
                  </h4>
                  <p className="text-gray-600 flex items-center">
                    <i className="fas fa-id-card mr-2 text-blue-500"></i>
                    {selectedPatient.documento}
                  </p>
                  <p className="text-gray-600 flex items-center mt-1">
                    <i className="fas fa-envelope mr-2 text-green-500"></i>
                    {selectedPatient.email}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <i className="fas fa-check-circle mr-1"></i>
                    Seleccionado
                  </div>
                </div>
              </div>

              {/* Información detallada */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Género */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                      <i className="fas fa-venus-mars text-pink-600"></i>
                    </div>
                    <span className="text-sm font-medium text-gray-500">Género</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800 capitalize">
                    {selectedPatient.genero}
                  </p>
                </div>

                {/* Edad */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <i className="fas fa-birthday-cake text-orange-600"></i>
                    </div>
                    <span className="text-sm font-medium text-gray-500">Edad</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {calculateAge(selectedPatient.fecha_nacimiento)} años
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(selectedPatient.fecha_nacimiento).toLocaleDateString('es-ES')}
                  </p>
                </div>

                {/* Nivel Educativo */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <i className="fas fa-graduation-cap text-green-600"></i>
                    </div>
                    <span className="text-sm font-medium text-gray-500">Educación</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800 capitalize">
                    {selectedPatient.nivel_educativo}
                  </p>
                </div>

                {/* Ocupación */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 md:col-span-2 lg:col-span-3">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <i className="fas fa-briefcase text-purple-600"></i>
                    </div>
                    <span className="text-sm font-medium text-gray-500">Ocupación</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedPatient.ocupacion || 'No especificada'}
                  </p>
                </div>
              </div>


            </div>
          </div>
        </div>
      )}

      {/* Resultados del Paciente */}
      {selectedPatient && (
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              <i className="fas fa-chart-bar mr-2 text-purple-600"></i>
              Resultados de Tests Aplicados
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mx-auto"></div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 max-w-6xl mx-auto overflow-hidden">

            {loadingResults ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <i className="fas fa-spinner fa-spin text-purple-600 text-xl"></i>
                </div>
                <p className="text-gray-600 font-medium">Cargando resultados...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="p-6">
                {/* Gráfico de Progreso de Tests */}
                <div className="mb-8">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                      <i className="fas fa-chart-pie mr-2 text-purple-600"></i>
                      Progreso de Evaluación
                    </h3>
                    <TestProgressChart 
                      completedTests={results}
                      allTests={testsByLevel[selectedLevel] || []}
                      totalTime={results.reduce((sum, r) => sum + (r.tiempo_segundos || 0), 0)}
                    />
                  </div>
                </div>






              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <i className="fas fa-clipboard-check text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin resultados registrados</h3>
                <p className="text-gray-500 mb-4">Este paciente no tiene resultados de tests registrados</p>
                <p className="text-sm text-gray-400">Aplica tests usando las opciones de abajo</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tests Disponibles */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            <i className="fas fa-clipboard-list mr-2 text-blue-600"></i>
            Tests Disponibles - {educationalLevels[selectedLevel].name}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">
            {educationalLevels[selectedLevel].description}
          </p>
        </div>

        {/* Indicadores Globales de Progreso */}
        {selectedPatient && educationalLevels[selectedLevel].available && (() => {
          const stats = getProgressStats();
          return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-200 max-w-5xl mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  <i className="fas fa-chart-pie mr-2 text-blue-600"></i>
                  Progreso de Evaluación
                </h3>
                <p className="text-blue-700 font-medium">
                  {getProgressMessage(stats.percentage)}
                </p>
              </div>

              {/* Contadores principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-green-200">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <i className="fas fa-check text-green-600"></i>
                    </div>
                    <span className="text-sm font-medium text-gray-600">Completados</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                </div>

                <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-orange-200">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                      <i className="fas fa-clock text-orange-600"></i>
                    </div>
                    <span className="text-sm font-medium text-gray-600">Pendientes</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                </div>

                <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-blue-200">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <i className="fas fa-list text-blue-600"></i>
                    </div>
                    <span className="text-sm font-medium text-gray-600">Total</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                </div>
              </div>

              {/* Barra de progreso visual */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progreso General</span>
                  <span className="text-sm font-bold text-gray-800">{stats.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${stats.percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Mensaje de estado */}
              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  stats.percentage === 100
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : stats.percentage > 0
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  <i className={`mr-2 ${
                    stats.percentage === 100
                      ? 'fas fa-trophy'
                      : stats.percentage > 0
                        ? 'fas fa-play-circle'
                        : 'fas fa-info-circle'
                  }`}></i>
                  {stats.percentage === 100
                    ? '¡Evaluación Completa!'
                    : stats.percentage > 0
                      ? `${stats.completed} de ${stats.total} tests completados`
                      : 'Listo para comenzar'
                  }
                </div>
              </div>
            </div>
          );
        })()}

        {!selectedPatient && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center">
              <i className="fas fa-info-circle text-yellow-600 mr-2"></i>
              <p className="text-yellow-800">
                Selecciona un paciente para poder aplicar los tests y guardar los resultados
              </p>
            </div>
          </div>
        )}

        {!educationalLevels[selectedLevel].available && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <i className="fas fa-tools text-orange-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                Nivel en Desarrollo
              </h3>
              <p className="text-orange-700 mb-4">
                Los tests para {educationalLevels[selectedLevel].name} están actualmente en desarrollo.
              </p>
              <p className="text-sm text-orange-600">
                Por favor, selecciona el Nivel E (Escolar) que está completamente disponible.
              </p>
            </div>
          </div>
        )}

        {/* Grid de tarjetas de tests */}
        {educationalLevels[selectedLevel].available && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-fr max-w-7xl mx-auto">
            {testsByLevel[selectedLevel].map((test) => (
              <TestCard
                key={test.id}
                test={test}
                iconClass={test.iconClass}
                bgClass={test.bgClass}
                textClass={test.textClass}
                buttonColor={test.buttonColor}
                abbreviation={test.abbreviation}
                showButton={!!selectedPatient}
                disabled={!selectedPatient}
                patientId={selectedPatient?.id}
                level={selectedLevel}
                isCompleted={isTestCompleted(test.id)}
                onRepeatTest={() => handleRepeatTest(test)}
              />
            ))}
          </div>
        )}

        {/* Módulo de Resultados de Tests Aplicados después de las cards */}
        {selectedPatient && results.length > 0 && (
          <div className="mt-8">
            <TestResultsCharts
              results={results}
              completedTests={completedTests}
              selectedLevel={selectedLevel}
            />
            
            {/* Botón Finalizar Evaluación */}
            <div className="mt-8 text-center">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  <i className="fas fa-flag-checkered mr-2 text-red-600"></i>
                  Finalizar Evaluación
                </h3>
                <p className="text-gray-600 mb-4">
                  {isCandidato
                    ? 'Cuando hayas completado todos los tests que necesites, puedes finalizar tu evaluación.'
                    : 'Finaliza la evaluación del paciente cuando consideres que ha completado los tests necesarios.'
                  }
                </p>
                
                {/* Información del paciente */}
                <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Paciente:</strong> {selectedPatient.nombre} {selectedPatient.apellido}
                  </div>
                  {selectedPatient.documento && (
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Documento:</strong> {selectedPatient.documento}
                    </div>
                  )}
                  {activeSession && (
                    <div className="text-sm text-gray-600">
                      <strong>Sesión activa:</strong> {new Date(activeSession.fecha_inicio).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Advertencia importante */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Importante:</strong> Al finalizar la evaluación, se cerrará la sesión actual. 
                    Asegúrate de que el paciente haya completado todos los tests necesarios.
                  </p>
                </div>

                <button
                  onClick={handleFinishTest}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <i className="fas fa-stop-circle mr-2"></i>
                  Terminar Prueba
                </button>

                {/* Información adicional */}
                <div className="mt-4 text-xs text-gray-500">
                  <p>
                    Después de finalizar, podrás generar informes desde la sección de Resultados.
                    {!isCandidato && ' También podrás seleccionar otro paciente para evaluar.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Modal de confirmación para repetir test */}
      {showRepeatModal && testToRepeat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-orange-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Repetir Test
              </h3>
              <p className="text-gray-600">
                ¿Estás seguro de que deseas repetir el test de <strong>{testToRepeat.title}</strong>?
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <i className="fas fa-info-circle text-yellow-600 mr-2 mt-0.5"></i>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Importante:</p>
                  <p>El resultado anterior será eliminado y sobrescrito con el nuevo resultado.</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRepeatModal(false);
                  setTestToRepeat(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRepeatTest}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                <i className="fas fa-redo mr-2"></i>
                Repetir Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
