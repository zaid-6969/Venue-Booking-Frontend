/**
 * AdminBookingsPage Component
 *
 * Master list of all marketplace venue bookings for System Administrators
 */

import { useState } from 'react';
import { Calendar, DollarSign, Filter, Search } from 'lucide-react';

const DEMO_BOOKINGS = [
  { _id: 'b-1', reference: 'VH-2026-X89B', venue: 'The Grand Majestic Banquet', customer: 'Ananya Sharma', date: '2026-08-15', amount: 330400, status: 'confirmed' },
  { _id: 'b-2', reference: 'VH-2026-A42C', venue: 'Royal Heritage Palace', customer: 'Vikram Malhotra', date: '2026-09-01', amount: 413000, status: 'confirmed' },
  { _id: 'b-3', reference: 'VH-2026-F91K', venue: 'Green Valley Farmhouse', customer: 'Rohan Deshmukh', date: '2026-08-20', amount: 236000, status: 'pending' },
];

const AdminBookingsPage = () => {
  const [filter, setFilter] = useState('all');

  const filtered = DEMO_BOOKINGS.filter(b => filter === 'all' || b.status === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Master Booking Registry</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Monitor and review all customer venue reservations across India
          </p>
        </div>

        <div style={{ display: 'flex', gap: 4, background: 'var(--surface-1)', padding: 4, borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
          {['all', 'confirmed', 'pending', 'cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: filter === st ? 'var(--brand-default)' : 'transparent',
                color: filter === st ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filtered.map(b => (
            <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--brand-default)', fontFamily: 'var(--font-mono)' }}>
                  {b.reference}
                </span>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{b.venue}</h3>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                  Guest: {b.customer} • Date: {b.date}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--brand-default)' }}>₹{b.amount.toLocaleString('en-IN')}</span>
                <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`} style={{ textTransform: 'capitalize' }}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminBookingsPage;
