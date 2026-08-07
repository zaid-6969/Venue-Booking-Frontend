/**
 * FAQPage Component
 *
 * Frequently Asked Questions accordion view
 */

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'How do I book a banquet hall on VenueHub?',
    a: 'Simply search for venues by city or category, view package details, choose your date on the booking calendar, select optional add-ons, and proceed to checkout.',
  },
  {
    q: 'Can I visit the venue before making a payment?',
    a: 'Yes! Every venue detail page includes direct contact options and virtual site tours. You can schedule a physical site visit before finalizing your booking.',
  },
  {
    q: 'What is VenueHub\'s cancellation policy?',
    a: 'Venues on our platform use standardized cancellation policies (Flexible, Moderate, Strict). Cancellation refund terms are clearly specified on each venue details page.',
  },
  {
    q: 'How can venue owners list their properties?',
    a: 'Click "List Your Venue" in the header navigation, create an Owner account, and complete our simple venue submission form with photos, pricing, and amenities.',
  },
];

const FAQPage = () => {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-20)', maxWidth: 840 }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          Frequently Asked Questions
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', marginTop: 'var(--space-3)' }}>
          Got questions? We've got answers. Everything you need to know about venue booking on VenueHub.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {FAQS.map((item, idx) => (
          <div key={idx} className="card" style={{ background: 'var(--surface-1)', padding: 0, overflow: 'hidden' }}>
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              style={{
                width: '100%',
                padding: 'var(--space-5) var(--space-6)',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>{item.q}</span>
              <ChevronDown size={20} style={{ transform: openIdx === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-tertiary)' }} />
            </button>
            {openIdx === idx && (
              <div style={{ padding: '0 var(--space-6) var(--space-6)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;
