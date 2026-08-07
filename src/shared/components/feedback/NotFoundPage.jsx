/**
 * NotFoundPage — 404 Page
 */
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-8)',
      background: 'var(--bg-base)',
      textAlign: 'center',
    }}>
      {/* 404 Number */}
      <div style={{
        fontSize: '8rem',
        fontWeight: 800,
        lineHeight: 1,
        fontFamily: 'var(--font-display)',
        background: 'linear-gradient(135deg, var(--brand-default), var(--color-primary-300))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: 'var(--space-4)',
      }}>
        404
      </div>

      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>
        Page Not Found
      </h1>

      <p style={{
        color: 'var(--text-secondary)',
        maxWidth: '480px',
        marginBottom: 'var(--space-8)',
        fontSize: 'var(--text-lg)',
      }}>
        The venue you're looking for seems to have moved. Let's get you back on track.
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => window.history.back()}
          className="btn btn-secondary"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
        <Link to="/" className="btn btn-primary">
          <Home size={16} />
          Browse Venues
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
