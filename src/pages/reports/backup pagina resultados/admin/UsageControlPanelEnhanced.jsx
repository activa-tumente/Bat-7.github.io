/**
 * @file UsageControlPanelEnhanced.jsx
 * @description Panel mejorado de control de usos con asignación de paquetes a psicólogos
 */

/**
 * @file UsageControlPanelEnhanced.jsx
 * @description Enhanced usage control panel with psychologist package assignment
 * @author BAT-7 Development Team
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { useUsageControl } from '../../hooks/useUsageControl';
import UsageControlErrorBoundary from './UsageControlErrorBoundary';
import PackageCard from './PackageCard';
import { 
  USAGE_PACKAGES, 
  USAGE_ALERTS, 
  PIN_CONFIG, 
  USAGE_MESSAGES 
} from '../../constants/usageControlConstants';

/**
 * Enhanced Usage Control Panel Component
 * @description Manages psychologist usage assignments with package system
 */
const UsageControlPanelEnhanced = () => {
  // Use custom hook for data management
  const {
    usageData,
    psychologists,
    hasUsageColumns,
    estadisticas,
    loading,
    error,
    purchasePackage,
    verifyPIN,
    refreshData
  } = useUsageControl();

  // Local component state
  const [psicologoSeleccionado, setPsicologoSeleccionado] = useState(null);
  const [pinVerificado, setPinVerificado] = useState(false);
  const [pinActual, setPinActual] = useState('');
  const [mostrarAsignacion, setMostrarAsignacion] = useState(false);
  const [paqueteParaAsignar, setPaqueteParaAsignar] = useState(null);
  const [procesandoAsignacion, setProcesandoAsignacion] = useState(false);

  // Memoized calculations for performance
  const selectedPsychologistUsage = useMemo(() => {
    if (!psicologoSeleccionado) return null;
    return {
      usosRestantes: psicologoSeleccionado.usos_disponibles || 0,
      usosUtilizados: psicologoSeleccionado.usos_utilizados || 0,
      totalComprados: psicologoSeleccionado.total_comprados || 0
    };
  }, [psicologoSeleccionado]);

  const shouldShowLowUsageAlert = useMemo(() => {
    return selectedPsychologistUsage && 
           selectedPsychologistUsage.usosRestantes <= USAGE_ALERTS.LOW_USAGE_THRESHOLD && 
           selectedPsychologistUsage.usosRestantes > USAGE_ALERTS.CRITICAL_USAGE_THRESHOLD;
  }, [selectedPsychologistUsage]);

  const shouldShowCriticalUsageAlert = useMemo(() => {
    return selectedPsychologistUsage && 
           selectedPsychologistUsage.usosRestantes === USAGE_ALERTS.CRITICAL_USAGE_THRESHOLD;
  }, [selectedPsychologistUsage]);

  // Helper functions
  const formatearPrecio = (precio) => `${precio.toLocaleString('es-ES')}`;
  
  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar psicólogos de Supabase
      await cargarPsicologos();
      
      // Cargar estadísticas generales
      await cargarEstadisticas();

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarPsicologos = async () => {
    try {
      console.log('📋 [UsageControl] Cargando psicólogos...');
      
      // Primero intentar con todas las columnas
      let { data: psicologosData, error } = await supabase
        .from('psicologos')
        .select(`
          id,
          nombre,
          apellido,
          email,
          telefono,
          especialidad,
          usos_disponibles,
          usos_utilizados,
          total_comprados,
          fecha_ultimo_paquete,
          estado
        `)
        .order('nombre');

      // Si hay error por columnas faltantes, intentar con columnas básicas
      if (error && error.code === '42703') {
        console.log('⚠️ [UsageControl] Columnas de uso no existen, cargando datos básicos...');
        
        const { data: psicologosBasicos, error: errorBasico } = await supabase
          .from('psicologos')
          .select(`
            id,
            nombre,
            apellido,
            email,
            telefono
          `)
          .order('nombre');

        if (errorBasico) throw errorBasico;

        // Agregar valores por defecto para las columnas faltantes
        psicologosData = psicologosBasicos?.map(psicologo => ({
          ...psicologo,
          especialidad: 'Psicología General',
          usos_disponibles: 0,
          usos_utilizados: 0,
          total_comprados: 0,
          fecha_ultimo_paquete: null,
          estado: 'activo'
        })) || [];

        error = null;
      }

      if (error) throw error;

      console.log('✅ [UsageControl] Psicólogos cargados:', psicologosData?.length || 0);
      setPsicologos(psicologosData || []);

      // Si hay psicólogos, seleccionar el primero por defecto
      if (psicologosData && psicologosData.length > 0) {
        setPsicologoSeleccionado(psicologosData[0]);
        setUsageData({
          usosRestantes: psicologosData[0].usos_disponibles || 0,
          usosUtilizados: psicologosData[0].usos_utilizados || 0,
          totalComprados: psicologosData[0].total_comprados || 0,
          paqueteActual: null
        });
      }

    } catch (error) {
      console.error('❌ Error cargando psicólogos:', error);
      setPsicologos([]);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      // Obtener estadísticas de la base de datos
      const { data: pacientes } = await supabase.from('pacientes').select('id');
      const { data: informes } = await supabase.from('informes_generados').select('id').eq('estado', 'generado');
      const { data: resultadosHoy } = await supabase.from('resultados').select('id').gte('created_at', new Date().toISOString().split('T')[0]);

      setEstadisticas({
        usosHoy: resultadosHoy?.length || 0,
        usosSemana: 0,
        pacientesEvaluados: pacientes?.length || 0,
        informesGenerados: informes?.length || 0
      });

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const seleccionarPsicologo = (psicologo) => {
    setPsicologoSeleccionado(psicologo);
    setUsageData({
      usosRestantes: psicologo.usos_disponibles || 0,
      usosUtilizados: psicologo.usos_utilizados || 0,
      totalComprados: psicologo.total_comprados || 0,
      paqueteActual: null
    });
  };

  /**
   * Verifies the admin PIN for secure operations
   * @returns {boolean} True if PIN is correct
   */
  const verificarPIN = () => {
    const pinCorrecto = localStorage.getItem(PIN_CONFIG.STORAGE_KEY) || PIN_CONFIG.DEFAULT_PIN;
    const isValid = verifyPIN(pinActual);
    
    if (isValid) {
      setPinVerificado(true);
      setPinActual('');
      // TODO: Replace alert with toast notification
      alert('✅ PIN verificado correctamente');
    } else {
      // TODO: Replace alert with toast notification
      alert('❌ PIN incorrecto');
      setPinActual('');
    }
    
    return isValid;
  };

  const iniciarAsignacionPaquete = (paquete) => {
    if (!pinVerificado) {
      alert('⚠️ Debe verificar el PIN antes de asignar paquetes');
      return;
    }

    if (!psicologoSeleccionado) {
      alert('⚠️ Debe seleccionar un psicólogo antes de asignar paquetes');
      return;
    }

    setPaqueteParaAsignar(paquete);
    setMostrarAsignacion(true);
  };

  const confirmarAsignacionPaquete = async () => {
    if (!paqueteParaAsignar || !psicologoSeleccionado) return;

    try {
      setProcesandoAsignacion(true);
      console.log(`📦 [UsageControl] Asignando paquete de ${paqueteParaAsignar.cantidad} usos a ${psicologoSeleccionado.nombre} ${psicologoSeleccionado.apellido}`);

      // Calcular nuevos valores
      const nuevosUsosDisponibles = (psicologoSeleccionado.usos_disponibles || 0) + paqueteParaAsignar.cantidad;
      const nuevoTotalComprados = (psicologoSeleccionado.total_comprados || 0) + paqueteParaAsignar.cantidad;

      // Intentar actualizar en Supabase
      let error = null;
      
      try {
        const { error: updateError } = await supabase
          .from('psicologos')
          .update({
            usos_disponibles: nuevosUsosDisponibles,
            total_comprados: nuevoTotalComprados,
            fecha_ultimo_paquete: new Date().toISOString()
          })
          .eq('id', psicologoSeleccionado.id);
        
        error = updateError;
      } catch (updateError) {
        // Si las columnas no existen, simular la actualización localmente
        if (updateError.code === '42703') {
          console.log('⚠️ [UsageControl] Columnas no existen, simulando actualización local...');
          error = null; // No es un error real, solo columnas faltantes
        } else {
          error = updateError;
        }
      }

      if (error) throw error;

      // Actualizar estado local
      const psicologoActualizado = {
        ...psicologoSeleccionado,
        usos_disponibles: nuevosUsosDisponibles,
        total_comprados: nuevoTotalComprados,
        fecha_ultimo_paquete: new Date().toISOString()
      };

      setPsicologoSeleccionado(psicologoActualizado);
      setUsageData({
        usosRestantes: nuevosUsosDisponibles,
        usosUtilizados: psicologoSeleccionado.usos_utilizados || 0,
        totalComprados: nuevoTotalComprados,
        paqueteActual: paqueteParaAsignar
      });

      // Actualizar lista de psicólogos
      setPsicologos(prev => prev.map(p => 
        p.id === psicologoSeleccionado.id ? psicologoActualizado : p
      ));

      console.log('✅ [UsageControl] Paquete asignado exitosamente');
      alert(`✅ Paquete asignado exitosamente!\n\n👨‍⚕️ Psicólogo: ${psicologoSeleccionado.nombre} ${psicologoSeleccionado.apellido}\n📦 Paquete: ${paqueteParaAsignar.cantidad} usos\n💰 Precio: $${paqueteParaAsignar.precio.toLocaleString()}\n🎯 Usos disponibles: ${nuevosUsosDisponibles}`);

      setMostrarAsignacion(false);
      setPaqueteParaAsignar(null);

    } catch (error) {
      console.error('❌ Error asignando paquete:', error);
      alert('❌ Error asignando paquete: ' + error.message);
    } finally {
      setProcesandoAsignacion(false);
    }
  };

  const formatearPrecio = (precio) => `$${precio.toLocaleString('es-ES')}`;

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardBody className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-semibold">Cargando panel de control...</p>
        </CardBody>
      </Card>
    );
  }

  // Auto-select first psychologist when data loads
  useEffect(() => {
    if (psychologists.length > 0 && !psicologoSeleccionado) {
      setPsicologoSeleccionado(psychologists[0]);
    }
  }, [psychologists, psicologoSeleccionado]);

  if (loading) {
    return (
      <Card className="mb-6">
        <CardBody className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-semibold">Cargando panel de control...</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6 border-2 border-red-200 bg-red-50">
        <CardBody className="text-center py-8">
          <i className="fas fa-exclamation-triangle text-4xl text-red-600 mb-4"></i>
          <h3 className="text-lg font-bold text-red-800 mb-2">Error del Sistema</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button
            onClick={refreshData}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <i className="fas fa-redo mr-2"></i>
            Reintentar
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <UsageControlErrorBoundary>
      <div className="space-y-6">
      {/* Header del Panel */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                <i className="fas fa-chart-bar text-2xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold">Sistema de Control de Usos</h2>
                <p className="text-blue-100 text-sm">Asignación de paquetes de usos a psicólogos</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!pinVerificado ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="password"
                    value={pinActual}
                    onChange={(e) => setPinActual(e.target.value)}
                    placeholder="PIN (1234)"
                    className="px-3 py-2 rounded-lg text-gray-800 text-sm"
                    maxLength="6"
                  />
                  <Button
                    onClick={verificarPIN}
                    className="bg-green-500 hover:bg-green-600 text-white"
                    size="sm"
                  >
                    <i className="fas fa-unlock mr-2"></i>
                    Verificar
                  </Button>
                </div>
              ) : (
                <span className="text-green-200 text-sm flex items-center">
                  <i className="fas fa-check-circle mr-2"></i>
                  PIN Verificado
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Selector de Psicólogo */}
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-green-50 border-b">
          <h3 className="text-lg font-semibold text-green-800 flex items-center">
            <i className="fas fa-user-md mr-2"></i>
            Seleccionar Psicólogo
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {psicologos.map(psicologo => (
              <Card 
                key={psicologo.id}
                className={`cursor-pointer transition-all duration-200 border-2 ${
                  psicologoSeleccionado?.id === psicologo.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => seleccionarPsicologo(psicologo)}
              >
                <CardBody className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <i className="fas fa-user-md text-blue-600"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        {psicologo.nombre} {psicologo.apellido}
                      </h4>
                      <p className="text-sm text-gray-600">{psicologo.especialidad}</p>
                    </div>
                    {psicologoSeleccionado?.id === psicologo.id && (
                      <i className="fas fa-check-circle text-blue-500 text-xl"></i>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600">Usos disponibles</p>
                      <p className="font-bold text-blue-600">{psicologo.usos_disponibles || 0}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600">Usos utilizados</p>
                      <p className="font-bold text-green-600">{psicologo.usos_utilizados || 0}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Último paquete: {formatearFecha(psicologo.fecha_ultimo_paquete)}</p>
                    <p>Email: {psicologo.email}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
          
          {psicologos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-user-md text-4xl mb-4 opacity-50"></i>
              <p>No hay psicólogos registrados en el sistema</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Estadísticas del Psicólogo Seleccionado */}
      {psicologoSeleccionado && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-blue-500">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usos Restantes</p>
                  <p className="text-3xl font-bold text-blue-600">{usageData.usosRestantes}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <i className="fas fa-coins text-2xl text-blue-600"></i>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-600">
                  Total comprados: {usageData.totalComprados}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usos Utilizados</p>
                  <p className="text-3xl font-bold text-green-600">{usageData.usosUtilizados}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <i className="fas fa-clipboard-check text-2xl text-green-600"></i>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-600">
                  Psicólogo: {psicologoSeleccionado.nombre}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pacientes Evaluados</p>
                  <p className="text-3xl font-bold text-purple-600">{estadisticas.pacientesEvaluados}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <i className="fas fa-users text-2xl text-purple-600"></i>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Informes Generados</p>
                  <p className="text-3xl font-bold text-orange-600">{estadisticas.informesGenerados}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <i className="fas fa-file-medical text-2xl text-orange-600"></i>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Paquetes Disponibles */}
      {pinVerificado && psicologoSeleccionado && (
        <Card className="border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
            <h3 className="text-lg font-bold flex items-center">
              <i className="fas fa-shopping-cart mr-2"></i>
              Asignar Paquetes de Usos a {psicologoSeleccionado.nombre} {psicologoSeleccionado.apellido}
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {USAGE_PACKAGES.map(paquete => (
                <PackageCard
                  key={paquete.id}
                  paquete={paquete}
                  onPurchase={iniciarAsignacionPaquete}
                  disabled={!pinVerificado || !psicologoSeleccionado}
                  aria-label={`Asignar paquete de ${paquete.cantidad} usos a ${psicologoSeleccionado?.nombre || 'psicólogo seleccionado'}`}
                />
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Modal de Confirmación de Asignación */}
      {mostrarAsignacion && paqueteParaAsignar && psicologoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="bg-blue-600 text-white">
              <h3 className="text-lg font-bold">Confirmar Asignación de Paquete</h3>
            </CardHeader>
            <CardBody className="p-6">
              <div className="text-center mb-6">
                <div className={`w-20 h-20 ${paqueteParaAsignar.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <i className="fas fa-gift text-3xl text-white"></i>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  {paqueteParaAsignar.cantidad} Usos
                </h4>
                <p className="text-gray-600 mb-4">{paqueteParaAsignar.descripcion}</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatearPrecio(paqueteParaAsignar.precio)}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h5 className="font-semibold text-gray-800 mb-2">Asignar a:</h5>
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <i className="fas fa-user-md text-blue-600"></i>
                  </div>
                  <div>
                    <p className="font-semibold">{psicologoSeleccionado.nombre} {psicologoSeleccionado.apellido}</p>
                    <p className="text-sm text-gray-600">{psicologoSeleccionado.especialidad}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Usos actuales:</span>
                    <span>{psicologoSeleccionado.usos_disponibles || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usos a agregar:</span>
                    <span className="text-green-600">+{paqueteParaAsignar.cantidad}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total después:</span>
                    <span className="text-blue-600">{(psicologoSeleccionado.usos_disponibles || 0) + paqueteParaAsignar.cantidad}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={confirmarAsignacionPaquete}
                  disabled={procesandoAsignacion}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  {procesandoAsignacion ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Asignando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle mr-2"></i>
                      Confirmar Asignación
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setMostrarAsignacion(false)}
                  disabled={procesandoAsignacion}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancelar
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Usage Alerts */}
      {shouldShowLowUsageAlert && (
        <Card className="border-2 border-yellow-300 bg-yellow-50">
          <CardBody className="p-4">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-yellow-600 text-xl mr-3"></i>
              <div>
                <p className="font-semibold text-yellow-800">
                  {USAGE_MESSAGES.LOW_USAGE(psicologoSeleccionado.nombre, selectedPsychologistUsage.usosRestantes)}
                </p>
                <p className="text-yellow-700 text-sm">
                  Considere asignar un nuevo paquete.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {shouldShowCriticalUsageAlert && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardBody className="p-4">
            <div className="flex items-center">
              <i className="fas fa-lock text-red-600 text-xl mr-3"></i>
              <div>
                <p className="font-semibold text-red-800">
                  {USAGE_MESSAGES.NO_USAGE(psicologoSeleccionado.nombre)}
                </p>
                <p className="text-red-700 text-sm">
                  Debe asignar un paquete para que pueda continuar usando el sistema.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Mensaje sobre migración de base de datos */}
      {psicologos.length > 0 && psicologos[0].usos_disponibles === 0 && psicologos[0].total_comprados === 0 && (
        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardBody className="p-4">
            <div className="flex items-center">
              <i className="fas fa-database text-orange-600 text-xl mr-3"></i>
              <div>
                <p className="font-semibold text-orange-800">
                  🔧 Migración de Base de Datos Requerida
                </p>
                <p className="text-orange-700 text-sm mb-2">
                  Para usar completamente el sistema de control de usos, ejecuta la migración SQL:
                </p>
                <code className="bg-orange-100 px-2 py-1 rounded text-xs">
                  supabase/migrations/006_add_usage_columns_to_psicologos.sql
                </code>
                <p className="text-orange-700 text-xs mt-2">
                  Mientras tanto, el sistema funcionará con valores por defecto.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {!psicologoSeleccionado && psicologos.length > 0 && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardBody className="p-4">
            <div className="flex items-center">
              <i className="fas fa-info-circle text-blue-600 text-xl mr-3"></i>
              <div>
                <p className="font-semibold text-blue-800">
                  ℹ️ Selecciona un psicólogo
                </p>
                <p className="text-blue-700 text-sm">
                  Selecciona un psicólogo de la lista para ver sus estadísticas y asignar paquetes de usos.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
      </div>
    </UsageControlErrorBoundary>
  );
};

export default UsageControlPanelEnhanced;