import React, { useState, useEffect, useCallback } from 'react';
// Importamos los iconos necesarios
import { FaMale, FaFemale, FaUser } from 'react-icons/fa'; // Asegúrate de tener react-icons instalado
import enhancedSupabaseService from '../../../services/mockEnhancedSupabaseService'; // Usamos el servicio mock
import { toast } from 'react-toastify'; // Asegúrate de tener react-toastify instalado y configurado
import { showErrorToast, showSuccessToast } from '../../../utils/errorHandler'; // Ajusta la ruta si es necesario

// Componentes reutilizables (Asegúrate de que estas rutas sean correctas)
import DataTable from '../../../components/ui/DataTable';
import SearchFilter from '../../../components/ui/SearchFilter';
import FormModal from '../../../components/ui/FormModal';

/**
 * Componente mejorado para la gestión de pacientes
 */
const PatientsTab = ({ isAdmin }) => {
  const [patients, setPatients] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [formValues, setFormValues] = useState({
    nombre: '',
    apellidos: '',
    fecha_nacimiento: '',
    genero: '',
    documento_identidad: '',
    email: '',
    telefono: '',
    institucion_id: '',
    psicologo_id: '',
    notas: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nombre');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterValues, setFilterValues] = useState({
    institucion_id: '',
    genero: '',
    psicologo_id: '',
    edad_min: '',
    edad_max: ''
  });

  // Configuración de columnas para la tabla
  const columns = [
    {
      field: 'nombre',
      header: 'Nombre',
      sortable: true,
      highlight: true,
      render: (value, row) => {
        // *** INICIO: Lógica de iconos de género con colores ***
        let icon;
        // Verifica el valor exacto de genero
        if (row.genero === 'Masculino') {
          // Ícono azul para Masculino
          icon = <FaMale style={{ color: '#1e40af', marginRight: '0.5rem', fontSize: '1.2rem' }} />;
        } else if (row.genero === 'Femenino') {
          // Ícono rosa para Femenino
          icon = <FaFemale style={{ color: '#db2777', marginRight: '0.5rem', fontSize: '1.2rem' }} />;
        } else {
          // Ícono gris por defecto si no es Masculino ni Femenino
          icon = <FaUser style={{ color: '#6b7280', marginRight: '0.5rem', fontSize: '1.2rem' }} />;
        }
        // *** FIN: Lógica de iconos de género con colores ***

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
      field: 'edad',
      header: 'Edad',
      sortable: true,
      emptyValue: '-',
      type: 'numeric',
      render: (value) => {
        // Estilo de "chip" para la edad
        return (
          <div style={{
            backgroundColor: '#e6f0ff', // Azul muy claro
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            minWidth: '30px', // Ancho mínimo para consistencia
            textAlign: 'center'
          }}>
            {value || '-'}
          </div>
        );
      }
    },
    {
      field: 'genero',
      header: 'Género',
      sortable: true,
      render: (value) => {
        // Muestra M o F con fondo de color según el género
        const displayValue = value === 'Masculino' ? 'M' : (value === 'Femenino' ? 'F' : value);
        let bgColor = '#e5e7eb'; // Gris claro por defecto
        if (value === 'Masculino') {
          bgColor = '#dbeafe'; // Azul claro
        } else if (value === 'Femenino') {
          bgColor = '#fce7f3'; // Rosa claro
        }

        return (
          <div style={{
            backgroundColor: bgColor,
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            minWidth: '30px', // Ancho mínimo para consistencia
            textAlign: 'center',
            fontWeight: 500 // Un poco más de peso
          }}>
            {displayValue || '-'}
          </div>
        );
      }
    },
    {
      field: 'documento_identidad',
      header: 'Documento',
      sortable: true,
      emptyValue: '-',
      render: (value) => { // Renderizado consistente con guion si está vacío
        return value ? value : '-';
      }
    },
    {
      field: 'email',
      header: 'Email',
      sortable: true,
      emptyValue: '-',
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
      sortable: false, // No se puede ordenar directamente por el nombre calculado
      render: (_, row) => {
        // Busca el nombre de la institución en los datos cargados
        const institucion = row.instituciones?.nombre ||
          institutions.find(inst => inst.id === row.institucion_id)?.nombre || '-';

        // Estilo de "chip" para la institución
        return institucion !== '-' ? (
          <div style={{
            backgroundColor: '#e0e7ff', // Indigo muy claro
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            whiteSpace: 'nowrap', // Evita que el texto se divida en varias líneas
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '150px' // Limita el ancho si es muy largo
          }}>
            {institucion}
          </div>
        ) : '-';
      }
    },
    {
      field: 'psicologo',
      header: 'Psicólogo',
      sortable: false, // No se puede ordenar directamente por el nombre calculado
      render: (_, row) => {
        if (!row.psicologo_id) return '-';
        // Busca el nombre completo del psicólogo
        const psico = psychologists.find(p => p.id === row.psicologo_id);
        const nombreCompleto = psico ? `${psico.nombre} ${psico.apellidos}` : '-';

        // Estilo de "chip" para el psicólogo
        return nombreCompleto !== '-' ? (
           <div style={{
            backgroundColor: '#e0f2fe', // Cyan muy claro
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '150px'
          }}>
            {nombreCompleto}
          </div>
        ) : '-';
      }
    }
  ];

  // Función simplificada para obtener datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Usar directamente enhancedSupabaseService para todas las peticiones
      const [patientsResult, institutionsResult, psychologistsResult] = await Promise.all([
        enhancedSupabaseService.getPatients(sortField, sortDirection),
        enhancedSupabaseService.getInstitutions(),
        enhancedSupabaseService.getPsychologists()
      ]);

      // Procesar pacientes añadiendo edad calculada (si existe la función)
      const patientsWithAge = (Array.isArray(patientsResult.data) ? patientsResult.data : []).map(p => ({
        ...p,
        edad: calculateAge(p.fecha_nacimiento)
      }));

      // Establecer datos sin validaciones complicadas
      setPatients(patientsWithAge);
      setInstitutions(Array.isArray(institutionsResult.data) ? institutionsResult.data : []);
      setPsychologists(Array.isArray(psychologistsResult.data) ? psychologistsResult.data : []);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error("Hubo un problema al cargar los datos");
      // Intentar mantener datos anteriores si los hay
    } finally {
      setLoading(false);
    }
  }, [sortField, sortDirection]);

  // Cargar datos al montar y cuando cambie el orden
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calcular edad a partir de la fecha de nacimiento
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    try {
        const today = new Date();
        const birth = new Date(birthDate);

        // Validación básica de fecha
        if (isNaN(birth.getTime())) {
            console.warn(`Fecha de nacimiento inválida: ${birthDate}`);
            return null;
        }

        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
        }

        return age >= 0 ? age : null; // Asegurarse de que la edad no sea negativa
    } catch (e) {
        console.error(`Error calculando edad para ${birthDate}:`, e);
        return null;
    }
  };


  // Abrir modal para crear/editar paciente
  const openModal = (patient = null) => {
    console.log('Abriendo modal de paciente...');
    setCurrentPatient(patient);

    if (patient) {
      // Si editamos, poblamos con los datos existentes
      setFormValues({
        nombre: patient.nombre || '',
        apellidos: patient.apellidos || '',
        // Asegurarse de que la fecha esté en formato YYYY-MM-DD para el input type="date"
        fecha_nacimiento: patient.fecha_nacimiento ? new Date(patient.fecha_nacimiento).toISOString().split('T')[0] : '',
        genero: patient.genero || '',
        documento_identidad: patient.documento_identidad || '',
        email: patient.email || '',
        telefono: patient.telefono || '',
        institucion_id: patient.institucion_id || '',
        psicologo_id: patient.psicologo_id || '',
        notas: patient.notas || ''
      });
    } else {
      // Si creamos, reseteamos los valores (considerando valor por defecto para institucion si existe)
      setFormValues({
        nombre: '',
        apellidos: '',
        fecha_nacimiento: '',
        genero: '',
        documento_identidad: '',
        email: '',
        telefono: '',
        institucion_id: institutions.length > 0 ? institutions[0].id : '', // Valor por defecto o ''
        psicologo_id: '', // Siempre vacío al crear
        notas: ''
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
    console.log('Cerrando modal de paciente...');
    setIsModalOpen(false);
    setCurrentPatient(null); // Limpiar paciente actual al cerrar

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
    // fetchData se disparará automáticamente por el useEffect que depende de sortField y sortDirection
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
      institucion_id: '',
      genero: '',
      psicologo_id: '',
      edad_min: '',
      edad_max: ''
    });
    setSearchTerm(''); // También limpiar búsqueda general
  };

  // Manejar eliminación de paciente - simplificado sin confirmación
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      // Eliminar directamente sin confirmación
      await enhancedSupabaseService.deletePatient(id);
      toast.success("Paciente eliminado correctamente");
      fetchData(); // Recargar datos
    } catch (error) {
      console.error('Error al eliminar paciente:', error);
      toast.error('No se pudo eliminar el paciente');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar pacientes por término de búsqueda y filtros avanzados (CLIENT SIDE FILTERING)
  // Esto se aplica sobre los datos ya ordenados y traídos del backend
  const filteredPatients = patients.filter(patient => {
    // --- Filtro por término de búsqueda general ---
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      patient.nombre?.toLowerCase().includes(searchTermLower) ||
      patient.apellidos?.toLowerCase().includes(searchTermLower) ||
      patient.documento_identidad?.toLowerCase().includes(searchTermLower) ||
      patient.email?.toLowerCase().includes(searchTermLower) ||
      patient.telefono?.toLowerCase().includes(searchTermLower) ||
      (institutions.find(inst => inst.id === patient.institucion_id)?.nombre || '').toLowerCase().includes(searchTermLower) || // Buscar por nombre de institución
      patient.notas?.toLowerCase().includes(searchTermLower)
    );

    // --- Filtros avanzados ---
    // Filtro por institución
    const matchesInstitution =
      !filterValues.institucion_id || patient.institucion_id === filterValues.institucion_id;

    // Filtro por género
    const matchesGender =
      !filterValues.genero || patient.genero === filterValues.genero;

    // Filtro por psicólogo (maneja 'null' para 'sin asignar')
    const matchesPsychologist =
      !filterValues.psicologo_id ||
      (filterValues.psicologo_id === 'null' ? !patient.psicologo_id : patient.psicologo_id === filterValues.psicologo_id);

    // Filtro por edad mínima (asegurarse de que patient.edad existe y es número)
    const patientAge = typeof patient.edad === 'number' ? patient.edad : -1; // Usar -1 si no hay edad
    const minAgeFilter = parseInt(filterValues.edad_min);
    const matchesMinAge = isNaN(minAgeFilter) || patientAge === -1 || patientAge >= minAgeFilter;


    // Filtro por edad máxima (asegurarse de que patient.edad existe y es número)
    const maxAgeFilter = parseInt(filterValues.edad_max);
    const matchesMaxAge = isNaN(maxAgeFilter) || patientAge === -1 || patientAge <= maxAgeFilter;


    // Debe cumplir con todos los filtros
    return matchesSearch && matchesInstitution && matchesGender &&
           matchesPsychologist && matchesMinAge && matchesMaxAge;
  });

  // Configuración de filtros para el componente SearchFilter
  const filters = [
    {
      id: 'institucion_id',
      type: 'select',
      label: 'Institución',
      placeholder: 'Todas las instituciones',
      options: [
        { value: '', label: 'Todas las instituciones' }, // Opción para limpiar
        ...institutions.map(inst => ({
          value: inst.id,
          label: inst.nombre
        }))
      ]
    },
    {
      id: 'genero',
      type: 'select',
      label: 'Género',
      placeholder: 'Todos los géneros',
      options: [
        { value: '', label: 'Todos los géneros' }, // Opción para limpiar
        { value: 'Masculino', label: 'Masculino' },
        { value: 'Femenino', label: 'Femenino' }
        // Añadir más si es necesario (ej. 'Otro')
      ]
    },
    {
      id: 'psicologo_id',
      type: 'select',
      label: 'Psicólogo',
      placeholder: 'Todos los psicólogos',
      options: [
        { value: '', label: 'Todos' }, // Opción para limpiar
        { value: 'null', label: 'Sin asignar' }, // Opción específica para no asignados
        ...psychologists.map(psico => ({
          value: psico.id,
          label: `${psico.nombre} ${psico.apellidos}`
        }))
      ]
    },
    {
      id: 'edad_min', // Cambiado para claridad
      type: 'number', // Usar number input para edad mínima
      label: 'Edad Mín.',
      placeholder: 'Mín',
      min: 0,
      max: 120,
      style: { width: '80px' } // Estilo opcional para ajustar ancho
    },
    {
        id: 'edad_max', // Cambiado para claridad
        type: 'number', // Usar number input para edad máxima
        label: 'Edad Máx.',
        placeholder: 'Máx',
        min: 0,
        max: 120,
        style: { width: '80px' } // Estilo opcional
    }
    // Nota: El componente SearchFilter debe poder manejar estos tipos 'number' o adaptar la lógica.
    // Si SearchFilter solo acepta 'range', se debe mantener esa configuración.
    // El código original tenía un tipo 'range' para edad, ajusta según tu componente SearchFilter.
    /* Ejemplo si SearchFilter usa 'range':
    {
      id: 'edad', // ID único para el rango
      type: 'range',
      label: 'Rango Edad',
      minPlaceholder: 'Mínima',
      maxPlaceholder: 'Máxima',
      min: 0,
      max: 120,
      // Los valores se manejarían como filterValues.edad_min y filterValues.edad_max
    }
    */
  ];

  // Configuración de campos para el formulario (FormModal)
  const formFields = [
    // --- Datos Personales ---
    { id: 'section_datos_personales', type: 'section', label: 'Datos Personales', width: 'full' },
    {
      id: 'nombre', type: 'text', label: 'Nombre', placeholder: 'Ej. Juan', width: 'half',
      validation: { required: false }
    },
    {
      id: 'apellidos', type: 'text', label: 'Apellidos', placeholder: 'Ej. Pérez Gómez', width: 'half',
      validation: { required: false }
    },
    {
      id: 'fecha_nacimiento', type: 'date', label: 'Fecha de Nacimiento', width: 'half',
      validation: { required: false }
    },
    {
      id: 'genero', type: 'select', label: 'Género', placeholder: 'Seleccionar género', width: 'half',
      options: [ { value: '', label: 'Seleccionar...' }, { value: 'Masculino', label: 'Masculino' }, { value: 'Femenino', label: 'Femenino' }],
      validation: { required: false }
    },
    {
      id: 'documento_identidad', type: 'text', label: 'Documento de Identidad', placeholder: 'Ej. 1234567890', width: 'half',
      validation: { required: false }
    },

    // --- Información de Contacto ---
    { id: 'section_contacto', type: 'section', label: 'Información de Contacto', width: 'full' },
    {
      id: 'email', type: 'email', label: 'Email', placeholder: 'juan.perez@ejemplo.com', width: 'half',
      validation: { required: false } // Pattern opcional
    },
    {
      id: 'telefono', type: 'tel', label: 'Teléfono', placeholder: 'Ej. 601 234 5678', width: 'half',
      validation: { required: false } // Pattern opcional
    },

    // --- Institución y Asignación ---
    { id: 'section_institucion', type: 'section', label: 'Institución y Asignación', width: 'full' },
    {
      id: 'institucion_id', type: 'select', label: 'Institución', placeholder: 'Seleccionar institución', width: 'half',
      options: [ { value: '', label: 'Seleccionar...' }, ...institutions.map(inst => ({ value: inst.id, label: inst.nombre })) ],
      validation: { required: false }
    },
    {
      id: 'psicologo_id', type: 'select', label: 'Psicólogo Asignado', placeholder: 'Sin asignar', width: 'half',
      // Incluir opción para desasignar (valor vacío) y la lista de psicólogos
      options: [ { value: '', label: 'Sin asignar' }, ...psychologists.map(psico => ({ value: psico.id, label: `${psico.nombre} ${psico.apellidos}` })) ]
      // No requiere validación obligatoria, puede no tener psicólogo
    },

    // --- Notas Adicionales ---
    { id: 'section_notas', type: 'section', label: 'Notas Adicionales', width: 'full' },
    {
      id: 'notas', type: 'textarea', label: 'Notas', placeholder: 'Información adicional...', width: 'full', rows: 3
    }
  ];

  // Manejar envío del formulario - versión simplificada
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Preparar datos para el servicio - con valores por defecto para evitar problemas
      const patientData = {
        nombre: values.nombre || 'Sin nombre',
        apellidos: values.apellidos || '',
        fecha_nacimiento: values.fecha_nacimiento || null,
        genero: values.genero || null,
        documento_identidad: values.documento_identidad || '',
        email: values.email || '',
        telefono: values.telefono || '',
        institucion_id: values.institucion_id || institutions[0]?.id || null,
        psicologo_id: values.psicologo_id || null,
        notas: values.notas || ''
      };

      if (currentPatient) {
        // Actualizar paciente existente
        await enhancedSupabaseService.updatePatient(currentPatient.id, patientData);
        toast.success(`Paciente actualizado correctamente`);
      } else {
        // Crear nuevo paciente
        await enhancedSupabaseService.createPatient(patientData);
        toast.success(`Paciente creado correctamente`);
      }

      closeModal(); // Cerrar modal
      fetchData(); // Recargar datos

    } catch (error) {
      console.error('Error al guardar paciente:', error);
      toast.error('Hubo un problema al guardar los datos');
    } finally {
      setLoading(false);
    }
  };

  // --- Renderizado del Componente ---
  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 rounded-lg shadow-sm"> {/* Añadido padding y fondo */}
      {/* Barra de búsqueda y filtros */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nombre, apellido, documento..." // Placeholder más descriptivo
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange} // Pasa la función correcta
        onClearFilters={handleClearFilters}
        onAddNew={() => openModal()} // Llama a openModal sin argumentos para crear
        canAdd={isAdmin} // Controla si se muestra el botón de añadir
        addButtonText="+ Nuevo Paciente" // Texto del botón
        // Podrías añadir props adicionales si tu componente SearchFilter las necesita
      />

      {/* Tabla de Datos */}
      <DataTable
        columns={columns}
        data={filteredPatients} // Usar los datos filtrados del lado del cliente
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        loading={loading}
        enableActions={isAdmin} // Habilitar acciones si es admin
        onEdit={(patient) => openModal(patient)} // Pasa el paciente completo a editar
        onDelete={(id, patient) => handleDelete(id, patient)} // Pasa id y paciente para el mensaje
        isTemporaryFn={(id) => typeof id === 'string' && id.startsWith('temp-')} // Función para identificar IDs temporales (offline)
        emptyMessage={patients.length === 0 && !loading ? "No hay pacientes registrados." : "No se encontraron pacientes que coincidan con los filtros."} // Mensaje dinámico
        actionLabels={{ edit: "Editar paciente", delete: "Eliminar paciente" }} // Tooltips/aria-labels para acciones
        // Propiedades adicionales opcionales para DataTable:
        // pagination={true}
        // rowsPerPageOptions={[10, 25, 50]}
        // defaultRowsPerPage={10}
      />

      {/* Modal de Formulario para Crear/Editar */}
      {isModalOpen && ( // Renderizar modal solo si está abierto para optimizar
          <FormModal
            isOpen={isModalOpen}
            onClose={closeModal}
            title={currentPatient ? `Editar Paciente: ${currentPatient.nombre}` : 'Nuevo Paciente'}
            fields={formFields}
            initialValues={formValues}
            onSubmit={handleSubmit}
            loading={loading}
            submitText={currentPatient ? 'Guardar Cambios' : 'Crear Paciente'}
            isEdit={!!currentPatient} // True si estamos editando
            size="xl" // Tamaño más grande para mostrar toda la información
            // resetOnClose={true} // Opcional: resetear el formulario al cerrar
          />
      )}
    </div>
  );
};

export default PatientsTab;
