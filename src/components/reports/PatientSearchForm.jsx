/**
 * @file PatientSearchForm.jsx
 * @description Advanced search form for patients with BAT-7 results
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { FaSearch, FaFilter, FaChevronDown, FaChevronUp, FaDownload, FaTimes } from 'react-icons/fa';
import PatientSearchService from '../../services/PatientSearchService';
import { toast } from 'react-toastify';

const PatientSearchForm = ({ onSearch, onStatsUpdate, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    institution: '',
    gender: 'all',
    dateFrom: '',
    dateTo: '',
    patientName: '',
    document: '',
    testStatus: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
    ...initialFilters
  });

  const [institutions, setInstitutions] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchStats, setSearchStats] = useState(null);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load institutions on component mount
  useEffect(() => {
    loadInstitutions();
    loadSearchStats();
  }, []);

  const loadInstitutions = async () => {
    try {
      const institutionList = await PatientSearchService.getInstitutions();
      setInstitutions(institutionList);
    } catch (error) {
      console.error('Error loading institutions:', error);
      toast.error('Error al cargar instituciones');
    }
  };

  const loadSearchStats = async () => {
    try {
      const stats = await PatientSearchService.getSearchStats();
      setSearchStats(stats);
      if (onStatsUpdate) onStatsUpdate(stats);
    } catch (error) {
      console.error('Error loading search stats:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNameInputChange = async (value) => {
    handleFilterChange('patientName', value);
    
    if (value.length >= 2) {
      try {
        const suggestions = await PatientSearchService.getPatientNameSuggestions(value);
        setNameSuggestions(suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error getting suggestions:', error);
      }
    } else {
      setNameSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleFilterChange('patientName', suggestion.value);
    setShowSuggestions(false);
    setNameSuggestions([]);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      if (onSearch) {
        await onSearch(filters);
      }
    } catch (error) {
      console.error('Error in search:', error);
      toast.error('Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      institution: '',
      gender: 'all',
      dateFrom: '',
      dateTo: '',
      patientName: '',
      document: '',
      testStatus: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    setNameSuggestions([]);
    setShowSuggestions(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.institution) count++;
    if (filters.gender !== 'all') count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.patientName.trim()) count++;
    if (filters.document.trim()) count++;
    if (filters.testStatus !== 'all') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaSearch className="text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              Búsqueda Avanzada de Pacientes
            </h2>
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {searchStats && (
              <span className="text-sm text-gray-600">
                {searchStats.totalPatients} pacientes con resultados
              </span>
            )}
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <FaFilter className="mr-1" />
              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardBody>
        {/* Quick Search Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Paciente
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre o apellido..."
              value={filters.patientName}
              onChange={(e) => handleNameInputChange(e.target.value)}
              onFocus={() => nameSuggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* Name Suggestions Dropdown */}
            {showSuggestions && nameSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {nameSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    <div className="font-medium text-gray-900">{suggestion.label}</div>
                    <div className="text-sm text-gray-500">{suggestion.sublabel}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institución
            </label>
            <select
              value={filters.institution}
              onChange={(e) => handleFilterChange('institution', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las instituciones</option>
              {institutions.map((institution) => (
                <option key={institution.id} value={institution.id}>
                  {institution.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado de Evaluación
            </label>
            <select
              value={filters.testStatus}
              onChange={(e) => handleFilterChange('testStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="completed">Evaluación completa</option>
              <option value="partial">Evaluación parcial</option>
              <option value="no_tests">Sin evaluaciones</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters (Collapsible) */}
        {isExpanded && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documento
                </label>
                <input
                  type="text"
                  placeholder="Número de documento"
                  value={filters.document}
                  onChange={(e) => handleFilterChange('document', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Género
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordenar por
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="created_at">Fecha de registro</option>
                  <option value="name">Nombre</option>
                  <option value="apellido">Apellido</option>
                  <option value="documento">Documento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orden
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="desc">Descendente</option>
                  <option value="asc">Ascendente</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            >
              <FaSearch className="mr-2" />
              {isLoading ? 'Buscando...' : 'Buscar'}
            </Button>
            
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="flex items-center"
            >
              <FaTimes className="mr-2" />
              Limpiar
            </Button>
          </div>

          {searchStats && (
            <div className="text-sm text-gray-600">
              <span className="mr-4">
                Total: {searchStats.totalPatients} pacientes
              </span>
              <span className="mr-4">
                ♂ {searchStats.genderDistribution.male}
              </span>
              <span>
                ♀ {searchStats.genderDistribution.female}
              </span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default PatientSearchForm;