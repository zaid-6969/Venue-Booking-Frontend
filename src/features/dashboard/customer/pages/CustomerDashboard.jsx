/**
 * CustomerDashboard Component
 *
 * Overview dashboard for logged-in customers featuring:
 * - Stat cards: Total Bookings, Active Reservations, Wishlist Count, Reviews Written
 * - Recent Bookings overview table
 * - Quick action shortcuts
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  CalendarCheck, Heart, Star, FileText, Building2, ArrowRight,
  Clock, CheckCircle2, XCircle, ChevronRight
} from 'lucide-react';

import { fetchMyBookings, selectMyBookings, selectBookingStatus } from '@features/bookings/redux/bookingsSlice';
import { selectWishlistItems } from '@features/wishlist/redux/wishlistSlice';
import { fetchMyReviews, selectMyReviews } from '@features/reviews/redux/reviewsSlice';
import { selectCurrentUser } from '@features/auth/redux/authSlice';

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const rawBookings = useSelector(selectMyBookings);
  const rawWishlist = useSelector(selectWishlistItems);
  const rawReviews  = useSelector(selectMyReviews);

  useEffect(() => {
    dispatch(fetchMyBookings());
    dispatch(fetchMyReviews());
  }, [dispatch]);

  const bookingsList = Array.isArray(rawBookings) ? rawBookings : [];
  const wishlistList = Array.isArray(rawWishlist) ? rawWishlist : [];
  const reviewsList  = Array.isArray(rawReviews) ? rawReviews : [];

  const activeBookings = bookingsList.filter(b => b.bookingStatus === 'confirmed' || b.bookingStatus === 'pending');
  const completedBookings = bookingsList.filter(b => b.bookingStatus === 'completed');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

      {/* Welcome Banner */}
      <div className="card glass" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-3xl)', background: 'linear-gradient(135deg, var(--surface-1) 0%, var(--brand-subtle) 100%)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--brand-default)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Customer Portal</span>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginTop: 2, color: 'var(--text-primary)' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Customer'}!
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
              Manage your venue reservations, wishlist, and reviews all in one place.
            </p>
          </div>
          <Link to="/venues" className="btn btn-primary" style={{ gap: 'var(--space-2)' }}>
            <Building2 size={18} /> Browse Venues
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-5)' }}>
        {[
          { label: 'Total Bookings', val: bookingsList.length, icon: CalendarCheck, color: 'var(--brand-default)', bg: 'var(--brand-subtle)' },
          { label: 'Active Reservations', val: activeBookings.length, icon: Clock, color: 'var(--color-info-500)', bg: 'var(--color-info-50)' },
          { label: 'Saved Wishlist', val: wishlistList.length, icon: Heart, color: 'var(--color-error-500)', bg: 'var(--color-error-50)' },
          { label: 'My Reviews', val: reviewsList.length, icon: Star, color: 'var(--color-warning-500)', bg: 'var(--color-warning-50)' },
        ].map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <div key={i} className="card" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-xl)', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconComp size={22} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.val}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings Section */}
      <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>Recent Reservations</h2>
          <Link to="/dashboard/bookings" style={{ fontSize: 'var(--text-sm)', color: 'var(--brand-default)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            View All <ChevronRight size={16} />
          </Link>
        </div>

        {bookingsList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-tertiary)' }}>
            <CalendarCheck size={40} style={{ margin: '0 auto var(--space-3) auto', opacity: 0.5 }} />
            <p style={{ fontSize: 'var(--text-sm)' }}>No reservations found yet.</p>
            <Link to="/venues" className="btn btn-secondary btn-sm" style={{ marginTop: 'var(--space-4)' }}>
              Explore Event Venues
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {bookingsList.slice(0, 3).map((item) => (
              <div
                key={item._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-4)',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)',
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--brand-default)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    {item.bookingReference}
                  </div>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                    {item.venue?.name || 'Event Hall'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    Event Date: {new Date(item.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <span className={`badge ${item.bookingStatus === 'confirmed' ? 'badge-success' : item.bookingStatus === 'pending' ? 'badge-warning' : 'badge-error'}`} style={{ textTransform: 'capitalize' }}>
                    {item.bookingStatus}
                  </span>
                  <Link to={`/dashboard/bookings/${item._id}`} className="btn btn-secondary btn-sm">
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerDashboard;
