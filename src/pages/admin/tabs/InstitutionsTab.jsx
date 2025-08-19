import React, { useState, useEffect } from 'react';
import { FaBuilding, FaEdit, FaTrash, FaPlus, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import supabaseService from '../../../services/supabaseService';
import InstitutionForm from '../../../components/admin/InstitutionForm';

const InstitutionsTab = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInstitution, setCurrentInstitution] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar instituciones al montar el componente
  useEffect(() => {
    fetchInstitutions();
  }, []);

  // Función para obtener las instituciones
  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseService.getInstitutions();
      if (error) throw error;
      setInstitutions(data || []);
    } catch (error) {
      console.error('Error al obtener instituciones:', error);
      toast.error('Error al cargar las instituciones');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para crear/editar
  const openModal = (institution = null) => {
    setCurrentInstitution(institution);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentInstitution(null);
  };

  // Manejar envío del formulario
  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      let result;

      if (currentInstitution) {
        // Actualizar institución existente
        result = await supabaseService.updateInstitution(currentInstitution.id, formData);
        if (result.error) throw result.error;
        toast.success('Institución actualizada correctamente');
      } else {
        // Crear nueva institución
        result = await supabaseService.createInstitution(formData);
        if (result.error) throw result.error;
        toast.success('Institución creada correctamente');
      }

      // Actualizar lista de instituciones
      fetchInstitutions();
      closeModal();
    } catch (error) {
      console.error('Error al guardar institución:', error);
      toast.error(currentInstitution
        ? 'Error al actualizar la institución'
        : 'Error al crear la institución');
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación de institución
  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta institución?')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabaseService.deleteInstitution(id);
      if (error) throw error;

      toast.success('Institución eliminada correctamente');
      fetchInstitutions();
    } catch (error) {
      console.error('Error al eliminar institución:', error);
      toast.error('Error al eliminar la institución');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar instituciones por término de búsqueda
  const filteredInstitutions = institutions.filter(institution =>
    institution.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.telefono?.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <div className="space-y-6">
      {/* Encabezado y búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Instituciones</h2>
          <p className="text-gray-600">Administre las instituciones registradas en el sistema</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar institución..."
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
            Nueva Institución
          </button>
        </div>
      </div>

      {/* Tabla de instituciones */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <FaSpinner className="animate-spin text-blue-600 text-2xl mr-2" />
            <span>Cargando instituciones...</span>
          </div>
        ) : filteredInstitutions.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            {searchTerm ? 'No se encontraron instituciones que coincidan con la búsqueda.' : 'No hay instituciones registradas.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-sky-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Dirección</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Sitio Web</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInstitutions.map((institution) => (
                  <tr key={institution.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaBuilding className="text-gray-500 mr-2" />
                        <div className="text-sm font-medium text-gray-900">{institution.nombre}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{institution.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{institution.direccion}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{institution.telefono}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {institution.sitio_web ? (
                        <a href={institution.sitio_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {institution.sitio_web.replace(/^https?:\/\//, '').split('/')[0]}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(institution)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(institution.id)}
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

      {/* Modal para crear/editar institución */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl mx-4">
            <h2 className="text-xl font-bold mb-4">
              {currentInstitution ? 'Editar Institución' : 'Nueva Institución'}
            </h2>
            <InstitutionForm
              initialData={currentInstitution}
              onSubmit={handleSubmit}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionsTab;
