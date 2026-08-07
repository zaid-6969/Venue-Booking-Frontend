/**
 * PrivacyPage Component
 *
 * Privacy Policy Document
 */

const PrivacyPage = () => {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-20)', maxWidth: 840 }}>
      <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-8)' }}>Last updated: August 2026</p>

      <div className="card" style={{ padding: 'var(--space-8)', background: 'var(--surface-1)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
        <section>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>1. Information We Collect</h3>
          <p>We collect personal information that you provide when registering an account, booking a venue, or contacting support. This includes name, email, phone number, and transaction details.</p>
        </section>

        <section>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>2. How We Use Your Data</h3>
          <p>Your data is used strictly for processing venue reservations, customer support, identity verification, and sending order confirmation updates.</p>
        </section>

        <section>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>3. Security & Protection</h3>
          <p>We implement 256-bit SSL encryption and strict database access controls to safeguard your financial and personal information against unauthorized access.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
