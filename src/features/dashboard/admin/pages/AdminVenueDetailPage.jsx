/**
 * AdminVenueDetailPage Component — Dedicated Super Admin Venue Details
 *
 * Provides complete visibility into venue details, real ImageKit images,
 * owner information with direct navigation, dynamic MongoDB performance metrics,
 * venue bookings ledger with search & pagination, revenue trends, and moderation controls.
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  MapPin,
  Users,
  DollarSign,
  CalendarCheck,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  FileText,
  Shield,
  Layers,
  Sparkles,
  TrendingUp,
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

import adminService from '../services/adminService';
import PageLoader from '@shared/components/feedback/PageLoader';
import Pagination from '@shared/components/navigation/Pagination';

const AdminVenueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [venueData, setVenueData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Venue Bookings sub-table state
  const [bookings, setBookings] = useState([]);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [bookingsTotalPages, setBookingsTotalPages] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsLimit, setBookingsLimit] = useState(10);
  const [bookingsSearch, setBookingsSearch] = useState('');
  const [bookingsStatus, setBookingsStatus] = useState('all');
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Moderation state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [moderating, setModerating] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getVenueDetails(id);
      if (res?.data) {
        setVenueData(res.data);
      }
    } catch (err) {
      console.error('Error fetching venue details:', err);
      toast.error(err?.response?.data?.message || 'Failed to load venue details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchBookings = useCallback(async () => {
    try {
      setBookingsLoading(true);
      const params = {
        page: bookingsPage,
        limit: bookingsLimit,
        search: bookingsSearch || undefined,
        status: bookingsStatus !== 'all' ? bookingsStatus : undefined,
      };
      const res = await adminService.getVenueBookings(id, params);
      if (res?.data) {
        setBookings(res.data);
        const pagination = res.pagination || res.meta || {};
        setBookingsTotal(pagination.total ?? res.total ?? 0);
        setBookingsTotalPages(pagination.totalPages ?? res.totalPages ?? 1);
      }
    } catch (err) {
      console.error('Error fetching venue bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  }, [id, bookingsPage, bookingsLimit, bookingsSearch, bookingsStatus]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleApprove = async () => {
    try {
      setModerating(true);
      await adminService.restoreVenue(id);
      toast.success('Venue listing approved and restored to active state!');
      fetchDetails();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve venue');
    } finally {
      setModerating(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please specify a rejection reason');
      return;
    }
    try {
      setModerating(true);
      await adminService.rejectVenue(id, rejectReason);
      toast.success('Venue listing rejected');
      setIsRejectModalOpen(false);
      fetchDetails();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject venue');
    } finally {
      setModerating(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!venueData?.venue) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center', borderRadius: 20 }}>
        <Building2 size={40} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Venue not found</h2>
        <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
          The requested property record could not be loaded from MongoDB.
        </p>
        <button onClick={() => navigate('/admin/venues')} className="btn btn-secondary" style={{ marginTop: 16 }}>
          Back to Venues
        </button>
      </div>
    );
  }

  const { venue, performance } = venueData;
  const isRejected = venue.status === 'rejected';
  const isActive = venue.status === 'active';
  const isPending = venue.status === 'pending';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 50 }}>
      {/* Top Breadcrumb & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate('/admin/venues')}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 10, padding: '8px 12px', fontSize: 12, gap: 6 }}
          >
            <ArrowLeft size={14} /> Back to Venues
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0, fontFamily: 'var(--font-display)' }}>
                {venue.name}
              </h1>
              <span
                className={`badge ${
                  isActive ? 'badge-success' : isPending ? 'badge-warning' : isRejected ? 'badge-error' : 'badge-neutral'
                }`}
                style={{ textTransform: 'capitalize', fontSize: 11 }}
              >
                {venue.status}
              </span>
              {venue.rejectionType === 'owner_cascade' && (
                <span className="badge badge-warning" style={{ fontSize: 10 }}>
                  Cascaded from Owner
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{venue._id}</span> • Created: {new Date(venue.createdAt).toLocaleDateString('en-IN')}
            </div>
          </div>
        </div>

        {/* Moderation Controls */}
        <div style={{ display: 'flex', gap: 10 }}>
          {isRejected || isPending ? (
            <button
              onClick={handleApprove}
              disabled={moderating}
              className="btn btn-primary"
              style={{
                borderRadius: 12,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 700,
                gap: 6,
                background: '#10b981',
                border: 'none',
                color: '#fff',
              }}
            >
              <CheckCircle2 size={16} /> Approve & Restore
            </button>
          ) : (
            <button
              onClick={() => {
                setRejectReason('Quality or documentation standards not met');
                setIsRejectModalOpen(true);
              }}
              disabled={moderating}
              className="btn btn-secondary"
              style={{
                borderRadius: 12,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 700,
                gap: 6,
                color: '#ef4444',
                borderColor: '#fca5a5',
              }}
            >
              <XCircle size={16} /> Reject Listing
            </button>
          )}
        </div>
      </div>

      {/* Rejection Alert Banner if venue is rejected */}
      {isRejected && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 16,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2, color: '#ef4444' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>This venue is currently Rejected & Unpublished</div>
            <div style={{ fontSize: 12, marginTop: 2, color: '#7f1d1d' }}>
              <strong>Reason:</strong> {venue.rejectionReason || 'No reason specified'}
            </div>
            {venue.rejectedAt && (
              <div style={{ fontSize: 11, marginTop: 4, color: '#991b1b' }}>
                Rejected on {new Date(venue.rejectedAt).toLocaleString('en-IN')}
                {venue.rejectedBy?.name && ` by ${venue.rejectedBy.name}`}
                {venue.rejectionType === 'owner_cascade' && ' (Consequence of venue owner rejection)'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Grid: Venue Information & Owner Information */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* Venue Information Card */}
        <div className="card" style={{ padding: 24, borderRadius: 20, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Venue Information
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Category / Type</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#6344f5', textTransform: 'capitalize' }}>
                {venue.category?.replace('-', ' ')}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Base Price / Day</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                {formatCurrency(venue.pricePerDay)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Guest Capacity</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                {venue.minCapacity} to {venue.maxCapacity} guests
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Location Address</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', textAlign: 'right', maxWidth: '60%' }}>
                {venue.location?.address}, {venue.location?.city}, {venue.location?.state} {venue.location?.pincode}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Cancellation Policy</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>
                {venue.cancellationPolicy || 'Moderate'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Description</span>
              <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, margin: 0, background: 'var(--bg-subtle)', padding: 12, borderRadius: 10 }}>
                {venue.description}
              </p>
            </div>

            {venue.amenities?.length > 0 && (
              <div>
                <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Amenities Included</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {venue.amenities.map((am, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        background: '#f1f5f9',
                        color: '#334155',
                        padding: '3px 8px',
                        borderRadius: 6,
                        textTransform: 'capitalize',
                      }}
                    >
                      {am.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Owner Information Card */}
        <div className="card" style={{ padding: 24, borderRadius: 20, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Owner Information
            </h2>
            {venue.owner?._id && (
              <Link
                to={`/admin/owners/${venue.owner._id}`}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: 8, fontSize: 12, gap: 4, textDecoration: 'none' }}
              >
                <Shield size={13} /> View Owner Profile →
              </Link>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: '#f0ebff',
                color: '#6344f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 20,
              }}
            >
              {venue.owner?.name?.charAt(0)?.toUpperCase() || 'O'}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{venue.owner?.name || 'Unknown Host'}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Registered Property Host</div>
              <span
                className={`badge ${
                  venue.owner?.status === 'rejected' || venue.owner?.isActive === false
                    ? 'badge-error'
                    : 'badge-success'
                }`}
                style={{ fontSize: 10, marginTop: 4, padding: '2px 8px' }}
              >
                {venue.owner?.status === 'rejected' || venue.owner?.isActive === false ? 'Owner Suspended' : 'Owner Active'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
              <Mail size={16} style={{ color: '#6344f5' }} />
              <span>{venue.owner?.email || 'No email registered'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
              <Phone size={16} style={{ color: '#6344f5' }} />
              <span>{venue.owner?.phone || 'No phone registered'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
              <Calendar size={16} style={{ color: '#6344f5' }} />
              <span>Member since {venue.owner?.createdAt ? new Date(venue.owner.createdAt).toLocaleDateString('en-IN') : 'N/A'}</span>
            </div>
          </div>

          {/* Venue Gallery Preview */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 8 }}>
              Venue Gallery ({venue.gallery?.length || 1} Images)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: 8 }}>
              {venue.coverImage?.url && (
                <img
                  src={venue.coverImage.url}
                  alt="Cover"
                  style={{ width: '100%', height: 60, borderRadius: 8, objectFit: 'cover', border: '2px solid #6344f5' }}
                />
              )}
              {venue.gallery?.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`Gallery ${idx + 1}`}
                  style={{ width: '100%', height: 60, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real Venue Performance Metrics Cards */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Venue Performance (MongoDB Real Data)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { label: 'Total Bookings', val: performance?.totalBookings || 0, icon: CalendarCheck, color: '#6344f5', bg: '#f0ebff' },
            { label: 'Completed Bookings', val: performance?.completedBookings || 0, icon: CheckCircle2, color: '#10b981', bg: '#ecfdf5' },
            { label: 'Upcoming Bookings', val: performance?.upcomingBookings || 0, icon: Clock, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Cancelled Bookings', val: performance?.cancelledBookings || 0, icon: XCircle, color: '#ef4444', bg: '#fee2e2' },
            { label: 'Total Revenue', val: formatCurrency(performance?.totalRevenue), icon: DollarSign, color: '#10b981', bg: '#ecfdf5' },
            { label: 'Avg Booking Value', val: formatCurrency(performance?.averageBookingValue), icon: TrendingUp, color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Average Rating', val: `★ ${performance?.averageRating || venue.rating?.average || 0}`, icon: Star, color: '#f59e0b', bg: '#fffbeb' },
            { label: 'Total Reviews', val: performance?.totalReviews || venue.rating?.count || 0, icon: FileText, color: '#8b5cf6', bg: '#f5f3ff' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="card"
                style={{
                  padding: '16px 18px',
                  borderRadius: 16,
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: item.bg,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)', marginTop: 2 }}>
                    {item.val}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Venue Bookings Sub-section */}
      <div className="card" style={{ padding: 24, borderRadius: 20, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Venue Bookings Ledger
            </h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0 0' }}>
              Platform reservation records for this venue ({bookingsTotal} total)
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select
              value={bookingsStatus}
              onChange={(e) => {
                setBookingsStatus(e.target.value);
                setBookingsPage(1);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-subtle)',
                fontSize: 12,
                color: '#0f172a',
                outline: 'none',
              }}
            >
              <option value="all">All Booking Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {bookingsLoading ? (
          <PageLoader />
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
            <CalendarCheck size={36} style={{ margin: '0 auto 8px auto', color: '#94a3b8' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>No bookings for this venue</div>
            <div style={{ fontSize: 12, marginTop: 2 }}>Customer reservations will be listed here.</div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569', fontSize: 11 }}>Booking ID</th>
                    <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569', fontSize: 11 }}>Customer</th>
                    <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569', fontSize: 11 }}>Event Date</th>
                    <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569', fontSize: 11 }}>Guests</th>
                    <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569', fontSize: 11 }}>Amount</th>
                    <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569', fontSize: 11 }}>Booking Status</th>
                    <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569', fontSize: 11 }}>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#6344f5', fontFamily: 'var(--font-mono)' }}>
                        {b.bookingReference}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.customer?.name || 'Customer'}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{b.customer?.email}</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>
                        {b.eventDate ? new Date(b.eventDate).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#0f172a', fontWeight: 600 }}>
                        {b.guestCount}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>
                        {formatCurrency(b.pricing?.totalAmount || 0)}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          className={`badge ${
                            b.bookingStatus === 'confirmed' || b.bookingStatus === 'completed'
                              ? 'badge-success'
                              : b.bookingStatus === 'pending'
                              ? 'badge-warning'
                              : 'badge-error'
                          }`}
                          style={{ fontSize: 11, textTransform: 'capitalize' }}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          className={`badge ${
                            b.paymentStatus === 'success' ? 'badge-success' : 'badge-neutral'
                          }`}
                          style={{ fontSize: 11, textTransform: 'capitalize' }}
                        >
                          {b.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Server-side Pagination Component */}
            <Pagination
              page={bookingsPage}
              limit={bookingsLimit}
              total={bookingsTotal}
              totalPages={bookingsTotalPages}
              loading={bookingsLoading}
              onPageChange={(newPage) => setBookingsPage(newPage)}
              onLimitChange={(newLimit) => {
                setBookingsLimit(newLimit);
                setBookingsPage(1);
              }}
              limitOptions={[5, 10, 20]}
            />
          </>
        )}
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 460,
              padding: 24,
              borderRadius: 20,
              background: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: '#fee2e2',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Reject Venue Listing
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0 0' }}>
                  {venue.name}
                </p>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>
              Specify the reason why this venue is being rejected. The owner and record will be updated in MongoDB.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Enter explanation for rejection..."
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 10,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-subtle)',
                fontSize: 13,
                outline: 'none',
                resize: 'none',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                disabled={moderating}
                className="btn btn-secondary"
                style={{ borderRadius: 10, padding: '8px 16px', fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={moderating || !rejectReason.trim()}
                className="btn btn-primary"
                style={{
                  borderRadius: 10,
                  padding: '8px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                }}
              >
                {moderating ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVenueDetailPage;
