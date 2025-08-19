import React from 'react';
import { FaSpinner, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import { PIN_CONSTANTS } from '../../services/pin/PinConstants';

/**
 * Loading state component for pin status
 */
export const PinLoadingState = () => (
  <div className="flex items-center justify-center p-8">
    <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
    <span className="ml-3 text-gray-600">Verificando permisos...</span>
  </div>
);

/**
 * Error state component for pin access denied
 */
export const PinErrorState = ({ error, pinStatus, onRefresh }) => (
  <div className="max-w-md mx-auto mt-8">
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <FaLock className="text-red-500 text-2xl mr-3" />
        <h3 className="text-lg font-semibold text-red-800">
          Acceso Restringido
        </h3>
      </div>
      
      <p className="text-red-700 mb-4">{error}</p>
      
      {pinStatus && !pinStatus.isUnlimited && (
        <PinStatusDetails pinStatus={pinStatus} />
      )}
      
      <div className="flex flex-col space-y-3">
        <button
          onClick={onRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Verificar Nuevamente
        </button>
        
        <p className="text-sm text-red-600">
          <FaExclamationTriangle className="inline mr-1" />
          Contacta al administrador para obtener más pines
        </p>
      </div>
    </div>
  </div>
);

/**
 * Pin status details component
 */
export const PinStatusDetails = ({ pinStatus }) => (
  <div className="bg-white rounded-lg p-4 mb-4">
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-gray-600">Pines Totales:</span>
        <span className="font-medium ml-2">{pinStatus.totalPins || 0}</span>
      </div>
      <div>
        <span className="text-gray-600">Pines Usados:</span>
        <span className="font-medium ml-2">{pinStatus.usedPins || 0}</span>
      </div>
      <div>
        <span className="text-gray-600">Pines Restantes:</span>
        <span className="font-medium ml-2">{pinStatus.remainingPins || 0}</span>
      </div>
      <div>
        <span className="text-gray-600">Estado:</span>
        <span className="font-medium ml-2">{pinStatus.reason}</span>
      </div>
    </div>
  </div>
);

/**
 * Low pins warning component
 */
export const LowPinsWarning = ({ remainingPins }) => (
  <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <div className="flex items-center">
      <FaExclamationTriangle className="text-yellow-500 mr-2" />
      <div>
        <p className="text-yellow-800 font-medium">
          Quedan solo {remainingPins} pines disponibles
        </p>
        <p className="text-yellow-700 text-sm">
          Contacta al administrador para obtener más pines antes de que se agoten
        </p>
      </div>
    </div>
  </div>
);