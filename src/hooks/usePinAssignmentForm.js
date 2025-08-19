import { useState, useCallback, useMemo } from 'react';
import { PinValidator } from '../services/pin/PinValidator';
import { PIN_CONSTANTS } from '../services/pin/PinConstants';

/**
 * Custom hook for pin assignment form validation and state management
 * Uses existing PinValidator and PinConstants
 */
export const usePinAssignmentForm = () => {
  const [selectedPsychologist, setSelectedPsychologist] = useState('');
  const [pinAmount, setPinAmount] = useState('');
  const [isUnlimited, setIsUnlimited] = useState(false);

  // Use constants from existing system
  const pinOptions = useMemo(() => [
    1, 5, 25, 50, 100, 
    PIN_CONSTANTS.THRESHOLDS.BULK_ASSIGNMENT_MIN,
    PIN_CONSTANTS.THRESHOLDS.BULK_ASSIGNMENT_MAX
  ], []);

  const validation = useMemo(() => {
    const errors = [];
    
    if (!selectedPsychologist) {
      errors.push('Debe seleccionar un psicólogo');
    }

    if (!isUnlimited) {
      const amount = parseInt(pinAmount);
      if (!pinAmount || amount <= 0) {
        errors.push('Debe ingresar una cantidad válida de pines');
      } else if (amount > PIN_CONSTANTS.THRESHOLDS.BULK_ASSIGNMENT_MAX) {
        errors.push(`La cantidad máxima es ${PIN_CONSTANTS.THRESHOLDS.BULK_ASSIGNMENT_MAX} pines`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [selectedPsychologist, pinAmount, isUnlimited]);

  const handlePinOptionClick = useCallback((amount) => {
    setPinAmount(amount.toString());
  }, []);

  const resetForm = useCallback(() => {
    setSelectedPsychologist('');
    setPinAmount('');
    setIsUnlimited(false);
  }, []);

  const getFormData = useCallback(() => ({
    psychologistId: selectedPsychologist,
    amount: isUnlimited ? 0 : parseInt(pinAmount),
    isUnlimited,
    planType: isUnlimited ? PIN_CONSTANTS.PLAN_TYPES.UNLIMITED : PIN_CONSTANTS.PLAN_TYPES.ASSIGNED
  }), [selectedPsychologist, pinAmount, isUnlimited]);

  return {
    // State
    selectedPsychologist,
    pinAmount,
    isUnlimited,
    pinOptions,
    validation,
    
    // Actions
    setSelectedPsychologist,
    setPinAmount,
    setIsUnlimited,
    handlePinOptionClick,
    resetForm,
    getFormData
  };
};

export default usePinAssignmentForm;