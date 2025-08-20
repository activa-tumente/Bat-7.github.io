import React, { useMemo } from 'react';
import { usePinControlStatus } from '../hooks/usePinControl';
import { PIN_CONSTANTS } from '../services/pin/PinConstants';
import PinStatusIndicator from '../components/common/PinStatusIndicator';
import { 
  PinLoadingState, 
  PinErrorState, 
  LowPinsWarning 
} from '../components/common/PinStatusDisplay';

/**
 * Higher-Order Component que agrega control de pines a cualquier componente
 * Verifica automáticamente si el psicólogo puede usar el sistema
 * 
 * @param {React.Component} WrappedComponent - Componente a envolver
 * @param {Object} options - Opciones de configuración
 * @returns {React.Component} Componente envuelto con control de pines
 */
const withPinControl = (WrappedComponent, options = {}) => {
  const {
    requirePins = true,
    showPinStatus = true,
    blockOnNoPins = true,
    customErrorMessage = null,
    psychologistIdProp = 'psychologistId'
  } = options;

  return function PinControlledComponent(props) {
    const psychologistId = props[psychologistIdProp];
    
    // Use the existing hook instead of duplicating logic
    const {
      pinStatus,
      loading,
      error,
      canUse,
      remainingPins,
      isUnlimited,
      refreshStatus
    } = usePinControlStatus(psychologistId, { showToastOnError: false });

    // Memoize enhanced props to prevent unnecessary re-renders
    const enhancedProps = useMemo(() => ({
      ...props,
      pinStatus,
      refreshPinStatus: refreshStatus,
      canUsePins: canUse,
      remainingPins,
      isUnlimitedPins: isUnlimited
    }), [props, pinStatus, refreshStatus, canUse, remainingPins, isUnlimited]);

    // Early returns for different states
    if (!requirePins || !psychologistId) {
      return <WrappedComponent {...enhancedProps} />;
    }

    if (loading) {
      return <PinLoadingState />;
    }

    if (error && blockOnNoPins) {
      return (
        <PinErrorState 
          error={customErrorMessage || error}
          pinStatus={pinStatus}
          onRefresh={refreshStatus}
        />
      );
    }

    if (!canUse && blockOnNoPins) {
      return (
        <PinErrorState 
          error={customErrorMessage || pinStatus?.reason || 'No se puede acceder al sistema'}
          pinStatus={pinStatus}
          onRefresh={refreshStatus}
        />
      );
    }

    // Determine if should show low pins warning
    const shouldShowLowPinsWarning = pinStatus && 
      !isUnlimited && 
      canUse && 
      remainingPins <= PIN_CONSTANTS.THRESHOLDS.LOW_PIN_WARNING;

    return (
      <div className="relative">
        {showPinStatus && psychologistId && pinStatus && (
          <div className="mb-4 flex justify-end">
            <PinStatusIndicator 
              psychologistId={psychologistId}
              className="shadow-sm"
            />
          </div>
        )}
        
        {shouldShowLowPinsWarning && (
          <LowPinsWarning remainingPins={remainingPins} />
        )}
        
        <WrappedComponent {...enhancedProps} />
      </div>
    );
  };
};

// ✅ This hook should be removed - use the existing usePinControl hook instead
// The logic is already implemented in src/hooks/usePinControl.js

export default withPinControl;