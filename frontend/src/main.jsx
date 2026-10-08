import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles.css';

class ApplicationErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="auth-shell app-error" role="alert">
          <div className="loading-card">
            <strong>CarLog Pro</strong>
            <h1>Impossible d’afficher cette page</h1>
            <p>{this.state.error.message || 'Une erreur inattendue est survenue.'}</p>
            <button className="btn-primary" type="button" onClick={() => window.location.reload()}>
              Recharger l’application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApplicationErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ApplicationErrorBoundary>
  </React.StrictMode>
);
