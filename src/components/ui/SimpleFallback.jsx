import React from 'react';

/**
 * Componente de fallback ultra simple para debugging
 */
const SimpleFallback = ({ message = "Cargando..." }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: '500',
          color: '#111827',
          margin: '0 0 0.5rem'
        }}>
          {message}
        </h2>
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          margin: '0'
        }}>
          Por favor espera un momento...
        </p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SimpleFallback;
