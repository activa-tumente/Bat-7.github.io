import React, { useState } from 'react';
import { 
  FaTrash, FaCheckCircle, FaTimesCircle, FaClock, 
  FaTimes, FaChevronDown 
} from 'react-icons/fa';

/**
 * Bulk actions component for candidates
 */
const BulkActions = ({ 
  selectedCount, 
  onBulkDelete, 
  onBulkStatusChange, 
  onClearSelection 
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const statusOptions = [
    { value: 'activo', label: 'Activo', icon: FaCheckCircle, color: 'text-green-600' },
    { value: 'inactivo', label: 'Inactivo', icon: FaTimesCircle, color: 'text-red-600' },
    { value: 'pendiente', label: 'Pendiente', icon: FaClock, color: 'text-yellow-600' }
  ];

  const handleStatusChange = (status) => {
    onBulkStatusChange(status);
    setShowStatusMenu(false);
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <span className="text-sm font-medium text-orange-800">
              {selectedCount} candidato{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Status Change Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Cambiar Estado
                <FaChevronDown className="ml-2 h-3 w-3" />
              </button>
              
              {showStatusMenu && (
                <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="py-1">
                    {statusOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(option.value)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Icon className={`mr-3 ${option.color}`} />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Delete Button */}
            <button
              onClick={onBulkDelete}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <FaTrash className="mr-2" />
              Eliminar Seleccionados
            </button>
          </div>
        </div>

        {/* Clear Selection */}
        <button
          onClick={onClearSelection}
          className="flex items-center text-sm text-orange-600 hover:text-orange-800 transition-colors"
        >
          <FaTimes className="mr-1" />
          Limpiar Selección
        </button>
      </div>
    </div>
  );
};

export default BulkActions;
