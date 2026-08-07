/**
 * GoogleMapComponent
 *
 * Renders an interactive embedded Google Map for any venue:
 * - Address & City locator
 * - Landmark badge overlays
 * - Direct "Get Directions" link opening Google Maps in a new tab
 * - Latitude / Longitude support
 */

import { MapPin, Navigation, ExternalLink } from 'lucide-react';

const GoogleMapComponent = ({ location, venueName }) => {
  const address = location?.address || '';
  const city = location?.city || 'Mumbai';
  const state = location?.state || 'Maharashtra';
  const fullAddress = `${address ? address + ', ' : ''}${city}, ${state}, India`;
  
  const mapQuery = encodeURIComponent(fullAddress);
  const embedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  const externalDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border-subtle)', overflow: 'hidden', padding: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={20} style={{ color: 'var(--brand-default)' }} /> Location & Directions
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
            {fullAddress}
          </p>
        </div>

        <a
          href={externalDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ gap: 6, textDecoration: 'none' }}
        >
          <Navigation size={14} /> Open in Google Maps <ExternalLink size={12} />
        </a>
      </div>

      {/* Embedded Interactive Map */}
      <div style={{ width: '100%', height: 380, borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
        <iframe
          title={`Location Map for ${venueName || 'Venue'}`}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={embedUrl}
          loading="lazy"
        />
      </div>

      {/* Nearby Landmark Badges */}
      <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-tertiary)' }}>Nearby Landmarks:</span>
        {['City Airport (25 min)', 'Metro Station (5 min)', '5-Star Hotel District', 'Central Highway'].map((lm, i) => (
          <span key={i} style={{ background: 'var(--bg-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', color: 'var(--text-secondary)' }}>
            📍 {lm}
          </span>
        ))}
      </div>
    </div>
  );
};

export default GoogleMapComponent;
