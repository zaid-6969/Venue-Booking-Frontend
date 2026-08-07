/**
 * BookingsPage Component
 *
 * Filterable list of all customer bookings (All, Pending, Confirmed, Cancelled, Completed)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarCheck, Clock, CheckCircle2, XCircle, ChevronRight, FileText, CreditCard } from 'lucide-react';
import { fetchMyBookings, selectMyBookings, selectBookingStatus } from '@features/bookings/redux/bookingsSlice';
import PageLoader from '@shared/components/feedback/PageLoader';
import InvoiceModal from '@features/bookings/components/InvoiceModal';

const STATUS_BADGES = {
  accepted:  { label: 'Accepted — Pay Now', cls: 'badge-warning' },
  confirmed: { label: 'Confirmed', cls: 'badge-success' },
  pending:   { label: 'Pending Owner Review', cls: 'badge-neutral' },
  rejected:  { label: 'Rejected', cls: 'badge-error' },
  cancelled: { label: 'Cancelled', cls: 'badge-error' },
  completed: { label: 'Completed', cls: 'badge-info' },
};

const BookingsPage = () => {
  const dispatch = useDispatch();
  const bookings = useSelector(selectMyBookings);
  const status   = useSelector(selectBookingStatus);
  const [filter, setFilter] = useState('all');
  const [activeInvoiceBooking, setActiveInvoiceBooking] = useState(null);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.bookingStatus === filter;
  });

  if (status === 'loading') return <PageLoader message="Fetching your bookings..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>My Reservations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Track and manage all your past and upcoming venue bookings
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface-1)', padding: 4, borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          {['all', 'accepted', 'confirmed', 'pending', 'cancelled', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: filter === tab ? 'var(--brand-default)' : 'transparent',
                color: filter === tab ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <CalendarCheck size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--space-4) auto' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>No Bookings Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            There are no reservations matching the selected filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filteredBookings.map((item) => {
            const badge = STATUS_BADGES[item.bookingStatus] || STATUS_BADGES.pending;
            const isAccepted = item.bookingStatus === 'accepted';
            const isConfirmed = item.bookingStatus === 'confirmed' || item.bookingStatus === 'completed';

            return (
              <div key={item._id} className="card" style={{ padding: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', borderLeft: isAccepted ? '4px solid var(--color-warning-500)' : 'none' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--brand-default)', fontFamily: 'var(--font-mono)' }}>
                      {item.bookingReference}
                    </span>
                    <span className={`badge ${badge.cls}`}>{badge.label}</span>
                  </div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.venue?.name || 'Event Venue'}
                  </h3>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                    Event Date: {new Date(item.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • Guests: {item.guestCount}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--brand-default)', fontFamily: 'var(--font-display)' }}>
                      ₹{(item.pricing?.totalAmount || 0).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Total Amount</div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {isAccepted && (
                      <Link to={`/book/${item.venue?._id || 'venue'}/payment?bookingId=${item._id}`} className="btn btn-primary btn-sm" style={{ gap: 4 }}>
                        <CreditCard size={14} /> Pay Now
                      </Link>
                    )}
                    {isConfirmed && (
                      <button onClick={() => setActiveInvoiceBooking(item)} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
                        <FileText size={14} /> Invoice
                      </button>
                    )}
                    <Link to={`/dashboard/bookings/${item._id}`} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
                      Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal Trigger */}
      {activeInvoiceBooking && (
        <InvoiceModal
          booking={activeInvoiceBooking}
          onClose={() => setActiveInvoiceBooking(null)}
          isOwner={false}
        />
      )}
    </div>
  );
};

export default BookingsPage;
