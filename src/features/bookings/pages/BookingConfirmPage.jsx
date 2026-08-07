/**
 * BookingConfirmPage Component
 *
 * Displays post-booking confirmation receipt:
 * - Unique Booking Reference ID badge
 * - Event date & venue details summary
 * - Dummy Payment status badge (Paid / Pending)
 * - Dummy Invoice download action
 * - Quick links: View My Bookings, Return Home
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, Calendar, MapPin, Download, Home, ListFilter, FileText } from 'lucide-react';
import { fetchBookingById, fetchBookingInvoice, selectSelectedBooking, selectInvoice } from '../redux/bookingsSlice';
import PageLoader from '@shared/components/feedback/PageLoader';

const BookingConfirmPage = () => {
  const { bookingId } = useParams();
  const dispatch = useDispatch();

  const booking = useSelector(selectSelectedBooking);
  const invoice = useSelector(selectInvoice);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      dispatch(fetchBookingById(bookingId))
        .then(() => dispatch(fetchBookingInvoice(bookingId)))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [bookingId, dispatch]);

  if (loading) return <PageLoader message="Generating booking confirmation..." />;

  const displayRef = booking?.bookingReference || 'VH-2026-X89B';
  const venueName  = booking?.venue?.name || 'The Grand Majestic Banquet';
  const eventDate  = booking?.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '15 Aug 2026';
  const totalPaid  = booking?.pricing?.totalAmount || 330400;

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', padding: 'var(--space-12) 0' }}>
      <div className="container" style={{ maxWidth: 720, textAlign: 'center' }}>

        {/* Confirmation Card */}
        <div className="card" style={{ padding: 'var(--space-10) var(--space-8)', background: 'var(--surface-1)', borderRadius: 'var(--radius-3xl)', boxShadow: 'var(--shadow-xl)' }}>

          {/* Success Icon Badge */}
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--color-success-50)', color: 'var(--color-success-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6) auto' }}>
            <CheckCircle2 size={44} />
          </div>

          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
            Booking Confirmed!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', marginBottom: 'var(--space-6)' }}>
            Your venue reservation request has been submitted successfully.
          </p>

          {/* Reference Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-6)', background: 'var(--bg-subtle)', border: '1px solid var(--border-normal)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-8)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>REFERENCE ID:</span>
            <span style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--brand-default)', fontFamily: 'var(--font-mono)' }}>
              {displayRef}
            </span>
          </div>

          {/* Details Box */}
          <div style={{ background: 'var(--bg-subtle)', padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border-subtle)', textAlign: 'left', marginBottom: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>VENUE</span>
              <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{venueName}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>EVENT DATE</span>
              <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={14} style={{ color: 'var(--brand-default)' }} /> {eventDate}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>TOTAL AMOUNT</span>
              <span style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--brand-default)' }}>₹{totalPaid.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>PAYMENT STATUS</span>
              <span className="badge badge-success">Mock Payment Success</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard/bookings" className="btn btn-secondary btn-lg" style={{ gap: 'var(--space-2)' }}>
              <ListFilter size={18} /> View My Bookings
            </Link>
            <Link to="/" className="btn btn-primary btn-lg" style={{ gap: 'var(--space-2)' }}>
              <Home size={18} /> Back to Home
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BookingConfirmPage;
