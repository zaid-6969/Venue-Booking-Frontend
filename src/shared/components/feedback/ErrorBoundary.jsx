/**
 * ErrorBoundary Component
 *
 * Catches unhandled UI component errors and presents a beautiful recovery screen.
 */

import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
          <div className="card" style={{ maxWidth: 540, width: '100%', padding: 'var(--space-10)', textAlign: 'center', background: 'var(--surface-1)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-error-50)', color: 'var(--color-error-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
              <AlertTriangle size={32} />
            </div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              Something went wrong
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
              An unexpected display error occurred. You can refresh the page or return home.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
              <button onClick={() => window.location.reload()} className="btn btn-secondary" style={{ gap: 'var(--space-2)' }}>
                <RotateCcw size={16} /> Refresh Page
              </button>
              <Link to="/" className="btn btn-primary" style={{ gap: 'var(--space-2)' }}>
                <Home size={16} /> Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
