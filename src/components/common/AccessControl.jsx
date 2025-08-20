import React from 'react';
import PropTypes from 'prop-types';
import { FaLock, FaExclamationTriangle } from 'react-icons/fa';

/**
 * Reusable access control component
 * Handles permission-based rendering with better UX
 */
const AccessControl = ({ 
  hasAccess, 
  children, 
  fallback,
  title = "Acceso Restringido",
  message = "No tienes permisos para acceder a esta sección.",
  showContactInfo = true 
}) => {
  if (hasAccess) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <FaLock className="text-yellow-600 text-4xl mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">{title}</h3>
        <p className="text-yellow-700 mb-4">{message}</p>
        
        {showContactInfo && (
          <div className="bg-yellow-100 rounded-md p-3 mt-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                Si crees que deberías tener acceso, contacta al administrador del sistema.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

AccessControl.propTypes = {
  hasAccess: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  title: PropTypes.string,
  message: PropTypes.string,
  showContactInfo: PropTypes.bool
};

export default AccessControl;