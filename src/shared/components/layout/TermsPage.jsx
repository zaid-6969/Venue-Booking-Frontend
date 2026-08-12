/**
 * TermsPage Component
 *
 * Terms of Service Document
 */

const TermsPage = () => {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-20)', maxWidth: 840 }}>
      <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>
        Terms of Service
      </h1>
      <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-8)' }}>Last updated: August 2026</p>

      <div className="card" style={{ padding: 'var(--space-8)', background: 'var(--surface-1)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
        <section>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>1. Platform Agreement</h3>
          <p>By accessing EventFlow, you agree to comply with our platform terms, booking rules, and user conduct standards.</p>
        </section>

        <section>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>2. Booking & Payments</h3>
          <p>All bookings made through EventFlow are subject to venue host availability and confirmation. Payment amounts include applicable taxes and platform fees.</p>
        </section>

        <section>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>3. Host Responsibilities</h3>
          <p>Venue owners must maintain accurate property details, honor confirmed reservations, and comply with safety and local municipal guidelines.</p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
