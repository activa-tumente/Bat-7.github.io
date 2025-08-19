/**
 * Panel de asignación de pacientes a psicólogos
 */

import React, { useState } from 'react';
import { FaUserFriends, FaPlus, FaExchangeAlt, FaSearch, FaFilter } from 'react-icons/fa';
import { usePatientAssignment } from '../../hooks/usePatientAssignment';
import DataTable from '../ui/DataTable';

const PatientAssignmentPanel = ({ psychologistMode = false, currentUserId = null }) => {
  const {
    assignments,
    availableCandidates,
    availablePsychologists,
    statistics,
    loading,
    error,
    assignPatient,
    unassignPatient,
    transferPatients,
    unassignedCandidates,
    assignedCandidates,
    psychologistStats
  } = usePatientAssignment();

  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedPsychologist, setSelectedPsychologist] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'assigned', 'unassigned'

  // Configuración de columnas para candidatos
  const candidateColumns = [
    {
      key: 'nombre',
      label: 'Candidato',
      render: (candidate) => (
        <div>
          <div className="font-medium text-gray-900">
            {candidate.nombre} {candidate.apellidos}
          </div>
          <div className="text-sm text-gray-500">{candidate.documento_identidad}</div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Contacto',
      render: (candidate) => (
        <div>
          <div className="text-sm text-gray-900">{candidate.email}</div>
          <div className="text-sm text-gray-500">{candidate.telefono}</div>
        </div>
      )
    },
    {
      key: 'psicologo_asignado',
      label: 'Psicólogo Asignado',
      render: (candidate) => {
        if (candidate.current_assignment && candidate.current_assignment.length > 0) {
          const assignment = candidate.current_assignment[0];
          return (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              {assignment.psicologo?.nombre} {assignment.psicologo?.apellido}
            </span>
          );
        }
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            Sin asignar
          </span>
        );
      }
    },
    {
      key: 'institucion',
      label: 'Institución',
      render: (candidate) => candidate.institucion?.nombre || 'Sin institución'
    }
  ];

  // Configuración de columnas para asignaciones
  const assignmentColumns = [
    {
      key: 'candidato',
      label: 'Candidato',
      render: (assignment) => (
        <div>
          <div className="font-medium text-gray-900">
            {assignment.candidato?.nombre} {assignment.candidato?.apellidos}
          </div>
          <div className="text-sm text-gray-500">{assignment.candidato?.documento_identidad}</div>
        </div>
      )
    },
    {
      key: 'psicologo',
      label: 'Psicólogo',
      render: (assignment) => (
        <div>
          <div className="font-medium text-gray-900">
            {assignment.psicologo?.nombre} {assignment.psicologo?.apellido}
          </div>
          <div className="text-sm text-gray-500">{assignment.psicologo?.institucion?.nombre}</div>
        </div>
      )
    },
    {
      key: 'assigned_at',
      label: 'Fecha Asignación',
      render: (assignment) => new Date(assignment.assigned_at).toLocaleDateString()
    },
    {
      key: 'notes',
      label: 'Notas',
      render: (assignment) => assignment.notes || 'Sin notas'
    }
  ];

  const handleAssignPatient = async () => {
    if (!selectedCandidate || !selectedPsychologist) {
      alert('Debe seleccionar un candidato y un psicólogo');
      return;
    }

    const result = await assignPatient(
      selectedCandidate.id,
      selectedPsychologist,
      currentUserId || 'admin',
      'Asignación desde panel de administración'
    );

    if (result.success) {
      setShowAssignDialog(false);
      setSelectedCandidate(null);
      setSelectedPsychologist('');
    }
  };

  const handleUnassignPatient = async (candidateId) => {
    if (window.confirm('¿Está seguro de que desea desasignar este paciente?')) {
      await unassignPatient(candidateId, currentUserId || 'admin', 'Desasignación desde panel');
    }
  };

  // Filtrar candidatos según búsqueda y estado
  const filteredCandidates = availableCandidates.filter(candidate => {
    const matchesSearch = !searchTerm || 
      candidate.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.documento_identidad?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'assigned' && candidate.psicologo_id) ||
      (filterStatus === 'unassigned' && !candidate.psicologo_id);

    return matchesSearch && matchesFilter;
  });

  if (psychologistMode) {
    // Vista para psicólogos - solo sus pacientes asignados
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Mis Pacientes Asignados</h2>
          
          {/* Estadísticas básicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {assignments.filter(a => a.psicologo_id === currentUserId).length}
              </div>
              <div className="text-sm text-blue-600">Pacientes Asignados</div>
            </div>
          </div>

          {/* Lista de pacientes asignados */}
          <DataTable
            columns={candidateColumns}
            data={assignments.filter(a => a.psicologo_id === currentUserId).map(a => a.candidato)}
            loading={loading}
            emptyMessage="No tiene pacientes asignados"
          />
        </div>
      </div>
    );
  }

  // Vista completa para administradores
  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaUserFriends className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Candidatos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statistics.totalCandidates}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaUserFriends className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Asignados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statistics.assignedCandidates}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaUserFriends className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Sin Asignar
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statistics.unassignedCandidates}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaUserFriends className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      % Asignados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statistics.assignmentPercentage}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel principal */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Asignación de Pacientes</h2>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona las asignaciones de candidatos a psicólogos
            </p>
          </div>
          <button
            onClick={() => setShowAssignDialog(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700"
          >
            <FaPlus className="mr-2 h-4 w-4" />
            Nueva Asignación
          </button>
        </div>

        {/* Controles de búsqueda y filtro */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar candidatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="all">Todos los candidatos</option>
            <option value="assigned">Solo asignados</option>
            <option value="unassigned">Solo sin asignar</option>
          </select>
        </div>

        {/* Tabla de candidatos */}
        <DataTable
          columns={candidateColumns}
          data={filteredCandidates}
          loading={loading}
          onEdit={(candidate) => {
            setSelectedCandidate(candidate);
            setShowAssignDialog(true);
          }}
          onDelete={(candidate) => handleUnassignPatient(candidate.id)}
          emptyMessage="No se encontraron candidatos"
          actionLabels={{ edit: "Asignar", delete: "Desasignar" }}
        />
      </div>

      {/* Modal de asignación */}
      {showAssignDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Asignar Paciente
                </h3>
                <button
                  onClick={() => setShowAssignDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Candidato
                  </label>
                  <select
                    value={selectedCandidate?.id || ''}
                    onChange={(e) => {
                      const candidate = availableCandidates.find(c => c.id === e.target.value);
                      setSelectedCandidate(candidate);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Seleccionar candidato</option>
                    {unassignedCandidates.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.nombre} {candidate.apellidos} - {candidate.documento_identidad}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Psicólogo
                  </label>
                  <select
                    value={selectedPsychologist}
                    onChange={(e) => setSelectedPsychologist(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Seleccionar psicólogo</option>
                    {availablePsychologists.map((psychologist) => (
                      <option key={psychologist.id} value={psychologist.id}>
                        {psychologist.nombre} {psychologist.apellido} - {psychologist.institucion?.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowAssignDialog(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAssignPatient}
                    className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700"
                  >
                    Asignar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAssignmentPanel;
