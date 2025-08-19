import React, { useState, useEffect, useCallback } from 'react';
import supabase from '../../api/supabaseClient';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import PatientCard from '../../components/patient/PatientCard';
import { 
  FaSpinner, FaSearch, FaFilter, FaSortAlphaDown, FaSortAlphaUp, 
  FaUser, FaArrowUp, FaTable, FaTh, FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';
import { debounce } from 'lodash';

// Componente para la tabla de pacientes
const PatientsTable = ({ patients, loading, onSelectPatient }) => {
  if (loading) return null;
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Género</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Nacimiento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Psicólogo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{patient.nombre} {patient.apellidos}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{patient.documento_identidad}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{patient.genero}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{new Date(patient.fecha_nacimiento).toLocaleDateString()}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {patient.psicologo ? `${patient.psicologo.nombre} ${patient.psicologo.apellido}` : 'No asignado'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  onClick={() => onSelectPatient(patient)} 
                  className="text-blue-600 hover:text-blue-900"
                >
                  Ver detalles
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Patients = () => {
  // Estados para la gestión de pacientes
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortField, setSortField] = useState('nombre');
  const [filterGender, setFilterGender] = useState('');
  
  // Estado para el modo de visualización
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'table'
  
  // Función para obtener pacientes de Supabase con paginación y filtros en el servidor
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      
      // Construir la consulta base
      let query = supabase
        .from('pacientes')
        .select(`
          *,
          psicologo:psicologo_id (
            id, nombre, apellido
          )
        `, { count: 'exact' });
      
      // Aplicar filtros en el servidor
      if (searchTerm) {
        query = query.or(
          `nombre.ilike.%${searchTerm}%,apellidos.ilike.%${searchTerm}%,documento_identidad.ilike.%${searchTerm}%`
        );
      }
      
      if (filterGender) {
        query = query.eq('genero', filterGender);
      }
      
      // Aplicar ordenamiento
      query = query.order(sortField, { ascending: sortOrder === 'asc' });
      
      // Aplicar paginación
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Ejecutar la consulta con paginación
      const { data, error, count } = await query.range(from, to);
      
      if (error) throw error;
      
      setPatients(data || []);
      setFilteredPatients(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error al cargar pacientes:', error.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterGender, sortOrder, sortField, currentPage, pageSize]);
  
  // Cargar pacientes cuando cambien los filtros o la paginación
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);
  
  // Función debounce para la búsqueda
  const debouncedSearch = useCallback(
    debounce((term) => {
      setSearchTerm(term);
      setCurrentPage(1); // Resetear a la primera página al buscar
    }, 500),
    []
  );
  
  // Manejador para el cambio en el input de búsqueda
  const handleSearchChange = (e) => {
    const term = e.target.value;
    // Actualizar el valor del input inmediatamente
    e.target.value = term;
    // Debounce la búsqueda real
    debouncedSearch(term);
  };
  
  // Cambiar orden de clasificación
  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1); // Resetear a la primera página al cambiar el orden
  };
  
  // Cambiar campo de ordenamiento
  const handleSortFieldChange = (e) => {
    setSortField(e.target.value);
    setCurrentPage(1);
  };

  // Limpiar todos los filtros
  const clearFilters = () => {
    setSearchTerm('');
    setFilterGender('');
    setSortField('nombre');
    setSortOrder('asc');
    setCurrentPage(1);
    
    // Limpiar el input de búsqueda
    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) searchInput.value = '';
  };

  // Volver arriba
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Cambiar de página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    scrollToTop();
  };
  
  // Calcular el número total de páginas
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Manejar la selección de un paciente
  const handleSelectPatient = (patient) => {
    // Aquí podrías navegar a la página de detalles del paciente
    console.log('Paciente seleccionado:', patient);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-3">
            <div className="bg-yellow-400 p-3 rounded-full mr-3 shadow-md">
              <FaUser className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-950 bg-clip-text text-transparent">Pacientes</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">Lista de pacientes registrados en el sistema para evaluaciones psicométricas</p>
        </div>
      </div>

      {/* Barra de búsqueda y filtros mejorados */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barra de búsqueda con icono */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-blue-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="Buscar paciente por nombre, apellido o documento..."
              onChange={handleSearchChange}
            />
          </div>
          
          {/* Filtros y ordenamiento */}
          <div className="flex flex-wrap gap-2">
            {/* Filtro por género */}
            <div className="relative inline-block">
              <select
                className="appearance-none pl-8 pr-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                value={filterGender}
                onChange={(e) => {
                  setFilterGender(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Todos los géneros</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-blue-400" />
              </div>
            </div>
            
            {/* Campo de ordenamiento */}
            <div className="relative inline-block">
              <select
                className="appearance-none pl-8 pr-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                value={sortField}
                onChange={handleSortFieldChange}
              >
                <option value="nombre">Nombre</option>
                <option value="apellidos">Apellidos</option>
                <option value="fecha_nacimiento">Fecha de nacimiento</option>
                <option value="documento_identidad">Documento</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-blue-400" />
              </div>
            </div>
            
            {/* Botón de ordenamiento */}
            <button
              className="flex items-center px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              onClick={toggleSortOrder}
            >
              {sortOrder === 'asc' ? (
                <FaSortAlphaDown className="mr-2 text-blue-500" />
              ) : (
                <FaSortAlphaUp className="mr-2 text-blue-500" />
              )}
              <span>Ordenar</span>
            </button>
            
            {/* Botón para cambiar vista */}
            <button
              className="flex items-center px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            >
              {viewMode === 'grid' ? (
                <>
                  <FaTable className="mr-2 text-blue-500" />
                  <span>Vista tabla</span>
                </>
              ) : (
                <>
                  <FaTh className="mr-2 text-blue-500" />
                  <span>Vista tarjetas</span>
                </>
              )}
            </button>
            
            {/* Botón para limpiar filtros */}
            {(searchTerm || filterGender || sortField !== 'nombre' || sortOrder !== 'asc') && (
              <button
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <Card className="shadow-md border-0 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white border-0">
          <div className="flex items-center justify-center">
            <h2 className="text-xl font-semibold">Lista de Pacientes</h2>
            <span className="ml-3 bg-white text-blue-600 rounded-full px-3 py-1 text-sm font-medium">
              {totalCount}
            </span>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-600">Cargando pacientes...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              {searchTerm || filterGender ? (
                <div>
                  <p className="text-gray-500 mb-2">No se encontraron pacientes que coincidan con los filtros aplicados</p>
                  <button
                    className="text-blue-500 hover:text-blue-700 font-medium"
                    onClick={clearFilters}
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <p className="text-gray-500">No hay pacientes registrados</p>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
              {filteredPatients.map((patient) => (
                <PatientCard 
                  key={patient.id} 
                  patient={patient} 
                  onClick={() => handleSelectPatient(patient)}
                />
              ))}
            </div>
          ) : (
            <PatientsTable 
              patients={filteredPatients} 
              loading={loading} 
              onSelectPatient={handleSelectPatient} 
            />
          )}
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Anterior</span>
                  <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* Mostrar números de página */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Mostrar solo páginas cercanas a la actual
                  if (
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    (pageNum === 2 && currentPage > 3) ||
                    (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    // Mostrar puntos suspensivos
                    return (
                      <span
                        key={pageNum}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Siguiente</span>
                  <FaChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          )}
        </CardBody>
        <CardFooter className="bg-gray-50 border-t border-gray-100 p-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Mostrando {filteredPatients.length} de {patients.length} pacientes
          </p>
          <button 
            onClick={scrollToTop}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FaArrowUp className="mr-1" /> Volver arriba
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Patients;




