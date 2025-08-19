import React from 'react';

/**
 * Aplicación de prueba mínima para verificar que React funciona
 */
function TestApp() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ color: '#1f2937', marginBottom: '1rem' }}>
          🎉 React Funciona!
        </h1>
        
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Si puedes ver este mensaje, React está funcionando correctamente.
        </p>
        
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '6px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ color: '#0369a1', margin: '0 0 0.5rem 0' }}>
            Información del Sistema
          </h3>
          <div style={{ fontSize: '0.875rem', color: '#0369a1', textAlign: 'left' }}>
            <div><strong>URL:</strong> {window.location.href}</div>
            <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
            <div><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Recargar
          </button>
          
          <button
            onClick={() => {
              console.log('Test App funcionando correctamente');
              alert('¡React está funcionando! Revisa la consola para más detalles.');
            }}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Test Console
          </button>
        </div>
        
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '6px',
          fontSize: '0.875rem',
          color: '#92400e'
        }}>
          <strong>Próximo paso:</strong> Si ves este mensaje, el problema no es React.
          Verifica la configuración de rutas y autenticación.
        </div>
      </div>
    </div>
  );
}

export default TestApp;
