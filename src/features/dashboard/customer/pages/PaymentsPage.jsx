/**
 * PaymentsPage Component — Customer Dashboard
 *
 * Dedicated Payments & Booking Status Section for Customers:
 * - View all bookings with explicit status flags: Accepted (Confirmed), Pending, Rejected
 * - Check payment status (Paid, Pending Deposit, Refunded)
 * - Pay Now trigger with interactive Payment Checkout Modal (UPI / Card / NetBanking)
 * - Receipt / Invoice download trigger
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  CreditCard, CalendarCheck, CheckCircle2, Clock, XCircle,
  ShieldCheck, DollarSign, Download, ArrowRight, Sparkles, QrCode, Lock, X
} from 'lucide-react';
import { fetchMyBookings, selectMyBookings, selectBookingStatus } from '@features/bookings/redux/bookingsSlice';
import PageLoader from '@shared/components/feedback/PageLoader';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  confirmed: {
    label: 'Accepted / Confirmed',
    badgeCls: 'badge-success',
    icon: CheckCircle2,
    iconColor: 'var(--color-success-500)',
    description: 'Owner approved! Your venue reservation is active.',
  },
  pending: {
    label: 'Pending Approval',
    badgeCls: 'badge-warning',
    icon: Clock,
    iconColor: 'var(--color-warning-500)',
    description: 'Submitted to venue owner. Waiting for approval.',
  },
  rejected: {
    label: 'Rejected by Owner',
    badgeCls: 'badge-error',
    icon: XCircle,
    iconColor: 'var(--color-error-500)',
    description: 'The owner declined this reservation request.',
  },
  cancelled: {
    label: 'Cancelled',
    badgeCls: 'badge-error',
    icon: XCircle,
    iconColor: 'var(--text-tertiary)',
    description: 'This booking was cancelled.',
  },
  completed: {
    label: 'Completed',
    badgeCls: 'badge-info',
    icon: CheckCircle2,
    iconColor: 'var(--brand-default)',
    description: 'Event completed successfully.',
  },
};

const PaymentsPage = () => {
  const dispatch = useDispatch();
  const bookings = useSelector(selectMyBookings);
  const status   = useSelector(selectBookingStatus);

  const [activeTab, setActiveTab] = useState('all');
  const [selectedBookingForPay, setSelectedBookingForPay] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handlePaySubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      toast.success(`Payment of ₹${(selectedBookingForPay?.pricing?.totalAmount || 150000).toLocaleString('en-IN')} successful!`);
      setSelectedBookingForPay(null);
      dispatch(fetchMyBookings());
    }, 1800);
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'accepted') return b.bookingStatus === 'confirmed';
    return b.bookingStatus === activeTab;
  });

  // Calculate statistics
  const totalAmountSpent = bookings
    .filter(b => b.paymentStatus === 'success' || b.bookingStatus === 'confirmed')
    .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

  const acceptedCount = bookings.filter(b => b.bookingStatus === 'confirmed').length;
  const pendingCount  = bookings.filter(b => b.bookingStatus === 'pending').length;
  const rejectedCount = bookings.filter(b => b.bookingStatus === 'rejected').length;

  if (status === 'loading') return <PageLoader message="Loading your payment records..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Payments & Booking Status</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Review booking acceptance status, payment receipts, and settle pending venue balances
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--surface-1)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Total Spent</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--brand-default)', marginTop: 4 }}>
            ₹{totalAmountSpent.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 4 }}>Across all bookings</div>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--surface-1)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Accepted / Approved</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-success-500)', marginTop: 4 }}>
            {acceptedCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 4 }}>Ready for payment / event</div>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--surface-1)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Pending Owner Review</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-warning-500)', marginTop: 4 }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 4 }}>Awaiting confirmation</div>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--surface-1)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Rejected / Declined</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-error-500)', marginTop: 4 }}>
            {rejectedCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 4 }}>Unavailable on dates</div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, background: 'var(--surface-1)', padding: 6, borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: `All (${bookings.length})` },
          { id: 'accepted', label: `Accepted (${acceptedCount})` },
          { id: 'pending', label: `Pending (${pendingCount})` },
          { id: 'rejected', label: `Rejected (${rejectedCount})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-xl)',
              border: 'none',
              background: activeTab === tab.id ? 'var(--brand-default)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings & Payment Cards List */}
      {filteredBookings.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <CreditCard size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--space-4) auto' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>No Bookings in this Section</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            There are no booking or payment records matching the selected status tab.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {filteredBookings.map((booking) => {
            const st = STATUS_CONFIG[booking.bookingStatus] || STATUS_CONFIG.pending;
            const StatusIcon = st.icon;
            const isAccepted = booking.bookingStatus === 'confirmed';
            const isPaid = booking.paymentStatus === 'success';

            return (
              <div key={booking._id} className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', borderRadius: 'var(--radius-2xl)' }}>

                {/* Top Row: Reference & Status Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--brand-default)', fontFamily: 'var(--font-mono)', background: 'var(--brand-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-md)' }}>
                      {booking.bookingReference}
                    </span>
                    <span className={`badge ${st.badgeCls}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <StatusIcon size={14} style={{ color: st.iconColor }} />
                      {st.label}
                    </span>
                  </div>

                  {/* Payment Status Pill */}
                  <div>
                    {isPaid ? (
                      <span className="badge badge-success" style={{ fontWeight: 700 }}>
                        <ShieldCheck size={14} style={{ marginRight: 4 }} /> Paid in Full
                      </span>
                    ) : isAccepted ? (
                      <span className="badge badge-warning" style={{ fontWeight: 700 }}>
                        <Clock size={14} style={{ marginRight: 4 }} /> Payment Due
                      </span>
                    ) : (
                      <span className="badge badge-neutral" style={{ fontWeight: 600 }}>
                        Payment Pending Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Information Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-4)', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {booking.venue?.name || 'Event Venue'}
                    </h3>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
                      Event Date: <strong>{new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> • Guests: {booking.guestCount}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: st.iconColor, marginTop: 4, fontWeight: 600 }}>
                      {st.description}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Total Amount
                    </div>
                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--brand-default)', fontFamily: 'var(--font-display)' }}>
                      ₹{(booking.pricing?.totalAmount || 150000).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Action Footer Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <Link to={`/dashboard/bookings/${booking._id}`} style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--brand-default)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    View Complete Details <ArrowRight size={14} />
                  </Link>

                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    {isAccepted && !isPaid && (
                      <button
                        onClick={() => setSelectedBookingForPay(booking)}
                        className="btn btn-primary btn-sm"
                        style={{ gap: 6, fontWeight: 700 }}
                      >
                        <CreditCard size={16} /> Pay ₹{(booking.pricing?.totalAmount || 150000).toLocaleString('en-IN')} Now
                      </button>
                    )}

                    {isPaid && (
                      <button
                        onClick={() => toast.success(`Downloading tax invoice for ${booking.bookingReference}`)}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: 6 }}
                      >
                        <Download size={16} /> Download Receipt
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
      {selectedBookingForPay && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
          <div className="card" style={{ width: '100%', maxWidth: 520, padding: 'var(--space-8)', background: 'var(--surface-1)', borderRadius: 'var(--radius-3xl)', position: 'relative' }}>
            <button
              onClick={() => setSelectedBookingForPay(null)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 4 }}>
              Pay Venue Reservation
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
              Ref: <strong>{selectedBookingForPay.bookingReference}</strong> • {selectedBookingForPay.venue?.name}
            </p>

            <form onSubmit={handlePaySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 6 }}>
                  SELECT PAYMENT METHOD
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`btn ${paymentMethod === 'upi' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  >
                    <QrCode size={16} /> UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`btn ${paymentMethod === 'card' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  >
                    <CreditCard size={16} /> Debit/Credit Card
                  </button>
                </div>
              </div>

              {paymentMethod === 'upi' && (
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                    ENTER YOUR UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. mobileNumber@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="input"
                    required
                  />
                </div>
              )}

              {paymentMethod === 'card' && (
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                    CARD NUMBER
                  </label>
                  <input
                    type="text"
                    placeholder="4532 •••• •••• 8921"
                    className="input"
                    required
                  />
                </div>
              )}

              <div style={{ padding: 'var(--space-4)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', marginTop: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', fontWeight: 800 }}>
                  <span>Total Payable:</span>
                  <span style={{ color: 'var(--brand-default)' }}>₹{(selectedBookingForPay.pricing?.totalAmount || 150000).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: 'var(--space-4)', fontWeight: 800, gap: 8 }}
              >
                {isProcessing ? 'Processing Payment...' : <><Lock size={18} /> Confirm & Pay Now</>}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentsPage;
