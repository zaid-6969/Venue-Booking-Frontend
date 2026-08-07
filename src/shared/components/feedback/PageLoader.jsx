/**
 * PageLoader — Full-page loading spinner
 * Used during code splitting, auth initialization, and data fetching
 */

const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div
      role="status"
      aria-label={message}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-4)',
        background: 'var(--bg-base)',
      }}
    >
      {/* Spinner */}
      <div style={{
        width: 40, height: 40,
        border: '3px solid var(--border-normal)',
        borderTopColor: 'var(--brand-default)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
        {message}
      </span>
    </div>
  );
};

export default PageLoader;

