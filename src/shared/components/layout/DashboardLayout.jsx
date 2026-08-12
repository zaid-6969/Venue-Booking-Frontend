/**
 * DashboardLayout — Shared layout for Customer/Owner/Admin panels
 * Left sidebar + top header + content area
 */
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, CalendarCheck, Heart, Star, Bell, User,
  FileText, Building2, Calendar, Settings, Users, BarChart3,
  LogOut, Menu, X, ChevronRight, Shield, Home, Plus, CreditCard,
  XCircle, UserX
} from 'lucide-react';
import { logoutUser } from '@features/auth/redux/authThunks';
import { selectCurrentUser } from '@features/auth/redux/authSlice';
import { selectUnreadCount as selectNotifCount } from '@features/notifications/redux/notificationsSlice';
import { APP_NAME } from '@constants/index';
import { Link } from 'react-router-dom';
import AdminCommandPalette from '@features/dashboard/admin/components/AdminCommandPalette';

import { selectOwnerBookings } from '@features/bookings/redux/bookingsSlice';

const NAV_CONFIG = {
  customer: [
    { label: 'Dashboard',     path: '/dashboard',               icon: LayoutDashboard },
    { label: 'My Bookings',   path: '/dashboard/bookings',      icon: CalendarCheck },
    { label: 'Payments',      path: '/dashboard/payments',      icon: CreditCard },
    { label: 'Wishlist',      path: '/dashboard/wishlist',      icon: Heart },
    { label: 'My Reviews',    path: '/dashboard/reviews',       icon: Star },
    { label: 'Notifications', path: '/dashboard/notifications', icon: Bell, badge: true },
    { label: 'Invoices',      path: '/dashboard/invoices',      icon: FileText },
    { label: 'Profile',       path: '/dashboard/profile',       icon: User },
  ],
  owner: [
    { label: 'Dashboard',   path: '/owner/dashboard',  icon: LayoutDashboard },
    { label: 'My Venues',   path: '/owner/venues',     icon: Building2 },
    { label: 'Bookings',    path: '/owner/bookings',   icon: CalendarCheck },
    { label: 'Calendar',    path: '/owner/calendar',   icon: Calendar },
    { label: 'Inquiries',   path: '/owner/inquiries',  icon: FileText, dynamicBadge: 'inquiries' },
    { label: 'Reviews',     path: '/owner/reviews',    icon: Star },
    { label: 'Earnings',    path: '/owner/earnings',   icon: CreditCard },
    { label: 'Profile',     path: '/owner/profile',    icon: User },
    { label: 'Settings',    path: '/owner/settings',   icon: Settings },
  ],
  admin: [
    { label: 'Dashboard',        path: '/admin/dashboard',        icon: LayoutDashboard },
    { label: 'Venues',           path: '/admin/venues',           icon: Building2 },
    { label: 'Venue Owners',     path: '/admin/owners',           icon: Shield },
    { label: 'Bookings',         path: '/admin/bookings',         icon: CalendarCheck },
    { label: 'Registered Users', path: '/admin/users',            icon: Users },
    { label: 'Rejected Venues',  path: '/admin/rejected-venues',  icon: XCircle },
    { label: 'Rejected Owners',  path: '/admin/rejected-owners',  icon: UserX },
    { label: 'Analytics',        path: '/admin/analytics',        icon: BarChart3 },
    { label: 'Settings',         path: '/admin/settings',         icon: Settings },
  ],
};

const ROLE_LABELS = { customer: 'Customer', owner: 'Venue Owner', admin: 'Admin' };

const DashboardLayout = ({ role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const user       = useSelector(selectCurrentUser);
  const notifCount = useSelector(selectNotifCount);
  const rawOwnerBookings = useSelector(selectOwnerBookings);
  const pendingInquiries = Array.isArray(rawOwnerBookings) ? rawOwnerBookings.filter(b => b.bookingStatus === 'pending').length : 0;
  const navItems   = NAV_CONFIG[role] || NAV_CONFIG.customer;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  const Sidebar = ({ isMobile = false }) => (
    <aside style={{
      width: isMobile ? '100%' : 260,
      background: 'var(--surface-1)',
      borderRight: isMobile ? 'none' : '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: isMobile ? 'relative' : 'sticky',
      top: 0,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--border-subtle)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#6344f5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontFamily: 'var(--font-display)',
            fontSize: 18,
          }}>{APP_NAME.charAt(0)}</div>
          <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: 18 }}>
            {APP_NAME} <span style={{ color: '#a78bfa', fontSize: 12 }}>✦</span>
          </span>
        </Link>
      </div>

      {/* User Info Card */}
      <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: '#f0ebff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#6344f5', fontWeight: 800,
              fontSize: 'var(--text-base)',
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {user?.name || 'affan'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                {ROLE_LABELS[role]}
              </div>
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>▾</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: 'var(--space-3)' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path + item.label}
              to={item.path}
              end={item.path === '/owner/dashboard' || item.path === '/dashboard' || item.path === '/admin/dashboard'}
              onClick={() => isMobile && setIsSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-xl)',
                textDecoration: 'none',
                marginBottom: 4,
                background: isActive ? '#6344f5' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: 'var(--text-sm)',
                transition: 'all var(--transition-fast)',
                position: 'relative',
              })}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>

              {item.dynamicBadge === 'inquiries' && (
                <span style={{
                  marginLeft: 'auto',
                  background: pendingInquiries > 0 ? '#6344f5' : 'rgba(99, 68, 245, 0.1)',
                  color: pendingInquiries > 0 ? '#ffffff' : '#6344f5',
                  borderRadius: 'var(--radius-full)',
                  padding: '2px 8px',
                  fontSize: 11,
                  fontWeight: 800,
                }}>
                  {pendingInquiries}
                </span>
              )}
              {item.badgeVal && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'rgba(99, 68, 245, 0.15)',
                  color: '#6344f5',
                  borderRadius: 'var(--radius-full)',
                  padding: '2px 8px',
                  fontSize: 11,
                  fontWeight: 800,
                }}>
                  {item.badgeVal}
                </span>
              )}
              {item.badge && notifCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: '#6344f5',
                  color: '#fff',
                  borderRadius: 'var(--radius-full)',
                  padding: '1px 7px',
                  fontSize: 10,
                  fontWeight: 700,
                  minWidth: 20,
                  textAlign: 'center',
                }}>
                  {notifCount > 99 ? '99+' : notifCount}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* {role === 'owner' && (
          <div style={{
            margin: '16px 8px 8px 8px',
            padding: '16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6344f5 0%, #8b5cf6 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(99, 68, 245, 0.25)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>Grow Your Business</div>
            <div style={{ fontSize: 11, opacity: 0.9, lineHeight: 1.3, marginBottom: 12 }}>
              Complete your venue profile to get more bookings
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800
              }}>75%</div>
              <Link to="/owner/profile" style={{
                background: '#ffffff', color: '#6344f5', padding: '6px 12px', borderRadius: 10,
                fontSize: 11, fontWeight: 800, textDecoration: 'none', display: 'inline-block'
              }}>
                Complete Profile →
              </Link>
            </div>
          </div>
        )} */}
      </nav>

      {/* Bottom Actions */}
      <div style={{ padding: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
        <NavLink to="/" style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)',
          textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)',
          marginBottom: 'var(--space-1)',
        }}>
          <Home size={18} />
          Back to Home
        </NavLink>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: '100%',
            padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--color-error-500)', fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-sans)', fontWeight: 500,
          }}
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-subtle)' }}>
      {/* Desktop Sidebar */}
      <div style={{ display: 'none' }} className="desktop-sidebar">
        <Sidebar />
      </div>

      {/* Mobile Overlay Sidebar */}
      {isSidebarOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 'var(--z-modal)',
          display: 'flex',
        }}>
          <div style={{ background: 'rgba(0,0,0,0.5)', flex: 1 }} onClick={() => setIsSidebarOpen(false)} />
          <div style={{ width: 280, boxShadow: 'var(--shadow-2xl)' }}>
            <Sidebar isMobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <header style={{
          background: 'var(--surface-1)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="menu-toggle-btn"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', display: 'flex',
                padding: 4,
              }}
            >
              <Menu size={20} />
            </button>

            {/* Global Search Bar */}
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '6px 14px',
              width: 320,
            }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 13, marginRight: 8 }}>🔍</span>
              <input
                type="text"
                placeholder="Search anything..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                }}
              />
              <kbd style={{
                background: 'var(--surface-1)',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                border: '1px solid var(--border-subtle)',
              }}>
                ⌘K
              </kbd>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {role === 'owner' && (
              <Link
                to="/owner/venues/new"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 12,
                  background: '#f0ebff',
                  color: '#6344f5',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  border: '1px solid #e0d7ff',
                }}
              >
                <span>+</span> Add New Venue
              </Link>
            )}

            {/* Notification Bell */}
            <Link
              to={role === 'owner' ? '/owner/bookings' : '/dashboard/notifications'}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'var(--bg-subtle)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
              }}
            >
              <Bell size={18} />
              {notifCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {notifCount > 9 ? '9+' : notifCount || 4}
                </span>
              )}
            </Link>

            {/* Profile Dropdown Header Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 999, background: 'var(--bg-subtle)' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: '#6344f5', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13,
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                {user?.name || 'affan'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: 'var(--space-6)' }}>
          <Outlet />
        </main>

        {/* Admin Command Palette (Ctrl+K) */}
        {role === 'admin' && <AdminCommandPalette />}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .desktop-sidebar { display: block !important; }
          .menu-toggle-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
