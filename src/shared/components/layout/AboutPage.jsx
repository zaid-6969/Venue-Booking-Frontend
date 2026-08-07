/**
 * AboutPage Component
 *
 * Platform mission statement, stats, and company story
 */

import { Building2, ShieldCheck, HeartHandshake, Award, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-20)' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto var(--space-16)' }}>
        <span className="badge badge-primary" style={{ marginBottom: 'var(--space-3)' }}>About VenueHub</span>
        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
          Transforming Event Space Discovery Across India
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', marginTop: 'var(--space-4)' }}>
          VenueHub is India's leading marketplace for banquet halls, wedding lawns, resorts, and corporate convention spaces. We connect event organizers directly with verified property hosts.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-16)' }}>
        {[
          { label: 'Verified Venues', val: '2,500+' },
          { label: 'Events Hosted', val: '50,000+' },
          { label: 'Cities Covered', val: '100+' },
          { label: 'Customer Rating', val: '4.8 / 5.0' },
        ].map((st, i) => (
          <div key={i} className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', background: 'var(--surface-1)' }}>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--brand-default)', fontFamily: 'var(--font-display)' }}>
              {st.val}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 600, marginTop: 4 }}>
              {st.label}
            </div>
          </div>
        ))}
      </div>

      {/* Mission & Value Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-8)', marginBottom: 'var(--space-16)' }}>
        <div className="card" style={{ padding: 'var(--space-8)', background: 'var(--surface-1)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-xl)', background: 'var(--brand-subtle)', color: 'var(--brand-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>100% Verified Properties</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Every venue listed on VenueHub undergoes rigorous physical audit and verification checks to ensure image accuracy and pricing transparency.
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-8)', background: 'var(--surface-1)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-xl)', background: 'var(--brand-subtle)', color: 'var(--brand-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            <HeartHandshake size={24} />
          </div>
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Transparent Pricing</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            No hidden charges or surprise surge fees. Get upfront package breakdowns, per-plate pricing, and clear cancellation policies.
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-8)', background: 'var(--surface-1)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-xl)', background: 'var(--brand-subtle)', color: 'var(--brand-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            <Award size={24} />
          </div>
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Instant Reservation</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Reserve event dates in real-time with flexible deposit options, instant booking confirmation, and digital payment security.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center', background: 'var(--brand-default)', color: '#fff', borderRadius: 'var(--radius-3xl)' }}>
        <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Ready to Host Your Dream Event?</h2>
        <p style={{ opacity: 0.9, marginTop: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          Browse thousands of extraordinary banquet halls and wedding spaces today.
        </p>
        <Link to="/venues" className="btn btn-secondary btn-lg" style={{ background: '#fff', color: 'var(--brand-default)', fontWeight: 800 }}>
          Explore Venues Catalog
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
