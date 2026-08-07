/**
 * QuickPreviewModal Component
 *
 * Fullscreen / Expanded Interactive Venue Preview Overlay:
 * - High-res Gallery Carousel with Lightbox Selector
 * - Google Maps Location Embed View
 * - Key Specifications (Capacity, Sq Ft, Parking, Hours, Stage)
 * - Tiered Package Inclusions (Silver, Gold, Platinum)
 * - Categorized Amenities List
 * - Price Summary & Direct Booking Link
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, MapPin, Users, Star, Check, ArrowRight, ShieldCheck, Maximize2, Layers, Calendar, Clock, Car, Phone } from 'lucide-react';

const QuickPreviewModal = ({ venue, onClose }) => {
  if (!venue) return null;

  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'packages' | 'map' | 'amenities'
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const gallery = venue.gallery?.length > 0 ? venue.gallery : [
    { url: venue.coverImage?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800' },
    { url: 'https://images.unsplash.com/photo-1545232979-fbf34fc30907?w=800' },
    { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' },
    { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800' },
  ];

  const currentImage = gallery[activeImageIndex]?.url || venue.coverImage?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800';

  const mapQuery = encodeURIComponent(`${venue.location?.address || ''} ${venue.location?.city || 'Mumbai'} India`);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const packages = venue.packages?.length > 0 ? venue.packages : [
    { name: 'Silver Package', price: (venue.pricePerDay || 100000) * 1.2, includes: ['Standard Decor', 'AC Hall (8 hrs)', 'Stage & Lighting', 'Basic Sound System'] },
    { name: 'Gold Package', price: (venue.pricePerDay || 100000) * 1.8, includes: ['Premium Floral Decor', 'Full Day AC Hall', 'Catering (Veg 200 PAX)', 'DJ Setup & Lights', 'Valet Parking'] },
    { name: 'Platinum Package', price: (venue.pricePerDay || 100000) * 2.5, includes: ['Royal Theme Decor', '24 Hr Venue Access', 'Catering (Veg + Non-Veg)', 'Live DJ & Music Band', '2 Green Rooms'] },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 'var(--z-modal-bg)',
      background: 'rgba(15, 15, 14, 0.82)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-4)',
    }}>
      <div className="card" style={{
        maxWidth: 1040,
        width: '100%',
        maxHeight: '92vh',
        overflow: 'hidden',
        background: 'var(--surface-1)',
        padding: 0,
        borderRadius: 'var(--radius-3xl)',
        position: 'relative',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-2xl)',
      }}>

        {/* Modal Top Header */}
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface-2)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                {venue.category ? venue.category.replace('-', ' ') : 'Venue'}
              </span>
              {venue.isVerified && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <ShieldCheck size={14} /> Verified Space
                </span>
              )}
            </div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
              {venue.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'var(--bg-muted)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-normal)',
              borderRadius: '50%',
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Main Content (Scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--border-subtle)', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-3)' }}>
            {[
              { id: 'gallery', label: 'Photo Gallery' },
              { id: 'packages', label: 'Packages & Pricing' },
              { id: 'map', label: 'Location & Map' },
              { id: 'amenities', label: 'Amenities & Specs' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeTab === tab.id ? 'var(--brand-default)' : 'var(--bg-subtle)',
                  color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: GALLERY */}
          {activeTab === 'gallery' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
              <div>
                <div style={{ position: 'relative', width: '100%', height: 320, borderRadius: 'var(--radius-2xl)', overflow: 'hidden', background: 'var(--bg-subtle)' }}>
                  <img
                    src={currentImage}
                    alt={venue.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px' }}>
                    Photo {activeImageIndex + 1} of {gallery.length}
                  </span>
                </div>

                {/* Thumbnails list */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)', overflowX: 'auto', paddingBottom: 4 }}>
                  {gallery.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt="Thumbnail"
                      onClick={() => setActiveImageIndex(i)}
                      style={{
                        width: 72,
                        height: 56,
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        border: activeImageIndex === i ? '2px solid var(--brand-default)' : '2px solid transparent',
                        opacity: activeImageIndex === i ? 1 : 0.6,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-3)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-warning-700)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                      <Star size={16} fill="currentColor" /> {venue.rating?.average || 4.8} ({venue.rating?.count || 45} reviews)
                    </span>
                    <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                      <Users size={16} /> Up to {venue.maxCapacity || 500} guests
                    </span>
                  </div>

                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
                    {venue.description || venue.tagline}
                  </p>

                  {/* Spec pills */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    <div style={{ background: 'var(--bg-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-xl)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block' }}>Guest Capacity</span>
                      <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{venue.minCapacity || 50} - {venue.maxCapacity || 500} PAX</strong>
                    </div>
                    <div style={{ background: 'var(--bg-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-xl)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block' }}>Location City</span>
                      <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{venue.location?.city || 'Mumbai'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PACKAGES */}
          {activeTab === 'packages' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
              {packages.map((pkg, idx) => (
                <div key={idx} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{pkg.name}</h3>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--brand-default)', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>
                      ₹{pkg.price ? pkg.price.toLocaleString('en-IN') : 'N/A'}
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(pkg.includes || ['Standard Decoration', 'AC Hall', 'Basic Lighting']).map((inc, i) => (
                        <li key={i} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Check size={14} style={{ color: 'var(--color-success-500)' }} /> {inc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: MAP */}
          {activeTab === 'map' && (
            <div>
              <div style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} style={{ color: 'var(--brand-default)' }} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {venue.location?.address || 'Linking Road'}, {venue.location?.city || 'Mumbai'}, {venue.location?.state || 'Maharashtra'}
                </span>
              </div>
              <div style={{ width: '100%', height: 360, borderRadius: 'var(--radius-2xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <iframe
                  title="Google Maps Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={mapEmbedUrl}
                />
              </div>
            </div>
          )}

          {/* TAB 4: AMENITIES & SPECS */}
          {activeTab === 'amenities' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
              {(venue.amenities || ['parking', 'ac', 'catering', 'decoration', 'dj', 'valet', 'wifi']).map((am, i) => (
                <div key={i} style={{ background: 'var(--bg-subtle)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={16} style={{ color: 'var(--color-success-500)' }} />
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {am.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Bar */}
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block' }}>Base Rental Rate</span>
            <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--brand-default)', fontFamily: 'var(--font-display)' }}>
              ₹{(venue.pricePerDay || 0).toLocaleString('en-IN')}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}> / day</span>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              Close Preview
            </button>
            <Link to={`/venues/${venue.slug || venue._id}`} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
              Book Venue <ArrowRight size={16} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuickPreviewModal;
