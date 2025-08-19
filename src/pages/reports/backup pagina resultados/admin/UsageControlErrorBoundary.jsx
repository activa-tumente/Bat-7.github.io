/**
 * @file UsageControlErrorBoundary.jsx
 * @description Error boundary for usage control components
 */

import React from 'react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';

class UsageControlErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UsageControl Error:', error, errorInfo);
    // In production, send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardBody className="p-8 text-center">
            <div className="mb-4">
              <i className="fas fa-exclamation-triangle text-4xl text-red-600 mb-4"></i>
              <h2 className="text-xl font-bold text-red-800 mb-2">
                Error en el Sistema de Control de Usos
              </h2>
              <p className="text-red-700 mb-4">
                Ha ocurrido un error inesperado. Por favor, recarga la página o contacta al administrador.
              </p>
            </div>
            
            <div className="space-x-4">
              <Button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <i className="fas fa-redo mr-2"></i>
                Recargar Página
              </Button>
              
              <Button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Intentar Nuevamente
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-red-600 font-medium">
                  Detalles del Error (Desarrollo)
                </summary>
                <pre className="mt-2 p-4 bg-red-100 rounded text-xs overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </CardBody>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default UsageControlErrorBoundary;