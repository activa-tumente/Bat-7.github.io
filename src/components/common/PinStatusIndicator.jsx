import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaCoins, FaInfinity, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import pinControlService from '../../services/pin/ImprovedPinControlService';
import { PinStatusStrategyFactory } from '../../services/pin/PinStatusStrategy';

/**
 * Componente que muestra el estado de pines del psicólogo actual
 */
const PinStatusIndicator = ({ psychologistId, className = '' }) => {
  const [pinStatus, setPinStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (psychologistId) {
      loadPinStatus();
    }
  }, [psychologistId, loadPinStatus]);

  const loadPinStatus = useCallback(async () => {
    try {
      setLoading(true);
      const status = await pinControlService.checkPsychologistUsage(psychologistId);
      setPinStatus(status);
    } catch (error) {
      console.error('Error al cargar estado de pines:', error);
    } finally {
      setLoading(false);
    }
  }, [psychologistId]);

  // Memoize display information using strategy pattern
  const displayInfo = useMemo(() => {
    if (loading || !pinStatus) return null;
    
    const strategy = PinStatusStrategyFactory.createStrategy(pinStatus);
    return strategy.getDisplayInfo(pinStatus);
  }, [loading, pinStatus]);

  const statusIcon = useMemo(() => {
    if (!displayInfo) return null;
    
    switch (displayInfo.icon) {
      case 'FaInfinity':
        return <FaInfinity className="w-4 h-4" />;
      case 'FaExclamationTriangle':
        return <FaExclamationTriangle className="w-4 h-4" />;
      default:
        return <FaCoins className="w-4 h-4" />;
    }
  }, [displayInfo]);

  if (loading || !pinStatus || !displayInfo) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${displayInfo.color}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {statusIcon}
        <span className="text-sm font-medium">{displayInfo.text}</span>
      </div>

      {showDetails && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Estado de Pines</h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Estado:</span>
              <span className={`text-sm font-medium ${
                pinStatus.canUse ? 'text-green-600' : 'text-red-600'
              }`}>
                {pinStatus.reason}
              </span>
            </div>

            {!pinStatus.isUnlimited && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pines Totales:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {pinStatus.totalPins || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pines Usados:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {pinStatus.usedPins || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pines Restantes:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {pinStatus.remainingPins || 0}
                  </span>
                </div>

                {pinStatus.totalPins > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progreso de uso</span>
                      <span>{Math.round(((pinStatus.usedPins || 0) / pinStatus.totalPins) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          pinStatus.remainingPins <= 5 ? 'bg-red-500' : 
                          pinStatus.remainingPins <= 10 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{
                          width: `${Math.min(((pinStatus.usedPins || 0) / pinStatus.totalPins) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </>
            )}

            {pinStatus.isUnlimited && (
              <div className="text-center py-2">
                <FaInfinity className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Tienes acceso ilimitado al sistema
                </p>
              </div>
            )}

            {!pinStatus.canUse && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                <div className="flex items-center">
                  <FaExclamationTriangle className="w-4 h-4 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">
                    Contacta al administrador para obtener más pines
                  </p>
                </div>
              </div>
            )}

            {pinStatus.canUse && pinStatus.remainingPins <= 5 && !pinStatus.isUnlimited && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                <div className="flex items-center">
                  <FaExclamationTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                  <p className="text-sm text-yellow-700">
                    Quedan pocos pines disponibles
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={loadPinStatus}
              className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Actualizar Estado
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PinStatusIndicator;