import React, { useState, useEffect } from 'react';
import { useNoAuth as useAuth } from '../../context/NoAuthContext';
import FinishEvaluationButton from './FinishEvaluationButton';
import SessionControlService from '../../services/SessionControlService';
import { toast } from 'react-toastify';

/**
 * Ejemplo de cómo integrar el botón "Finalizar Evaluación" en el componente Questionnaire
 * Este es un ejemplo de implementación que puedes adaptar a tu Questionnaire.jsx existente
 */
const QuestionnaireWithFinishButton = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  // Determinar si el usuario es candidato
  const isCandidato = user?.tipo_usuario === 'estudiante' || user?.rol === 'estudiante';

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

  const handleFinishEvaluation = async () => {
    // Limpiar estado de sesión
    setActiveSession(null);
    setSessionId(null);

    // Para administradores y psicólogos, limpiar selección de paciente
    if (!isCandidato) {
      setSelectedPatient(null);
      setSearchTerm('');
      setResults([]);
      toast.info('Puedes seleccionar otro paciente para evaluar');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Sistema de Evaluación BAT-7
      </h1>

      {/* Aquí iría tu lógica de selección de paciente existente */}
      {/* ... */}

      {/* Sección de resultados del paciente seleccionado */}
      {selectedPatient && (
        <div className="space-y-6">
          {/* Información del paciente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Paciente Seleccionado
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre:</p>
                <p className="font-medium">{selectedPatient.nombre} {selectedPatient.apellido}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Documento:</p>
                <p className="font-medium">{selectedPatient.documento}</p>
              </div>
            </div>
          </div>

          {/* Aquí irían los tests disponibles y resultados */}
          {/* ... tu lógica existente de tests ... */}

          {/* Botón de finalizar evaluación */}
          <FinishEvaluationButton
            activeSession={activeSession}
            selectedPatient={selectedPatient}
            user={user}
            isCandidato={isCandidato}
            onFinish={handleFinishEvaluation}
            SessionControlService={SessionControlService}
            className="mt-8"
          />
        </div>
      )}

      {/* Mensaje cuando no hay paciente seleccionado */}
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
  );
};

export default QuestionnaireWithFinishButton;