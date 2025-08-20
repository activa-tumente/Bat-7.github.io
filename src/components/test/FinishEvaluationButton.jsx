import React, { useState } from 'react';
import { FaFlagCheckered, FaStopCircle, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

/**
 * Componente del botón "Finalizar Evaluación"
 * Maneja el cierre formal de una sesión de evaluación
 */
const FinishEvaluationButton = ({
  activeSession,
  selectedPatient,
  user,
  isCandidato = false,
  onFinish,
  SessionControlService,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFinishTest = async () => {
    if (!selectedPatient) {
      toast.error('No hay paciente seleccionado');
      return;
    }

    // Confirmación del usuario
    const confirmFinish = window.confirm(
      '¿Estás seguro de que deseas terminar la evaluación completa? Esta acción cerrará la sesión actual.'
    );

    if (!confirmFinish) return;

    try {
      setLoading(true);
      console.log('🏁 Finalizando evaluación para paciente:', selectedPatient.id);

      // Finalizar sesión activa si existe
      if (activeSession && SessionControlService) {
        await SessionControlService.finishSession(activeSession.id, user);
        console.log('✅ Sesión finalizada:', activeSession.id);
      }

      // Ejecutar callback personalizado si se proporciona
      if (onFinish) {
        await onFinish();
      }

      toast.success('Evaluación finalizada correctamente. Ahora puedes generar el informe desde la sección de Resultados.');

      // Redirigir según el rol
      if (isCandidato) {
        navigate('/home');
      } else {
        // Para administradores y psicólogos, se maneja en el componente padre
        console.log('✅ Evaluación finalizada para administrador/psicólogo');
      }

    } catch (error) {
      console.error('❌ Error al finalizar evaluación:', error);
      toast.error('Error al finalizar la evaluación: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPatient) {
    return null;
  }

  return (
    <div className={`mb-8 text-center ${className}`}>
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center">
          <FaFlagCheckered className="mr-2 text-red-600" />
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

        {/* Botón principal */}
        <button
          onClick={handleFinishTest}
          disabled={loading}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center mx-auto"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Finalizando...
            </>
          ) : (
            <>
              <FaStopCircle className="mr-2" />
              Terminar Prueba
            </>
          )}
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
  );
};

export default FinishEvaluationButton;