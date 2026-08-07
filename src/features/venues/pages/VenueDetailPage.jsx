/**
 * VenueDetailPage Component
 *
 * Full detailed view for a single venue featuring:
 * - Large gallery with main hero image + thumbnails + full-screen modal
 * - Venue basic details (name, tagline, location badge, rating, categories)
 * - Sticky booking card with date selector, guest count slider, package picker, and price calculation
 * - Amenities grid with icons
 * - Selectable Packages section
 * - Extra services list
 * - Venue Rules & Cancellation Policy
 * - Interactive Availability Calendar (FullCalendar)
 * - Map location placeholder
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  MapPin, Star, Users, Check, Heart, GitCompare, Calendar as CalendarIcon,
  Shield, AlertCircle, Info, Sparkles, ChevronRight, X, Clock, Award, Phone, Mail,
  CheckCircle2, Plus, ArrowRight
} from 'lucide-react';
import VenueAvailabilityCalendar from '../components/VenueAvailabilityCalendar';
import { fetchVenueBySlug, fetchVenueById } from '../redux/venuesThunks';
import { selectSelectedVenue, selectDetailStatus, selectDetailError } from '../redux/venuesSlice';
import { setBookingDraft } from '@features/bookings/redux/bookingsSlice';
import { addToWishlist, removeFromWishlist, selectWishlistItems, toggleLocalWishlist } from '@features/wishlist/redux/wishlistSlice';
import { addToCompare, removeFromCompare, selectIsInCompare, selectCanAddToCompare } from '@features/compare/redux/compareSlice';
import { selectIsAuthenticated } from '@features/auth/redux/authSlice';
import { ImagePresets } from '@lib/imagekit';
import PageLoader from '@shared/components/feedback/PageLoader';
import GoogleMapComponent from '../components/GoogleMapComponent';
import toast from 'react-hot-toast';



const DEMO_VENUE_DETAIL = {
  _id: 'demo-venue-1',
  name: 'The Grand Majestic Banquet',
  slug: 'the-grand-majestic-banquet',
  tagline: 'Where dreams become unforgettable celebrations',
  description: 'The Grand Majestic Banquet is Mumbai’s premier luxury event destination spread across 15,000 sq. ft. of climate-controlled, magnificently decorated space. Designed to accommodate opulent weddings, high-profile corporate galas, and intimate family gatherings.',
  category: 'banquet-hall',
  location: {
    address: 'Plot 45, Bandra Reclamation, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    country: 'India',
  },
  minCapacity: 100,
  maxCapacity: 800,
  pricePerDay: 150000,
  rating: { average: 4.8, count: 127 },
  coverImage: { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800' },
  gallery: [
    { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', isPrimary: true },
    { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800' },
    { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800' },
  ],
  amenities: ['ac', 'parking', 'catering', 'decoration', 'power-backup', 'stage'],
  packages: [
    { name: 'Royal Gold Package', price: 50000, capacity: 300, includes: ['Custom Floral Decor', 'Multi-cuisine Buffet (50 Items)', 'DJ & Sound System'] },
    { name: 'Platinum Luxury Package', price: 95000, capacity: 500, includes: ['Full Theme Decoration', 'International Buffet', 'Live Band & DJ', 'Valet Parking'] },
  ],
  extraServices: [
    { name: 'Live DJ & Lighting FX', price: 25000 },
    { name: 'Valet Parking Team', price: 12000 },
    { name: 'Bridal Makeup Suite', price: 15000 },
  ],
  rules: [
    { title: 'Music Timings', description: 'Loud music must stop by 10:30 PM per local police guidelines.' },
    { title: 'Alcohol Policy', description: 'Alcohol permitted with valid one-day liquor license.' },
  ],
  cancellationPolicy: 'moderate',
  cancellationDetails: 'Free cancellation up to 14 days before the event date.',
};

const VenueDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const venueFromState = useSelector(selectSelectedVenue);
  const detailStatus   = useSelector(selectDetailStatus);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const wishlistItems  = useSelector(selectWishlistItems);

  const venue = venueFromState || DEMO_VENUE_DETAIL;
  const isWishlisted = wishlistItems.includes(venue._id);
  const isInCompare = useSelector(selectIsInCompare(venue._id));
  const canAddToCompare = useSelector(selectCanAddToCompare);

  // Gallery Modal
  const [activeImage, setActiveImage] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Booking Widget State
  const [selectedDate, setSelectedDate] = useState('');
  const [guestCount, setGuestCount] = useState(venue.minCapacity || 100);
  const [selectedPackage, setSelectedPackage] = useState(venue.packages?.[0] || null);
  const [selectedExtras, setSelectedExtras] = useState([]);

  useEffect(() => {
    if (slug) {
      dispatch(fetchVenueBySlug(slug));
    }
  }, [slug, dispatch]);

  const handleExtraToggle = (service) => {
    const exists = selectedExtras.some(e => e.name === service.name);
    if (exists) {
      setSelectedExtras(selectedExtras.filter(e => e.name !== service.name));
    } else {
      setSelectedExtras([...selectedExtras, service]);
    }
  };

  // Price Calculator
  const basePrice = venue.pricePerDay || 0;
  const packagePrice = selectedPackage?.price || 0;
  const extrasPrice = selectedExtras.reduce((sum, item) => sum + item.price, 0);
  const subtotal = basePrice + packagePrice + extrasPrice;
  const estimatedTax = Math.round(subtotal * 0.18);
  const estimatedTotal = subtotal + estimatedTax;

  const handleProceedToBooking = () => {
    if (!selectedDate) {
      alert('Please select an event date before proceeding.');
      return;
    }

    // Save draft state to Redux
    dispatch(setBookingDraft({
      venueId: venue._id,
      eventDate: selectedDate,
      guestCount,
      packageId: selectedPackage?.name || null,
      selectedPackage,
      extraServices: selectedExtras,
    }));

    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: `/book/${venue._id}` } });
    } else {
      navigate(`/book/${venue._id}`);
    }
  };

  const handleWishlistClick = () => {
    if (isAuthenticated) {
      if (isWishlisted) dispatch(removeFromWishlist(venue._id));
      else dispatch(addToWishlist(venue._id));
    } else {
      dispatch(toggleLocalWishlist(venue._id));
    }
  };

  const handleCompareClick = () => {
    if (isInCompare) dispatch(removeFromCompare(venue._id));
    else if (canAddToCompare) dispatch(addToCompare(venue));
  };

  const galleryImages = venue.gallery && venue.gallery.length > 0
    ? venue.gallery
    : [venue.coverImage || { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200' }];

  if (detailStatus === 'loading') return <PageLoader message="Loading venue details..." />;

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: 'var(--space-20)' }}>
      <div className="container" style={{ paddingTop: 'var(--space-6)' }}>

        {/* ============================================================ */}
        {/* HEADER TITLE & ACTIONS                                       */}
        {/* ============================================================ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{venue.category?.replace('-', ' ')}</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={14} style={{ color: 'var(--brand-default)' }} />
                {venue.location?.address}, {venue.location?.city}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {venue.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', marginTop: 4 }}>{venue.tagline}</p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              onClick={handleCompareClick}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <GitCompare size={16} />
              {isInCompare ? 'Comparing' : 'Compare'}
            </button>
            <button
              onClick={handleWishlistClick}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: isWishlisted ? 'var(--color-error-500)' : 'inherit' }}
            >
              <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
              {isWishlisted ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* LARGE GALLERY GRID                                           */}
        {/* ============================================================ */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-3)', borderRadius: 'var(--radius-3xl)', overflow: 'hidden', height: 440, marginBottom: 'var(--space-10)', position: 'relative' }} className="venue-gallery-grid">
          {/* Main Hero Image */}
          <div style={{ position: 'relative', height: '100%', cursor: 'pointer' }} onClick={() => setShowGalleryModal(true)}>
            <img
              src={galleryImages[0]?.url}
              alt={venue.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Thumbnail Stack */}
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 'var(--space-3)', height: '100%' }}>
            {galleryImages.slice(1, 3).map((img, i) => (
              <div key={i} style={{ position: 'relative', height: '100%', cursor: 'pointer' }} onClick={() => setShowGalleryModal(true)}>
                <img src={img.url} alt="Gallery view" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>

          {/* View All Photos Overlay */}
          <button
            onClick={() => setShowGalleryModal(true)}
            className="btn btn-secondary btn-sm"
            style={{
              position: 'absolute',
              bottom: 'var(--space-4)',
              right: 'var(--space-4)',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              fontWeight: 700,
              gap: 'var(--space-2)'
            }}
          >
            View All Photos ({galleryImages.length})
          </button>
        </div>

        {/* ============================================================ */}
        {/* TWO-COLUMN LAYOUT: CONTENT + STICKY BOOKING CARD              */}
        {/* ============================================================ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-10)' }} className="venue-detail-content-grid">

          {/* LEFT MAIN CONTENT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>

            {/* Highlights Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-4)', background: 'var(--surface-1)', padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>Capacity</div>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginTop: 2 }}>{venue.minCapacity} - {venue.maxCapacity} guests</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>Rating</div>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={16} fill="currentColor" style={{ color: 'var(--color-warning-500)' }} /> {venue.rating?.average} ({venue.rating?.count} reviews)
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>Policy</div>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginTop: 2, textTransform: 'capitalize' }}>{venue.cancellationPolicy}</div>
              </div>
            </div>

            {/* Overview Description */}
            <section>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>About this venue</h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {venue.description}
              </p>
            </section>

            {/* Amenities Grid */}
            <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-10)' }}>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Included Amenities</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
                {venue.amenities?.map((amenity, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--color-success-500)' }} />
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'capitalize' }}>{amenity.replace('-', ' ')}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Selectable Packages */}
            <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-10)' }}>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Event Packages</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>Choose a package tailored to your celebration scale</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
                {venue.packages?.map((pkg, i) => {
                  const isSelected = selectedPackage?.name === pkg.name;
                  return (
                    <div
                      key={i}
                      className="card"
                      onClick={() => setSelectedPackage(pkg)}
                      style={{
                        padding: 'var(--space-6)',
                        cursor: 'pointer',
                        borderColor: isSelected ? 'var(--brand-default)' : 'var(--border-subtle)',
                        borderWidth: isSelected ? 2 : 1,
                        background: isSelected ? 'var(--brand-subtle)' : 'var(--surface-1)',
                        position: 'relative',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {pkg.isPopular && (
                        <span className="badge badge-primary" style={{ position: 'absolute', top: 12, right: 12 }}>Most Popular</span>
                      )}
                      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 4 }}>{pkg.name}</h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>{pkg.description}</p>
                      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--brand-default)', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>
                        ₹{pkg.price.toLocaleString('en-IN')}
                      </div>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {pkg.includes?.map((inc, j) => (
                          <li key={j} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Check size={14} style={{ color: 'var(--color-success-500)' }} /> {inc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Extra Services Checklist */}
            <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-10)' }}>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Add-on Services</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {venue.extraServices?.map((service, i) => {
                  const isChecked = selectedExtras.some(e => e.name === service.name);
                  return (
                    <div
                      key={i}
                      onClick={() => handleExtraToggle(service)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--space-4) var(--space-5)',
                        background: 'var(--surface-1)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-xl)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          style={{ width: 18, height: 18, accentColor: 'var(--brand-default)' }}
                        />
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{service.name}</span>
                      </div>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--brand-default)' }}>
                        +₹{service.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Availability Calendar */}
            <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-10)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Availability Calendar</h2>
                <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                  <span style={{ color: '#22c55e' }}>🟢 Available</span>
                  <span style={{ color: '#ef4444' }}>🔴 Booked</span>
                  <span style={{ color: '#f59e0b' }}>🟡 Awaiting Confirmation</span>
                  <span style={{ color: '#6b7280' }}>⚪ Blocked</span>
                </div>
              </div>

              <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
                <VenueAvailabilityCalendar
                  availability={venue.availability || []}
                  selectedDate={selectedDate}
                  onSelectDate={(date) => setSelectedDate(date)}
                />
              </div>
            </section>

            {/* Rules & Policy */}
            <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-10)' }}>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Venue Rules & Policies</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {venue.rules?.map((rule, i) => (
                  <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                    <Info size={18} style={{ color: 'var(--brand-default)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{rule.title}</h4>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{rule.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Interactive Map & Directions */}
            <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-10)' }}>
              <GoogleMapComponent location={venue.location} venueName={venue.name} />
            </section>
          </div>

          {/* RIGHT STICKY BOOKING CARD */}
          <aside>
            <div className="card glass" style={{ padding: 'var(--space-6)', position: 'sticky', top: 'calc(var(--header-height) + 20px)', borderRadius: 'var(--radius-3xl)', boxShadow: 'var(--shadow-2xl)' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
                <div>
                  <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--brand-default)', fontFamily: 'var(--font-display)' }}>
                    ₹{venue.pricePerDay?.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginLeft: 4 }}>/day</span>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-warning-700)', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Star size={12} fill="currentColor" /> {venue.rating?.average}
                </div>
              </div>

              {/* Event Date Selector */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                  Event Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input"
                  style={{ cursor: 'pointer' }}
                />
              </div>

              {/* Guest Count Slider */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                  <span>Guest Count</span>
                  <span style={{ color: 'var(--brand-default)' }}>{guestCount} Guests</span>
                </div>
                <input
                  type="range"
                  min={venue.minCapacity || 50}
                  max={venue.maxCapacity || 1000}
                  step={10}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-default)' }}
                />
              </div>

              {/* Price Calculation Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--surface-2)', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-xs)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Venue Base Rental</span>
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
                    <span>Add-ons ({selectedExtras.length})</span>
                    <span>₹{extrasPrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GST (18% Mock)</span>
                  <span>₹{estimatedTax.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border-normal)', paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  <span>Estimated Total</span>
                  <span style={{ color: 'var(--brand-default)' }}>₹{estimatedTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                onClick={handleProceedToBooking}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', borderRadius: 'var(--radius-xl)', fontWeight: 700, gap: 'var(--space-2)' }}
              >
                Book Venue Now <ArrowRight size={18} />
              </button>

            </div>
          </aside>

        </div>

      </div>

      <style>{`
        @media (max-width: 1024px) {
          .venue-detail-content-grid { grid-template-columns: 1fr !important; }
          .venue-gallery-grid { grid-template-columns: 1fr !important; height: auto !important; }
        }
      `}</style>
    </div>
  );
};

export default VenueDetailPage;
