import React from 'react';
import { usePatientSession } from '../../context/PatientSessionContext';
import { FaUser, FaClock, FaCheckCircle } from 'react-icons/fa';

/**
 * Componente que muestra información de la sesión activa del paciente
 * Útil para mostrar en la interfaz cuando hay un paciente seleccionado
 */
const PatientSessionIndicator = ({ className = '' }) => {
  const {
    selectedPatient,
    isSessionActive,
    selectedLevel,
    completedTests,
    sessionDuration,
    hasActiveSession
  } = usePatientSession();

  if (!hasActiveSession) {
    return null;
  }

  const levelNames = {
    'E': 'Escolar',
    'B': 'Bachillerato',
    'S': 'Superior'
  };

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <FaUser className="text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">
                {selectedPatient.nombre} {selectedPatient.apellido}
              </p>
              <p className="text-sm text-gray-600">
                Nivel: {levelNames[selectedLevel] || selectedLevel}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <FaClock className="text-gray-500" />
            <span>{sessionDuration} min</span>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-green-600">
            <FaCheckCircle className="text-green-500" />
            <span>{completedTests.length} completados</span>
          </div>
          
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" 
               title="Sesión activa"></div>
        </div>
      </div>
    </div>
  );
};

export default PatientSessionIndicator;
