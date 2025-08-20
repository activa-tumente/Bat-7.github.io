import React, { useState, useEffect, useMemo } from 'react';
import { FaChartBar, FaClock, FaCalendarAlt, FaDownload, FaEye, FaUsers, FaClipboardCheck, FaCoins, FaPlus, FaInfinity, FaExclamationTriangle, FaTrash, FaEdit, FaFileCsv, FaUserTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PinManagementService from '../../services/pin/PinManagementService';
import SimplePinService from '../../services/pin/SimplePinService';
import PinAssignmentModal from './PinAssignmentModal';
import supabaseService from '../../services/supabaseService';
import { supabase } from '../../api/supabaseClient';

const UsageControlPanel = () => {
  const [pinStats, setPinStats] = useState([]);
  
  // Initialize services
  const simplePinService = SimplePinService;

  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [pinLogs, setPinLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedPsychologist, setSelectedPsychologist] = useState('');
  const [pinAmount, setPinAmount] = useState(1);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  // Estados para selección múltiple
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Estados para eliminación de psicólogos
  const [selectedPsychologists, setSelectedPsychologists] = useState([]);
  const [selectAllPsychologists, setSelectAllPsychologists] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState('pins'); // 'pins' o 'complete'
  const [pinQuantityToDelete, setPinQuantityToDelete] = useState(1);
  const [showDeletePsychologistModal, setShowDeletePsychologistModal] = useState(false);

  const timeRanges = [
    { value: '24hours', label: 'Últimas 24 horas' },
    { value: '7days', label: 'Últimos 7 días' },
    { value: '30days', label: 'Últimos 30 días' },
    { value: '90days', label: 'Últimos 90 días' }
  ];

  const pinAmounts = [1, 5, 10, 25, 50, 100];

  // Memoize expensive calculations
  const summaryStats = useMemo(() => ({
    totalPsychologists: pinStats.length,
    totalPinsAssigned: pinStats.reduce((acc, stat) => acc + (stat.total_asignado || 0), 0),
    totalPinsUsed: pinStats.reduce((acc, stat) => acc + (stat.total_consumido || 0), 0),
    totalPinsRemaining: pinStats.reduce((acc, stat) => acc + (stat.pines_restantes || 0), 0)
  }), [pinStats]);

  useEffect(() => {
    loadPinData();
  }, [timeRange]);

  const loadPinData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando datos de control de pines...');

      const stats = await PinManagementService.getPsychologistsWithPinStats();
      setPinStats(stats);

      // Cargar historial de pines
      const history = await PinManagementService.getTransactionHistory(null, 20);
      setPinLogs(history);

      // Generar alertas basadas en las estadísticas - solo para psicólogos con pines asignados
      const alertsData = stats.filter(stat => 
        (stat.status === 'pocos_pines' || stat.status === 'sin_pines') && 
        stat.total_asignado > 0  // Solo mostrar alertas si el psicólogo tiene pines asignados
      ).map(stat => ({
        type: stat.status === 'sin_pines' ? 'error' : 'warning',
        psychologist_id: stat.psicologo_id,
        psychologist_name: stat.nombre_psicologo,
        message: stat.status === 'sin_pines' 
          ? `${stat.nombre_psicologo} no tiene pines disponibles`
          : `${stat.nombre_psicologo} tiene solo ${stat.pines_restantes} pines restantes`,
        severity: stat.status === 'sin_pines' ? 'error' : 'warning'
      }));
      setAlerts(alertsData);

      console.log('✅ Datos de pines cargados correctamente');
    } catch (error) {
      console.error('❌ Error loading pin data:', error);
      toast.error('Error al cargar datos de pines');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPins = async () => {
    if (!selectedPsychologist) {
      toast.error('Selecciona un psicólogo');
      return;
    }

    try {
      setLoading(true);
      
      await PinManagementService.assignPins(
        selectedPsychologist,
        isUnlimited ? 0 : pinAmount,
        isUnlimited,
        isUnlimited ? 'unlimited' : 'manual'
      );

      toast.success(`Pines ${isUnlimited ? 'ilimitados' : pinAmount} asignados correctamente`);
      setShowAssignModal(false);
      setSelectedPsychologist('');
      setPinAmount(1);
      setIsUnlimited(false);
      
      // Recargar datos
      await loadPinData();
    } catch (error) {
      console.error('Error al asignar pines:', error);
      toast.error('Error al asignar pines');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'asignacion':
        return <FaPlus className="w-4 h-4 text-green-600" />;
      case 'consumo':
        return <FaCoins className="w-4 h-4 text-orange-600" />;
      case 'pin_assigned':
        return <FaPlus className="w-4 h-4 text-green-600" />;
      case 'pin_consumed':
        return <FaCoins className="w-4 h-4 text-orange-600" />;
      case 'test_completed':
        return <FaClipboardCheck className="w-4 h-4 text-blue-600" />;
      case 'report_generated':
        return <FaEye className="w-4 h-4 text-purple-600" />;
      default:
        return <FaUsers className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'asignacion':
        return 'bg-green-100 text-green-800';
      case 'consumo':
        return 'bg-orange-100 text-orange-800';
      case 'pin_assigned':
        return 'bg-green-100 text-green-800';
      case 'pin_consumed':
        return 'bg-orange-100 text-orange-800';
      case 'test_completed':
        return 'bg-blue-100 text-blue-800';
      case 'report_generated':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'pocos_pines':
        return 'bg-yellow-100 text-yellow-800';
      case 'sin_pines':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'activo':
        return 'Activo';
      case 'pocos_pines':
        return 'Pines Bajos';
      case 'sin_pines':
        return 'Sin Pines';
      default:
        return 'Inactivo';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    } else {
      return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
    }
  };

  // Función para eliminar transacción individual
  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.')) {
      return;
    }

    const toastId = toast.loading('Eliminando transacción...');
    
    try {
      const result = await PinManagementService.deleteTransaction(transactionId);
      
      if (result.success) {
        toast.update(toastId, {
          render: 'Transacción eliminada exitosamente',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
        
        // Recargar datos completos para refrescar métricas
        await loadPinData();
        
        console.log('✅ Datos recargados después de eliminar transacción');
      } else {
        toast.update(toastId, {
          render: `Error al eliminar transacción: ${result.message}`,
          type: 'error',
          isLoading: false,
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
      toast.update(toastId, {
        render: 'Error inesperado al eliminar transacción',
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
    }
  };

  // Función para manejar selección individual
  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId);
      } else {
        return [...prev, transactionId];
      }
    });
  };

  // Función para seleccionar/deseleccionar todos
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(pinLogs.map(log => log.id));
    }
    setSelectAll(!selectAll);
  };

  // Función para eliminación masiva
  const handleBulkDelete = async () => {
    if (selectedTransactions.length === 0) {
      toast.error('No hay registros seleccionados');
      return;
    }

    if (!window.confirm(`¿Seguro que deseas eliminar ${selectedTransactions.length} registros seleccionados?`)) {
      return;
    }

    const toastId = toast.loading(`Eliminando ${selectedTransactions.length} transacciones...`);
    
    try {
      const result = await PinManagementService.deleteMultipleTransactions(selectedTransactions);
      
      if (result.success) {
        toast.update(toastId, {
          render: `${result.deletedCount} transacciones eliminadas exitosamente`,
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
        
        // Limpiar selección y recargar datos completos
        setSelectedTransactions([]);
        setSelectAll(false);
        
        await loadPinData();
        
        console.log(`✅ Datos recargados después de eliminar ${result.deletedCount} transacciones`);
        
        if (result.affectedPsychologists) {
          console.log(`📊 Psicólogos afectados: ${result.affectedPsychologists.join(', ')}`);
        }
      } else {
        toast.update(toastId, {
          render: `Error al eliminar transacciones: ${result.message}`,
          type: 'error',
          isLoading: false,
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error('Error al eliminar transacciones:', error);
      toast.update(toastId, {
        render: 'Error inesperado al eliminar transacciones',
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
    }
  };

  const exportPinReport = () => {
    try {
      const csvContent = [
        ['Psicólogo', 'Email', 'Total Pines', 'Pines Usados', 'Pines Restantes', 'Estado', 'Plan', 'Pacientes Asignados', 'Tests Completados'],
        ...pinStats.map(stat => [
          stat.psychologist_name || 'N/A',
          stat.psychologist_email || 'N/A',
          stat.is_unlimited ? 'Ilimitado' : stat.total_pins || 0,
          stat.used_pins || 0,
          stat.is_unlimited ? 'Ilimitado' : stat.remaining_pins || 0,
          getStatusText(stat.status),
          stat.plan_type || 'N/A',
          stat.assigned_patients || 0,
          stat.completed_tests || 0
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_pines_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Reporte de pines exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      toast.error('Error al exportar reporte');
    }
  };

  // Funciones para manejo de psicólogos
  const handleSelectPsychologist = (psychologistId) => {
    setSelectedPsychologists(prev => {
      if (prev.includes(psychologistId)) {
        return prev.filter(id => id !== psychologistId);
      } else {
        return [...prev, psychologistId];
      }
    });
  };

  const handleSelectAllPsychologists = () => {
    if (selectAllPsychologists) {
      setSelectedPsychologists([]);
    } else {
      setSelectedPsychologists(pinStats.map(stat => stat.psicologo_id));
    }
    setSelectAllPsychologists(!selectAllPsychologists);
  };

  const handleRemovePins = async () => {
    if (selectedPsychologists.length === 0) {
      toast.error('Selecciona al menos un psicólogo');
      return;
    }

    if (deleteMode === 'pins' && (!pinQuantityToDelete || pinQuantityToDelete <= 0)) {
      toast.error('Ingresa una cantidad válida de pines a eliminar');
      return;
    }

    const confirmMessage = deleteMode === 'complete'
      ? `¿Estás seguro de eliminar COMPLETAMENTE todas las asignaciones de pines de ${selectedPsychologists.length} psicólogo(s)? Esta acción no se puede deshacer.`
      : `¿Estás seguro de eliminar ${pinQuantityToDelete} pines de ${selectedPsychologists.length} psicólogo(s)?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    const toastId = toast.loading(
      deleteMode === 'complete'
        ? 'Eliminando asignaciones completas...'
        : `Eliminando ${pinQuantityToDelete} pines...`
    );

    try {
      let result;
      
      if (deleteMode === 'complete') {
        if (selectedPsychologists.length === 1) {
          result = await PinManagementService.removePsychologistPinAssignment(
            selectedPsychologists[0],
            'Eliminación completa desde panel de control'
          );
        } else {
          result = await PinManagementService.removeMultiplePsychologistAssignments(
            selectedPsychologists,
            'Eliminación masiva desde panel de control'
          );
        }
      } else {
        // Eliminar cantidad específica de pines
        const promises = selectedPsychologists.map(psychologistId =>
          PinManagementService.removePinsFromPsychologist(
            psychologistId,
            pinQuantityToDelete,
            `Eliminación de ${pinQuantityToDelete} pines desde panel de control`
          )
        );
        
        const results = await Promise.all(promises);
        const successCount = results.filter(r => r.success).length;
        
        result = {
          success: successCount > 0,
          deletedCount: successCount,
          totalRequested: selectedPsychologists.length
        };
      }

      if (result.success) {
        const successMessage = deleteMode === 'complete'
          ? `Asignaciones eliminadas exitosamente para ${result.deletedCount || selectedPsychologists.length} psicólogo(s)`
          : `${pinQuantityToDelete} pines eliminados exitosamente de ${result.deletedCount || selectedPsychologists.length} psicólogo(s)`;
        
        toast.update(toastId, {
          render: successMessage,
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
        
        // Limpiar selección y cerrar modal
        setSelectedPsychologists([]);
        setSelectAllPsychologists(false);
        setShowDeleteModal(false);
        setPinQuantityToDelete(1);
        
        // Recargar datos
        await loadPinData();
      } else {
        toast.update(toastId, {
          render: `Error: ${result.message || 'No se pudieron procesar las eliminaciones'}`,
          type: 'error',
          isLoading: false,
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error('Error al eliminar pines/psicólogos:', error);
      toast.update(toastId, {
        render: 'Error inesperado al procesar la eliminación',
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
    }
  };

  const handleDeletePsychologists = async () => {
    if (selectedPsychologists.length === 0) {
      toast.error('Selecciona al menos un psicólogo');
      return;
    }

    const confirmMessage = `¿Estás seguro de eliminar las asignaciones de pines de ${selectedPsychologists.length} psicólogo(s)? Esta acción eliminará todas sus transacciones de pines pero mantendrá sus datos de usuario. Esta acción no se puede deshacer.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    const toastId = toast.loading(`Eliminando asignaciones de pines de ${selectedPsychologists.length} psicólogo(s)...`);

    try {
      let result;
      
      if (selectedPsychologists.length === 1) {
          // Eliminar asignaciones de un solo psicólogo usando SimplePinService
          result = await simplePinService.removePsychologistPinAssignment(
            selectedPsychologists[0],
            'Eliminación desde panel de control'
          );
        } else {
          // Eliminar asignaciones de múltiples psicólogos usando SimplePinService
          result = await simplePinService.removeMultiplePsychologistAssignments(
            selectedPsychologists,
            'Eliminación múltiple desde panel de control'
          );
        }

      // Mostrar resultados
      if (result.success) {
        const successMessage = selectedPsychologists.length === 1
          ? `Asignaciones de pines eliminadas exitosamente para ${result.psychologist_name || 'el psicólogo'}`
          : `Asignaciones eliminadas: ${result.successCount} exitosos${result.errorCount > 0 ? `, ${result.errorCount} con errores` : ''}`;
        
        toast.update(toastId, {
          render: successMessage,
          type: result.errorCount > 0 ? 'warning' : 'success',
          isLoading: false,
          autoClose: 5000
        });
        
        // Mostrar errores detallados si los hay (para eliminación múltiple)
        if (result.errors && result.errors.length > 0) {
          console.error('Errores en eliminación de asignaciones:', result.errors);
          result.errors.forEach(errorInfo => {
            toast.error(`Error al eliminar asignaciones del psicólogo ${errorInfo.psychologist_id}: ${errorInfo.error}`, {
              autoClose: 8000
            });
          });
        }
      } else {
        toast.update(toastId, {
          render: `Error: ${result.message}`,
          type: 'error',
          isLoading: false,
          autoClose: 5000
        });
      }
      
      // Limpiar selección y cerrar modal
      setSelectedPsychologists([]);
      setSelectAllPsychologists(false);
      setShowDeletePsychologistModal(false);
      
      // Recargar datos
      await loadPinData();
      
    } catch (error) {
      console.error('Error al eliminar asignaciones de pines:', error);
      toast.update(toastId, {
        render: 'Error inesperado al eliminar asignaciones de pines',
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <FaCoins className="text-yellow-500" />
          Control de Pines
        </h2>
        <p className="text-gray-600 mt-2">Gestiona y monitorea el uso de pines por psicólogo</p>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <FaExclamationTriangle className="text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-yellow-800">Alertas de Pines</h3>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={alert.psychologist_id} className="text-yellow-700">
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controles principales */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <FaCalendarAlt className="text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FaPlus />
              <span>Asignar Pines</span>
            </button>
            <button
              onClick={exportPinReport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FaDownload />
              <span>Exportar Reporte</span>
            </button>
          </div>
        </div>

        {/* Estadísticas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Psicólogos</p>
                <p className="text-3xl font-bold text-gray-900">{summaryStats.totalPsychologists}</p>
              </div>
              <FaUsers className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2 text-gray-500 text-xs">
              {pinStats.filter(stat => stat.total_asignado > 0).length} con pines asignados
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pines Asignados</p>
                <p className="text-3xl font-bold text-gray-900">{summaryStats.totalPinsAssigned}</p>
              </div>
              <FaCoins className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 text-gray-500 text-xs">
              0 planes ilimitados
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pines Usados</p>
                <p className="text-3xl font-bold text-gray-900">{summaryStats.totalPinsUsed}</p>
              </div>
              <FaChartBar className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-2 text-gray-500 text-xs">
              {pinStats.reduce((acc, stat) => acc + (stat.tests_completados || 0), 0)} tests completados
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pines Restantes</p>
                <p className="text-3xl font-bold text-gray-900">{summaryStats.totalPinsRemaining}</p>
              </div>
              <FaClock className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2 text-gray-500 text-xs">
              {pinStats.reduce((acc, stat) => acc + (stat.pacientes_asignados || 0), 0)} pacientes asignados
            </div>
          </div>
        </div>

        {/* Tabla de psicólogos */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Estado de Pines por Psicólogo</h3>
            {selectedPsychologists.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setDeleteMode('pins');
                    setShowDeleteModal(true);
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  disabled={loading}
                >
                  <FaEdit />
                  <span>Eliminar Pines ({selectedPsychologists.length})</span>
                </button>
                <button
                  onClick={() => {
                    setDeleteMode('complete');
                    setShowDeleteModal(true);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  disabled={loading}
                >
                  <FaTrash />
                  <span>Eliminar Asignaciones ({selectedPsychologists.length})</span>
                </button>
                <button
                  onClick={() => setShowDeletePsychologistModal(true)}
                  className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  disabled={loading}
                >
                  <FaUserTimes />
                  <span>Eliminar Asignaciones ({selectedPsychologists.length})</span>
                </button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectAllPsychologists}
                      onChange={handleSelectAllPsychologists}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Psicólogo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pines Totales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pines Usados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pines Restantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pacientes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tests
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pinStats.map((stat, index) => (
                  <tr key={stat.psicologo_id || index} className={`hover:bg-gray-50 ${selectedPsychologists.includes(stat.psicologo_id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedPsychologists.includes(stat.psicologo_id)}
                        onChange={() => handleSelectPsychologist(stat.psicologo_id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {stat.nombre_psicologo || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {stat.email_psicologo || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        {stat.total_asignado || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{stat.total_consumido || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {stat.pines_restantes || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(stat.status)}`}>
                        {getStatusText(stat.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.pacientes_asignados || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.tests_completados || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historial de actividad de pines */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Historial de Actividad de Pines</h3>
            {selectedTransactions.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                disabled={loading}
              >
                <FaTrash />
                <span>Eliminar Seleccionados ({selectedTransactions.length})</span>
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Psicólogo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pinLogs.map((log, index) => (
                  <tr key={log.id || index} className={`hover:bg-gray-50 ${selectedTransactions.includes(log.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(log.id)}
                        onChange={() => handleSelectTransaction(log.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.psicologos ? `${log.psicologos.nombre} ${log.psicologos.apellido}` : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.psicologos?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.tipo)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.tipo)}`}>
                          {log.tipo === 'asignacion' ? 'Asignación' : 'Consumo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        -
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimeAgo(log.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.motivo || 'Sin descripción'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteTransaction(log.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        title="Eliminar Transacción"
                        disabled={loading}
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de asignación de pines */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Asignar Pines</h3>
            
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
                  <option value="">Seleccionar psicólogo...</option>
                  {pinStats.map((stat, index) => (
                    <option key={stat.psicologo_id || index} value={stat.psicologo_id}>
                      {stat.nombre_psicologo} ({stat.email_psicologo})
                      {stat.total_asignado > 0 ? ` - ${stat.pines_restantes || 0} pines` : ' - Sin pines asignados'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isUnlimited}
                    onChange={(e) => setIsUnlimited(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Plan Ilimitado</span>
                </label>
              </div>

              {!isUnlimited && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad de Pines
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {pinAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setPinAmount(amount)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pinAmount === amount
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={pinAmount}
                    onChange={(e) => setPinAmount(parseInt(e.target.value) || 1)}
                    min="1"
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cantidad personalizada"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedPsychologist('');
                  setPinAmount(1);
                  setIsUnlimited(false);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignPins}
                disabled={!selectedPsychologist || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Asignando...' : 'Asignar Pines'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Eliminaciones */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <FaExclamationTriangle className="text-yellow-500 text-xl mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                {deleteMode === 'pins' ? 'Eliminar Pines' : 'Eliminar Asignaciones Completas'}
              </h3>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-3">
                {deleteMode === 'pins' 
                  ? `¿Estás seguro de que deseas eliminar pines de ${selectedPsychologists.length} psicólogo(s) seleccionado(s)?`
                  : `¿Estás seguro de que deseas eliminar TODAS las asignaciones de pines de ${selectedPsychologists.length} psicólogo(s) seleccionado(s)? Esta acción no se puede deshacer.`
                }
              </p>
              
              {deleteMode === 'pins' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad de pines a eliminar:
                  </label>
                  <input
                    type="number"
                    value={pinQuantityToDelete}
                    onChange={(e) => setPinQuantityToDelete(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cantidad de pines"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPinQuantityToDelete(1);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRemovePins}
                disabled={loading || (deleteMode === 'pins' && pinQuantityToDelete < 1)}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  deleteMode === 'pins' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Procesando...' : (deleteMode === 'pins' ? 'Eliminar Pines' : 'Eliminar Asignaciones')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Eliminación Completa de Psicólogos */}
      {showDeletePsychologistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <FaUserTimes className="text-red-500 text-xl mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Eliminar Asignaciones de Pines
              </h3>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-3">
                ¿Estás seguro de que deseas eliminar las asignaciones de pines de {selectedPsychologists.length} psicólogo(s)?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm font-medium mb-2">⚠️ ADVERTENCIA: Esta acción eliminará:</p>
                <ul className="text-red-700 text-sm list-disc list-inside space-y-1">
                  <li>Todas las asignaciones de pines</li>
                  <li>Todo el historial de transacciones de pines</li>
                  <li>Los pines restantes del psicólogo</li>
                </ul>
                <p className="text-red-800 text-sm font-bold mt-2">Los datos del psicólogo se mantendrán. Esta acción NO se puede deshacer.</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeletePsychologistModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePsychologists}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Eliminando...' : 'Eliminar Asignaciones'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Asignación de Pines */}
      <PinAssignmentModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={loadPinData}
      />
    </div>
  );
};

export default UsageControlPanel;
