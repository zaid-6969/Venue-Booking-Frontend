/**
 * HomePage Component
 *
 * Enterprise Home Landing Page featuring:
 * - Hero banner with background overlay and live count stats
 * - Advanced Search bar (City, Category, Capacity, Date)
 * - Featured Venues carousel/grid with real/mock data fallback
 * - Category Grid with icons
 * - Popular Cities cards
 * - Why Choose Us benefit grid
 * - Customer Reviews section
 * - FAQ Accordion
 * - Footer CTA banner
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, MapPin, Calendar, Users, Building2, Shield, Heart,
  Sparkles, CheckCircle2, ChevronRight, Star, HelpCircle, ArrowRight,
  TrendingUp, Award, Clock, DollarSign
} from 'lucide-react';
import { fetchFeaturedVenues } from '../redux/venuesThunks';
import { selectFeaturedVenues, selectFeaturedStatus } from '../redux/venuesSlice';
import { VENUE_CATEGORIES, POPULAR_CITIES } from '@constants/index';
import VenueCard from '../components/VenueCard';

// Dummy backup venues in case backend DB isn't seeded yet
const DEMO_FEATURED = [
  {
    _id: 'demo-1',
    name: 'The Grand Majestic Banquet',
    slug: 'the-grand-majestic-banquet',
    tagline: 'Where dreams become celebrations',
    description: 'Mumbai\'s most prestigious event venue offering 15,000 sq ft of luxury space.',
    category: 'banquet-hall',
    location: { city: 'Mumbai' },
    minCapacity: 100,
    maxCapacity: 800,
    pricePerDay: 150000,
    rating: { average: 4.8, count: 127 },
    isFeatured: true,
    coverImage: { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800' }
  },
  {
    _id: 'demo-2',
    name: 'Royal Heritage Palace',
    slug: 'royal-heritage-palace',
    tagline: 'A royal experience for your royal occasion',
    description: 'Stunning heritage property nestled in Delhi spread across 3 acres of gardens.',
    category: 'marriage-hall',
    location: { city: 'Delhi' },
    minCapacity: 200,
    maxCapacity: 2000,
    pricePerDay: 350000,
    rating: { average: 4.9, count: 203 },
    isFeatured: true,
    coverImage: { url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800' }
  },
  {
    _id: 'demo-3',
    name: 'Green Valley Farmhouse',
    slug: 'green-valley-farmhouse',
    tagline: 'Nature\'s luxury for your celebration',
    description: 'Sprawling 5-acre property situated on the outskirts of Bangalore.',
    category: 'farmhouse',
    location: { city: 'Bangalore' },
    minCapacity: 100,
    maxCapacity: 1000,
    pricePerDay: 200000,
    rating: { average: 4.7, count: 156 },
    isFeatured: true,
    coverImage: { url: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800' }
  },
  {
    _id: 'demo-4',
    name: 'Skyline Rooftop Events',
    slug: 'skyline-rooftop-events',
    tagline: 'Celebrate under the stars',
    description: 'Breathtaking 360-degree view of South Mumbai skyline and Arabian Sea.',
    category: 'rooftop',
    location: { city: 'Mumbai' },
    minCapacity: 50,
    maxCapacity: 250,
    pricePerDay: 85000,
    rating: { average: 4.6, count: 89 },
    isFeatured: true,
    coverImage: { url: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800' }
  }
];

const FAQS = [
  {
    q: 'How do I book a venue through EventFlow?',
    a: 'Simply search for your preferred city or venue type, select your event date and guest count, choose an available package, and complete the booking form with instant confirmation.'
  },
  {
    q: 'Are the prices listed on EventFlow negotiable?',
    a: 'Our listed prices are transparent and verified directly by venue owners. Many venues offer special package discounts for weekday events or seasonal bookings.'
  },
  {
    q: 'What is the cancellation policy?',
    a: 'Each venue sets its own cancellation policy (Flexible, Moderate, or Strict). The specific policy is clearly displayed on the venue details page prior to booking.'
  },
  {
    q: 'Can I visit the venue before making a payment?',
    a: 'Yes! You can request a site visit directly through the venue details page or contact the venue owner via our messaging feature.'
  }
];

const REVIEWS = [
  {
    name: 'Ananya Sharma',
    city: 'Mumbai',
    comment: 'Found our dream wedding venue in less than 15 minutes! The virtual tour and transparent pricing made decision making effortless.',
    rating: 5,
    role: 'Bride'
  },
  {
    name: 'Vikram Malhotra',
    city: 'Delhi',
    comment: 'Booked a corporate convention center for 500+ attendees. Smooth coordination, instant mock invoice, and excellent venue service.',
    rating: 5,
    role: 'Event Manager'
  },
  {
    name: 'Rohan Deshmukh',
    city: 'Pune',
    comment: 'As a venue owner, EventFlow has boosted our booking inquiries by over 300%. The admin dashboard is super clean and intuitive.',
    rating: 5,
    role: 'Venue Owner'
  }
];

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const featuredVenues = useSelector(selectFeaturedVenues);
  const featuredStatus = useSelector(selectFeaturedStatus);

  // Search state
  const [searchCity, setSearchCity] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchCapacity, setSearchCapacity] = useState('');

  // Active FAQ accordion state
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    dispatch(fetchFeaturedVenues());
  }, [dispatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    if (searchCategory) params.set('category', searchCategory);
    if (searchCapacity) params.set('capacity', searchCapacity);

    navigate(`/venues?${params.toString()}`);
  };

  const displayVenues = featuredVenues.length > 0 ? featuredVenues : DEMO_FEATURED;

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* ============================================================ */}
      {/* HERO SECTION                                                 */}
      {/* ============================================================ */}
      <section style={{
        position: 'relative',
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-24)',
        background: 'linear-gradient(180deg, var(--bg-subtle) 0%, var(--bg-base) 100%)',
        overflow: 'hidden',
      }}>
        {/* Subtle decorative glow */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(255, 90, 54, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Badge Pill */}
          <div className="animate-fade-in-down" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: '6px 16px', borderRadius: 'var(--radius-full)', background: 'var(--brand-subtle)', border: '1px solid rgba(255, 90, 54, 0.2)', marginBottom: 'var(--space-6)' }}>
            <Sparkles size={14} style={{ color: 'var(--brand-default)' }} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--brand-default)', letterSpacing: '0.02em' }}>
              #1 Venue & Banquet Marketplace
            </span>
          </div>

          {/* Hero Headline */}
          <h1 className="animate-fade-in-up" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, maxWidth: 900, margin: '0 auto var(--space-6) auto', fontFamily: 'var(--font-display)' }}>
            Discover & Book Extraordinary Event Spaces
          </h1>

          <p className="animate-fade-in-up delay-100" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', maxWidth: 680, margin: '0 auto var(--space-12) auto', lineHeight: 1.6 }}>
            Browse curated banquet halls, marriage lawns, resorts, and corporate convention centers with verified pricing and instant availability.
          </p>

          {/* ============================================================ */}
          {/* ADVANCED SEARCH BAR CARD                                     */}
          {/* ============================================================ */}
          <div className="card glass animate-scale-in delay-200" style={{ maxWidth: 1000, margin: '0 auto', padding: 'var(--space-4)', borderRadius: 'var(--radius-3xl)', boxShadow: 'var(--shadow-2xl)' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', alignItems: 'center' }}>

              {/* City Selection */}
              <div style={{ background: 'var(--surface-1)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                  <MapPin size={14} style={{ color: 'var(--brand-default)' }} /> City
                </label>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <option value="">All Cities</option>
                  {POPULAR_CITIES.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Venue Category */}
              <div style={{ background: 'var(--surface-1)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                  <Building2 size={14} style={{ color: 'var(--brand-default)' }} /> Category
                </label>
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <option value="">All Categories</option>
                  {VENUE_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Guests Capacity */}
              <div style={{ background: 'var(--surface-1)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                  <Users size={14} style={{ color: 'var(--brand-default)' }} /> Expected Guests
                </label>
                <select
                  value={searchCapacity}
                  onChange={(e) => setSearchCapacity(e.target.value)}
                  style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <option value="">Any Capacity</option>
                  <option value="100">Up to 100 Guests</option>
                  <option value="300">100 - 300 Guests</option>
                  <option value="500">300 - 500 Guests</option>
                  <option value="1000">500+ Guests</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ height: '100%', minHeight: 54, borderRadius: 'var(--radius-xl)', fontSize: 'var(--text-base)', fontWeight: 700, gap: 'var(--space-2)' }}
              >
                <Search size={18} />
                Search Venues
              </button>

            </form>
          </div>

          {/* Live Stats Row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-12)', marginTop: 'var(--space-16)', flexWrap: 'wrap' }}>
            {[
              { count: '2,500+', label: 'Verified Venues' },
              { count: '50,000+', label: 'Events Hosted' },
              { count: '100+', label: 'Cities Covered' },
              { count: '4.8 ★', label: 'Customer Rating' }
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--brand-default)', fontFamily: 'var(--font-display)' }}>{stat.count}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CATEGORIES GRID                                              */}
      {/* ============================================================ */}
      <section style={{ padding: 'var(--space-16) 0', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-10)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>Explore by Venue Type</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>Find spaces customized for your specific event needs</p>
            </div>
            <Link to="/venues" className="btn btn-ghost" style={{ gap: 'var(--space-1)', color: 'var(--brand-default)', fontWeight: 600 }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            {VENUE_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/venues?category=${cat.id}`}
                className="card"
                style={{
                  padding: 'var(--space-6)',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-xl)', background: 'var(--brand-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-default)' }}>
                  <Building2 size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>{cat.label}</h3>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Browse spaces →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURED VENUES                                              */}
      {/* ============================================================ */}
      <section style={{ padding: 'var(--space-20) 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-10)' }}>
            <div>
              <div style={{ color: 'var(--brand-default)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-1)' }}>Handpicked Selections</div>
              <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>Featured Venues</h2>
            </div>
            <Link to="/venues" className="btn btn-secondary" style={{ gap: 'var(--space-2)' }}>
              Explore All Venues <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
            {displayVenues.slice(0, 8).map((venue) => (
              <VenueCard key={venue._id} venue={venue} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* POPULAR CITIES                                               */}
      {/* ============================================================ */}
      <section style={{ padding: 'var(--space-16) 0', background: 'var(--bg-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto var(--space-12) auto' }}>
            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Popular Destinations</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Find top-rated venues across India’s leading celebration hubs</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-5)' }}>
            {POPULAR_CITIES.map((city) => (
              <Link
                key={city.id}
                to={`/venues?city=${city.name}`}
                className="card"
                style={{
                  padding: 'var(--space-6)',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-2xl)',
                  background: 'var(--surface-1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--brand-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-default)', fontWeight: 800 }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>{city.name}</h3>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{city.state}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* WHY CHOOSE US                                                */}
      {/* ============================================================ */}
      <section style={{ padding: 'var(--space-20) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto var(--space-16) auto' }}>
            <div style={{ color: 'var(--brand-default)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-1)' }}>Why EventFlow</div>
            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>Built for Seamless Event Planning</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-8)' }}>
            {[
              { icon: Shield, title: '100% Verified Venues', desc: 'Every venue undergoes rigorous physical and legal verification before listing.' },
              { icon: DollarSign, title: 'Transparent Pricing', desc: 'No hidden charges or surprise costs. What you see is exactly what you pay.' },
              { icon: Clock, title: 'Instant Availability', desc: 'Real-time calendar updates eliminate double-bookings and endless phone calls.' },
              { icon: Award, title: 'Best Price Guarantee', desc: 'Direct owner rates ensuring you get maximum value for your celebration.' }
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)', textAlign: 'left' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 'var(--radius-xl)', background: 'var(--brand-subtle)', color: 'var(--brand-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
                     <IconComp size={24} />
                  </div>
                  <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>{item.title}</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CUSTOMER REVIEWS                                             */}
      {/* ============================================================ */}
      <section style={{ padding: 'var(--space-20) 0', background: 'var(--bg-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto var(--space-12) auto' }}>
            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>Loved by Hosts & Event Organizers</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>Read genuine stories from users who found their perfect venues</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            {REVIEWS.map((rev, i) => (
              <div key={i} className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
                <div style={{ display: 'flex', gap: 4, color: 'var(--color-warning-500)', marginBottom: 'var(--space-4)' }}>
                  {[...Array(rev.rating)].map((_, r) => <Star key={r} size={16} fill="currentColor" />)}
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
                  "{rev.comment}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'auto' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--brand-default)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {rev.name[0]}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{rev.name}</h4>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{rev.role} • {rev.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FAQ SECTION                                                  */}
      {/* ============================================================ */}
      <section style={{ padding: 'var(--space-20) 0' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>Frequently Asked Questions</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>Everything you need to know about booking with EventFlow</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="card"
                style={{ cursor: 'pointer', overflow: 'hidden', transition: 'all var(--transition-fast)' }}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <div style={{ padding: 'var(--space-5) var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                  <span>{faq.q}</span>
                  <ChevronRight size={18} style={{ transform: openFaq === idx ? 'rotate(90deg)' : 'none', transition: 'transform var(--transition-fast)', color: 'var(--brand-default)' }} />
                </div>

                {openFaq === idx && (
                  <div style={{ padding: '0 var(--space-6) var(--space-5) var(--space-6)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA BANNER                                                   */}
      {/* ============================================================ */}
      <section style={{ padding: 'var(--space-16) 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, #1a1a18 0%, #2d1810 100%)',
            borderRadius: 'var(--radius-3xl)',
            padding: 'var(--space-16) var(--space-8)',
            textAlign: 'center',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 800, color: '#fff', marginBottom: 'var(--space-4)' }}>
              Are You a Venue Owner?
            </h2>
            <p style={{ fontSize: 'var(--text-lg)', color: 'rgba(255, 255, 255, 0.7)', maxWidth: 600, margin: '0 auto var(--space-8) auto' }}>
              List your banquet hall or event space on India's fastest-growing venue marketplace and double your booking inquiries today.
            </p>
            <Link to="/auth/register" className="btn btn-primary btn-xl" style={{ fontWeight: 700 }}>
              List Your Venue For Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
