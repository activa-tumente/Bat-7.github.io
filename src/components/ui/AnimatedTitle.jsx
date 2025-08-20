import React from 'react';

/**
 * Componente de título simple para BAT-7
 * Sin efectos de animación
 */
const AnimatedTitle = ({ className = "" }) => {
  return (
    <div className={`title-container ${className}`}>
      <div className="inline-flex items-center">
        {/* Título principal sin efectos */}
        <h1 className="simple-title text-2xl font-bold text-blue-900">
          <span>BAT-7 Batería de Aptitudes</span>
        </h1>
      </div>
      
      <style jsx="true">{`
        .title-container {
          display: inline-block;
        }
        
        .simple-title {
          font-weight: 800;
          letter-spacing: 1px;
          color: #1d387a;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .simple-title {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .simple-title {
            font-size: 1.25rem;
            text-align: center;
            line-height: 1.2;
          }
        }

        @media (max-width: 360px) {
          .simple-title {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedTitle;
