import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Calendar, MapPin, Users, FileText, XCircle, CheckCircle2, Building2, CreditCard, Sparkles } from 'lucide-react';
import { fetchBookingById, cancelBooking, selectSelectedBooking } from '@features/bookings/redux/bookingsSlice';
import PageLoader from '@shared/components/feedback/PageLoader';
import InvoiceModal from '@features/bookings/components/InvoiceModal';
import toast from 'react-hot-toast';

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const booking = useSelector(selectSelectedBooking);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchBookingById(id)).finally(() => setLoading(false));
    }
  }, [id, dispatch]);

  const handleCancelBooking = async () => {
    const reason = prompt('Please enter cancellation reason:');
    if (!reason) return;

    setCancelling(true);
    try {
      await dispatch(cancelBooking({ id, reason })).unwrap();
      toast.success('Booking cancelled successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <PageLoader message="Loading reservation details..." />;

  const item = booking || {
    _id: id,
    bookingReference: 'VH-2026-X89B',
    eventDate: '2026-08-15',
    guestCount: 200,
    bookingStatus: 'confirmed',
    paymentStatus: 'success',
    venue: { name: 'The Grand Majestic Banquet', location: { address: '14 Linking Rd', city: 'Mumbai' } },
    pricing: { basePrice: 150000, packagePrice: 120000, extrasPrice: 15000, taxAmount: 51300, totalAmount: 336300 }
  };

  const isAccepted = item.bookingStatus === 'accepted';
  const isConfirmed = item.bookingStatus === 'confirmed' || item.bookingStatus === 'completed';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 840 }}>
      <div>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-2)' }}>
          <ArrowLeft size={16} /> Back to Reservations
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--brand-default)', fontFamily: 'var(--font-mono)' }}>
              REF: {item.bookingReference}
            </span>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginTop: 2 }}>{item.venue?.name}</h1>
          </div>
          <span className={`badge ${isConfirmed ? 'badge-success' : isAccepted ? 'badge-warning' : item.bookingStatus === 'pending' ? 'badge-neutral' : 'badge-error'}`} style={{ textTransform: 'capitalize', fontSize: 'var(--text-sm)', padding: '6px 16px' }}>
            {isAccepted ? 'Accepted — Action Required' : item.bookingStatus}
          </span>
        </div>
      </div>

      {/* Pay Now Alert Banner for Accepted Bookings */}
      {isAccepted && (
        <div className="card glass" style={{ padding: 'var(--space-6)', background: 'linear-gradient(135deg, #fffbe6 0%, #fef3c7 100%)', border: '2px solid var(--color-warning-500)', borderRadius: 'var(--radius-2xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-warning-700)', fontWeight: 800, fontSize: 'var(--text-sm)' }}>
                <Sparkles size={18} /> BOOKING REQUEST ACCEPTED BY HOST!
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: 4, fontWeight: 600 }}>
                The venue owner has approved your reservation date. Complete payment of ₹{(item.pricing?.totalAmount || 0).toLocaleString('en-IN')} to lock in your booking.
              </p>
            </div>

            <Link to={`/book/${item.venue?._id || 'venue'}/payment?bookingId=${item._id}`} className="btn btn-primary btn-lg" style={{ gap: 'var(--space-2)', boxShadow: 'var(--shadow-lg)' }}>
              <CreditCard size={20} /> Pay ₹{(item.pricing?.totalAmount || 0).toLocaleString('en-IN')} Now
            </Link>
          </div>
        </div>
      )}

      {/* Reservation Summary Card */}
      <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
        <div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>EVENT DATE</span>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} style={{ color: 'var(--brand-default)' }} />
            {new Date(item.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>

        <div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>GUESTS</span>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={16} style={{ color: 'var(--brand-default)' }} />
            {item.guestCount} Attending
          </div>
        </div>

        <div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>PAYMENT</span>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginTop: 4, color: isConfirmed ? 'var(--color-success-500)' : 'var(--color-warning-600)' }}>
            {isConfirmed ? `Paid (₹${(item.pricing?.totalAmount || 0).toLocaleString('en-IN')})` : 'Payment Pending'}
          </div>
        </div>
      </div>

      {/* Pricing Breakdown Card */}
      <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
          Payment Breakdown
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Venue Base Rental</span>
            <span>₹{(item.pricing?.basePrice || 0).toLocaleString('en-IN')}</span>
          </div>
          {item.pricing?.packagePrice > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Event Package</span>
              <span>₹{item.pricing.packagePrice.toLocaleString('en-IN')}</span>
            </div>
          )}
          {item.pricing?.extrasPrice > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Add-on Services</span>
              <span>₹{item.pricing.extrasPrice.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>GST (18% Mock)</span>
            <span>₹{(item.pricing?.taxAmount || 0).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ borderTop: '1px solid var(--border-normal)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
            <span>Total Amount</span>
            <span style={{ color: 'var(--brand-default)' }}>₹{(item.pricing?.totalAmount || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          {isAccepted ? (
            <Link to={`/book/${item.venue?._id || 'venue'}/payment?bookingId=${item._id}`} className="btn btn-primary" style={{ gap: 'var(--space-2)' }}>
              <CreditCard size={18} /> Proceed to Pay Now
            </Link>
          ) : (
            <button onClick={() => setShowInvoiceModal(true)} className="btn btn-secondary" style={{ gap: 'var(--space-2)' }}>
              <FileText size={18} /> View GST Tax Invoice
            </button>
          )}

          {item.bookingStatus !== 'cancelled' && (
            <button onClick={handleCancelBooking} disabled={cancelling} className="btn btn-danger" style={{ gap: 'var(--space-2)' }}>
              <XCircle size={18} /> Cancel Reservation
            </button>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <InvoiceModal
          booking={item}
          onClose={() => setShowInvoiceModal(false)}
          isOwner={false}
        />
      )}
    </div>
  );
};

export default BookingDetailPage;
