import React, { useState } from 'react';
import { FaTimes, FaDownload, FaFileCsv, FaFilePdf, FaUsers, FaCheck } from 'react-icons/fa';

/**
 * Export modal component for candidates
 */
const ExportModal = ({ 
  isOpen, 
  onClose, 
  onExport, 
  totalCount, 
  selectedCount 
}) => {
  const [format, setFormat] = useState('csv');
  const [scope, setScope] = useState('all');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport(format, scope === 'selected');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Exportar Candidatos
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Formato de Exportación
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  format === 'csv' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                }`}>
                  {format === 'csv' && <FaCheck className="text-white text-xs" />}
                </div>
                <FaFileCsv className="text-green-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">CSV (Excel)</div>
                  <div className="text-sm text-gray-500">
                    Archivo de valores separados por comas
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={format === 'pdf'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  format === 'pdf' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                }`}>
                  {format === 'pdf' && <FaCheck className="text-white text-xs" />}
                </div>
                <FaFilePdf className="text-red-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">PDF</div>
                  <div className="text-sm text-gray-500">
                    Documento portable (en desarrollo)
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Scope Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Candidatos a Exportar
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="scope"
                  value="all"
                  checked={scope === 'all'}
                  onChange={(e) => setScope(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  scope === 'all' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                }`}>
                  {scope === 'all' && <FaCheck className="text-white text-xs" />}
                </div>
                <FaUsers className="text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">
                    Todos los candidatos filtrados
                  </div>
                  <div className="text-sm text-gray-500">
                    {totalCount} candidatos
                  </div>
                </div>
              </label>

              {selectedCount > 0 && (
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="scope"
                    value="selected"
                    checked={scope === 'selected'}
                    onChange={(e) => setScope(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    scope === 'selected' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                  }`}>
                    {scope === 'selected' && <FaCheck className="text-white text-xs" />}
                  </div>
                  <FaCheck className="text-orange-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Solo candidatos seleccionados
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedCount} candidatos seleccionados
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Export Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <FaDownload className="text-blue-600 mt-1 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">
                  Información de Exportación
                </h4>
                <p className="text-sm text-blue-700">
                  Se exportarán los siguientes campos: Nombre, Apellidos, Documento, 
                  Email, Teléfono, Estado, Fecha de Registro.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <FaDownload className="mr-2" />
            Exportar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
