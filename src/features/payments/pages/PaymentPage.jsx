/**
 * PaymentPage Component
 *
 * Comprehensive Payment & Checkout interface:
 * - Multi-method selector: UPI / QR, Credit/Debit Card, Netbanking, Pay at Venue
 * - Real-time itemized order breakdown (Venue rental, package, add-ons, GST)
 * - Security seals & Money-back cancellation guarantee badge
 * - Instant simulated transaction processing with error handling
 * - Redirection to confirmation page on payment success
 */

import { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  CreditCard, QrCode, Building, ShieldCheck, CheckCircle2,
  Lock, ArrowLeft, AlertCircle, Sparkles, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { selectSelectedBooking, selectBookingDraft } from '@features/bookings/redux/bookingsSlice';
import { selectSelectedVenue } from '@features/venues/redux/venuesSlice';
import { processPayment } from '@features/payments/redux/paymentsSlice';

const PaymentPage = () => {
  const { venueId } = useParams();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const venue = useSelector(selectSelectedVenue);
  const booking = useSelector(selectSelectedBooking);
  const bookingDraft = useSelector(selectBookingDraft);

  // Active Payment Method State
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'pay_at_venue'
  const [isProcessing, setIsProcessing] = useState(false);

  // Form Fields
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const basePrice = venue?.pricePerDay || 150000;
  const packagePrice = bookingDraft?.selectedPackage?.price || 0;
  const extrasPrice = (bookingDraft?.extraServices || []).reduce((sum, item) => sum + (item.price || 0), 0);
  const subtotal = basePrice + packagePrice + extrasPrice;
  const taxAmount = Math.round(subtotal * 0.18);
  const totalAmount = booking?.pricing?.totalAmount || (subtotal + taxAmount);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    if (paymentMethod === 'upi' && !upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g., username@upi)');
      return;
    }

    if (paymentMethod === 'card' && cardDetails.number.replace(/\s/g, '').length < 16) {
      toast.error('Please enter a valid 16-digit card number');
      return;
    }

    setIsProcessing(true);
    const targetBookingId = bookingId || booking?._id;

    dispatch(processPayment({
      bookingId: targetBookingId,
      amount: totalAmount,
      paymentMethod,
      cardDetails,
      upiId,
    }))
      .unwrap()
      .then((res) => {
        setIsProcessing(false);
        toast.success('Payment authorized and booking confirmed!');
        const confirmedBookingId = res?.payment?.bookingId || targetBookingId || 'demo';
        navigate(`/book/${venueId || 'demo'}/confirm/${confirmedBookingId}`);
      })
      .catch((err) => {
        setIsProcessing(false);
        toast.error(err?.message || 'Payment processing failed');
      });
  };

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: 'var(--space-20)', paddingTop: 'var(--space-6)' }}>
      <div className="container" style={{ maxWidth: 1040 }}>

        {/* Page Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-2)' }}>
            <ArrowLeft size={16} /> Back to Details
          </button>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Secure Payment Checkout
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Complete your venue deposit payment using encrypted 256-bit SSL processing
          </p>
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-8)' }} className="payment-page-grid">

          {/* LEFT: PAYMENT METHOD TABS & FORM */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

            {/* Method Tabs */}
            <div className="card" style={{ padding: 'var(--space-4)', background: 'var(--surface-1)', borderRadius: 'var(--radius-2xl)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-2)' }}>
                {[
                  { id: 'upi', label: 'UPI / QR Code', icon: QrCode },
                  { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                  { id: 'netbanking', label: 'Net Banking', icon: Building },
                  { id: 'pay_at_venue', label: 'Pay at Venue', icon: ShieldCheck },
                ].map(method => {
                  const IconComp = method.icon;
                  const isActive = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'var(--space-4) var(--space-2)',
                        borderRadius: 'var(--radius-xl)',
                        border: isActive ? '2px solid var(--brand-default)' : '1px solid var(--border-subtle)',
                        background: isActive ? 'var(--brand-subtle)' : 'var(--bg-subtle)',
                        color: isActive ? 'var(--brand-default)' : 'var(--text-secondary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <IconComp size={20} style={{ marginBottom: 6 }} />
                      <span style={{ fontSize: 'var(--text-xs)' }}>{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Method Form Box */}
            <div className="card" style={{ padding: 'var(--space-8)', background: 'var(--surface-1)', borderRadius: 'var(--radius-2xl)' }}>

              <form onSubmit={handlePaymentSubmit}>

                {/* 1. UPI Payment Form */}
                {paymentMethod === 'upi' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <div>
                      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Instant UPI Payment</h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Pay directly using GPay, PhonePe, Paytm, or BHIM</p>
                    </div>

                    <div>
                      <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                        ENTER YOUR VPA / UPI ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. mobileNumber@upi or name@okaxis"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="input"
                        required
                      />
                    </div>

                    <div style={{ padding: 'var(--space-4)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                      <div style={{ width: 64, height: 64, background: '#fff', border: '1px solid var(--border-normal)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <QrCode size={40} style={{ color: 'var(--text-primary)' }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>Scan QR Code via any UPI App</h4>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Open GPay/PhonePe and scan the generated code on checkout.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Card Payment Form */}
                {paymentMethod === 'card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Credit or Debit Card</h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Visa, Mastercard, RuPay, and American Express accepted</p>
                    </div>

                    <div>
                      <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                        CARD NUMBER
                      </label>
                      <input
                        type="text"
                        name="number"
                        maxLength={19}
                        placeholder="4532 •••• •••• 8921"
                        value={cardDetails.number}
                        onChange={handleCardChange}
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                        CARDHOLDER NAME
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="As written on card"
                        value={cardDetails.name}
                        onChange={handleCardChange}
                        className="input"
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                      <div>
                        <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                          EXPIRY DATE
                        </label>
                        <input
                          type="text"
                          name="expiry"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardDetails.expiry}
                          onChange={handleCardChange}
                          className="input"
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                          CVV CODE
                        </label>
                        <input
                          type="password"
                          name="cvv"
                          placeholder="•••"
                          maxLength={4}
                          value={cardDetails.cvv}
                          onChange={handleCardChange}
                          className="input"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Netbanking Form */}
                {paymentMethod === 'netbanking' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Net Banking</h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Direct online transfer via all major Indian banks</p>
                    </div>

                    <div>
                      <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                        SELECT BANK
                      </label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="input"
                      >
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="State Bank of India">State Bank of India</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 4. Pay at Venue Form */}
                {paymentMethod === 'pay_at_venue' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div style={{ padding: 'var(--space-4)', background: 'var(--brand-subtle)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255, 90, 54, 0.2)' }}>
                      <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--brand-default)', marginBottom: 4 }}>
                        Pay 20% Advance & Balance at Venue
                      </h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Confirm your date reservation today with a partial token deposit. Pay remaining balance directly to the venue manager on event day.
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn btn-primary btn-xl"
                  style={{ width: '100%', borderRadius: 'var(--radius-xl)', marginTop: 'var(--space-8)', fontWeight: 700, gap: 'var(--space-2)' }}
                >
                  {isProcessing ? (
                    'Processing Transaction...'
                  ) : (
                    <>
                      <Lock size={18} /> Pay ₹{totalAmount.toLocaleString('en-IN')} Now
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-4)' }}>
                  <ShieldCheck size={14} style={{ color: 'var(--color-success-500)' }} />
                  <span>Guaranteed 100% Secure 256-Bit Encrypted Payment</span>
                </div>

              </form>

            </div>
          </div>

          {/* RIGHT: ORDER BREAKDOWN SUMMARY */}
          <div>
            <div className="card glass" style={{ padding: 'var(--space-6)', position: 'sticky', top: 'calc(var(--header-height) + 20px)', borderRadius: 'var(--radius-3xl)', boxShadow: 'var(--shadow-2xl)' }}>

              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
                Booking Summary
              </h3>

              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {venue?.name || 'The Grand Majestic Banquet'}
                </h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  {venue?.location?.address || 'Bandra West'}, {venue?.location?.city || 'Mumbai'}
                </p>
              </div>

              {/* Breakdown Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 'var(--text-xs)', marginBottom: 'var(--space-6)', background: 'var(--surface-2)', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Venue Base Rental</span>
                  <span>₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
                {bookingDraft?.selectedPackage && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{bookingDraft.selectedPackage.name}</span>
                    <span>₹{packagePrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {extrasPrice > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Add-on Services ({bookingDraft?.extraServices?.length || 0})</span>
                    <span>₹{extrasPrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>18% GST (Taxes)</span>
                  <span>₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-normal)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--brand-default)' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Cancellation Guarantee Pill */}
              <div style={{ padding: 'var(--space-4)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-success-700)', marginBottom: 2 }}>
                  <Check size={14} /> Free Cancellation Policy
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                  Cancel up to 14 days before your event date for a full refund minus minimal handling charges.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .payment-page-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default PaymentPage;
