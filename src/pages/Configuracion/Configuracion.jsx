import React, { useState, useEffect, useMemo } from 'react';
import { useNoAuth as useAuth } from '../../context/NoAuthContext';
import {
  FaChartLine,
  FaUsers,
  FaShieldAlt,
  FaUserMd,
  FaChartBar,
  FaCog,
  FaFlask
} from 'react-icons/fa';
import PageHeader from '../../components/ui/PageHeader';

// Importaciones de los módulos de administración
import AdminDashboard from '../../components/admin/AdminDashboard';
import SimpleUserManagementPanel from '../../components/admin/SimpleUserManagementPanel';
import PageAccessPanel from '../../components/admin/PageAccessPanel';
import PatientAssignmentPanel from '../../components/admin/PatientAssignmentPanel';
import UsageControlPanel from '../../components/admin/UsageControlPanel';

// TestPinSystem component removed - using real data only
import SimpleUserSettings from '../../components/settings/SimpleUserSettings';

const Configuracion = () => {
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Verificar si el usuario es administrador
  const isAdmin = userRole === 'administrador' || user?.tipo_usuario === 'administrador';

  // Configuración de pestañas
  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: FaChartLine,
      component: AdminDashboard,
      adminOnly: true,
      description: 'Resumen general del sistema'
    },
    {
      id: 'users',
      name: 'Gestión de Usuarios',
      icon: FaUsers,
      component: SimpleUserManagementPanel,
      adminOnly: true,
      description: 'Administra usuarios del sistema'
    },
    {
      id: 'access',
      name: 'Control de Acceso',
      icon: FaShieldAlt,
      component: PageAccessPanel,
      adminOnly: true,
      description: 'Gestiona permisos de acceso a páginas'
    },
    {
      id: 'assignments',
      name: 'Asignación de Pacientes',
      icon: FaUserMd,
      component: PatientAssignmentPanel,
      adminOnly: true,
      description: 'Asigna pacientes a psicólogos'
    },
    {
      id: 'usage',
      name: 'Control de Pines',
      icon: FaChartBar,
      component: UsageControlPanel,
      adminOnly: true,
      description: 'Gestiona y monitorea el uso de pines por psicólogo'
    },
    // TestPinSystem component removed - using real data only
    {
      id: 'settings',
      name: 'Configuración Personal',
      icon: FaCog,
      component: SimpleUserSettings,
      adminOnly: false,
      description: 'Configuración personal y preferencias'
    }
  ];

  // Filtrar pestañas según permisos usando useMemo para optimización
  const availableTabs = useMemo(() => {
    return tabs.filter(tab => !tab.adminOnly || isAdmin);
  }, [isAdmin]);

  // Establecer la pestaña activa predeterminada al primer tab disponible si el actual no lo está
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  // Renderizar el componente activo
  const renderActiveComponent = () => {
    const activeTabConfig = availableTabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return null;

    const Component = activeTabConfig.component;
    return <Component />;
  };

  // Si no es administrador y no hay pestañas disponibles, mostrar mensaje
  if (!isAdmin && availableTabs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="text-yellow-800">
            <h3 className="text-lg font-medium">Acceso Restringido</h3>
            <p className="mt-2">No tienes permisos para acceder a esta sección.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section with Standardized Style */}
      <PageHeader
        title="Configuración del Sistema"
        subtitle="Gestiona usuarios, configuraciones y estadísticas del sistema"
        icon={FaCog}
      />

      <div className="container mx-auto px-4 py-8">

        {/* Pestañas */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {availableTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                      ${isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Descripción de la pestaña activa */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              {availableTabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>

          {/* Contenido de la pestaña */}
          <div className="p-6">
            {renderActiveComponent()}
          </div>
        </div>

        {/* Footer informativo */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Sistema de Administración BAT-7 • 
            Usuario: {user?.nombre} {user?.apellido} • 
            Rol: {userRole || user?.tipo_usuario}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;
