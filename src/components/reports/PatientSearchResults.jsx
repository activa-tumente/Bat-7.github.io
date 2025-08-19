/**
 * @file PatientSearchResults.jsx
 * @description Search results component with multi-selection capabilities
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  FaUser, 
  FaCheckSquare, 
  FaSquare, 
  FaFileAlt, 
  FaEye, 
  FaTrashAlt,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaUsers,
  FaCalendar,
  FaIdCard,
  FaGraduationCap
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const PatientSearchResults = ({ 
  searchResults, 
  isLoading, 
  onPatientSelect,
  onBatchGenerate,
  onBatchDelete,
  onViewPatient,
  onPageChange,
  selectedPatients = [],
  onSelectionChange
}) => {
  const [localSelectedPatients, setLocalSelectedPatients] = useState(new Set(selectedPatients));
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    setLocalSelectedPatients(new Set(selectedPatients));
  }, [selectedPatients]);

  useEffect(() => {
    if (searchResults?.patients) {
      const allSelected = searchResults.patients.length > 0 && 
        searchResults.patients.every(patient => localSelectedPatients.has(patient.id));
      setSelectAll(allSelected);
    }
  }, [localSelectedPatients, searchResults?.patients]);

  const handlePatientSelection = (patientId, isSelected) => {
    const newSelection = new Set(localSelectedPatients);
    
    if (isSelected) {
      newSelection.add(patientId);
    } else {
      newSelection.delete(patientId);
    }
    
    setLocalSelectedPatients(newSelection);
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelection));
    }
  };

  const handleSelectAll = () => {
    if (!searchResults?.patients) return;

    const newSelection = new Set();
    
    if (!selectAll) {
      // Select all patients on current page
      searchResults.patients.forEach(patient => {
        newSelection.add(patient.id);
      });
    }
    
    setLocalSelectedPatients(newSelection);
    setSelectAll(!selectAll);
    
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelection));
    }
  };

  const handleBatchAction = (action) => {
    const selectedIds = Array.from(localSelectedPatients);
    
    if (selectedIds.length === 0) {
      toast.warning('Selecciona al menos un paciente');
      return;
    }

    if (action === 'generate' && onBatchGenerate) {
      onBatchGenerate(selectedIds);
    } else if (action === 'delete' && onBatchDelete) {
      onBatchDelete(selectedIds);
    }
  };

  const getTestStatusBadge = (status, completionPercentage) => {
    const badges = {
      completed: { 
        color: 'bg-green-100 text-green-800', 
        text: 'Completo',
        icon: '✓'
      },
      partial: { 
        color: 'bg-yellow-100 text-yellow-800', 
        text: `${completionPercentage}% Completo`,
        icon: '⚡'
      },
      no_tests: { 
        color: 'bg-gray-100 text-gray-800', 
        text: 'Sin Tests',
        icon: '○'
      }
    };

    const badge = badges[status] || badges.no_tests;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <span className="mr-1">{badge.icon}</span>
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
            <span className="text-gray-600">Buscando pacientes...</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!searchResults || searchResults.patients.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-12">
            <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron pacientes
            </h3>
            <p className="text-gray-500">
              Intenta ajustar los filtros de búsqueda para encontrar más resultados.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const { patients, total, page, totalPages, hasNextPage, hasPrevPage } = searchResults;
  const selectedCount = localSelectedPatients.size;

  return (
    <div className="space-y-4">
      {/* Results Header with Bulk Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {selectAll ? <FaCheckSquare className="text-blue-600" /> : <FaSquare />}
                  <span className="ml-2">
                    Seleccionar todos ({patients.length})
                  </span>
                </button>
              </div>
              
              {selectedCount > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
                  </span>
                  
                  <Button
                    onClick={() => handleBatchAction('generate')}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <FaFileAlt className="mr-1" />
                    Generar Informes
                  </Button>
                  
                  <Button
                    onClick={() => handleBatchAction('delete')}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <FaTrashAlt className="mr-1" />
                    Eliminar Informes
                  </Button>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600">
              Mostrando {((page - 1) * 20) + 1}-{Math.min(page * 20, total)} de {total} resultados
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Patient Results Grid */}
      <div className="grid grid-cols-1 gap-4">
        {patients.map((patient) => {
          const isSelected = localSelectedPatients.has(patient.id);
          const isFemale = patient.genero?.toLowerCase().startsWith('f');
          
          return (
            <Card 
              key={patient.id} 
              className={`transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
            >
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  {/* Patient Info */}
                  <div className="flex items-center space-x-4">
                    {/* Selection Checkbox */}
                    <button
                      onClick={() => handlePatientSelection(patient.id, !isSelected)}
                      className="flex-shrink-0"
                    >
                      {isSelected ? 
                        <FaCheckSquare className="text-blue-600 text-lg" /> : 
                        <FaSquare className="text-gray-400 text-lg hover:text-gray-600" />
                      }
                    </button>

                    {/* Gender Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isFemale ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      <span className="text-lg font-bold">
                        {isFemale ? '♀' : '♂'}
                      </span>
                    </div>

                    {/* Patient Details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {patient.nombre} {patient.apellido}
                        </h3>
                        {getTestStatusBadge(
                          patient.testSummary?.status, 
                          patient.testSummary?.completionPercentage
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FaIdCard className="mr-1" />
                          <span>{patient.documento}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <FaGraduationCap className="mr-1" />
                          <span>{patient.instituciones?.nombre || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <FaCalendar className="mr-1" />
                          <span>
                            {formatDate(patient.testSummary?.lastTestDate)}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <FaFileAlt className="mr-1" />
                          <span>
                            {patient.testSummary?.testCount || 0} test{(patient.testSummary?.testCount || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Aptitudes */}
                      {patient.testSummary?.aptitudes && patient.testSummary.aptitudes.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500 mr-2">Aptitudes:</span>
                          <div className="inline-flex flex-wrap gap-1">
                            {patient.testSummary.aptitudes.map((aptitud, index) => (
                              <span 
                                key={index}
                                className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {aptitud}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => onViewPatient && onViewPatient(patient.id)}
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <FaEye className="mr-1" />
                      Ver
                    </Button>
                    
                    <Button
                      onClick={() => onPatientSelect && onPatientSelect(patient)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <FaFileAlt className="mr-1" />
                      Generar
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => onPageChange && onPageChange(page - 1)}
                  disabled={!hasPrevPage}
                  variant="outline"
                  size="sm"
                >
                  <FaChevronLeft className="mr-1" />
                  Anterior
                </Button>
                
                <span className="px-3 py-1 bg-gray-100 rounded text-sm">
                  {page}
                </span>
                
                <Button
                  onClick={() => onPageChange && onPageChange(page + 1)}
                  disabled={!hasNextPage}
                  variant="outline"
                  size="sm"
                >
                  Siguiente
                  <FaChevronRight className="ml-1" />
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default PatientSearchResults;