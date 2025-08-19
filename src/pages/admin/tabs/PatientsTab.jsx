import React, { useState, useEffect } from 'react';
import { FaUsers, FaEdit, FaTrash, FaPlus, FaSpinner, FaMale, FaFemale } from 'react-icons/fa';
import { toast } from 'react-toastify';
import supabaseService from '../../../services/supabaseService'; // Servicio para conectar con Supabase

const PatientsTab = () => {
  const [patients, setPatients] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
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
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    genero: 'masculino',
    fecha_nacimiento: '',
    documento: '',
    email: '',
    nivel_educativo: '',
    ocupacion: '',
    institucion_id: '',
    psicologo_id: ''
  });

  // Cargar pacientes, instituciones y psicólogos al montar el componente
  useEffect(() => {
    fetchPatients();
    fetchInstitutions();
    fetchPsychologists();
  }, []);

  // Función para obtener los pacientes desde Supabase
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseService.getPatients();
      if (error) throw error;

      // Procesar pacientes añadiendo edad calculada
      const patientsWithAge = (Array.isArray(data) ? data : []).map(p => ({
        ...p,
        edad: calculateAge(p.fecha_nacimiento)
      }));

      setPatients(patientsWithAge);
      console.log('Pacientes cargados desde Supabase:', patientsWithAge);
    } catch (error) {
      console.error('Error al obtener pacientes:', error);
      toast.error('Error: ' + (error.message || 'Error al cargar los pacientes'));
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener las instituciones desde Supabase
  const fetchInstitutions = async () => {
    try {
      const { data, error } = await supabaseService.getInstitutions();
      if (error) throw error;
      setInstitutions(data || []);
      console.log('Instituciones cargadas desde Supabase:', data);
    } catch (error) {
      console.error('Error al obtener instituciones:', error);
      toast.error('Error: ' + (error.message || 'Error al cargar las instituciones'));
    }
  };

  // Función para obtener los psicólogos desde Supabase
  const fetchPsychologists = async () => {
    try {
      const { data, error } = await supabaseService.getPsychologists();
      if (error) throw error;
      setPsychologists(data || []);
      console.log('Psicólogos cargados desde Supabase:', data);
    } catch (error) {
      console.error('Error al obtener psicólogos:', error);
      toast.error('Error: ' + (error.message || 'Error al cargar los psicólogos'));
    }
  };

  // Abrir modal para crear/editar
  const openModal = (patient = null) => {
    setCurrentPatient(patient);

    if (patient) {
      setFormData({
        nombre: patient.nombre || '',
        apellido: patient.apellido || '',
        genero: patient.genero || 'masculino',
        fecha_nacimiento: patient.fecha_nacimiento || '',
        documento: patient.documento || '',
        email: patient.email || '',
        institucion_id: patient.institucion_id || '',
        psicologo_id: patient.psicologo_id || '',
        activo: patient.activo !== false
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        genero: 'masculino',
        fecha_nacimiento: '',
        documento: '',
        email: '',
        institucion_id: '',
        psicologo_id: '',
        activo: true
      });
    }

    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPatient(null);
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Validar formulario
  const validateForm = () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return false;
    }
    if (!formData.apellido.trim()) {
      toast.error('El apellido es obligatorio');
      return false;
    }
    if (!formData.institucion_id) {
      toast.error('Debe seleccionar una institución');
      return false;
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('El email no es válido');
      return false;
    }
    return true;
  };

  // Función para manejar el envío del formulario usando Supabase
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Preparar datos para Supabase
      const patientData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        genero: formData.genero,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        documento: formData.documento || '',
        email: formData.email || '',
        institucion_id: formData.institucion_id,
        psicologo_id: formData.psicologo_id || null,
        activo: formData.activo,
        updated_at: new Date().toISOString()
      };

      // Si es un nuevo paciente, agregar fecha de creación
      if (!currentPatient) {
        patientData.created_at = new Date().toISOString();
      }

      let result;

      if (currentPatient) {
        // Actualizar paciente existente
        result = await supabaseService.updatePatient(currentPatient.id, patientData);
        if (result.error) throw result.error;
        toast.success(`Paciente "${formData.nombre}" actualizado correctamente`);
      } else {
        // Crear nuevo paciente
        result = await supabaseService.createPatient(patientData);
        if (result.error) throw result.error;
        toast.success(`Paciente "${formData.nombre}" creado correctamente`);
      }

      console.log('Respuesta de Supabase:', result);

      // Actualizar lista de pacientes
      fetchPatients();
      closeModal();
    } catch (error) {
      console.error('Error al guardar paciente:', error);
      toast.error('Error: ' + (error.message || (currentPatient
        ? 'Error al actualizar el paciente'
        : 'Error al crear el paciente')));
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación de paciente usando Supabase
  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este paciente?')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabaseService.deletePatient(id);
      if (error) throw error;

      toast.success('Paciente eliminado correctamente');
      fetchPatients();
    } catch (error) {
      console.error('Error al eliminar paciente:', error);
      toast.error('Error: ' + (error.message || 'Error al eliminar el paciente'));
    } finally {
      setLoading(false);
    }
  };

  // Calcular edad a partir de la fecha de nacimiento
  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Función auxiliar para filtrar pacientes por término de búsqueda simple
  const filterPatientsBySearchTerm = (patient, term) => {
    const searchTermLower = term.toLowerCase();
    return (
      patient.nombre?.toLowerCase().includes(searchTermLower) ||
      patient.apellido?.toLowerCase().includes(searchTermLower) ||
      patient.documento?.toLowerCase().includes(searchTermLower) ||
      patient.email?.toLowerCase().includes(searchTermLower)
    );
  };

  // Obtener nombre de institución por ID
  const getInstitutionName = (id) => {
    const institution = institutions.find(inst => inst.id === id);
    return institution ? institution.nombre : 'No asignada';
  };

  // Obtener nombre de psicólogo por ID
  const getPsychologistName = (id) => {
    const psychologist = psychologists.find(psych => psych.id === id);
    return psychologist ? `${psychologist.nombre} ${psychologist.apellido}` : 'No asignado';
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

  // Función para recargar datos
  const fetchData = async () => {
    await Promise.all([
      fetchPatients(),
      fetchInstitutions(),
      fetchPsychologists()
    ]);
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

  // Comentario: La función handleModalSubmit ha sido eliminada porque ya tenemos handleFormSubmit

  return (
    <div className="space-y-6">
      {/* Encabezado y búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Pacientes</h2>
          <p className="text-gray-600">Administre los pacientes registrados en el sistema</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar paciente..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            <FaPlus className="mr-2" />
            Nuevo Paciente
          </button>
        </div>
      </div>

      {/* Tabla de pacientes */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {loading && patients.length === 0 ? (
          <div className="flex justify-center items-center p-8">
            <FaSpinner className="animate-spin text-blue-600 text-2xl mr-2" />
            <span>Cargando pacientes...</span>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            {searchTerm ? 'No se encontraron pacientes que coincidan con la búsqueda.' : 'No hay pacientes registrados.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-sky-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Documento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Edad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Institución</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Psicólogo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {patient.genero === 'femenino' ? (
                          <FaFemale className="text-pink-500 mr-2" />
                        ) : (
                          <FaMale className="text-blue-500 mr-2" />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {patient.nombre} {patient.apellido}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.documento || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{calculateAge(patient.fecha_nacimiento)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.email ? (
                        <div>
                          <div>{patient.email}</div>
                        </div>
                      ) : (
                        patient.email || '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getInstitutionName(patient.institucion_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getPsychologistName(patient.psicologo_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(patient)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para crear/editar paciente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl mx-4">
            <h2 className="text-xl font-bold mb-4">
              {currentPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Género
                  </label>
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Documento
                  </label>
                  <input
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nivel Educativo
                  </label>
                  <input
                    type="text"
                    name="nivel_educativo"
                    value={formData.nivel_educativo}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ocupación
                  </label>
                  <input
                    type="text"
                    name="ocupacion"
                    value={formData.ocupacion}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institución *
                  </label>
                  <select
                    name="institucion_id"
                    value={formData.institucion_id}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Seleccione una institución</option>
                    {institutions.map(institution => (
                      <option key={institution.id} value={institution.id}>
                        {institution.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Psicólogo
                  </label>
                  <select
                    name="psicologo_id"
                    value={formData.psicologo_id}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Seleccione un psicólogo</option>
                    {psychologists.map(psychologist => (
                      <option key={psychologist.id} value={psychologist.id}>
                        {psychologist.nombre} {psychologist.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Guardando...
                    </>
                  ) : (
                    currentPatient ? 'Actualizar' : 'Crear'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsTab;
