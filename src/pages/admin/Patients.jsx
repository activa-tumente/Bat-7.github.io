import React, { useState, useEffect } from 'react';
import { useNoAuth } from '../../context/NoAuthContext';
import { toast } from 'react-toastify';
import {
  FaUsers, FaSearch, FaPlus, FaTrash, FaEdit, FaSpinner
} from 'react-icons/fa';
import supabase from '../../api/supabaseClient';
import PageHeader from '../../components/ui/PageHeader';
import PatientModal from '../../components/admin/PatientModal';

/**
 * Página de Gestión de Pacientes - BAT-7
 * Diseño moderno que coincide con el panel de administración
 */
const Patients = () => {
  const { user, isAdmin, isPsicologo, loading: authLoading } = useNoAuth();
  
  // Estado principal
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  
  // Estado para listas de selección
  const [psychologists, setPsychologists] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  // Control de acceso
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center">
          <FaSpinner className="animate-spin text-blue-500 text-2xl mr-3" />
          <span className="text-gray-600">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isPsicologo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUsers className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">
            Solo los administradores y psicólogos pueden gestionar pacientes.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Cargar pacientes
  const loadPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
      
      // Log de información de conexión
      console.log('✅ Pacientes cargados:', data?.length || 0);
      
    } catch (error) {
      console.error('❌ Error al cargar pacientes:', error);
      toast.error('Error al cargar los pacientes');
    } finally {
      setLoading(false);
    }
  };

  // Cargar psicólogos
  const loadPsychologists = async () => {
    try {
      const { data, error } = await supabase
        .from('psicologos')
        .select('id, nombre, apellido')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setPsychologists(data || []);
      console.log('✅ Psicólogos cargados:', data?.length || 0);
      
    } catch (error) {
      console.error('❌ Error al cargar psicólogos:', error);
    }
  };

  // Cargar instituciones
  const loadInstitutions = async () => {
    try {
      const { data, error } = await supabase
        .from('instituciones')
        .select('id, nombre')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setInstitutions(data || []);
      console.log('✅ Instituciones cargadas:', data?.length || 0);
      
    } catch (error) {
      console.error('❌ Error al cargar instituciones:', error);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadPatients();
    loadPsychologists();
    loadInstitutions();
    
    // Verificar conexión con Supabase
    const testConnection = async () => {
      try {
        console.log('🔍 Verificando conexión con Supabase...');
        
        // Contar pacientes
        const { count: patientsCount } = await supabase
          .from('pacientes')
          .select('*', { count: 'exact', head: true });
        
        // Contar resultados
        const { count: resultsCount } = await supabase
          .from('resultados')
          .select('*', { count: 'exact', head: true });
        
        console.log(`📊 Total de pacientes: ${patientsCount || 0}`);
        console.log(`📋 Total de resultados: ${resultsCount || 0}`);
        
      } catch (error) {
        console.error('💥 Error de conexión:', error);
      }
    };
    
    testConnection();
  }, []);

  // Filtrar pacientes
  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.nombre?.toLowerCase().includes(searchLower) ||
      patient.apellido?.toLowerCase().includes(searchLower) ||
      patient.documento?.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower)
    );
  });

  // Funciones CRUD
  const handleCreate = () => {
    setSelectedPatient(null);
    setModalTitle('Nuevo Paciente');
    setIsModalOpen(true);
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setModalTitle('Editar Paciente');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
    setModalTitle('');
  };

  const handleSavePatient = async (formData) => {
    if (selectedPatient) {
      // Editar paciente existente
      await updatePatient(selectedPatient.id, formData);
    } else {
      // Crear nuevo paciente
      await createPatient(formData);
    }
  };

  const createPatient = async (patientData) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('pacientes')
        .insert([patientData]);

      if (error) throw error;
      
      toast.success('Paciente creado correctamente');
      loadPatients();
    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error('Error al crear el paciente');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePatient = async (patientId, updatedData) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('pacientes')
        .update(updatedData)
        .eq('id', patientId);

      if (error) throw error;
      
      toast.success('Paciente actualizado correctamente');
      loadPatients();
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Error al actualizar el paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (patient) => {
    if (!window.confirm(`¿Está seguro de eliminar al paciente ${patient.nombre} ${patient.apellido}?`)) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', patient.id);

      if (error) throw error;
      
      toast.success('Paciente eliminado correctamente');
      loadPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Error al eliminar el paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section with Standardized Style */}
      <PageHeader
        title="Gestión de Pacientes"
        subtitle="Administra la información y el historial de tus pacientes registrados en la plataforma"
        icon={FaUsers}
      />



      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Section Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Pacientes</h2>
              <p className="text-gray-600 mt-1">
                Administre los pacientes registrados en el sistema ({filteredPatients.length} pacientes)
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Add New Button */}
              {isAdmin && (
                <button
                  onClick={handleCreate}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="mr-2" />
                  Nuevo Paciente
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Nombre Completo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Género
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Fecha de Nacimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Nivel Educativo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Ocupación
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <FaSpinner className="animate-spin text-blue-500 text-2xl mr-3" />
                        <span className="text-gray-600">Cargando pacientes...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="px-6 py-12 text-center text-gray-500">
                      {patients.length === 0 ? 'No hay pacientes registrados' : 'No se encontraron pacientes que coincidan con la búsqueda'}
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-sm font-medium">
                              {patient.nombre?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {patient.nombre} {patient.apellido}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.telefono && `Tel: ${patient.telefono}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.email || '-'}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {patient.documento || '-'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          patient.genero === 'masculino' ? 'bg-blue-100 text-blue-800' :
                          patient.genero === 'femenino' ? 'bg-pink-100 text-pink-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {patient.genero ? patient.genero.charAt(0).toUpperCase() + patient.genero.slice(1) : '-'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.fecha_nacimiento ? 
                          new Date(patient.fecha_nacimiento).toLocaleDateString('es-ES') : 
                          '-'
                        }
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {patient.nivel_educativo || '-'}
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {patient.ocupacion || '-'}
                      </td>
                      
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(patient)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Editar paciente"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(patient)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Eliminar paciente"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          © 2025 Sistema de Gestión Psicológica - Panel de Administración
        </div>
      </div>

      {/* Patient Modal */}
      <PatientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        patient={selectedPatient}
        onSave={handleSavePatient}
        title={modalTitle}
        psychologists={psychologists}
        institutions={institutions}
      />
    </div>
  );
};

export default Patients;
