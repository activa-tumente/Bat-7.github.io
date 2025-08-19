import React, { useState, useEffect } from 'react';
import { FaChartBar, FaUsers, FaUserMd, FaBuilding, FaCoins, FaInfinity, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { supabase } from '../api/supabaseClient';
import enhancedSupabaseService from '../services/enhancedSupabaseService';
import PinStatusIndicator from '../components/common/PinStatusIndicator';
import { useAuth } from '../context/AuthContext';

/**
 * Página principal del Dashboard
 * Muestra estadísticas generales y accesos rápidos con integración del sistema de pines
 */
const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalPsychologists: 0,
    totalInstitutions: 0,
    totalPins: 0,
    usedPins: 0,
    activePsychologists: 0,
    psychologistsWithLowPins: 0,
  });
  const [pinStats, setPinStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Cargar estadísticas básicas
        const [patientsResult, psychologistsResult, institutionsResult, pinStatsResult] = await Promise.all([
          enhancedSupabaseService.getPatients(),
          enhancedSupabaseService.getPsychologists(),
          enhancedSupabaseService.getInstitutions(),
          // Cargar estadísticas del sistema de pines
          isAdmin ? 
            supabase.rpc('get_all_psychologists_with_stats') : 
            supabase.rpc('get_psychologist_pin_stats_optimized')
        ]);

        const totalPatients = Array.isArray(patientsResult.data) ? patientsResult.data.length : 0;
        const totalPsychologists = Array.isArray(psychologistsResult.data) ? psychologistsResult.data.length : 0;
        const totalInstitutions = Array.isArray(institutionsResult.data) ? institutionsResult.data.length : 0;

        let totalPins = 0;
        let usedPins = 0;
        let activePsychologists = 0;
        let psychologistsWithLowPins = 0;

        if (isAdmin && pinStatsResult.data) {
          // Estadísticas globales para administradores
          totalPins = pinStatsResult.data.reduce((sum, psych) => sum + (psych.total_uses || 0), 0);
          usedPins = pinStatsResult.data.reduce((sum, psych) => sum + (psych.used_uses || 0), 0);
          activePsychologists = pinStatsResult.data.filter(psych => psych.total_uses > 0).length;
          psychologistsWithLowPins = pinStatsResult.data.filter(psych => {
            const remaining = psych.total_uses - psych.used_uses;
            return remaining <= 5 && remaining > 0;
          }).length;
        } else if (pinStatsResult.data) {
          // Estadísticas individuales para psicólogos
          const myStats = pinStatsResult.data.find(item => item.psychologist_id === user?.id);
          if (myStats) {
            totalPins = myStats.total_uses || 0;
            usedPins = myStats.used_uses || 0;
            setPinStats(myStats);
          }
        }

        setStats({
          totalPatients,
          totalPsychologists,
          totalInstitutions,
          totalPins,
          usedPins,
          activePsychologists,
          psychologistsWithLowPins,
        });
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin, user?.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Bienvenido {user?.full_name || 'al sistema'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <FaSpinner className="animate-spin text-blue-600 text-3xl" />
          </div>
        ) : (
          <>
            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <FaUsers className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pacientes</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.totalPatients}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <FaUserMd className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Psicólogos</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.totalPsychologists}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <FaBuilding className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Instituciones</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.totalInstitutions}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <FaChartBar className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Evaluaciones</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.totalPins}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas del Sistema de Pines */}
            {isAdmin ? (
              <div className="mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Estado de Pines</h2>
                  <PinStatusIndicator psychologistId={user?.id} />
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Estado de Pines</h2>
                <PinStatusIndicator psychologistId={user?.id} />
              </div>
            )}

            {/* Enlaces rápidos */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <a
                  href="/patients"
                  className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
                  <span className="mt-2 block text-sm font-medium text-gray-900">Ver Pacientes</span>
                </a>
                <a
                  href="/evaluations"
                  className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaChartBar className="mx-auto h-12 w-12 text-gray-400" />
                  <span className="mt-2 block text-sm font-medium text-gray-900">Ver Evaluaciones</span>
                </a>
                <a
                  href="/reports"
                  className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaUserMd className="mx-auto h-12 w-12 text-gray-400" />
                  <span className="mt-2 block text-sm font-medium text-gray-900">Ver Reportes</span>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
