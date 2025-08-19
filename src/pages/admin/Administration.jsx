import React, { useState, useEffect } from 'react';
import { FaBuilding, FaUserMd, FaUsers, FaSpinner, FaDatabase, FaCog } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';

// Importamos los componentes de pestañas
import InstitutionsTab from './tabs/InstitutionsTab';
import PsychologistsTab from './tabs/PsychologistsTab';
import PatientsTab from './tabs/PatientsTab';

// Importamos el componente de prueba de Supabase
import SupabaseTest from '../../components/SupabaseTest';
import ConversionManager from '../../components/admin/ConversionManager';

// Importamos el servicio de Supabase si es necesario
// import supabaseService from '../../services/supabaseService';

/**
 * Componente principal para el panel de administración
 * Gestiona la navegación entre pestañas
 */
const Administration = () => {
  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState('institutions');
  // Estado para controlar la carga inicial
  const [loading, setLoading] = useState(true);
  // Estado para controlar la conexión a Supabase
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // Obtener parámetros de la URL
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    // Si hay un parámetro tab en la URL, activar esa pestaña
    if (tabParam && ['institutions', 'psychologists', 'patients', 'supabase', 'conversion'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    // Inicializar el contenedor modal al montar el componente
    const initModalContainer = () => {
      // Verificar si ya existe el contenedor modal
      let modalRoot = document.getElementById('modal-root');

      // Si no existe, crearlo
      if (!modalRoot) {
        modalRoot = document.createElement('div');
        modalRoot.id = 'modal-root';
        document.body.appendChild(modalRoot);

        // Estilos básicos para el contenedor modal
        modalRoot.style.position = 'relative';
        modalRoot.style.zIndex = '9999';
      }
    };

    // Ejecutar la función al montar el componente
    initModalContainer();

    // Simular carga de datos
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    // Limpiar el contenedor modal al desmontar
    return () => {
      const modalRoot = document.getElementById('modal-root');
      if (modalRoot && modalRoot.childElementCount === 0) {
        document.body.removeChild(modalRoot);
      }
    };
  }, [tabParam]);

  // Cambiar a la pestaña seleccionada
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Renderizar la pestaña activa
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'institutions':
        return <InstitutionsTab />;
      case 'psychologists':
        return <PsychologistsTab />;
      case 'patients':
        return <PatientsTab />;
      case 'supabase':
        return <SupabaseTest onConnectionChange={setSupabaseConnected} />;
      case 'conversion':
        return <ConversionManager />;
      default:
        return <InstitutionsTab />;
    }
  };

  // Si está cargando, mostrar un spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Cargando Panel de Administración...</h2>
        <p className="text-gray-500 mt-2">Verificando permisos y cargando datos</p>
      </div>
    );
  }



  // Renderizado principal del componente de administración
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header Section with Standardized Style */}
      <PageHeader
        title="Panel de Administración"
        subtitle="Gestión centralizada de recursos de la plataforma"
        icon={FaCog}
      />

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Navegación de pestañas */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                className={`px-4 py-4 text-center text-sm font-medium ${
                  activeTab === 'institutions'
                    ? 'border-b-2 border-blue-500 text-amber-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } focus:outline-none transition-colors w-1/5`}
                onClick={() => handleTabChange('institutions')}
              >
                <div className="flex items-center justify-center">
                  <FaBuilding className="mr-2" />
                  <span>Instituciones</span>
                </div>
              </button>

              <button
                className={`px-4 py-4 text-center text-sm font-medium ${
                  activeTab === 'psychologists'
                    ? 'border-b-2 border-blue-500 text-amber-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } focus:outline-none transition-colors w-1/5`}
                onClick={() => handleTabChange('psychologists')}
              >
                <div className="flex items-center justify-center">
                  <FaUserMd className="mr-2" />
                  <span>Psicólogos</span>
                </div>
              </button>

              <button
                className={`px-4 py-4 text-center text-sm font-medium ${
                  activeTab === 'patients'
                    ? 'border-b-2 border-blue-500 text-amber-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } focus:outline-none transition-colors w-1/5`}
                onClick={() => handleTabChange('patients')}
              >
                <div className="flex items-center justify-center">
                  <FaUsers className="mr-2" />
                  <span>Pacientes</span>
                </div>
              </button>

              <button
                className={`px-4 py-4 text-center text-sm font-medium ${
                  activeTab === 'conversion'
                    ? 'border-b-2 border-blue-500 text-green-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } focus:outline-none transition-colors w-1/5`}
                onClick={() => handleTabChange('conversion')}
              >
                <div className="flex items-center justify-center">
                  <i className="fas fa-exchange-alt mr-2"></i>
                  <span>Conversión PD→PC</span>
                </div>
              </button>

              <button
                className={`px-4 py-4 text-center text-sm font-medium ${
                  activeTab === 'supabase'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } focus:outline-none transition-colors w-1/5`}
                onClick={() => handleTabChange('supabase')}
              >
                <div className="flex items-center justify-center">
                  <FaDatabase className="mr-2" />
                  <span>Supabase</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Contenido de la pestaña activa */}
          <div className="p-6">
            {renderActiveTab()}
          </div>
        </div>
      </main>

      {/* Pie de página */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Sistema de Gestión Psicológica - Panel de Administración
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Administration;
