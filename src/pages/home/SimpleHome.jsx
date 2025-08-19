import React from 'react';
import { Link } from 'react-router-dom';
import { useNoAuth } from '../../context/NoAuthContext';

/**
 * Página de inicio simplificada para debugging
 */
const SimpleHome = () => {
  const { user, userRole } = useNoAuth();

  console.log('SimpleHome: Renderizando con usuario:', user);

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#1f2937',
          margin: '0 0 0.5rem 0'
        }}>
          ¡Bienvenido al Sistema BAT-7!
        </h1>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '1.125rem',
          margin: '0'
        }}>
          Sistema de Evaluación de Aptitudes
        </p>
      </div>

      {/* Información del usuario */}
      <div style={{ 
        backgroundColor: '#dbeafe', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginBottom: '2rem',
        border: '1px solid #93c5fd'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          color: '#1e40af',
          margin: '0 0 1rem 0'
        }}>
          Información del Usuario
        </h2>
        <div style={{ color: '#1e40af' }}>
          <p><strong>Nombre:</strong> {user?.nombre} {user?.apellido}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Rol:</strong> {userRole}</p>
          <p><strong>ID:</strong> {user?.id}</p>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#1f2937',
          margin: '0 0 1.5rem 0'
        }}>
          Acciones Rápidas
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem'
        }}>
          {/* Evaluaciones */}
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#374151',
              margin: '0 0 1rem 0'
            }}>
              Evaluaciones
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link 
                to="/test/verbal" 
                style={{ 
                  color: '#3b82f6', 
                  textDecoration: 'none',
                  padding: '0.5rem',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  display: 'block'
                }}
              >
                Evaluación Verbal
              </Link>
              <Link 
                to="/test/numerico" 
                style={{ 
                  color: '#3b82f6', 
                  textDecoration: 'none',
                  padding: '0.5rem',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  display: 'block'
                }}
              >
                Evaluación Numérica
              </Link>
            </div>
          </div>

          {/* Administración */}
          {(userRole === 'administrador' || userRole === 'psicologo') && (
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: '#fef3c7', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#92400e',
                margin: '0 0 1rem 0'
              }}>
                Administración
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link 
                  to="/dashboard" 
                  style={{ 
                    color: '#d97706', 
                    textDecoration: 'none',
                    padding: '0.5rem',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    display: 'block'
                  }}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/admin/administration" 
                  style={{ 
                    color: '#d97706', 
                    textDecoration: 'none',
                    padding: '0.5rem',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    display: 'block'
                  }}
                >
                  Administración
                </Link>
              </div>
            </div>
          )}

          {/* Navegación */}
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: '#ecfdf5', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#065f46',
              margin: '0 0 1rem 0'
            }}>
              Navegación
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link 
                to="/" 
                style={{ 
                  color: '#059669', 
                  textDecoration: 'none',
                  padding: '0.5rem',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  display: 'block'
                }}
              >
                Página Principal
              </Link>
              <a 
                href="/simple" 
                style={{ 
                  color: '#059669', 
                  textDecoration: 'none',
                  padding: '0.5rem',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  display: 'block'
                }}
              >
                Diagnóstico Simple
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleHome;
