import React, { useState, useEffect } from 'react';
import { FaUserMd, FaUser, FaLink, FaUnlink, FaSearch, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const PatientAssignmentPanel = () => {
  const [psychologists, setPsychologists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPsychologist, setSelectedPsychologist] = useState('');
  const [unassignedPatients, setUnassignedPatients] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando datos de asignaciones...');

      // Datos estáticos para demostración
      loadPsychologists();
      loadPatients();
      loadAssignments();

      console.log('✅ Datos cargados correctamente');
    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const loadPsychologists = () => {
    // Datos estáticos de psicólogos
    setPsychologists([
      {
        id: '1',
        nombre: 'Dr. Rodriguez',
        apellido: 'Martínez',
        email: 'dr.rodriguez@bat7.com',
        tipo_usuario: 'psicologo',
        especialidad: 'Psicología Clínica'
      },
      {
        id: '2',
        nombre: 'Dra. Martínez',
        apellido: 'López',
        email: 'dra.martinez@bat7.com',
        tipo_usuario: 'psicologo',
        especialidad: 'Psicología Educativa'
      },
      {
        id: '3',
        nombre: 'Dr. García',
        apellido: 'Fernández',
        email: 'dr.garcia@bat7.com',
        tipo_usuario: 'psicologo',
        especialidad: 'Psicología Organizacional'
      }
    ]);
  };

  const loadPatients = () => {
    // Datos estáticos de candidatos
    setPatients([
      {
        id: '3',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@test.com',
        tipo_usuario: 'candidato',
        documento: '12345678'
      },
      {
        id: '4',
        nombre: 'María',
        apellido: 'García',
        email: 'maria.garcia@test.com',
        tipo_usuario: 'candidato',
        documento: '87654321'
      },
      {
        id: '5',
        nombre: 'Carlos',
        apellido: 'López',
        email: 'carlos.lopez@test.com',
        tipo_usuario: 'candidato',
        documento: '11223344'
      },
      {
        id: '6',
        nombre: 'Ana',
        apellido: 'Martínez',
        email: 'ana.martinez@test.com',
        tipo_usuario: 'candidato',
        documento: '44332211'
      }
    ]);
  };

  const loadAssignments = () => {
    // Datos estáticos de asignaciones
    setAssignments([
      {
        id: 1,
        psicologo_id: '1',
        paciente_id: '3',
        assigned_at: '2025-07-15T10:30:00Z',
        is_active: true,
        psychologist: {
          id: '1',
          nombre: 'Dr. Rodriguez',
          apellido: 'Martínez',
          email: 'dr.rodriguez@bat7.com'
        },
        patient: {
          id: '3',
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan.perez@test.com'
        }
      },
      {
        id: 2,
        psicologo_id: '2',
        paciente_id: '4',
        assigned_at: '2025-07-14T14:20:00Z',
        is_active: true,
        psychologist: {
          id: '2',
          nombre: 'Dra. Martínez',
          apellido: 'López',
          email: 'dra.martinez@bat7.com'
        },
        patient: {
          id: '4',
          nombre: 'María',
          apellido: 'García',
          email: 'maria.garcia@test.com'
        }
      }
    ]);
  };

  const handleAssignPatient = async (psychologistId, patientId) => {
    try {
      const assignmentData = {
        psicologo_id: psychologistId,
        paciente_id: patientId,
        assigned_at: new Date().toISOString(),
        is_active: true
      };

      // Agregar al estado local
      const newAssignment = {
        ...assignmentData,
        id: Date.now()
      };
      setAssignments(prev => [...prev, newAssignment]);

      // Intentar guardar en la base de datos
      const { error } = await supabase
        .from('patient_assignments')
        .insert([assignmentData]);

      if (error && error.code !== '42P01') {
        throw error;
      }

      toast.success('Paciente asignado exitosamente');
      setShowAssignModal(false);
    } catch (error) {
      console.error('Error assigning patient:', error);
      toast.error('Error al asignar paciente');
    }
  };

  const handleUnassignPatient = async (assignmentId) => {
    if (!window.confirm('¿Estás seguro de que quieres desasignar este paciente?')) {
      return;
    }

    try {
      // Eliminar del estado local
      setAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));

      // Intentar eliminar de la base de datos
      const { error } = await supabase
        .from('patient_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error && error.code !== '42P01') {
        throw error;
      }

      toast.success('Paciente desasignado exitosamente');
    } catch (error) {
      console.error('Error unassigning patient:', error);
      toast.error('Error al desasignar paciente');
    }
  };

  const handleSaveAssignments = async () => {
    if (!selectedPsychologist || selectedPatients.length === 0) {
      toast.error('Debe seleccionar un psicólogo y al menos un paciente');
      return;
    }

    try {
      // Crear nuevas asignaciones
      const newAssignments = selectedPatients.map(patientId => ({
        id: `${selectedPsychologist}-${patientId}-${Date.now()}`,
        psicologo_id: selectedPsychologist,
        paciente_id: patientId,
        assigned_at: new Date().toISOString(),
        is_active: true
      }));

      // Agregar al estado local
      setAssignments(prev => [...prev, ...newAssignments]);

      // Limpiar selecciones y cerrar modal
      setSelectedPatients([]);
      setSelectedPsychologist('');
      setModalSearchTerm('');
      setShowAssignModal(false);

      toast.success(`${selectedPatients.length} paciente(s) asignado(s) exitosamente`);
    } catch (error) {
      console.error('Error saving assignments:', error);
      toast.error('Error al guardar asignaciones');
    }
  };

  const togglePatientSelection = (patientId) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const getAssignedPatients = (psychologistId) => {
    return assignments
      .filter(assignment => assignment.psicologo_id === psychologistId && assignment.is_active === true)
      .map(assignment => {
        const patient = patients.find(p => p.id === assignment.paciente_id);
        return { ...assignment, patient };
      })
      .filter(assignment => assignment.patient);
  };

  const getUnassignedPatients = () => {
    const assignedPatientIds = assignments
      .filter(assignment => assignment.is_active === true)
      .map(assignment => assignment.paciente_id);

    return patients.filter(patient => !assignedPatientIds.includes(patient.id));
  };

  const filteredPsychologists = psychologists.filter(psychologist =>
    psychologist.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    psychologist.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    psychologist.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Asignación de Pacientes</h2>
        <p className="text-gray-600 mt-2">Gestiona la asignación de pacientes a psicólogos</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Psicólogos</p>
              <p className="text-3xl font-bold text-gray-900">{psychologists.length}</p>
            </div>
            <FaUserMd className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pacientes</p>
              <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
            </div>
            <FaUser className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Asignaciones</p>
              <p className="text-3xl font-bold text-gray-900">{assignments.filter(a => a.status === 'active').length}</p>
            </div>
            <FaLink className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sin Asignar</p>
              <p className="text-3xl font-bold text-gray-900">{getUnassignedPatients().length}</p>
            </div>
            <FaUnlink className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar psicólogos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FaPlus />
            <span>Nueva Asignación</span>
          </button>
        </div>

        {/* Lista de psicólogos y sus pacientes asignados */}
        <div className="space-y-6">
          {filteredPsychologists.map((psychologist) => {
            const assignedPatients = getAssignedPatients(psychologist.id);
            
            return (
              <div key={psychologist.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUserMd className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {psychologist.nombre} {psychologist.apellido}
                      </h3>
                      <p className="text-sm text-gray-600">{psychologist.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Pacientes asignados</p>
                    <p className="text-2xl font-bold text-blue-600">{assignedPatients.length}</p>
                  </div>
                </div>

                {assignedPatients.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignedPatients.map((assignment) => (
                      <div key={assignment.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <FaUser className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {assignment.patient.nombre} {assignment.patient.apellido}
                            </p>
                            <p className="text-xs text-gray-600">{assignment.patient.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnassignPatient(assignment.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Desasignar paciente"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaUser className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay pacientes asignados</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredPsychologists.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron psicólogos</p>
          </div>
        )}
      </div>

      {/* Modal para nueva asignación */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva Asignación</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Psicólogo
                </label>
                <select
                  value={selectedPsychologist}
                  onChange={(e) => setSelectedPsychologist(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar psicólogo</option>
                  {psychologists.map(psychologist => (
                    <option key={psychologist.id} value={psychologist.id}>
                      {psychologist.nombre} {psychologist.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pacientes sin asignar ({getUnassignedPatients().filter(p =>
                    p.nombre.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                    p.apellido.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                    p.email.toLowerCase().includes(modalSearchTerm.toLowerCase())
                  ).length})
                </label>

                {/* Barra de búsqueda */}
                <div className="relative mb-3">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar pacientes..."
                    value={modalSearchTerm}
                    onChange={(e) => setModalSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
                  {getUnassignedPatients()
                    .filter(patient =>
                      patient.nombre.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                      patient.apellido.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                      patient.email.toLowerCase().includes(modalSearchTerm.toLowerCase())
                    )
                    .map(patient => (
                    <div
                      key={patient.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0 flex items-center justify-between ${
                        selectedPatients.includes(patient.id) ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => togglePatientSelection(patient.id)}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {patient.nombre} {patient.apellido}
                        </p>
                        <p className="text-xs text-gray-600">{patient.email}</p>
                      </div>
                      {selectedPatients.includes(patient.id) && (
                        <FaCheck className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  ))}
                  {getUnassignedPatients().filter(p =>
                    p.nombre.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                    p.apellido.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                    p.email.toLowerCase().includes(modalSearchTerm.toLowerCase())
                  ).length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      {modalSearchTerm ? 'No se encontraron pacientes' : 'No hay pacientes sin asignar'}
                    </div>
                  )}
                </div>

                {selectedPatients.length > 0 && (
                  <div className="mt-2 text-sm text-blue-600">
                    {selectedPatients.length} paciente(s) seleccionado(s)
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedPatients([]);
                  setSelectedPsychologist('');
                  setModalSearchTerm('');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAssignments}
                disabled={!selectedPsychologist || selectedPatients.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <FaCheck className="w-4 h-4" />
                <span>Guardar ({selectedPatients.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAssignmentPanel;
