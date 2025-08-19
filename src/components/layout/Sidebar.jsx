import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import { toast } from 'react-toastify';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Inicializar favoritos desde localStorage o usar valores predeterminados
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('sidebarFavorites');
    return savedFavorites ? JSON.parse(savedFavorites) : {
      dashboard: false,
      home: false,
      patients: false,
      tests: false,
      results: false,
      settings: false,
      help: false
    };
  });

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('sidebarFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle para favoritos
  const toggleFavorite = (key, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await AuthService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  // Verificar si una ruta está activa
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    return location.pathname === path ||
           (location.pathname.startsWith(path) &&
            (location.pathname.length === path.length ||
             location.pathname[path.length] === '/'));
  };

  // Elementos del menú
  const menuItems = [
    { name: 'Dashboard', path: '/admin/administration', icon: 'chart-line', key: 'dashboard' },
    { name: 'Inicio', path: '/home', icon: 'home', key: 'home' },
    { name: 'Pacientes', path: '/student/patients', icon: 'users', key: 'patients' },
    { name: 'Cuestionario', path: '/student/questionnaire', icon: 'clipboard-list', key: 'tests' },
    { name: 'Resultados', path: '/student/resultados', icon: 'chart-bar', key: 'results' },
    { name: 'Informes Guardados', path: '/student/informes-guardados', icon: 'archive', key: 'saved-reports' },
    { name: 'Admin - Resultados', path: '/admin/reports', icon: 'chart-line', key: 'admin-results' },
    { name: 'Admin - Informes', path: '/admin/informes-guardados', icon: 'folder-open', key: 'admin-saved-reports' },
    { name: 'Configuración', path: '/configuracion', icon: 'sliders-h', key: 'settings' },
    { name: 'Ayuda', path: '/help', icon: 'question-circle', key: 'help' }
  ];

  // Filtrar favoritos
  const favoriteItems = menuItems.filter(item => favorites[item.key]);

  return (
    <div className={`sidebar bg-[#121940] text-[#a4b1cd] fixed top-0 left-0 h-full z-50 transition-all duration-500 ease-in-out transform hover:shadow-2xl
                     ${isOpen ? 'w-64' : 'w-[70px]'}`}>
            <div className="sidebar-header p-5 flex justify-between items-center border-b border-opacity-10 border-white">
                {isOpen && (
          <h1 className="text-[2.7rem] font-bold text-white text-center flex-1 transition-all duration-300 transform hover:scale-105">
            Activatu<span className="text-[#ffda0a]">mente</span>
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className="text-[#a4b1cd] cursor-pointer hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white hover:bg-opacity-10"
        >
          <i className={`fas ${isOpen ? 'fa-chevron-left' : 'fa-chevron-right'} transition-transform duration-300`}></i>
        </button>
      </div>

      {/* Sección de favoritos */}
      {favoriteItems.length > 0 && (
        <div className="sidebar-section py-4 border-b border-opacity-10 border-white">
          {isOpen && (
            <h2 className="uppercase text-xs px-5 mb-3 tracking-wider font-semibold text-gray-400 flex items-center">
              <i className="fas fa-star text-[#ffda0a] mr-2"></i>
              Favoritos
            </h2>
          )}
          <ul className="menu-list">
            {favoriteItems.map((item) => (
              <li
                key={`fav-${item.key}`}
                                className={`p-3 px-5 hover:bg-opacity-10 hover:bg-white transition-all duration-300 ease-in-out transform hover:translate-x-1
                          ${isActive(item.path) ? 'bg-[#f59e0b] bg-opacity-20 text-white border-l-4 border-[#f59e0b] shadow-lg' : ''}`}
              >
                <div className={`flex items-center ${!isOpen ? 'justify-center' : 'justify-between'} w-full`}>
                  <Link
                    to={item.path}
                    className={`flex items-center ${!isOpen ? 'justify-center w-full' : 'flex-grow'}`}
                  >
                    <i className={`fas fa-${item.icon} ${!isOpen ? 'text-3xl' : 'mr-3 text-xl'} ${!isOpen ? 'w-full' : 'w-5'} text-center transition-all duration-300 ease-in-out ${isActive(item.path) ? 'text-[#f59e0b]' : 'text-[#f59e0b]'} hover:scale-110`}></i>
                    {isOpen && <span className="transition-all duration-300 ease-in-out">{item.name}</span>}
                  </Link>
                  {isOpen ? (
                    <span
                      className="text-[#ffda0a] cursor-pointer"
                      onClick={(e) => toggleFavorite(item.key, e)}
                      title="Quitar de favoritos"
                    >
                      <i className="fas fa-star"></i>
                    </span>
                  ) : (
                    <span className="text-[#ffda0a] text-xs absolute right-1 top-1">
                      <i className="fas fa-star"></i>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Menú principal */}
      <div className="sidebar-content py-4">
        {isOpen && favoriteItems.length > 0 && (
          <h2 className="uppercase text-xs px-5 mb-3 tracking-wider font-semibold text-gray-400 flex items-center">
            <i className="fas fa-list text-gray-400 mr-2"></i>
            Menú
          </h2>
        )}
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li
              key={item.name}
                            className={`p-3 px-5 hover:bg-opacity-10 hover:bg-white transition-all duration-300 ease-in-out transform hover:translate-x-1
                        ${isActive(item.path) ? 'bg-[#f59e0b] bg-opacity-20 text-white border-l-4 border-[#f59e0b] shadow-lg' : ''}`}
            >
              <div className={`flex items-center ${!isOpen ? 'justify-center' : 'justify-between'} w-full relative`}>
                <Link
                  to={item.path}
                  className={`flex items-center ${!isOpen ? 'justify-center w-full' : 'flex-grow'}`}
                >
                  <i className={`fas fa-${item.icon} ${!isOpen ? 'text-3xl' : 'mr-3 text-xl'} ${!isOpen ? 'w-full' : 'w-5'} text-center transition-all duration-300 ease-in-out ${isActive(item.path) ? 'text-[#f59e0b]' : 'text-[#f59e0b]'} hover:scale-110`}></i>
                  {isOpen && <span className="transition-all duration-300 ease-in-out">{item.name}</span>}
                </Link>
                {isOpen ? (
                  <span
                    className={`cursor-pointer hover:text-[#ffda0a] transition-colors duration-200 ${favorites[item.key] ? 'text-[#ffda0a]' : 'text-gray-500'}`}
                    onClick={(e) => toggleFavorite(item.key, e)}
                    title={favorites[item.key] ? "Quitar de favoritos" : "Añadir a favoritos"}
                  >
                    <i className={`${favorites[item.key] ? 'fas' : 'far'} fa-star`}></i>
                  </span>
                ) : (
                  favorites[item.key] && (
                    <span className="text-[#ffda0a] text-xs absolute right-1 top-1">
                      <i className="fas fa-star"></i>
                    </span>
                  )
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Botón de cerrar sesión */}
      <div className="mt-auto p-5 border-t border-opacity-10 border-white">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center p-3 text-red-400 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-10 transition-all duration-300 ease-in-out transform hover:scale-105 rounded-lg group
                     ${!isOpen ? 'px-2' : 'px-4'}`}
          title="Cerrar Sesión"
        >
          <i className={`fas fa-sign-out-alt ${!isOpen ? '' : 'mr-3'} transition-transform duration-200 group-hover:scale-110`}></i>
          {isOpen && <span className="font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;