import React, { useState, useEffect, useCallback } from 'react';
// Importamos los iconos necesarios
import { FaMale, FaFemale, FaUser } from 'react-icons/fa';
import supabaseService from '../../../services/supabaseService'; // Servicio para conectar con Supabase
import { toast } from 'react-toastify';
import { showErrorToast, showSuccessToast } from '../../../utils/errorHandler';

// Componentes reutilizables
import DataTable from '../../../components/ui/DataTable'; // Asegúrate que la ruta es correcta
import SearchFilter from '../../../components/ui/SearchFilter'; // Asegúrate que la ruta es correcta
import FormModal from '../../../components/ui/FormModal'; // Asegúrate que la ruta es correcta

/**
 * Componente mejorado para la gestión de psicólogos
 */
const PsychologistsTab = ({ isAdmin }) => {
  const [psychologists, setPsychologists] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPsychologist, setCurrentPsychologist] = useState(null);
  // Estado inicial del formulario
  const initialFormValues = {
    nombre: '',
    apellidos: '',
    genero: '',
    email: '',
    documento_identidad: '',
    telefono: '',
    institucion_id: ''
  };
  const [formValues, setFormValues] = useState(initialFormValues);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nombre');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterValues, setFilterValues] = useState({
    institucion_id: ''
  });

  // Configuración de columnas para la tabla
  const columns = [
    {
      field: 'nombre',
      header: 'Nombre',
      sortable: true,
      highlight: true,
      render: (value, row) => {
        // *** INICIO: Lógica de iconos de género con colores y comparación robusta ***
        let icon;
        // Normaliza el valor de genero (quita espacios, convierte a minúsculas)
        // Usa optional chaining (?.) por si row.genero es null o undefined
        const generoNormalizado = row.genero?.trim().toLowerCase();

        // Compara con los valores normalizados
        if (generoNormalizado === 'masculino') {
          icon = <FaMale style={{ color: '#1e40af', marginRight: '0.5rem', fontSize: '1.2rem' }} />; // Azul
        } else if (generoNormalizado === 'femenino') {
          icon = <FaFemale style={{ color: '#db2777', marginRight: '0.5rem', fontSize: '1.2rem' }} />; // Rosa
        } else {
          icon = <FaUser style={{ color: '#6b7280', marginRight: '0.5rem', fontSize: '1.2rem' }} />; // Gris por defecto
        }
        // *** FIN: Lógica de iconos de género ***

        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <span>{value}</span>
          </div>
        );
      }
    },
    {
      field: 'apellidos',
      header: 'Apellidos',
      sortable: true,
    },
    {
      field: 'genero',
      header: 'Género',
      sortable: true,
      emptyValue: '-',
      render: (value) => {
        // Muestra M o F con fondo de color
        const displayValue = value === 'Masculino' ? 'M' : (value === 'Femenino' ? 'F' : value);
        let bgColor = '#e5e7eb'; // Gris claro por defecto
        const generoLower = value?.toLowerCase();
        if (generoLower === 'masculino') {
          bgColor = '#dbeafe'; // Azul claro
        } else if (generoLower === 'femenino') {
          bgColor = '#fce7f3'; // Rosa claro
        }

        return (
          <div style={{
            backgroundColor: bgColor,
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            minWidth: '30px',
            textAlign: 'center',
            fontWeight: 500
          }}>
            {displayValue || '-'}
          </div>
        );
      }
    },
    {
      field: 'email',
      header: 'Email',
      sortable: true,
      emptyValue: '-', // Mostrar guion si está vacío
    },
    {
      field: 'documento_identidad',
      header: 'Documento',
      sortable: true,
      emptyValue: '-', // Mostrar guion si está vacío
      render: (value) => value || '-' // Renderizado consistente
    },
    {
      field: 'telefono',
      header: 'Teléfono',
      sortable: true,
      emptyValue: '-',
    },
    {
      field: 'institucion',
      header: 'Institución',
      sortable: false, // No se puede ordenar por el nombre calculado directamente
      render: (_, row) => {
        // Busca el nombre de la institución
        const institucion = row.instituciones?.nombre ||
          institutions.find(inst => inst.id === row.institucion_id)?.nombre || '-';

        // Estilo chip
        return institucion !== '-' ? (
          <div style={{
            backgroundColor: '#e0e7ff', // Indigo muy claro
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '150px'
          }}>
            {institucion}
          </div>
        ) : '-';
      }
    }
  ];

  // Función para obtener datos desde Supabase
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Obtener datos desde Supabase
      const [psychologistsResult, institutionsResult] = await Promise.all([
        supabaseService.getPsychologists(),
        supabaseService.getInstitutions()
      ]);

      // Verificar errores
      if (psychologistsResult.error) throw psychologistsResult.error;
      if (institutionsResult.error) throw institutionsResult.error;

      // Establecer datos
      setPsychologists(Array.isArray(psychologistsResult.data) ? psychologistsResult.data : []);
      setInstitutions(Array.isArray(institutionsResult.data) ? institutionsResult.data : []);

      console.log('Datos cargados desde Supabase:', {
        psicologos: psychologistsResult.data,
        instituciones: institutionsResult.data
      });

    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error("Error: " + (error.message || "Hubo un problema al cargar los datos"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar y cuando cambie el orden
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Abrir modal para crear/editar psicólogo
  const openModal = (psychologist = null) => {
    console.log('Abriendo modal de psicólogo...');
    setCurrentPsychologist(psychologist);

    if (psychologist) {
      // Editar: poblar con datos existentes
      setFormValues({
        nombre: psychologist.nombre || '',
        apellidos: psychologist.apellidos || '',
        genero: psychologist.genero || '', // Asegurar que el valor coincida con las opciones del select
        email: psychologist.email || '',
        documento_identidad: psychologist.documento_identidad || '',
        telefono: psychologist.telefono || '',
        institucion_id: psychologist.institucion_id || ''
      });
    } else {
      // Crear: usar valores iniciales (considerando valor por defecto para institucion si existe)
      setFormValues({
        ...initialFormValues, // Resetea a los valores por defecto
        institucion_id: institutions.length > 0 ? institutions[0].id : '' // Valor por defecto o ''
      });
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
      console.log('Modal abierto, isModalOpen =', true);
    }, 50);
  };

  // Cerrar modal
  const closeModal = () => {
    console.log('Cerrando modal de psicólogo...');
    setIsModalOpen(false);
    setCurrentPsychologist(null); // Limpiar psicólogo actual al cerrar

    // Pequeño retraso para asegurar que el modal se cierre correctamente
    setTimeout(() => {
      // Verificar si hay elementos residuales en el modal-root
      const modalRoot = document.getElementById('modal-root');
      if (modalRoot && modalRoot.children.length > 0) {
        console.warn('modal-root contiene elementos residuales después de cerrar, limpiando...');
        modalRoot.innerHTML = '';
      }
    }, 100);
  };

  // Manejar cambio de ordenamiento
  const handleSort = (field) => {
    const newDirection = (sortField === field && sortDirection === 'asc') ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
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
      institucion_id: ''
    });
    setSearchTerm(''); // Limpiar también búsqueda general
  };

  // Manejar eliminación de psicólogo
  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este psicólogo?')) {
      return;
    }

    setLoading(true);
    try {
      // Eliminar usando Supabase
      const { error } = await supabaseService.deletePsychologist(id);

      if (error) throw error;

      toast.success("Psicólogo eliminado correctamente");
      fetchData(); // Recargar datos
    } catch (error) {
      console.error('Error al eliminar psicólogo:', error);
      toast.error("Error: " + (error.message || "No se pudo eliminar el psicólogo"));
    } finally {
      setLoading(false);
    }
  };

  // Filtrar psicólogos (Client Side Filtering)
  const filteredPsychologists = psychologists.filter(psychologist => {
    const searchTermLower = searchTerm.toLowerCase();
    // Filtro por búsqueda general
    const matchesSearch = !searchTerm || (
      psychologist.nombre?.toLowerCase().includes(searchTermLower) ||
      psychologist.apellidos?.toLowerCase().includes(searchTermLower) ||
      psychologist.genero?.toLowerCase().includes(searchTermLower) || // Buscar por género también
      psychologist.email?.toLowerCase().includes(searchTermLower) ||
      psychologist.documento_identidad?.toLowerCase().includes(searchTermLower) ||
      psychologist.telefono?.toLowerCase().includes(searchTermLower) ||
      (institutions.find(inst => inst.id === psychologist.institucion_id)?.nombre || '').toLowerCase().includes(searchTermLower) // Buscar por nombre de institución
    );

    // Filtro por institución específica
    const matchesInstitution =
      !filterValues.institucion_id ||
      psychologist.institucion_id === filterValues.institucion_id;

    return matchesSearch && matchesInstitution;
  });

  // Configuración de filtros para SearchFilter
  const filters = [
    {
      id: 'institucion_id',
      type: 'select',
      label: 'Institución',
      placeholder: 'Todas las instituciones',
      options: [
        { value: '', label: 'Todas las instituciones' }, // Opción para limpiar filtro
        ...institutions.map(inst => ({
          value: inst.id,
          label: inst.nombre
        }))
      ]
    }
  ];

  // Configuración de campos para el formulario FormModal
  const formFields = [
    // --- Datos Personales ---
    { id: 'section_datos_personales', type: 'section', label: 'Datos Personales', width: 'full' },
    {
      id: 'nombre', type: 'text', label: 'Nombre', placeholder: 'Ej. Ana', width: 'half',
      validation: { required: false }
    },
    {
      id: 'apellidos', type: 'text', label: 'Apellidos', placeholder: 'Ej. García López', width: 'half',
      validation: { required: false }
    },
    {
      id: 'genero', type: 'select', label: 'Género', placeholder: 'Seleccionar...', width: 'half',
      options: [ { value: '', label: 'Seleccionar...' }, { value: 'Masculino', label: 'Masculino' }, { value: 'Femenino', label: 'Femenino' } ],
      validation: { required: false }
    },
    {
      id: 'documento_identidad', type: 'text', label: 'Documento ID', placeholder: 'Ej. 987654321', width: 'half',
      validation: { required: false }
    },

    // --- Información de Contacto ---
    { id: 'section_contacto', type: 'section', label: 'Contacto y Acceso', width: 'full' },
    {
      id: 'email', type: 'email', label: 'Email (Usuario)', placeholder: 'ana.garcia@ejemplo.com', width: 'half',
      disabled: !!currentPsychologist, // Deshabilitado si estamos editando
      info: currentPsychologist ? 'El email no se puede modificar.' : 'Se creará una cuenta con este email.',
      validation: { required: false }
    },
    {
      id: 'telefono', type: 'tel', label: 'Teléfono', placeholder: 'Ej. 600 11 22 33', width: 'half',
      validation: { required: false }
    },

    // --- Institución ---
    { id: 'section_institucion', type: 'section', label: 'Institución Asignada', width: 'full' },
    {
      id: 'institucion_id', type: 'select', label: 'Institución', placeholder: 'Seleccionar...', width: 'full', // O 'half' si prefieres
      options: [ { value: '', label: 'Seleccionar...' }, ...institutions.map(inst => ({ value: inst.id, label: inst.nombre })) ],
      validation: { required: false }
    }
  ];

  // Manejar envío del formulario usando Supabase
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Validar datos mínimos
      if (!values.nombre) {
        toast.error('El nombre del psicólogo es obligatorio');
        setLoading(false);
        return;
      }

      // Datos del psicólogo
      const psychologistData = {
        nombre: values.nombre,
        apellidos: values.apellidos || '',
        genero: values.genero || 'No especificado',
        documento_identidad: values.documento_identidad || '',
        telefono: values.telefono || '',
        institucion_id: values.institucion_id || institutions[0]?.id || null,
        email: values.email || '',
        updated_at: new Date().toISOString()
      };

      // Si es un nuevo psicólogo, agregar fecha de creación
      if (!currentPsychologist) {
        psychologistData.created_at = new Date().toISOString();
      }

      let result;

      if (currentPsychologist) {
        // Actualizar psicólogo existente
        result = await supabaseService.updatePsychologist(currentPsychologist.id, psychologistData);
        if (result.error) throw result.error;
        toast.success(`Psicólogo "${values.nombre}" actualizado correctamente`);
      } else {
        // Crear nuevo psicólogo
        result = await supabaseService.createPsychologist(psychologistData);
        if (result.error) throw result.error;
        toast.success(`Psicólogo "${values.nombre}" creado correctamente`);
      }

      console.log('Respuesta de Supabase:', result);

      // Éxito en crear o actualizar
      closeModal();
      fetchData(); // Recargar la lista

    } catch (error) {
      console.error('Error al guardar psicólogo:', error);
      toast.error('Error: ' + (error.message || 'Hubo un problema al guardar los datos'));
    } finally {
      setLoading(false);
    }
  };

  // --- Renderizado del Componente ---
  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 rounded-lg shadow-sm">
      {/* Barra de búsqueda y filtros */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nombre, email, documento..."
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onAddNew={() => openModal()} // Llama a openModal para crear
        canAdd={isAdmin}
        addButtonText="+ Nuevo Psicólogo"
      />

      {/* Tabla de datos */}
      <DataTable
        columns={columns}
        data={filteredPsychologists} // Usar datos filtrados
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        loading={loading}
        enableActions={isAdmin}
        onEdit={(psychologist) => openModal(psychologist)} // Pasa el objeto completo
        onDelete={(id, psychologist) => handleDelete(id, psychologist)} // Pasa id y objeto
        isTemporaryFn={(id) => typeof id === 'string' && id.startsWith('temp-')}
        emptyMessage={psychologists.length === 0 && !loading ? "No hay psicólogos registrados." : "No se encontraron psicólogos que coincidan."}
        actionLabels={{ edit: "Editar psicólogo", delete: "Eliminar psicólogo" }}
      />

      {/* Modal de formulario */}
      {isModalOpen && (
        <FormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={currentPsychologist ? `Editar Psicólogo: ${currentPsychologist.nombre}` : 'Nuevo Psicólogo'}
          fields={formFields}
          initialValues={formValues}
          onSubmit={handleSubmit}
          loading={loading}
          submitText={currentPsychologist ? 'Guardar Cambios' : 'Crear Psicólogo'}
          isEdit={!!currentPsychologist}
          size="xl" // Tamaño más grande para mostrar toda la información
        />
      )}
    </div>
  );
};

export default PsychologistsTab;
