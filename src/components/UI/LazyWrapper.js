import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

const LazyWrapper = ({ 
  children, 
  fallback = <LoadingSpinner text="Cargando componente..." />,
  errorBoundary = true 
}) => {
  if (errorBoundary) {
    return (
      <ErrorBoundary>
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Simple Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('LazyWrapper Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
            <h3 className="text-lg font-semibold mb-2">Error al cargar el componente</h3>
            <p className="text-sm text-blueGray-600">
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-lightBlue-500 text-white px-4 py-2 rounded text-sm hover:bg-lightBlue-600 transition-colors"
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LazyWrapper;