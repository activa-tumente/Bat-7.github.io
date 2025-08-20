import React from 'react';

const Loading = ({ fullScreen = false, message = 'Cargando...' }) => {
  const containerClass = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50' 
    : 'flex flex-col items-center justify-center py-8';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        {message && <p className="text-gray-600">{message}</p>}
      </div>
    </div>
  );
};

export default Loading;