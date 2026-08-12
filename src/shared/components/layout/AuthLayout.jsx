/**
 * AuthLayout — Split-Screen Responsive Layout for Authentication Pages
 *
 * Left side: Brand hero banner with background image, features, and live statistics.
 * Right side: Centered form area with theme toggle, login/register forms, and trust badges.
 * Fit to screen: Fixed 100vh height with no scrollbar overflow on desktop.
 * Mobile: Hides left hero panel on small devices (<960px) for clean mobile UX.
 */

import { Outlet, Navigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from '@features/auth/redux/authSlice';
import { selectTheme, toggleTheme } from '@store/slices/uiSlice';
import { ShieldCheck, Tag, Headphones, Building2, Users, Star, Sun, Moon } from 'lucide-react';
import { APP_NAME } from '@constants/index';

const ROLE_HOME = {
  admin:    '/admin/dashboard',
  owner:    '/owner/dashboard',
  customer: '/dashboard',
};

const AuthLayout = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);
  const theme = useSelector(selectTheme);

  // Redirect already authenticated users
  if (isAuthenticated) {
    return <Navigate to={ROLE_HOME[role] || '/'} replace />;
  }

  return (
    <div style={{
      height: '100vh',
      maxHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--bg-base)',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden',
    }} className="auth-layout-container">

      {/* ============================================================ */}
      {/* LEFT PANEL — BRAND HERO & VISUALS                             */}
      {/* ============================================================ */}
      <div
        className="auth-hero-panel"
        style={{
          height: '100vh',
          maxHeight: '100vh',
          boxSizing: 'border-box',
          position: 'relative',
          background: `linear-gradient(180deg, rgba(16, 12, 42, 0.84) 0%, rgba(12, 8, 32, 0.94) 100%), url('/login-bg.png'), url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '32px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Top Header: Logo */}
        <div style={{ zIndex: 2 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#6344f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: 18,
              fontFamily: 'var(--font-display)',
              boxShadow: '0 6px 16px rgba(99, 68, 245, 0.4)',
            }}>
              {APP_NAME.charAt(0)}
            </div>
            <span style={{ color: '#ffffff', fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
              {APP_NAME}
            </span>
          </Link>
        </div>

        {/* Center Content: Headline & Subtitle */}
        <div style={{ zIndex: 2, maxWidth: 480, margin: '20px 0' }}>
          {/* Trust Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 14px',
            borderRadius: 999,
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: 12,
            fontWeight: 600,
            color: '#e2e8f0',
            marginBottom: 16,
          }}>
            <ShieldCheck size={14} style={{ color: '#818cf8' }} />
            <span>India's Most Trusted Venue Marketplace</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: '2.35rem',
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            marginBottom: 12,
            fontFamily: 'var(--font-display)',
          }}>
            The perfect venue for{' '}
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              every occasion
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '0.95rem',
            color: '#94a3b8',
            lineHeight: 1.5,
            marginBottom: 24,
            fontWeight: 400,
          }}>
            Explore verified venues for weddings, corporate events, parties and more — all in one place.
          </p>

          {/* Feature Badges Row */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={16} style={{ color: '#818cf8' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>Verified Venues</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>100% Trusted</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Tag size={16} style={{ color: '#c084fc' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>Best Prices</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Great Deals</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Headphones size={16} style={{ color: '#38bdf8' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>24/7 Support</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>We're here for you</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Floating Glass Stats Bar */}
        <div style={{
          zIndex: 2,
          background: 'rgba(255, 255, 255, 0.07)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 16,
          padding: '14px 18px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
          textAlign: 'center',
        }}>
          <div style={{ borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: 8 }}>
            <Building2 size={18} style={{ color: '#a78bfa', margin: '0 auto 4px auto' }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>2,400+</div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Venues Listed</div>
          </div>

          <div style={{ borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: 8 }}>
            <Users size={18} style={{ color: '#818cf8', margin: '0 auto 4px auto' }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>50K+</div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Happy Customers</div>
          </div>

          <div>
            <Star size={18} style={{ color: '#fbbf24', margin: '0 auto 4px auto' }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>4.8</div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Average Rating</div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT PANEL — FORM CONTAINER & THEME TOGGLE                   */}
      {/* ============================================================ */}
      <div
        className="auth-form-panel"
        style={{
          height: '100vh',
          maxHeight: '100vh',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 36px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Top Header Controls (Theme Toggle) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <button
            onClick={() => dispatch(toggleTheme())}
            className="btn btn-secondary btn-sm"
            style={{
              borderRadius: 999,
              gap: 6,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 600,
              background: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            {theme === 'light' ? <Sun size={14} /> : <Moon size={14} />}
            <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        {/* Form Content Wrapper */}
        <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Outlet />
        </div>

        {/* Bottom Trust Badges */}
        <div style={{
          display: 'flex',
          justify: 'center',
          gap: 20,
          flexWrap: 'wrap',
          paddingTop: 10,
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={16} style={{ color: 'var(--brand-default)' }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>Secure & Safe</div>
              <div style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>Your data is protected</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Star size={16} style={{ color: '#f59e0b' }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>Simple Booking</div>
              <div style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>Quick & hassle-free</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Building2 size={16} style={{ color: '#10b981' }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>Instant Confirmation</div>
              <div style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>Book and relax</div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RESPONSIVE MEDIA QUERIES                                     */}
      {/* ============================================================ */}
      <style>{`
        @media (max-width: 960px) {
          .auth-layout-container {
            grid-template-columns: 1fr !important;
            height: auto !important;
            max-height: none !important;
            overflow-y: auto !important;
          }
          .auth-hero-panel {
            display: none !important;
          }
          .auth-form-panel {
            padding: 24px 16px !important;
            justifyContent: center !important;
            height: auto !important;
            min-height: 100vh;
            max-height: none !important;
            overflow-y: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;
