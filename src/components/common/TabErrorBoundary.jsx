import React from 'react';
import PropTypes from 'prop-types';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

/**
 * Specialized error boundary for tab components
 * Provides better UX for configuration tab errors
 */
class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Tab Error:', error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <div className="text-center">
            <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              {this.props.title || 'Error al cargar el módulo'}
            </h3>
            <p className="text-red-600 mb-6 max-w-md mx-auto">
              {this.props.message || 'Hubo un problema al cargar este componente. Por favor, inténtalo de nuevo.'}
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-red-100 p-4 rounded mb-4 max-w-2xl mx-auto">
                <summary className="cursor-pointer font-medium text-red-800">
                  Detalles del Error (Desarrollo)
                </summary>
                <pre className="text-sm mt-2 overflow-auto text-red-700">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            
            <div className="flex justify-center space-x-3">
              <button
                onClick={this.handleRetry}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FaRedo />
                <span>Reintentar</span>
              </button>
              
              {this.props.onGoBack && (
                <button
                  onClick={this.props.onGoBack}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Volver
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

TabErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func,
  onGoBack: PropTypes.func
};

export default TabErrorBoundary;