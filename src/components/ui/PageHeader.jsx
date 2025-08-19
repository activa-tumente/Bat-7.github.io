import React from 'react';

/**
 * Componente de encabezado de página estandarizado para BAT-7
 * Aplica el estilo consistente con fondo azul oscuro #121940
 */
const PageHeader = ({
  title,
  subtitle,
  icon: IconComponent,
  className = "",
  showTransitions = true
}) => {
  return (
    <div className={`bg-gradient-to-r from-blue-900 to-blue-800 text-white ${className}`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            {IconComponent && (
              <div className="w-12 h-12 bg-[#f59e0b] rounded-full flex items-center justify-center mr-4 shadow-lg">
                <IconComponent className="text-white text-xl" />
              </div>
            )}
            <h1 className="text-3xl font-bold">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-blue-100 text-lg">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
