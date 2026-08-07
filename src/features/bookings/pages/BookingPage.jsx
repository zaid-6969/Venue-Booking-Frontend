/**
 * BookingPage Component
 *
 * Multi-step booking checkout flow:
 * - Step 1: Confirm event date, guest count, package, and extra services
 * - Step 2: Input special requests & contact details
 * - Real-time price breakdown (Base + Package + Add-ons + GST)
 * - Submits booking to backend & redirects to payment step
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Calendar, Users, Building2, CheckCircle2, Shield, ArrowRight, ArrowLeft, CreditCard
} from 'lucide-react';
import { createBooking } from '../redux/bookingsSlice';
import { selectBookingDraft } from '../redux/bookingsSlice';
import { selectSelectedVenue } from '@features/venues/redux/venuesSlice';
import { selectCurrentUser } from '@features/auth/redux/authSlice';
import toast from 'react-hot-toast';

const BookingPage = () => {
  const { venueId } = useParams();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const user         = useSelector(selectCurrentUser);
  const venue        = useSelector(selectSelectedVenue);
  const bookingDraft = useSelector(selectBookingDraft);

  // Form State initialized from bookingDraft
  const [eventDate, setEventDate] = useState(bookingDraft.eventDate || '');
  const [guestCount, setGuestCount] = useState(bookingDraft.guestCount || 100);
  const [selectedPackage, setSelectedPackage] = useState(bookingDraft.selectedPackage || null);
  const [selectedExtras, setSelectedExtras] = useState(bookingDraft.extraServices || []);
  const [specialReq, setSpecialReq] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const basePrice    = venue?.pricePerDay || 150000;
  const packagePrice = selectedPackage?.price || 0;
  const extrasPrice  = selectedExtras.reduce((sum, item) => sum + (item.price || 0), 0);
  const subtotal     = basePrice + packagePrice + extrasPrice;
  const taxAmount    = Math.round(subtotal * 0.18);
  const totalAmount  = subtotal + taxAmount;

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!eventDate) {
      toast.error('Please select an event date');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        venueId: venueId || venue?._id,
        eventDate,
        guestCount,
        selectedPackage,
        selectedExtraServices: selectedExtras,
        specialRequests: specialReq,
      };

      const action = await dispatch(createBooking(payload)).unwrap();
      toast.success('Booking initialized successfully!');
      
      // Navigate to Payment step with bookingId
      navigate(`/book/${venueId}/payment?bookingId=${action.booking._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to initialize booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: 'var(--space-20)' }}>
      <div className="container" style={{ maxWidth: 960 }}>

        <div style={{ marginBottom: 'var(--space-8)' }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-2)' }}>
            <ArrowLeft size={16} /> Back to Venue
          </button>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Confirm Venue Reservation</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review your event details and configure your reservation preferences</p>
        </div>

        <form onSubmit={handleSubmitBooking} style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-8)' }} className="booking-page-grid">

          {/* LEFT FORM FIELDS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

            {/* Event Summary Box */}
            <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={20} style={{ color: 'var(--brand-default)' }} />
                {venue?.name || 'Selected Event Hall'}
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                {venue?.location?.address}, {venue?.location?.city}
              </p>

              {/* Event Date Input */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                  Event Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="input"
                  required
                />
              </div>

              {/* Guest Count Input */}
              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                  Expected Guests
                </label>
                <input
                  type="number"
                  min={venue?.minCapacity || 10}
                  max={venue?.maxCapacity || 5000}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Special Requests */}
            <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Special Requests</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Add dietary restrictions, timing preferences, or specific setup requests for the venue owner.
              </p>
              <textarea
                rows={4}
                value={specialReq}
                onChange={(e) => setSpecialReq(e.target.value)}
                placeholder="e.g. Need Jain food options for 50 guests. Stage decor preferred in pastel theme."
                className="input"
              />
            </div>

          </div>

          {/* RIGHT SUMMARY CARD */}
          <div>
            <div className="card glass" style={{ padding: 'var(--space-6)', position: 'sticky', top: 'calc(var(--header-height) + 20px)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
                Price Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 'var(--text-xs)', marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Venue Base Price</span>
                  <span>₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
                {selectedPackage && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{selectedPackage.name}</span>
                    <span>₹{packagePrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {extrasPrice > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Add-on Services ({selectedExtras.length})</span>
                    <span>₹{extrasPrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>18% GST (Mock)</span>
                  <span>₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border-normal)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                  <span>Total Payable</span>
                  <span style={{ color: 'var(--brand-default)' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', borderRadius: 'var(--radius-xl)', fontWeight: 700, gap: 'var(--space-2)' }}
              >
                {isSubmitting ? 'Initializing...' : 'Proceed to Payment'} <CreditCard size={18} />
              </button>
            </div>
          </div>

        </form>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .booking-page-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default BookingPage;
