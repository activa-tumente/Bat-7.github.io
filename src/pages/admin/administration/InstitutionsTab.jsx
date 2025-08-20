import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Importamos el servicio de Supabase y las utilidades de manejo de errores
import supabaseService from '../../../services/supabaseService'; // Servicio para conectar con Supabase
import { supabaseConfig } from '../../../api/supabaseConfig';
import cacheManager from '../../../utils/cacheManager';
import { toast } from 'react-toastify';
import { showErrorToast, showSuccessToast } from '../../../utils/errorHandler';
// Importamos los iconos necesarios
import { FaUniversity, FaBuilding, FaHospital, FaSchool, FaSpinner, FaSync } from 'react-icons/fa';

// Componentes reutilizables
import DataTable from '../../../components/ui/DataTable';
import SearchFilter from '../../../components/ui/SearchFilter';
import FormModal from '../../../components/ui/FormModal';

/**
 * Componente mejorado para la gestión de instituciones
 */
const InstitutionsTab = ({ isAdmin }) => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInstitution, setCurrentInstitution] = useState(null);
  const [formValues, setFormValues] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    tipo: 'Universidad'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nombre');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterValues, setFilterValues] = useState({
    tipo: ''
  });

  // Función para determinar el icono según el tipo de institución
  const getInstitutionIcon = (nombre, tipo = '') => {
    // Si existe un tipo explícito, usarlo primero
    if (tipo) {
      if (tipo.toLowerCase().includes('universidad')) return <FaUniversity />;
      if (tipo.toLowerCase().includes('hospital') || tipo.toLowerCase().includes('clínica')) return <FaHospital />;
      if (tipo.toLowerCase().includes('colegio') || tipo.toLowerCase().includes('escuela')) return <FaSchool />;
      return <FaBuilding />;
    }

    // De lo contrario, intentar inferir del nombre
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('universidad') || nombreLower.includes('faculty')) return <FaUniversity />;
    if (nombreLower.includes('hospital') || nombreLower.includes('clínica') || nombreLower.includes('salud')) return <FaHospital />;
    if (nombreLower.includes('colegio') || nombreLower.includes('escuela') || nombreLower.includes('school')) return <FaSchool />;

    // Valor por defecto
    return <FaBuilding />;
  };

  // Configuración de columnas para la tabla
  const columns = [
    {
      field: 'nombre',
      header: 'Nombre',
      sortable: true,
      highlight: true,
      render: (value, row) => {
        // Mostrar icono según el tipo de institución
        const icon = getInstitutionIcon(value, row.tipo);

        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{
              color: '#1e40af',
              marginRight: '0.5rem',
              fontSize: '1.2rem'
            }}>
              {icon}
            </span>
            <span>{value}</span>
          </div>
        );
      }
    },
    {
      field: 'tipo',
      header: 'Tipo',
      sortable: true,
      emptyValue: '-',
      render: (value) => {
        return value ? (
          <div style={{
            backgroundColor: '#e6f0ff',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block'
          }}>
            {value}
          </div>
        ) : '-';
      }
    },
    {
      field: 'direccion',
      header: 'Dirección',
      sortable: true,
      emptyValue: '-',
      render: (value) => {
        return value ? (
          <div style={{
            backgroundColor: '#e6f0ff',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block'
          }}>
            {value}
          </div>
        ) : '-';
      }
    },
    {
      field: 'telefono',
      header: 'Teléfono',
      sortable: true,
      emptyValue: '-',
      render: (value) => {
        return value ? (
          <div style={{
            backgroundColor: '#e6f0ff',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block'
          }}>
            {value}
          </div>
        ) : '-';
      }
    }
  ];

  // Configuración de campos para el formulario
  const formFields = [
    {
      id: 'section_datos',
      type: 'section',
      label: 'Datos de la Institución',
      width: 'full'
    },
    {
      id: 'nombre',
      type: 'text',
      label: 'Nombre',
      placeholder: 'Ej. Universidad Nacional',
      width: 'full',
      validation: {
        required: false
      }
    },
    {
      id: 'tipo',
      type: 'select',
      label: 'Tipo de Institución',
      placeholder: 'Seleccione un tipo',
      width: 'full',
      options: [
        { value: 'Universidad', label: 'Universidad' },
        { value: 'Colegio', label: 'Colegio' },
        { value: 'Hospital', label: 'Hospital/Clínica' },
        { value: 'Centro Comunitario', label: 'Centro Comunitario' },
        { value: 'Otra', label: 'Otra' }
      ],
      validation: {
        required: false
      }
    },
    {
      id: 'section_contacto',
      type: 'section',
      label: 'Información de Contacto',
      width: 'full'
    },
    {
      id: 'direccion',
      type: 'text',
      label: 'Dirección',
      placeholder: 'Ej. Calle 45 #12-34',
      width: 'half',
      info: 'Dirección física de la institución',
      validation: {
        required: false
      }
    },
    {
      id: 'telefono',
      type: 'tel',
      label: 'Teléfono',
      placeholder: 'Ej. 601 234 5678',
      width: 'half',
      validation: {
        required: false
      }
    }
  ];

  // Configuración de filtros
  const filters = [
    {
      id: 'tipo',
      type: 'select',
      label: 'Tipo de Institución',
      placeholder: 'Todos los tipos',
      options: [
        { value: 'Universidad', label: 'Universidad' },
        { value: 'Colegio', label: 'Colegio' },
        { value: 'Hospital', label: 'Hospital/Clínica' },
        { value: 'Centro Comunitario', label: 'Centro Comunitario' },
        { value: 'Otra', label: 'Otra' }
      ]
    }
  ];

  // Estado para controlar errores
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('real'); // 'real', 'cache', 'mock', 'emergency'
  const [lastRefresh, setLastRefresh] = useState(null);

  // Función para obtener instituciones desde Supabase
  const fetchInstitutions = useCallback(async (forceRefresh = false) => {
    if (loading && !forceRefresh) return;

    setLoading(true);
    setError(null);

    try {
      // Obtener instituciones desde Supabase
      const { data, error } = await supabaseService.getInstitutions();

      if (error) throw error;

      // Usar los datos obtenidos de Supabase
      setInstitutions(Array.isArray(data) ? data : []);
      setDataSource('real');
      setLastRefresh(new Date());

      console.log('Instituciones cargadas desde Supabase:', data);

    } catch (error) {
      console.error('Error al cargar instituciones:', error);
      toast.error("Hubo un problema al cargar las instituciones");
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para forzar una actualización de datos
  const handleRefresh = useCallback(() => {
    fetchInstitutions(true);
  }, [fetchInstitutions]);

  // Cargar instituciones solo al montar el componente y cuando cambie el orden
  // Usamos una referencia para evitar llamadas duplicadas
  const isFirstRender = React.useRef(true);

  useEffect(() => {
    // Solo ejecutar en el primer renderizado o cuando cambie el ordenamiento
    if (isFirstRender.current || !isFirstRender.current) {
      isFirstRender.current = false;
      fetchInstitutions();
    }
  }, [sortField, sortDirection]);

  // Abrir modal para crear/editar institución
  const openModal = (institution = null) => {
    console.log('Abriendo modal de institución...');
    setCurrentInstitution(institution);

    // Configurar valores del formulario
    if (institution) {
      setFormValues({
        nombre: institution.nombre,
        tipo: institution.tipo || 'Universidad',
        direccion: institution.direccion || '',
        telefono: institution.telefono || ''
      });
    } else {
      setFormValues({
        nombre: '',
        tipo: 'Universidad',
        direccion: '',
        telefono: ''
      });
    }

    // Preparar el modal-root usando las utilidades mejoradas
    import('../../../utils/modalUtils').then(utils => {
      utils.fixModalIssues();

      // Pequeño retraso para asegurar que el DOM esté listo
      setTimeout(() => {
        setIsModalOpen(true);
        console.log('Modal abierto, isModalOpen =', true);

        // Forzar una actualización de la UI para asegurar que el modal se muestre
        utils.forceUIUpdate();
      }, 100); // Aumentado a 100ms para mayor seguridad
    }).catch(error => {
      console.error('Error al importar utilidades de modal:', error);

      // Aún así intentar abrir el modal con un retraso mayor
      setTimeout(() => {
        // Asegurar que el modal-root exista y esté limpio
        const modalRoot = document.getElementById('modal-root') || document.createElement('div');
        if (!modalRoot.id) {
          modalRoot.id = 'modal-root';
          document.body.appendChild(modalRoot);
        }

        // Limpiar contenido residual
        modalRoot.innerHTML = '';
        modalRoot.style.position = 'relative';
        modalRoot.style.zIndex = '9999';

        setIsModalOpen(true);
      }, 200);
    });
  };

  // Cerrar modal
  const closeModal = () => {
    console.log('Cerrando modal de institución...');
    setIsModalOpen(false);

    // Usar el método cleanupModalRoot para limpiar el modal-root
    import('../../../utils/modalUtils').then(utils => {
      setTimeout(() => {
        utils.cleanupModalRoot();

        // Asegurar que no haya modales atascados
        const stuckModals = document.querySelectorAll('.fixed.inset-0.z-[9999]');
        if (stuckModals.length > 0) {
          console.warn(`Se detectaron ${stuckModals.length} modales atascados, limpiando...`);
          stuckModals.forEach(modal => {
            try {
              modal.remove();
            } catch (e) {
              console.error('Error al eliminar modal atascado:', e);
            }
          });
        }
      }, 150);
    }).catch(error => {
      console.error('Error al importar utilidades de modal:', error);

      // Limpieza manual como fallback
      setTimeout(() => {
        const modalRoot = document.getElementById('modal-root');
        if (modalRoot) {
          modalRoot.innerHTML = '';
        }
      }, 150);
    });
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
    setFilterValues({
      tipo: ''
    });
  };

  // Manejar eliminación de institución
  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta institución?')) {
      return;
    }

    setLoading(true);
    try {
      // Eliminar usando Supabase
      const { error } = await supabaseService.deleteInstitution(id);

      if (error) throw error;

      toast.success("Institución eliminada correctamente");
      // Actualizar la lista para reflejar la eliminación
      fetchInstitutions();
    } catch (error) {
      console.error('Error al eliminar institución:', error);
      toast.error("No se pudo eliminar la institución: " + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Filtrar instituciones por término de búsqueda y filtros (usando useMemo para evitar recálculos)
  const filteredInstitutions = useMemo(() => {
    console.log('Recalculando instituciones filtradas');
    return institutions.filter(institution => {
      // Filtro por término de búsqueda
      const matchesSearch = !searchTerm ? true :
        institution.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (institution.direccion && institution.direccion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (institution.telefono && institution.telefono.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtro por tipo de institución
      const matchesTipo =
        !filterValues.tipo ||
        (institution.tipo && institution.tipo === filterValues.tipo);

      return matchesSearch && matchesTipo;
    });
  }, [institutions, searchTerm, filterValues.tipo]);

  // Manejar envío del formulario usando Supabase
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Validar datos mínimos
      if (!values.nombre) {
        toast.error('El nombre de la institución es obligatorio');
        setLoading(false);
        return;
      }

      const institutionData = {
        nombre: values.nombre,
        tipo: values.tipo || 'Universidad',
        direccion: values.direccion || '',
        telefono: values.telefono || '',
        updated_at: new Date().toISOString()
      };

      // Si es una nueva institución, agregar fecha de creación
      if (!currentInstitution) {
        institutionData.created_at = new Date().toISOString();
      }

      let result;

      if (currentInstitution) {
        // Actualizar usando Supabase
        result = await supabaseService.updateInstitution(currentInstitution.id, institutionData);
        if (result.error) throw result.error;
        toast.success(`Institución "${values.nombre}" actualizada correctamente`);
      } else {
        // Crear usando Supabase
        result = await supabaseService.createInstitution(institutionData);
        if (result.error) throw result.error;
        toast.success(`Institución "${values.nombre}" creada correctamente`);
      }

      console.log('Respuesta de Supabase:', result);

      // Actualizar la lista inmediatamente y cerrar modal
      fetchInstitutions();
      closeModal();

    } catch (error) {
      console.error('Error al guardar institución:', error);
      toast.error('Error: ' + (error.message || 'Hubo un problema al guardar los datos'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y botones */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar instituciones..."
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onAddNew={() => openModal()}
        canAdd={isAdmin}
        addButtonText="Nueva Institución"
      />

      {/* Tabla de datos con indicador de carga mejorado */}
      {loading && institutions.length === 0 ? (
        <div className="flex justify-center items-center p-12 bg-white rounded-lg shadow">
          <div className="text-center">
            <FaSpinner className="animate-spin text-blue-600 mx-auto mb-4 text-3xl" />
            <p className="text-gray-600 font-medium">Cargando instituciones...</p>
            <p className="text-gray-500 text-sm mt-2">Esto puede tardar unos momentos</p>
          </div>
        </div>
      ) : (
        <>
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
                  {institutions.length} instituciones cargadas |
                  {filteredInstitutions.length} mostradas |
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
                <strong>Error:</strong> {error.message || 'Error desconocido al cargar instituciones'}
              </div>
            )}
          </div>

          <DataTable
            columns={columns}
            data={filteredInstitutions}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            loading={loading}
            enableActions={isAdmin}
            onEdit={openModal}
            onDelete={handleDelete}
            isTemporaryFn={(id) => typeof id === 'string' && id.startsWith('temp-')}
            emptyMessage="No se encontraron instituciones registradas"
            actionLabels={{ edit: "Editar institución", delete: "Eliminar institución" }}
            loadingMessage="Optimizando datos de instituciones..."
          />
        </>
      )}

      {/* Modal de formulario */}
      <FormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentInstitution ? 'Editar Institución' : 'Nueva Institución'}
        fields={formFields}
        initialValues={formValues}
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Guardar"
        isEdit={!!currentInstitution}
        size="lg"
      />
    </div>
  );
};

export default InstitutionsTab;
