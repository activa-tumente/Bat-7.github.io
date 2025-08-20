import React from 'react';
import PropTypes from 'prop-types';

/**
 * System footer component with user and session information
 * Provides consistent footer across admin pages
 */
const SystemFooter = React.memo(({ user, userRole, activeTabName }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
    <div className="text-center text-sm text-gray-500">
      <div className="flex items-center justify-center space-x-4 flex-wrap">
        <span>Sistema de Administración BAT-7</span>
        <span className="hidden sm:inline">•</span>
        <span>Usuario: {user?.nombre} {user?.apellido}</span>
        <span className="hidden sm:inline">•</span>
        <span>Rol: {userRole || user?.tipo_usuario}</span>
        {activeTabName && (
          <>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Pestaña activa: {activeTabName}</span>
          </>
        )}
      </div>
    </div>
  </div>
));

SystemFooter.displayName = 'SystemFooter';

SystemFooter.propTypes = {
  user: PropTypes.shape({
    nombre: PropTypes.string,
    apellido: PropTypes.string,
    tipo_usuario: PropTypes.string
  }),
  userRole: PropTypes.string,
  activeTabName: PropTypes.string
};

export default SystemFooter;