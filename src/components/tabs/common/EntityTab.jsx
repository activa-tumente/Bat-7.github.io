import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { FaSpinner, FaSync } from 'react-icons/fa';

// Componentes reutilizables
import DataTable from '../../ui/DataTable';
import SearchFilter from '../../ui/SearchFilter';
import FormModal from '../../ui/FormModal';

/**
 * Componente genérico para gestión de entidades (instituciones, pacientes, psicólogos)
 * @param {Object} props - Propiedades del componente
 * @param {string} props.entityName - Nombre de la entidad (ej: 'institución', 'paciente')
 * @param {string} props.entityNamePlural - Nombre plural de la entidad (ej: 'instituciones', 'pacientes')
 * @param {Function} props.fetchEntities - Función para obtener entidades
 * @param {Function} props.createEntity - Función para crear entidad
 * @param {Function} props.updateEntity - Función para actualizar entidad
 * @param {Function} props.deleteEntity - Función para eliminar entidad
 * @param {Array} props.columns - Configuración de columnas para la tabla
 * @param {Array} props.formFields - Configuración de campos para el formulario
 * @param {Array} props.filters - Configuración de filtros
 * @param {Function} props.getInitialFormValues - Función para obtener los valores iniciales del formulario
 * @param {Function} props.getFormValues - Función para obtener los valores del formulario para una entidad existente
 * @param {Function} props.filterEntities - Función para filtrar entidades (opcional)
 * @param {boolean} props.isAdmin - Indica si el usuario es administrador
 */
const EntityTab = ({
  entityName,
  entityNamePlural,
  fetchEntities,
  createEntity,
  updateEntity,
  deleteEntity,
  columns,
  formFields,
  filters,
  getInitialFormValues,
  getFormValues,
  filterEntities,
  isAdmin,
  onBeforeModalOpen,
  onAfterModalClose
}) => {
  // --- Estados ---
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEntity, setCurrentEntity] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(columns[0]?.field || 'nombre');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterValues, setFilterValues] = useState(
    filters.reduce((acc, filter) => ({ ...acc, [filter.id]: '' }), {})
  );
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('real');
  const [lastRefresh, setLastRefresh] = useState(null);

  // --- Funciones ---

  // Obtener entidades
  const loadEntities = useCallback(async (forceRefresh = false) => {
    if (loading && !forceRefresh) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await fetchEntities(sortField, sortDirection);
      const { data } = result;
      
      setEntities(Array.isArray(data) ? data : []);
      setDataSource('real');
      setLastRefresh(new Date());
      
    } catch (error) {
      console.error(`Error al cargar ${entityNamePlural}:`, error);
      toast.error(`Hubo un problema al cargar los ${entityNamePlural}`);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [entityNamePlural, fetchEntities, sortField, sortDirection]);

  // Forzar actualización de datos
  const handleRefresh = useCallback(() => {
    loadEntities(true);
  }, [loadEntities]);

  // Cargar entidades al montar el componente y cuando cambie el orden
  useEffect(() => {
    loadEntities();
  }, [sortField, sortDirection, loadEntities]);

  // Abrir modal para crear/editar entidad
  const openModal = (entity = null) => {
    console.log(`Abriendo modal de ${entityName}...`);
    
    // Notificar al componente padre antes de abrir el modal (si hay handler)
    if (typeof onBeforeModalOpen === 'function') {
      onBeforeModalOpen(entity);
    }
    
    setCurrentEntity(entity);

    if (entity) {
      setFormValues(getFormValues(entity));
    } else {
      setFormValues(getInitialFormValues());
    }

    // Asegurar que el modal-root esté limpio y correctamente configurado
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot) {
      // Verificar si hay contenido residual
      if (modalRoot.children.length > 0) {
        console.warn('modal-root contiene elementos residuales, limpiando...');
        modalRoot.innerHTML = '';
      }

      // Asegurar que esté correctamente configurado
      modalRoot.style.position = 'relative';
      modalRoot.style.zIndex = '9999';
    }

    // Pequeño retraso para asegurar que el DOM esté listo
    setTimeout(() => {
      setIsModalOpen(true);
    }, 50);
  };

  // Cerrar modal
  const closeModal = () => {
    console.log(`Cerrando modal de ${entityName}...`);
    setIsModalOpen(false);
    setCurrentEntity(null);

    // Pequeño retraso para asegurar que el modal se cierre correctamente
    setTimeout(() => {
      // Verificar si hay elementos residuales en el modal-root
      const modalRoot = document.getElementById('modal-root');
      if (modalRoot && modalRoot.children.length > 0) {
        console.warn('modal-root contiene elementos residuales después de cerrar, limpiando...');
        modalRoot.innerHTML = '';
      }
      
      // Notificar al componente padre después de cerrar el modal (si hay handler)
      if (typeof onAfterModalClose === 'function') {
        onAfterModalClose();
      }
    }, 100);
  };

  // Manejar cambio de ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Manejar cambio en los filtros
  const handleFilterChange = (filterId, value) => {
    setFilterValues(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilterValues(
      filters.reduce((acc, filter) => ({ ...acc, [filter.id]: '' }), {})
    );
    setSearchTerm('');
  };

  // Manejar eliminación de entidad
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteEntity(id);
      toast.success(`${entityName} eliminado correctamente`);
      loadEntities();
    } catch (error) {
      console.error(`Error al eliminar ${entityName}:`, error);
      toast.error(`No se pudo eliminar el/la ${entityName.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar entidades (usando cliente o función personalizada)
  const filteredEntities = useMemo(() => {
    if (typeof filterEntities === 'function') {
      return filterEntities(entities, searchTerm, filterValues);
    }

    // Filtrado por defecto simple
    return entities.filter(entity => {
      // Filtro por término de búsqueda (busca en todos los campos)
      const matchesSearch = !searchTerm ? true : 
        Object.values(entity)
          .filter(value => typeof value === 'string')
          .some(value => value.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtro por valores específicos (igualdad exacta)
      const matchesFilters = Object.entries(filterValues).every(([key, value]) => {
        if (!value) return true; // Si no hay valor de filtro, se considera que coincide
        return entity[key] === value;
      });

      return matchesSearch && matchesFilters;
    });
  }, [entities, searchTerm, filterValues, filterEntities]);

  // Manejar envío del formulario
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (currentEntity) {
        // Actualizar entidad existente
        await updateEntity(currentEntity.id, values);
        toast.success(`${entityName} actualizado correctamente`);
      } else {
        // Crear nueva entidad
        await createEntity(values);
        toast.success(`${entityName} creado correctamente`);
      }

      closeModal();
      loadEntities();
    } catch (error) {
      console.error(`Error al guardar ${entityName}:`, error);
      toast.error('Hubo un problema al guardar los datos');
    } finally {
      setLoading(false);
    }
  };

  // --- Renderizado ---
  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 rounded-lg shadow-sm">
      {/* Barra de búsqueda y botones */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={`Buscar ${entityNamePlural}...`}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onAddNew={() => openModal()}
        canAdd={isAdmin}
        addButtonText={`Nuevo/a ${entityName}`}
      />

      {/* Barra de estado y acciones */}
      <div className="mb-4 p-3 bg-white border border-gray-200 rounded-md shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Estado de los datos:</h3>
            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                dataSource === 'real' ? 'bg-green-500' :
                dataSource === 'cache' ? 'bg-yellow-500' :
                dataSource === 'mock' ? 'bg-red-500' : 'bg-gray-500'
              }`}></span>
              <p className="text-xs text-gray-600">
                {dataSource === 'real' ? 'Datos en tiempo real' :
                dataSource === 'cache' ? 'Datos almacenados localmente' :
                dataSource === 'mock' ? 'Datos de prueba' :
                dataSource === 'emergency' ? 'Datos de emergencia' : 'Estado desconocido'}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {entities.length} {entityNamePlural} cargados |
              {filteredEntities.length} mostrados |
              {lastRefresh ? ` Última actualización: ${lastRefresh.toLocaleTimeString()}` : ' Sin actualizar'}
            </p>
          </div>
          <div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm transition-colors"
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              )}
              Actualizar
            </button>
          </div>
        </div>

        {/* Mostrar mensaje de error si existe */}
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            <strong>Error:</strong> {error.message || `Error desconocido al cargar ${entityNamePlural}`}
          </div>
        )}
      </div>

      {/* Vista de carga */}
      {loading && entities.length === 0 ? (
        <div className="flex justify-center items-center p-12 bg-white rounded-lg shadow">
          <div className="text-center">
            <FaSpinner className="animate-spin text-blue-600 mx-auto mb-4 text-3xl" />
            <p className="text-gray-600 font-medium">Cargando {entityNamePlural}...</p>
            <p className="text-gray-500 text-sm mt-2">Esto puede tardar unos momentos</p>
          </div>
        </div>
      ) : (
        /* Tabla de datos */
        <DataTable
          columns={columns}
          data={filteredEntities}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          loading={loading}
          enableActions={isAdmin}
          onEdit={openModal}
          onDelete={handleDelete}
          isTemporaryFn={(id) => typeof id === 'string' && id.startsWith('temp-')}
          emptyMessage={entities.length === 0 ? 
            `No hay ${entityNamePlural} registrados.` : 
            `No se encontraron ${entityNamePlural} que coincidan con los filtros.`}
          actionLabels={{ 
            edit: `Editar ${entityName.toLowerCase()}`, 
            delete: `Eliminar ${entityName.toLowerCase()}` 
          }}
          loadingMessage={`Optimizando datos de ${entityNamePlural}...`}
        />
      )}

      {/* Modal de formulario */}
      {isModalOpen && (
        <FormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={currentEntity ? 
            `Editar ${entityName}: ${currentEntity.nombre || ''}` : 
            `Nuevo/a ${entityName}`}
          fields={formFields}
          initialValues={formValues}
          onSubmit={handleSubmit}
          loading={loading}
          submitText={currentEntity ? 'Guardar Cambios' : `Crear ${entityName}`}
          isEdit={!!currentEntity}
          size="xl"
        />
      )}
    </div>
  );
};

export default EntityTab;
