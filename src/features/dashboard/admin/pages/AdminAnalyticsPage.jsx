/**
 * AdminAnalyticsPage Component
 *
 * Platform financial performance & booking trends analytics view
 */

import { TrendingUp, DollarSign, Building2, Users } from 'lucide-react';

const AdminAnalyticsPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Marketplace Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Comprehensive financial performance and marketplace activity metrics
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-5)' }}>
        {[
          { label: 'Monthly GMV Revenue', val: '₹42.5 Lakhs', growth: '+18.4%' },
          { label: 'Booking Conversions', val: '64.2%', growth: '+5.1%' },
          { label: 'Avg Order Value', val: '₹2,35,000', growth: '+12.0%' },
          { label: 'Active Host Payouts', val: '₹34.8 Lakhs', growth: '+15.2%' },
        ].map((item, i) => (
          <div key={i} className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>{item.label}</div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginTop: 4, color: 'var(--brand-default)', fontFamily: 'var(--font-display)' }}>
              {item.val}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-500)', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={14} /> {item.growth} vs last month
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 'var(--space-8)', background: 'var(--surface-1)', borderRadius: 'var(--radius-3xl)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Category Revenue Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[
            { cat: 'Banquet Halls', pct: '45%', val: '₹66.6 L' },
            { cat: 'Marriage Lawns', pct: '30%', val: '₹44.4 L' },
            { cat: 'Farmhouses & Resorts', pct: '15%', val: '₹22.2 L' },
            { cat: 'Corporate Convention Suites', pct: '10%', val: '₹14.8 L' },
          ].map((row, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{row.cat}</span>
              <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 800 }}>
                <span style={{ color: 'var(--brand-default)' }}>{row.pct}</span>
                <span>{row.val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
