import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { FaSpinner, FaTimes, FaCoins, FaInfinity, FaExclamationTriangle } from 'react-icons/fa';
import PinManagementService from '../../services/pin/PinManagementService';
import { usePsychologists } from '../../hooks/usePsychologists';
import { usePinAssignmentForm } from '../../hooks/usePinAssignmentForm';
import ErrorBoundary from '../common/ErrorBoundary';

/**
 * Modal for assigning pins to psychologists
 * Follows established patterns from the pin control system
 */
const PinAssignmentModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  
  // Use custom hooks for separation of concerns
  const { psychologists, loading: loadingPsychologists, error: psychologistsError } = usePsychologists();
  const {
    selectedPsychologist,
    pinAmount,
    isUnlimited,
    pinOptions,
    validation,
    setSelectedPsychologist,
    setPinAmount,
    setIsUnlimited,
    handlePinOptionClick,
    resetForm,
    getFormData
  } = usePinAssignmentForm();

  /**
   * Reset form when modal closes
   */
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  /**
   * Handle pin assignment with proper validation
   */
  const handleAssignPins = useCallback(async () => {
    // Use validation from custom hook
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.warn(error));
      return;
    }

    try {
      setLoading(true);
      const formData = getFormData();
      
      await PinManagementService.assignPins(
        formData.psychologistId,
        formData.amount,
        `Asignación manual ${formData.isUnlimited ? 'ilimitada' : `de ${formData.amount} pines`} desde modal`
      );

      resetForm();
      onSuccess?.();
      onClose();
      
      toast.success(
        `Pines ${formData.isUnlimited ? 'ilimitados' : formData.amount} asignados correctamente`
      );
      
    } catch (error) {
      console.error('Error asignando pines:', error);
      toast.error('Error al asignar pines: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [validation, getFormData, resetForm, onSuccess, onClose]);

  /**
   * Handle modal close with loading state check
   */
  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  /**
   * Memoize selected psychologist data for performance
   */
  const selectedPsychologistData = useMemo(() => {
    return psychologists.find(p => p.id === selectedPsychologist);
  }, [psychologists, selectedPsychologist]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaCoins className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900" id="modal-title">
                Asignar Pines
              </h2>
              <p className="text-sm text-gray-500">Gestiona la asignación de pines a psicólogos</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Cerrar modal"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Selector de Psicólogo */}
          <div className="mb-6">
            <label htmlFor="psychologist-select" className="block text-sm font-semibold text-gray-700 mb-3">
              Seleccionar Psicólogo
            </label>
            {loadingPsychologists ? (
              <div className="flex items-center justify-center py-3">
                <FaSpinner className="animate-spin text-blue-500 mr-2" />
                <span className="text-gray-600">Cargando psicólogos...</span>
              </div>
            ) : psychologistsError ? (
              <div className="flex items-center py-3 text-red-600">
                <FaExclamationTriangle className="mr-2" />
                <span className="text-sm">{psychologistsError}</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  id="psychologist-select"
                  value={selectedPsychologist}
                  onChange={(e) => setSelectedPsychologist(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer transition-all disabled:bg-gray-100"
                  disabled={loading}
                  aria-describedby="psychologist-help"
                >
                  <option value="">Seleccionar psicólogo...</option>
                  {psychologists.map((psychologist) => (
                    <option key={psychologist.id} value={psychologist.id}>
                      {psychologist.nombre} {psychologist.apellido} - {psychologist.email}
                      {psychologist.currentPins !== undefined && ` (${psychologist.currentPins} pines actuales)`}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
            <p id="psychologist-help" className="text-xs text-gray-500 mt-1">
              Selecciona el psicólogo al que deseas asignar pines
            </p>
          </div>

          {/* Cantidad de Pines */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Cantidad de Pines
            </label>
            
            {/* Opciones rápidas mejoradas */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {pinOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handlePinOptionClick(option)}
                  className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all transform hover:scale-105 ${
                    pinAmount === option.toString()
                      ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                  disabled={loading}
                >
                  {option}
                </button>
              ))}
            </div>
            
            {/* Input personalizado mejorado */}
            <div className="relative">
              <input
                type="number"
                min="1"
                max="1000"
                placeholder="Cantidad personalizada"
                value={pinAmount}
                onChange={(e) => setPinAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <FaCoins className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            {/* Indicador visual del valor seleccionado */}
            {pinAmount && parseInt(pinAmount) > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700 font-medium">
                    Pines a asignar:
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {pinAmount}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Información adicional */}
          {selectedPsychologist && pinAmount && (
            <div className="mb-6 p-3 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-center text-blue-800">
                <FaCoins className="mr-2" />
                <span className="text-sm">
                  Se asignarán <strong>{pinAmount} pines</strong> al psicólogo seleccionado
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssignPins}
            disabled={loading || !selectedPsychologist || !pinAmount}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Asignando...
              </>
            ) : (
              <>
                <FaCoins className="mr-2" />
                Asignar Pines
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinAssignmentModal;