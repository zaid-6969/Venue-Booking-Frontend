/**
 * Footer — Professional site footer
 */
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Link2, MessageCircle, Users2, Briefcase } from 'lucide-react';
import { APP_NAME } from '@constants/index';

const FOOTER_LINKS = {
  Venues: [
    { label: 'Browse All Venues', path: '/venues' },
    { label: 'Banquet Halls', path: '/venues?category=banquet-hall' },
    { label: 'Marriage Halls', path: '/venues?category=marriage-hall' },
    { label: 'Corporate Venues', path: '/venues?category=corporate' },
    { label: 'Outdoor Lawns', path: '/venues?category=lawn' },
  ],
  Company: [
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'FAQ', path: '/faq' },
    { label: 'List Your Venue', path: '/auth/register' },
  ],
  Legal: [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Cookie Policy', path: '/privacy#cookies' },
    { label: 'Refund Policy', path: '/terms#refunds' },
  ],
};

const SOCIAL_LINKS = [
  { icon: Link2,          href: '#', label: 'Instagram' },
  { icon: MessageCircle,  href: '#', label: 'Twitter' },
  { icon: Users2,         href: '#', label: 'Facebook' },
  { icon: Briefcase,      href: '#', label: 'LinkedIn' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: 'var(--color-neutral-950)',
      color: 'rgba(255,255,255,0.55)',
      paddingTop: 'var(--space-16)',
    }}>
      <div className="container">
        {/* Top Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 'var(--space-10)',
          paddingBottom: 'var(--space-12)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }} className="footer-grid">
          {/* Brand Column */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', textDecoration: 'none', marginBottom: 'var(--space-5)' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-lg)',
                background: 'var(--brand-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 'var(--text-lg)',
                fontFamily: 'var(--font-display)',
              }}>V</div>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 'var(--text-xl)', fontFamily: 'var(--font-display)' }}>
                {APP_NAME}
              </span>
            </Link>
            <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.8, marginBottom: 'var(--space-6)', maxWidth: 300, color: 'rgba(255,255,255,0.45)' }}>
              India's premier venue marketplace for weddings, corporate events, and celebrations. Discover and book the perfect space.
            </p>

            {/* Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { icon: Mail,    text: 'support@venuehub.in' },
                { icon: Phone,   text: '+91 98765 43210' },
                { icon: MapPin,  text: 'Mumbai, Maharashtra, India' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                  <Icon size={15} style={{ color: 'var(--brand-default)', flexShrink: 0 }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {category}
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      style={{
                        color: 'rgba(255,255,255,0.5)',
                        textDecoration: 'none',
                        fontSize: 'var(--text-sm)',
                        transition: 'color var(--transition-fast)',
                      }}
                      onMouseOver={e => e.target.style.color = '#fff'}
                      onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-6) 0',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
        }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.3)' }}>
            © {currentYear} {APP_NAME}. All rights reserved. Made with ♥ in India.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'var(--brand-default)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--brand-default)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
