import React, { useState, useEffect } from 'react';
import { FaUserMd, FaEdit, FaTrash, FaPlus, FaSpinner, FaMale, FaFemale } from 'react-icons/fa';
import { toast } from 'react-toastify';
import supabaseService from '../../../services/supabaseService';

const PsychologistsTab = () => {
  const [psychologists, setPsychologists] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPsychologist, setCurrentPsychologist] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    genero: 'masculino',
    email: '',
    telefono: '',
    especialidad: '',
    institucion_id: ''
  });

  // Cargar psicólogos e instituciones al montar el componente
  useEffect(() => {
    fetchPsychologists();
    fetchInstitutions();
  }, []);

  // Función para obtener los psicólogos
  const fetchPsychologists = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseService.getPsychologists();
      if (error) throw error;
      setPsychologists(data || []);
    } catch (error) {
      console.error('Error al obtener psicólogos:', error);
      toast.error('Error al cargar los psicólogos');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener las instituciones
  const fetchInstitutions = async () => {
    try {
      const { data, error } = await supabaseService.getInstitutions();
      if (error) throw error;
      setInstitutions(data || []);
    } catch (error) {
      console.error('Error al obtener instituciones:', error);
      toast.error('Error al cargar las instituciones');
    }
  };

  // Abrir modal para crear/editar
  const openModal = (psychologist = null) => {
    setCurrentPsychologist(psychologist);

    if (psychologist) {
      setFormData({
        nombre: psychologist.nombre || '',
        apellido: psychologist.apellido || '',
        genero: psychologist.genero || 'masculino',
        email: psychologist.email || '',
        telefono: psychologist.telefono || '',
        especialidad: psychologist.especialidad || '',
        institucion_id: psychologist.institucion_id || '',
        activo: psychologist.activo !== false
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        genero: 'masculino',
        email: '',
        telefono: '',
        especialidad: '',
        institucion_id: '',
        activo: true
      });
    }

    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPsychologist(null);
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

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      let result;

      if (currentPsychologist) {
        // Actualizar psicólogo existente
        result = await supabaseService.updatePsychologist(currentPsychologist.id, formData);
        if (result.error) throw result.error;
        toast.success('Psicólogo actualizado correctamente');
      } else {
        // Crear nuevo psicólogo
        result = await supabaseService.createPsychologist(formData);
        if (result.error) throw result.error;
        toast.success('Psicólogo creado correctamente');
      }

      // Actualizar lista de psicólogos
      fetchPsychologists();
      closeModal();
    } catch (error) {
      console.error('Error al guardar psicólogo:', error);
      toast.error(currentPsychologist
        ? 'Error al actualizar el psicólogo'
        : 'Error al crear el psicólogo');
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación de psicólogo
  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este psicólogo?')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabaseService.deletePsychologist(id);
      if (error) throw error;

      toast.success('Psicólogo eliminado correctamente');
      fetchPsychologists();
    } catch (error) {
      console.error('Error al eliminar psicólogo:', error);
      toast.error('Error al eliminar el psicólogo');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar psicólogos por término de búsqueda
  const filteredPsychologists = psychologists.filter(psychologist =>
    psychologist.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    psychologist.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    psychologist.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    psychologist.especialidad?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener nombre de institución por ID
  const getInstitutionName = (id) => {
    const institution = institutions.find(inst => inst.id === id);
    return institution ? institution.nombre : 'No asignada';
  };



  return (
    <div className="space-y-6">
      {/* Encabezado y búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Psicólogos</h2>
          <p className="text-gray-600">Administre los psicólogos registrados en el sistema</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar psicólogo..."
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
            Nuevo Psicólogo
          </button>
        </div>
      </div>

      {/* Tabla de psicólogos */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {loading && psychologists.length === 0 ? (
          <div className="flex justify-center items-center p-8">
            <FaSpinner className="animate-spin text-blue-600 text-2xl mr-2" />
            <span>Cargando psicólogos...</span>
          </div>
        ) : filteredPsychologists.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            {searchTerm ? 'No se encontraron psicólogos que coincidan con la búsqueda.' : 'No hay psicólogos registrados.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-sky-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Especialidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Institución</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPsychologists.map((psychologist) => (
                  <tr key={psychologist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {psychologist.genero === 'femenino' ? (
                          <FaFemale className="text-pink-500 mr-2" />
                        ) : (
                          <FaMale className="text-blue-500 mr-2" />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {psychologist.nombre} {psychologist.apellido}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{psychologist.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{psychologist.telefono || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{psychologist.especialidad || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getInstitutionName(psychologist.institucion_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        psychologist.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {psychologist.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(psychologist)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(psychologist.id)}
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

      {/* Modal para crear/editar psicólogo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl mx-4">
            <h2 className="text-xl font-bold mb-4">
              {currentPsychologist ? 'Editar Psicólogo' : 'Nuevo Psicólogo'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    Teléfono
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialidad
                  </label>
                  <input
                    type="text"
                    name="especialidad"
                    value={formData.especialidad}
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
                    currentPsychologist ? 'Actualizar' : 'Crear'
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

export default PsychologistsTab;
