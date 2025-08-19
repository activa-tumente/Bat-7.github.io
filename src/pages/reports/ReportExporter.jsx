import React, { useState } from 'react';
import { 
  FaDownload, 
  FaFilePdf, 
  FaFileWord, 
  FaFileExcel,
  FaCog,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { withPsychologistProtection } from '../../hoc/withRoleProtection';

/**
 * Componente para exportar informes en diferentes formatos
 * Permite configurar opciones de exportación y generar archivos
 */
const ReportExporter = ({ reportIds = [], onClose, onExport }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeDetailedAnalysis: true,
    includeRecommendations: true,
    includeRawData: false,
    combineReports: false,
    addWatermark: true,
    pageOrientation: 'portrait',
    fontSize: 'normal',
    colorScheme: 'color'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF',
      icon: FaFilePdf,
      description: 'Formato ideal para compartir y imprimir',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'docx',
      name: 'Word',
      icon: FaFileWord,
      description: 'Documento editable de Microsoft Word',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'xlsx',
      name: 'Excel',
      icon: FaFileExcel,
      description: 'Hoja de cálculo con datos tabulados',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  const handleOptionChange = (option, value) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simular progreso de exportación
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simular llamada a API de exportación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setExportProgress(100);

      // Simular descarga
      const exportData = {
        reportIds,
        format: exportFormat,
        options: exportOptions
      };

      console.log('Exportando informes:', exportData);
      
      // Aquí implementarías la lógica real de exportación
      // Por ejemplo, llamar a una API que genere el archivo
      
      if (onExport) {
        onExport(exportData);
      }

      // Simular descarga del archivo
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        if (onClose) {
          onClose();
        }
      }, 1000);

    } catch (error) {
      console.error('Error exportando informes:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const selectedFormat = exportFormats.find(f => f.id === exportFormat);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Exportar Informes
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {reportIds.length} informe{reportIds.length !== 1 ? 's' : ''} seleccionado{reportIds.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Selección de formato */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Formato de Exportación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exportFormats.map((format) => {
                const IconComponent = format.icon;
                const isSelected = exportFormat === format.id;
                
                return (
                  <button
                    key={format.id}
                    onClick={() => setExportFormat(format.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                      isSelected 
                        ? `${format.borderColor} ${format.bgColor}` 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <IconComponent className={`h-6 w-6 mr-3 ${format.color}`} />
                      <span className="font-medium text-gray-900">
                        {format.name}
                      </span>
                      {isSelected && (
                        <FaCheck className="h-4 w-4 ml-auto text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {format.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Opciones de exportación */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaCog className="h-5 w-5 mr-2" />
              Opciones de Exportación
            </h3>
            
            <div className="space-y-4">
              {/* Contenido a incluir */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Contenido a incluir</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeCharts}
                      onChange={(e) => handleOptionChange('includeCharts', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Gráficos y visualizaciones</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeDetailedAnalysis}
                      onChange={(e) => handleOptionChange('includeDetailedAnalysis', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Análisis detallado</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeRecommendations}
                      onChange={(e) => handleOptionChange('includeRecommendations', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Recomendaciones</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeRawData}
                      onChange={(e) => handleOptionChange('includeRawData', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Datos en bruto</span>
                  </label>
                </div>
              </div>

              {/* Opciones de formato */}
              {exportFormat === 'pdf' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Opciones de PDF</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Orientación
                      </label>
                      <select
                        value={exportOptions.pageOrientation}
                        onChange={(e) => handleOptionChange('pageOrientation', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="portrait">Vertical</option>
                        <option value="landscape">Horizontal</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tamaño de fuente
                      </label>
                      <select
                        value={exportOptions.fontSize}
                        onChange={(e) => handleOptionChange('fontSize', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="small">Pequeña</option>
                        <option value="normal">Normal</option>
                        <option value="large">Grande</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.addWatermark}
                        onChange={(e) => handleOptionChange('addWatermark', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">Agregar marca de agua</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Opciones múltiples informes */}
              {reportIds.length > 1 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Múltiples informes</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.combineReports}
                      onChange={(e) => handleOptionChange('combineReports', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Combinar en un solo archivo
                    </span>
                  </label>
                  <p className="ml-7 text-xs text-gray-500 mt-1">
                    Si no se selecciona, se generará un archivo ZIP con todos los informes
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Progreso de exportación */}
          {isExporting && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-sm font-medium text-blue-900">
                  Exportando informes... {exportProgress}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Formato: <span className="font-medium">{selectedFormat?.name}</span>
            {reportIds.length > 1 && exportOptions.combineReports && (
              <span className="ml-2 text-blue-600">(Combinado)</span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
            >
              <FaDownload className="h-4 w-4 mr-2" />
              {isExporting ? 'Exportando...' : 'Exportar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withPsychologistProtection(ReportExporter);
