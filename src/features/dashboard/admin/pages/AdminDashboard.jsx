/**
 * AdminDashboard Component — Marketplace Command Center
 *
 * Real MongoDB metrics, 6 clickable KPI cards, Quick Access navigation grid,
 * pending venue moderation queue, and recent platform activity.
 */

import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  DollarSign,
  Building2,
  Users,
  Shield,
  CalendarCheck,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Settings,
  UserX,
  CheckCircle2,
  RefreshCw,
  Eye,
  Sparkles,
  MapPin,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

import adminService from '../services/adminService';
import { selectCurrentUser } from '@features/auth/redux/authSlice';
import PageLoader from '@shared/components/feedback/PageLoader';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingVenues, setPendingVenues] = useState([]);
  const [moderatingId, setModeratingId] = useState(null);

  const loadData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [statsRes, pendingRes] = await Promise.all([
        adminService.getStats(),
        adminService.getVenues({ status: 'pending', limit: 5 }),
      ]);

      if (statsRes?.data) {
        setStats(statsRes.data);
      }
      if (pendingRes?.data) {
        setPendingVenues(pendingRes.data);
      }
    } catch (err) {
      console.error('Error loading admin dashboard stats:', err);
      toast.error(err?.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApproveVenue = async (venueId, venueName) => {
    try {
      setModeratingId(venueId);
      await adminService.restoreVenue(venueId);
      toast.success(`"${venueName}" approved & published live!`);
      setPendingVenues((prev) => prev.filter((v) => v._id !== venueId));
      loadData(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve venue');
    } finally {
      setModeratingId(null);
    }
  };

  const handleRejectVenue = async (venueId, venueName) => {
    const reason = window.prompt(`Reason for rejecting "${venueName}":`, 'Incomplete venue documentation or pricing inconsistency');
    if (reason === null) return; // cancelled

    try {
      setModeratingId(venueId);
      await adminService.rejectVenue(venueId, reason);
      toast.success(`"${venueName}" moved to rejected list`);
      setPendingVenues((prev) => prev.filter((v) => v._id !== venueId));
      loadData(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject venue');
    } finally {
      setModeratingId(null);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  if (loading && !stats) {
    return <PageLoader />;
  }

  const kpiCards = [
    {
      title: 'TOTAL PLATFORM PROFIT / REVENUE',
      value: formatCurrency(stats?.totalRevenue),
      linkText: 'View Revenue',
      path: '/admin/analytics',
      icon: DollarSign,
      color: '#6344f5',
      bg: '#f0ebff',
    },
    {
      title: 'ACTIVE VENUES',
      value: Number(stats?.activeVenuesCount || 0).toLocaleString('en-IN'),
      linkText: 'View Venues',
      path: '/admin/venues?status=active',
      icon: Building2,
      color: '#10b981',
      bg: '#ecfdf5',
    },
    {
      title: 'REGISTERED CUSTOMERS',
      value: Number(stats?.customersCount || 0).toLocaleString('en-IN'),
      linkText: 'View Users',
      path: '/admin/users',
      icon: Users,
      color: '#3b82f6',
      bg: '#eff6ff',
    },
    {
      title: 'REGISTERED VENUE OWNERS',
      value: Number(stats?.ownersCount || 0).toLocaleString('en-IN'),
      linkText: 'View Owners',
      path: '/admin/owners',
      icon: Shield,
      color: '#8b5cf6',
      bg: '#f5f3ff',
    },
    {
      title: 'TOTAL BOOKINGS',
      value: Number(stats?.totalBookingsCount || 0).toLocaleString('en-IN'),
      linkText: 'View Bookings',
      path: '/admin/bookings',
      icon: CalendarCheck,
      color: '#f59e0b',
      bg: '#fef3c7',
    },
    {
      title: 'REJECTED VENUES',
      value: Number(stats?.rejectedVenuesCount || 0).toLocaleString('en-IN'),
      linkText: 'View Rejected',
      path: '/admin/rejected-venues',
      icon: XCircle,
      color: '#ef4444',
      bg: '#fee2e2',
    },
  ];

  const quickAccessItems = [
    { label: 'Venues', path: '/admin/venues', icon: Building2, desc: 'Manage all listings' },
    { label: 'Venue Owners', path: '/admin/owners', icon: Shield, desc: 'Hosts & property owners' },
    { label: 'Bookings', path: '/admin/bookings', icon: CalendarCheck, desc: 'Platform reservation ledger' },
    { label: 'Registered Users', path: '/admin/users', icon: Users, desc: 'Customer accounts' },
    { label: 'Rejected Venues', path: '/admin/rejected-venues', icon: XCircle, desc: 'Moderated properties' },
    { label: 'Rejected Owners', path: '/admin/rejected-owners', icon: UserX, desc: 'Suspended host profiles' },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, desc: 'Financial trends & GMV' },
    { label: 'Reports', path: '/admin/settings', icon: Settings, desc: 'Platform settings & audits' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 40 }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          position: 'relative',
          padding: '28px 36px',
          borderRadius: 24,
          background: 'linear-gradient(135deg, #f7f5ff 0%, #f0ebff 60%, #e8e2ff 100%)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 4px 20px rgba(99, 68, 245, 0.04)',
        }}
      >
        <div style={{ zIndex: 2 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#6344f5',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            PLATFORM OVERSIGHT & MODERATION ✦
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: '#0f172a',
              fontFamily: 'var(--font-display)',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Super Admin Command Center
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0, fontWeight: 500 }}>
            Real-time platform statistics from MongoDB, listing moderation, and master registry.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, zIndex: 2 }}>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="btn btn-secondary"
            style={{
              borderRadius: 12,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 700,
              gap: 6,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Syncing...' : 'Sync MongoDB'}
          </button>
          <Link
            to="/admin/venues"
            className="btn btn-primary"
            style={{
              borderRadius: 12,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 700,
              gap: 6,
              background: '#6344f5',
              color: '#ffffff',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(99, 68, 245, 0.25)',
            }}
          >
            <Building2 size={16} /> Manage Venues
          </Link>
        </div>
      </div>

      {/* 6 Real MongoDB KPI Cards */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Platform Key Metrics
          </h2>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Real-time database records</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {kpiCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(card.path)}
                className="card hover-lift"
                style={{
                  padding: '20px 22px',
                  borderRadius: 18,
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {card.title}
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)', marginTop: 6 }}>
                      {card.value}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: card.bg,
                      color: card.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={22} />
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: 12,
                    fontWeight: 700,
                    color: card.color,
                  }}
                >
                  <span>{card.linkText} →</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick Access
          </h2>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Direct module navigation</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14,
          }}
        >
          {quickAccessItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.path}
                className="card hover-lift"
                style={{
                  padding: '16px 18px',
                  borderRadius: 16,
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: '#f0ebff',
                    color: '#6344f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{item.desc}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Venue Approval Queue & Recent Platform Bookings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
        {/* Pending Approvals Queue */}
        <div className="card" style={{ padding: '22px', borderRadius: 20, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Venue Approval Queue
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0 0' }}>Review submitted property listings</p>
            </div>
            <span
              style={{
                background: pendingVenues.length > 0 ? '#fef3c7' : '#ecfdf5',
                color: pendingVenues.length > 0 ? '#b45309' : '#047857',
                padding: '3px 10px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {pendingVenues.length} Pending
            </span>
          </div>

          {pendingVenues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
              <CheckCircle2 size={36} style={{ margin: '0 auto 8px auto', color: '#10b981' }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Queue is all clear!</div>
              <div style={{ fontSize: 12, marginTop: 2 }}>No venue submissions awaiting approval.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendingVenues.map((v) => (
                <div
                  key={v._id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#6344f5', textTransform: 'uppercase' }}>
                      {v.category?.replace('-', ' ')}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{v.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      Host: {v.owner?.name || 'Owner'} • {v.location?.city} • ₹{v.pricePerDay?.toLocaleString('en-IN')}/day
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link
                      to={`/admin/venues/${v._id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: 8, padding: '6px 10px', fontSize: 12, gap: 4, textDecoration: 'none' }}
                    >
                      <Eye size={13} /> View
                    </Link>
                    <button
                      onClick={() => handleApproveVenue(v._id, v.name)}
                      disabled={moderatingId === v._id}
                      className="btn btn-primary btn-sm"
                      style={{
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 700,
                        gap: 4,
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                      }}
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button
                      onClick={() => handleRejectVenue(v._id, v.name)}
                      disabled={moderatingId === v._id}
                      className="btn btn-secondary btn-sm"
                      style={{
                        borderRadius: 8,
                        padding: '6px 10px',
                        fontSize: 12,
                        fontWeight: 700,
                        gap: 4,
                        color: '#ef4444',
                      }}
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Platform Bookings */}
        <div className="card" style={{ padding: '22px', borderRadius: 20, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Recent Platform Bookings
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0 0' }}>Latest customer reservations</p>
            </div>
            <Link
              to="/admin/bookings"
              style={{ fontSize: 12, fontWeight: 700, color: '#6344f5', textDecoration: 'none' }}
            >
              View All →
            </Link>
          </div>

          {(!stats?.recentBookings || stats.recentBookings.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
              <CalendarCheck size={36} style={{ margin: '0 auto 8px auto', color: '#6344f5' }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>No bookings yet</div>
              <div style={{ fontSize: 12, marginTop: 2 }}>Platform bookings will appear here in real time.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.recentBookings.map((b) => (
                <div
                  key={b._id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#6344f5', fontFamily: 'var(--font-mono)' }}>
                      {b.bookingReference}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      {b.venue?.name || 'Venue'}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      Guest: {b.customer?.name || 'Customer'} • {new Date(b.eventDate).toLocaleDateString('en-IN')}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                      ₹{(b.pricing?.totalAmount || 0).toLocaleString('en-IN')}
                    </div>
                    <span
                      className={`badge ${
                        b.bookingStatus === 'confirmed' || b.bookingStatus === 'completed'
                          ? 'badge-success'
                          : b.bookingStatus === 'pending'
                          ? 'badge-warning'
                          : 'badge-error'
                      }`}
                      style={{ fontSize: 10, padding: '2px 8px', marginTop: 2, textTransform: 'capitalize' }}
                    >
                      {b.bookingStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
