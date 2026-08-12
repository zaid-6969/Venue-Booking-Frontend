/**
 * OwnerEarningsPage Component
 *
 * Owner Revenue & Financial Analytics:
 * - Gross venue earnings, platform commission fee (10%), net payouts
 * - Payout Bank Account Status
 * - Payout Transaction Log calculated from real confirmed bookings
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DollarSign, TrendingUp, CreditCard, ArrowUpRight, FileText,
  Building2, CheckCircle2, ShieldCheck, Download, Calendar
} from 'lucide-react';
import { fetchOwnerBookings, selectOwnerBookings } from '@features/bookings/redux/bookingsSlice';
import { selectCurrentUser } from '@features/auth/redux/authSlice';

const OwnerEarningsPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const rawBookings = useSelector(selectOwnerBookings);
  const bookings = Array.isArray(rawBookings) ? rawBookings : [];

  useEffect(() => {
    dispatch(fetchOwnerBookings());
  }, [dispatch]);

  const paidBookings = bookings.filter(b => b.bookingStatus === 'confirmed' || b.bookingStatus === 'completed');

  const grossRevenue = paidBookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || b.totalPrice || 0), 0);
  const platformFee = Math.round(grossRevenue * 0.10);
  const netPayout = grossRevenue - platformFee;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)' }}>Earnings & Payouts</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Track revenue payouts, platform service commissions, and payout transaction history
          </p>
        </div>

        <button className="btn btn-secondary" style={{ gap: 8, borderRadius: 12 }}>
          <Download size={16} /> Download Tax Report
        </button>
      </div>

      {/* KPI Financial Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {/* Gross Revenue */}
        <div className="card" style={{ padding: 24, borderRadius: 20, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary)' }}>Gross Booking Revenue</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0ebff', color: '#6344f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            ₹{grossRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={14} /> Total revenue across {paidBookings.length} confirmed bookings
          </div>
        </div>

        {/* Platform Fee */}
        <div className="card" style={{ padding: 24, borderRadius: 20, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary)' }}>Platform Service Fee (10%)</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fffbe6', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            ₹{platformFee.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500, marginTop: 4 }}>
            Includes GST invoice generation & payment gateway processing
          </div>
        </div>

        {/* Net Payout */}
        <div className="card" style={{ padding: 24, borderRadius: 20, background: 'linear-gradient(135deg, #f7f5ff 0%, #f0ebff 100%)', border: '1px solid #e0d7ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#6344f5' }}>Net Payout Balance</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#6344f5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#6344f5', fontFamily: 'var(--font-display)' }}>
            ₹{netPayout.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: '#047857', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={14} /> Auto-disbursed weekly to HDFC Bank (•••• 5678)
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="card" style={{ padding: 24, borderRadius: 20, background: 'var(--surface-1)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
          Payout & Reservation Financial History
        </h3>

        {paidBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-tertiary)' }}>
            <CreditCard size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
            <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>No Confirmed Payout Transactions</h4>
            <p style={{ fontSize: 13, marginTop: 4 }}>Completed reservation payouts will be logged here automatically.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)', fontSize: 11, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Booking Ref</th>
                  <th style={{ padding: '12px 16px' }}>Venue</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Event Date</th>
                  <th style={{ padding: '12px 16px' }}>Gross Revenue</th>
                  <th style={{ padding: '12px 16px' }}>Net Payout</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {paidBookings.map((b) => {
                  const gross = b.pricing?.totalAmount || b.totalPrice || 0;
                  const net = Math.round(gross * 0.9);
                  return (
                    <tr key={b._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#6344f5', fontFamily: 'var(--font-mono)' }}>
                        {b.bookingReference || b._id?.slice(-8)}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{b.venue?.name || 'Venue'}</td>
                      <td style={{ padding: '14px 16px' }}>{b.customer?.name || 'Customer'}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-tertiary)' }}>
                        {new Date(b.eventDate || Date.now()).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>₹{gross.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#10b981' }}>₹{net.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="badge badge-success">Disbursed</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerEarningsPage;
