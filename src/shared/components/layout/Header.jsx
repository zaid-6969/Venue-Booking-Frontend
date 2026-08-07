/**
 * Header — Main navigation for all public pages
 * Features: Logo, Nav links, Search, Wishlist, Compare, Auth, Theme toggle
 */
import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Search,
  Heart,
  GitCompare,
  Bell,
  User,
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown,
  Building2,
  LogOut,
  LayoutDashboard,
} from 'lucide-react'
import {
  selectIsAuthenticated,
  selectCurrentUser,
  selectUserRole,
} from '@features/auth/redux/authSlice'
import { selectWishlistItems } from '@features/wishlist/redux/wishlistSlice'
import { selectCompareCount } from '@features/compare/redux/compareSlice'
import { selectUnreadCount, fetchNotifications } from '@features/notifications/redux/notificationsSlice'
import { selectTheme, toggleTheme } from '@store/slices/uiSlice'
import { logoutUser } from '@features/auth/redux/authThunks'
import { APP_NAME } from '@constants/index'

const ROLE_DASHBOARD = {
  admin: '/admin/dashboard',
  owner: '/owner/dashboard',
  customer: '/dashboard',
}

const NAV_LINKS = [
  { label: 'Venues', path: '/venues' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const profileRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const role = useSelector(selectUserRole)
  const theme = useSelector(selectTheme)
  const wishlistItems = useSelector(selectWishlistItems)
  const compareCount = useSelector(selectCompareCount)
  const notifCount = useSelector(selectUnreadCount)

  // Fetch & Poll notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications())
      const timer = setInterval(() => dispatch(fetchNotifications()), 30000)
      return () => clearInterval(timer)
    }
  }, [isAuthenticated, dispatch])

  // Scroll effect
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsMobileOpen(false)
    }
  }

  const handleLogout = async () => {
    setIsProfileOpen(false)
    await dispatch(logoutUser())
    navigate('/')
  }

  const headerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    // Keep header above everything
    zIndex: 99,
    height: '76px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all var(--transition-normal)',
    background: isScrolled ? 'rgba(255,255,255,0.92)' : 'var(--surface-1)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    borderBottom: '1px solid var(--border-subtle)',
    boxShadow: isScrolled ? '0 8px 30px rgba(16,24,40,.08)' : 'none',
  }

  return (
    <>
      <header style={headerStyle}>
        <div
          className="container header-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '32px',
            height: '100%',
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--brand-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '15px',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              V
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: 'var(--text-xl)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
              }}
            >
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}
            className="desktop-nav"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                style={({ isActive }) => ({
                  padding: 'var(--space-2) var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--brand-default)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--brand-subtle)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            style={{
              flex: 1,
              maxWidth: 480,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-normal)',
              borderRadius: 'var(--radius-full)',
              padding: 'var(--space-2) var(--space-4)',
              cursor: 'text',
              transition: 'all var(--transition-fast)',
            }}
            className="desktop-search"
          >
            <Search size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search venues, cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </form>

          {/* Right Actions */}
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '14px',
              minWidth: 'auto',
              flexShrink: 0,
            }}
          >
            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              aria-label="Toggle theme"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border-normal)',
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-3)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = 'var(--brand-default)'
                e.currentTarget.style.color = 'var(--brand-default)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface-2)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'var(--border-normal)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Compare */}
            <Link
              to="/compare"
              style={{ position: 'relative', textDecoration: 'none' }}
              className="desktop-actions"
            >
              <button className="btn btn-ghost btn-sm" title="Compare venues">
                <GitCompare size={18} />
                {compareCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      background: 'var(--brand-default)',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {compareCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Wishlist */}
            <Link
              to={isAuthenticated ? '/dashboard/wishlist' : '/auth/login'}
              style={{ position: 'relative', textDecoration: 'none' }}
              className="desktop-actions"
            >
              <button className="btn btn-ghost btn-sm" title="Wishlist">
                <Heart size={18} />
                {wishlistItems.length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      background: 'var(--color-error-500)',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {wishlistItems.length}
                  </span>
                )}
              </button>
            </Link>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div ref={profileRef} style={{ position: 'relative', display: 'flex' }}>
                {/* Notifications */}
                <Link
                  to="/dashboard/notifications"
                  style={{
                    position: 'relative',
                    textDecoration: 'none',
                    marginRight: 'var(--space-1)',
                  }}
                  className="desktop-actions"
                >
                  <button className="btn btn-ghost btn-sm" title="Notifications">
                    <Bell size={18} />
                    {notifCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          background: 'var(--color-error-500)',
                          color: '#fff',
                          borderRadius: '50%',
                          width: 18,
                          height: 18,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {notifCount > 9 ? '9+' : notifCount}
                      </span>
                    )}
                  </button>
                </Link>

                {/* Profile Button */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    height: '46px',
                    padding: '0 18px 0 8px',
                    borderRadius: '999px',
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border-normal)',
                    boxShadow: '0 1px 2px rgba(16,24,40,.04)',
                    transition: 'all .2s ease',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--brand-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      maxWidth: '120px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    style={{
                      color: 'var(--text-tertiary)',
                      transform: isProfileOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform var(--transition-fast)',
                    }}
                  />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      background: 'var(--surface-1)',
                      border: '1px solid var(--border-normal)',
                      borderRadius: 'var(--radius-xl)',
                      boxShadow: 'var(--shadow-xl)',
                      minWidth: 200,
                      overflow: 'hidden',
                      animation: 'scaleIn 0.15s ease both',
                      transformOrigin: 'top right',
                      zIndex: 'var(--z-dropdown)',
                    }}
                  >
                    <div
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {user?.name}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        {user?.email}
                      </div>
                    </div>
                    <div style={{ padding: 'var(--space-2)' }}>
                      <Link
                        to={ROLE_DASHBOARD[role] || '/dashboard'}
                        onClick={() => setIsProfileOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          padding: 'var(--space-2) var(--space-4)',
                          borderRadius: 'var(--radius-lg)',
                          textDecoration: 'none',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>

                      <Link
                        to="/owner/venues"
                        onClick={() => setIsProfileOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          padding: 'var(--space-2) var(--space-4)',
                          borderRadius: 'var(--radius-lg)',
                          textDecoration: 'none',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <Building2 size={15} /> My Venues
                      </Link>

                      <Link
                        to="/owner/bookings"
                        onClick={() => setIsProfileOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          padding: 'var(--space-2) var(--space-4)',
                          borderRadius: 'var(--radius-lg)',
                          textDecoration: 'none',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <Bell size={15} /> Venue Requests
                      </Link>

                      <Link
                        to="/dashboard/bookings"
                        onClick={() => setIsProfileOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          padding: 'var(--space-2) var(--space-4)',
                          borderRadius: 'var(--radius-lg)',
                          textDecoration: 'none',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <User size={15} /> My Reservations
                      </Link>

                      <div
                        style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }}
                      />

                      <button
                        onClick={handleLogout}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          width: '100%',
                          padding: 'var(--space-2) var(--space-4)',
                          borderRadius: 'var(--radius-lg)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-error-500)',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                className="desktop-auth"
              >
                <Link to="/auth/login" className="btn btn-secondary btn-sm">
                  Login
                </Link>
                <Link to="/auth/register" className="btn btn-primary btn-sm">
                  List Your Venue
                </Link>
              </div>
            )}

            {/* Mobile menu toggle — visibility controlled purely by CSS media query below */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="btn btn-ghost btn-sm mobile-menu-btn"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            background: 'var(--surface-1)',
            borderBottom: '1px solid var(--border-normal)',
            padding: 'var(--space-4)',
            zIndex: 'calc(var(--z-fixed) - 1)',
            boxShadow: 'var(--shadow-lg)',
            animation: 'fadeInDown 0.2s ease both',
          }}
        >
          {/* Mobile Search */}
          <form
            onSubmit={handleSearch}
            style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}
          >
            <input
              className="input"
              type="text"
              placeholder="Search venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <Search size={16} />
            </button>
          </form>

          {/* Mobile Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileOpen(false)}
                style={({ isActive }) => ({
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  color: isActive ? 'var(--brand-default)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--brand-subtle)' : 'transparent',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Auth */}
          {!isAuthenticated && (
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <Link
                to="/auth/login"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setIsMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => setIsMobileOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
      .header-container{
       width:100%;
       max-width:1440px;
       margin:0 auto;
       padding:0 24px;
}

@media (max-width:1280px){

.header-container{

padding:0 16px;

}

}
  .mobile-menu-btn{
      display:none;
  }

  @media (max-width:1023px){

      .desktop-nav,
      .desktop-search,
      .desktop-actions,
      .desktop-auth{
          display:none !important;
      }

      .mobile-menu-btn{
          display:flex !important;
          align-items:center;
          justify-content:center;
      }

  }

  @media (min-width:1024px){

      .desktop-nav,
      .desktop-search,
      .desktop-actions,
      .desktop-auth{
          display:flex !important;
      }

      .mobile-menu-btn{
          display:none !important;
      }
  }
`}</style>
    </>
  )
}

export default Header