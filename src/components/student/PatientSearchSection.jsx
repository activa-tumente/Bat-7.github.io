import React, { memo } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const PatientSearchSection = memo(({ 
  searchTerm, 
  onSearchChange, 
  showFilters, 
  onToggleFilters,
  filters,
  onFilterChange,
  onClearFilters,
  filteredPatients,
  onSelectPatient,
  loading 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          <FaSearch className="inline mr-3 text-blue-600" />
          Buscar Paciente
        </h2>
        <button
          onClick={onToggleFilters}
          className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
            showFilters 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <i className={`fas fa-filter mr-2 ${showFilters ? 'text-white' : 'text-gray-500'}`}></i>
          {showFilters ? 'Ocultar Filtros' : 'Filtros Avanzados'}
        </button>
      </div>
      
      {/* Search Input */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido, documento o email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
        />
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        
        {(searchTerm || Object.values(filters).some(f => f)) && (
          <button
            onClick={onClearFilters}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200"
            title="Limpiar búsqueda y filtros"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <AdvancedFilters 
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
        />
      )}

      {/* Results Count */}
      {(searchTerm || Object.values(filters).some(f => f)) && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <i className="fas fa-info-circle mr-2"></i>
            Se encontraron <span className="font-semibold">{filteredPatients.length}</span> paciente(s)
          </p>
        </div>
      )}

      {/* Patient List */}
      <PatientList 
        patients={filteredPatients}
        onSelectPatient={onSelectPatient}
        loading={loading}
        searchTerm={searchTerm}
      />
    </div>
  );
});

PatientSearchSection.displayName = 'PatientSearchSection';

export default PatientSearchSection;