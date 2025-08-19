import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Componente de migas de pan (breadcrumbs) para mostrar la ruta de navegación actual
 */
const Breadcrumbs = () => {
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  
  // Mapeo de rutas a nombres legibles
  const routeNameMap = {
    admin: 'Administrador',
    professional: 'Profesional',
    student: 'Estudiante',
    dashboard: 'Dashboard',
    home: 'Home',
    patients: 'Pacientes',
    tests: 'Cuestionarios',
    reports: 'Reportes',
    results: 'Resultados',
    administration: 'Administración',
    settings: 'Configuración',
    help: 'Ayuda',
    profile: 'Perfil',
    users: 'Usuarios',
    institutions: 'Instituciones',
    students: 'Estudiantes'
  };
  
  // Generar los breadcrumbs basados en la ruta actual
  const breadcrumbs = useMemo(() => {
    // Ignorar rutas vacías
    const pathnames = location.pathname.split('/').filter(x => x);
    
    // Si no hay rutas, mostrar solo "Inicio"
    if (pathnames.length === 0) {
      return [{ name: 'Inicio', path: '/', active: true }];
    }
    
    // Construir los breadcrumbs
    return pathnames.map((name, index) => {
      // Construir la ruta acumulativa
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      // Determinar si es el último elemento (activo)
      const active = index === pathnames.length - 1;
      // Obtener el nombre legible de la ruta
      const displayName = routeNameMap[name] || name.charAt(0).toUpperCase() + name.slice(1);
      
      return { name: displayName, path, active };
    });
  }, [location.pathname]);
  
  // Si el usuario no está autenticado o no hay breadcrumbs, no mostrar nada
  if (!user || breadcrumbs.length === 0) {
    return null;
  }
  
  return (
    <nav className="bg-gray-100 py-2 px-4 rounded-md mb-4">
      <ol className="flex flex-wrap items-center text-sm">
        {/* Siempre mostrar el enlace a Inicio */}
        <li className="flex items-center">
          <Link to={`/${user.role}`} className="text-blue-600 hover:text-blue-800">
            Inicio
          </Link>
          {breadcrumbs.length > 0 && (
            <span className="mx-2 text-gray-500">
              <i className="fas fa-chevron-right text-xs"></i>
            </span>
          )}
        </li>
        
        {/* Mostrar los breadcrumbs */}
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.path} className="flex items-center">
            {breadcrumb.active ? (
              <span className="text-gray-700 font-medium">{breadcrumb.name}</span>
            ) : (
              <>
                <Link to={breadcrumb.path} className="text-blue-600 hover:text-blue-800">
                  {breadcrumb.name}
                </Link>
                <span className="mx-2 text-gray-500">
                  <i className="fas fa-chevron-right text-xs"></i>
                </span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
