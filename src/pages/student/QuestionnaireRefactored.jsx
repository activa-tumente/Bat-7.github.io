import React, { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FaClipboardList } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Components
import PageHeader from '../../components/ui/PageHeader';
import PatientSearchSection from '../../components/student/PatientSearchSection';
import EducationalLevelSelector from '../../components/student/EducationalLevelSelector';
import PatientResultsDisplay from '../../components/student/PatientResultsDisplay';
import FinishEvaluationButton from '../../components/test/FinishEvaluationButton';
import ErrorBoundary from '../../components/common/ErrorBoundary';

// Hooks
import { usePatientSearch } from '../../hooks/usePatientSearch';
import { usePatientResults } from '../../hooks/usePatientResults';
import { usePinControl } from '../../hooks/usePinControl';
import { useNoAuth as useAuth } from '../../context/NoAuthContext';

// Services
import SessionControlService from '../../services/SessionControlService';

// Constants
import { EDUCATIONAL_LEVELS } from '../../constants/testConstants';

/**
 * Refactored Questionnaire component with improved architecture
 * Separated concerns and better performance through memoization
 */
const Questionnaire = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Educational level state
  const [selectedLevel, setSelectedLevel] = useState('E');
  const [activeSession, setActiveSession] = useState(null);

  // Custom hooks for business logic
  const {
    selectedPatient,
    searchTerm,
    loading,
    showFilters,
    filters,
    filteredPatients,
    setSearchTerm,
    setShowFilters,
    handleSelectPatient,
    handleFilterChange,
    handleClearFilters
  } = usePatientSearch();

  const {
    results,
    loadingResults,
    patientStatistics,
    resultsByAptitude,
    performanceAnalysis
  } = usePatientResults(selectedPatient);

  const { checkPsychologistUsage } = usePinControl();

  // Determine user type
  const isCandidato = user?.tipo_usuario === 'estudiante' || user?.rol === 'estudiante';

  // Handle evaluation finish
  const handleFinishEvaluation = useCallback(async () => {
    setActiveSession(null);
    
    if (!isCandidato) {
      handleSelectPatient(null);
      setSearchTerm('');
      toast.info('Puedes seleccionar otro paciente para evaluar');
    }
  }, [isCandidato, handleSelectPatient, setSearchTerm]);

  // Handle level selection
  const handleLevelSelect = useCallback((level) => {
    if (EDUCATIONAL_LEVELS[level]?.available) {
      setSelectedLevel(level);
    }
  }, []);

  return (
    <ErrorBoundary title="Error en el Sistema de Evaluación">
      <div>
        {/* Header */}
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
          {/* Educational Level Selection */}
          <ErrorBoundary title="Error en Selección de Nivel">
            <EducationalLevelSelector
              selectedLevel={selectedLevel}
              onLevelSelect={handleLevelSelect}
              educationalLevels={EDUCATIONAL_LEVELS}
            />
          </ErrorBoundary>

          {/* Patient Search */}
          <ErrorBoundary title="Error en Búsqueda de Pacientes">
            <PatientSearchSection
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              filteredPatients={filteredPatients}
              onSelectPatient={handleSelectPatient}
              loading={loading}
            />
          </ErrorBoundary>

          {/* Patient Results */}
          {selectedPatient && (
            <ErrorBoundary title="Error en Resultados del Paciente">
              <PatientResultsDisplay
                patient={selectedPatient}
                results={results}
                loading={loadingResults}
                statistics={patientStatistics}
                resultsByAptitude={resultsByAptitude}
                performanceAnalysis={performanceAnalysis}
                selectedLevel={selectedLevel}
              />
              
              {/* Finish Evaluation Button */}
              <FinishEvaluationButton
                activeSession={activeSession}
                selectedPatient={selectedPatient}
                user={user}
                isCandidato={isCandidato}
                onFinish={handleFinishEvaluation}
                SessionControlService={SessionControlService}
                className="mt-8"
              />
            </ErrorBoundary>
          )}

          {/* No Patient Selected Message */}
          {!selectedPatient && (
            <div className="text-center py-12">
              <div className="bg-blue-50 rounded-lg p-8">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Selecciona un Paciente
                </h3>
                <p className="text-blue-700">
                  {isCandidato 
                    ? 'Busca tu nombre para comenzar la evaluación'
                    : 'Busca y selecciona un paciente para comenzar la evaluación'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Questionnaire;