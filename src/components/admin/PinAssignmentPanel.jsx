import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import PinManagementService from '../../services/pin/PinManagementService';
import { 
  FaSpinner, 
  FaPlusCircle, 
  FaExclamationTriangle, 
  FaCoins,
  FaUsers,
  FaChartBar,
  FaHistory,
  FaRedo
} from 'react-icons/fa';

const PinAssignmentPanel = () => {
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pinAmounts, setPinAmounts] = useState({});
  const [assigningId, setAssigningId] = useState(null);
  const [systemStats, setSystemStats] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);

  /**
   * Carga los datos de psicólogos y estadísticas del sistema
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar psicólogos y estadísticas en paralelo
      const [usageStats, systemSummary] = await Promise.all([
        PinManagementService.getUsageStats(),
        PinManagementService.getSystemSummary()
      ]);
      
      setPsychologists(usageStats.statistics);
      setSystemStats(systemSummary);
      
    } catch (err) {
      setError('No se pudieron cargar los datos. Intente de nuevo más tarde.');
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carga el historial de transacciones
   */
  const fetchTransactionHistory = useCallback(async () => {
    try {
      const history = await PinManagementService.getTransactionHistory(null, 20);
      setTransactionHistory(history);
    } catch (err) {
      console.error('Error cargando historial:', err);
      toast.error('Error al cargar el historial de transacciones.');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (showHistory) {
      fetchTransactionHistory();
    }
  }, [showHistory, fetchTransactionHistory]);

  /**
   * Maneja el cambio en la cantidad de pines a asignar
   */
  const handleAmountChange = (id, value) => {
    const amount = parseInt(value, 10);
    setPinAmounts(prev => ({
      ...prev,
      [id]: isNaN(amount) ? '' : Math.max(0, amount),
    }));
  };

  /**
   * Asigna pines a un psicólogo específico
   */
  const handleAssignPins = async (psychologistId) => {
    const amount = pinAmounts[psychologistId];
    if (!amount || amount <= 0) {
      toast.warn('Por favor, ingrese una cantidad válida de pines.');
      return;
    }

    setAssigningId(psychologistId);
    try {
      await PinManagementService.assignPins(
        psychologistId, 
        amount, 
        `Asignación manual de ${amount} pines`
      );
      
      // Limpiar input y refrescar datos
      setPinAmounts(prev => ({ ...prev, [psychologistId]: '' }));
      await fetchData();
      
    } catch (err) {
      // El toast de error ya se maneja en el servicio
      console.error('Error asignando pines:', err);
    } finally {
      setAssigningId(null);
    }
  };

  /**
   * Obtiene el color del badge según el estado
   */
  const getStatusBadge = (status, pinesRestantes) => {
    const badges = {
      'sin_pines': 'bg-red-100 text-red-800',
      'pocos_pines': 'bg-yellow-100 text-yellow-800',
      'activo': 'bg-green-100 text-green-800'
    };

    const labels = {
      'sin_pines': 'Sin pines',
      'pocos_pines': 'Pocos pines',
      'activo': 'Activo'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status] || badges.activo}`}>
        {labels[status] || 'Activo'} ({pinesRestantes})
      </span>
    );
  };

  /**
   * Formatea la fecha para mostrar
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
        <span className="ml-4 text-xl">Cargando datos del sistema...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-red-50 border border-red-200 rounded-lg">
        <FaExclamationTriangle className="text-red-500 text-4xl" />
        <span className="mt-4 text-xl text-red-700">{error}</span>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
        >
          <FaRedo className="mr-2" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Pines</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FaHistory className="mr-2" />
            {showHistory ? 'Ocultar' : 'Ver'} Historial
          </button>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FaRedo className="mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas del Sistema */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FaUsers className="text-blue-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Psicólogos Totales</p>
                <p className="text-2xl font-bold">{systemStats.total_psychologists}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FaCoins className="text-yellow-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pines Disponibles</p>
                <p className="text-2xl font-bold text-green-600">{systemStats.total_pins_available}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FaChartBar className="text-red-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pines Consumidos</p>
                <p className="text-2xl font-bold text-red-600">{systemStats.total_pins_consumed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FaUsers className="text-purple-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Con Pines / Sin Pines</p>
                <p className="text-2xl font-bold">
                  <span className="text-green-600">{systemStats.psychologists_with_pins}</span>
                  <span className="text-gray-400 mx-1">/</span>
                  <span className="text-red-600">{systemStats.psychologists_without_pins}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historial de Transacciones */}
      {showHistory && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Historial de Transacciones</h2>
          </div>
          <div className="p-4">
            {transactionHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay transacciones registradas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Psicólogo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactionHistory.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {transaction.psicologos?.nombre} {transaction.psicologos?.apellido}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            transaction.tipo === 'asignacion' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.tipo === 'asignacion' ? 'Asignación' : 'Consumo'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">
                          <span className={transaction.tipo === 'asignacion' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.tipo === 'asignacion' ? '+' : ''}{transaction.cantidad}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {transaction.motivo || 'Sin motivo especificado'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabla de Psicólogos */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Asignación de Pines por Psicólogo</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Psicólogo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asignados
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consumidos
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disponibles
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pacientes
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asignar Pines
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {psychologists.map((psychologist) => (
                <tr key={psychologist.psicologo_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {psychologist.nombre_psicologo}
                    </div>
                    <div className="text-sm text-gray-500">
                      {psychologist.email_psicologo}
                    </div>
                    {psychologist.ultima_transaccion && (
                      <div className="text-xs text-gray-400">
                        Última: {formatDate(psychologist.ultima_transaccion)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getStatusBadge(psychologist.status, psychologist.pines_restantes)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-blue-600 font-semibold">
                    {psychologist.total_asignado}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600 font-semibold">
                    {psychologist.total_consumido}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-bold text-lg">
                    {psychologist.pines_restantes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {psychologist.pacientes_asignados}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {psychologist.tests_completados}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        placeholder="Cantidad"
                        value={pinAmounts[psychologist.psicologo_id] || ''}
                        onChange={(e) => handleAmountChange(psychologist.psicologo_id, e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        disabled={assigningId === psychologist.psicologo_id}
                      />
                      <button
                        onClick={() => handleAssignPins(psychologist.psicologo_id)}
                        className={`px-3 py-1.5 text-white rounded-md disabled:bg-gray-400 flex items-center justify-center transition-colors text-sm ${
                          psychologist.pines_restantes > 0 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        disabled={
                          assigningId === psychologist.psicologo_id || 
                          !pinAmounts[psychologist.psicologo_id] ||
                          pinAmounts[psychologist.psicologo_id] <= 0
                        }
                        title={psychologist.pines_restantes > 0 ? 'Agregar pines adicionales' : 'Asignar pines iniciales'}
                      >
                        {assigningId === psychologist.psicologo_id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaPlusCircle />
                        )}
                        <span className="ml-1">
                          {psychologist.pines_restantes > 0 ? 'Agregar' : 'Asignar'}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {psychologists.length === 0 && (
          <div className="text-center py-8">
            <FaUsers className="mx-auto text-gray-400 text-4xl mb-4" />
            <p className="text-gray-500">No hay psicólogos registrados en el sistema.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PinAssignmentPanel;