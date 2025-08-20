import React from 'react';

/**
 * Componente simplificado para evitar parpadeo
 */
const PageTransition = ({ children }) => {
  return (
    <div className="page-content opacity-100 transition-opacity duration-200 ease-in-out">
      {children}
    </div>
  );
};

export default PageTransition;
