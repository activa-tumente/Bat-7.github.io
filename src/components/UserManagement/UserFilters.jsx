/**
 * Componente de filtros para la gestión de usuarios
 */

import React, { useState, useEffect } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import supabase from '../../api/supabaseClient';

const UserFilters = ({ filters, onFiltersChange, onResetFilters }) => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar instituciones para el filtro
  useEffect(() => {
    const fetchInstitutions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('instituciones')
          .select('id, nombre')
          .eq('activo', true)
          .order('nombre');

        if (error) throw error;
        setInstitutions(data || []);
      } catch (error) {
        console.error('Error al cargar instituciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, []);

  const userTypes = [
    { value: '', label: 'Todos los tipos' },
    { value: 'Administrador', label: 'Administrador' },
    { value: 'Psicólogo', label: 'Psicólogo' },
    { value: 'Candidato', label: 'Candidato' }
  ];

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'true', label: 'Activos' },
    { value: 'false', label: 'Inactivos' }
  ];

  const handleFilterChange = (key, value) => {
    // Convertir string a boolean para el filtro activo
    if (key === 'activo') {
      value = value === '' ? undefined : value === 'true';
    }
    
    onFiltersChange({ [key]: value });
  };

  const hasActiveFilters = () => {
    return filters.tipo_usuario || 
           filters.activo !== undefined || 
           filters.institucion_id;
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FaFilter className="h-4 w-4 text-gray-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
          {hasActiveFilters() && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              Filtros activos
            </span>
          )}
        </div>
        {hasActiveFilters() && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <FaTimes className="h-3 w-3 mr-1" />
            Limpiar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro por tipo de usuario */}
        <div>
          <label htmlFor="tipo_usuario" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Usuario
          </label>
          <select
            id="tipo_usuario"
            value={filters.tipo_usuario || ''}
            onChange={(e) => handleFilterChange('tipo_usuario', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          >
            {userTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por estado */}
        <div>
          <label htmlFor="activo" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="activo"
            value={filters.activo === undefined ? '' : filters.activo.toString()}
            onChange={(e) => handleFilterChange('activo', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por institución */}
        <div>
          <label htmlFor="institucion_id" className="block text-sm font-medium text-gray-700 mb-1">
            Institución
          </label>
          <select
            id="institucion_id"
            value={filters.institucion_id || ''}
            onChange={(e) => handleFilterChange('institucion_id', e.target.value)}
            disabled={loading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm disabled:bg-gray-100"
          >
            <option value="">Todas las instituciones</option>
            {institutions.map((institution) => (
              <option key={institution.id} value={institution.id}>
                {institution.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por tamaño de página */}
        <div>
          <label htmlFor="pageSize" className="block text-sm font-medium text-gray-700 mb-1">
            Elementos por página
          </label>
          <select
            id="pageSize"
            value={filters.pageSize || 10}
            onChange={(e) => handleFilterChange('pageSize', parseInt(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Filtros avanzados (expandible) */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtro por fecha de creación */}
          <div>
            <label htmlFor="fecha_desde" className="block text-sm font-medium text-gray-700 mb-1">
              Creado desde
            </label>
            <input
              type="date"
              id="fecha_desde"
              value={filters.fecha_desde || ''}
              onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="fecha_hasta" className="block text-sm font-medium text-gray-700 mb-1">
              Creado hasta
            </label>
            <input
              type="date"
              id="fecha_hasta"
              value={filters.fecha_hasta || ''}
              onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Resumen de filtros activos */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Filtros activos:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {filters.tipo_usuario && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Tipo: {filters.tipo_usuario}
                  <button
                    onClick={() => handleFilterChange('tipo_usuario', '')}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                  >
                    <FaTimes className="w-2 h-2" />
                  </button>
                </span>
              )}
              {filters.activo !== undefined && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Estado: {filters.activo ? 'Activo' : 'Inactivo'}
                  <button
                    onClick={() => handleFilterChange('activo', '')}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-600"
                  >
                    <FaTimes className="w-2 h-2" />
                  </button>
                </span>
              )}
              {filters.institucion_id && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Institución: {institutions.find(i => i.id === filters.institucion_id)?.nombre || 'Seleccionada'}
                  <button
                    onClick={() => handleFilterChange('institucion_id', '')}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-600"
                  >
                    <FaTimes className="w-2 h-2" />
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFilters;
