import { useState, useMemo, useCallback } from 'react';
import { useNoAuth as useAuth } from '../context/NoAuthContext';
import {
  FaChartLine,
  FaUsers,
  FaCoins,
  FaUserMd,
  FaCog,
  FaShieldAlt,
  FaFlask
} from 'react-icons/fa';

/**
 * Custom hook for managing configuration tabs
 * Encapsulates tab logic and permissions
 */
export const useConfigurationTabs = (initialTab = 'dashboard') => {
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Memoize admin check
  const isAdmin = useMemo(() => 
    userRole === 'administrador' || user?.tipo_usuario === 'administrador',
    [userRole, user?.tipo_usuario]
  );

  // Memoize tab configuration
  const tabsConfig = useMemo(() => [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: FaChartLine,
      adminOnly: true,
      description: 'Resumen general del sistema con métricas en tiempo real'
    },
    {
      id: 'users',
      name: 'Gestión de Usuarios',
      icon: FaUsers,
      adminOnly: true,
      description: 'Administra usuarios, roles y permisos del sistema'
    },
    {
      id: 'access',
      name: 'Control de Acceso',
      icon: FaShieldAlt,
      adminOnly: true,
      description: 'Gestiona permisos de acceso a páginas y funcionalidades'
    },
    {
      id: 'assignments',
      name: 'Asignación de Pacientes',
      icon: FaUserMd,
      adminOnly: true,
      description: 'Asigna pacientes a psicólogos con métricas detalladas'
    },
    {
      id: 'usage',
      name: 'Control de Pines',
      icon: FaCoins,
      adminOnly: true,
      description: 'Gestiona y monitorea el uso de pines por psicólogo con estadísticas avanzadas'
    },
    {
      id: 'test-pins',
      name: 'Pruebas de Pines',
      icon: FaFlask,
      adminOnly: true,
      description: 'Ejecuta pruebas del sistema de control de pines'
    },
    {
      id: 'settings',
      name: 'Configuración Personal',
      icon: FaCog,
      adminOnly: false,
      description: 'Configuración personal y preferencias del usuario'
    }
  ], []);

  // Memoize available tabs based on permissions
  const availableTabs = useMemo(() => 
    tabsConfig.filter(tab => !tab.adminOnly || isAdmin),
    [tabsConfig, isAdmin]
  );

  // Memoized tab change handler
  const handleTabChange = useCallback((tabId) => {
    const isTabAvailable = availableTabs.some(tab => tab.id === tabId);
    if (isTabAvailable) {
      setActiveTab(tabId);
    }
  }, [availableTabs]);

  // Validate current tab is still available
  const validatedActiveTab = useMemo(() => {
    const isCurrentTabAvailable = availableTabs.some(tab => tab.id === activeTab);
    return isCurrentTabAvailable ? activeTab : availableTabs[0]?.id || 'settings';
  }, [activeTab, availableTabs]);

  return {
    activeTab: validatedActiveTab,
    availableTabs,
    isAdmin,
    user,
    userRole,
    handleTabChange
  };
};