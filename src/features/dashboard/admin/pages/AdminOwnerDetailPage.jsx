/**
 * AdminOwnerDetailPage Component — Dedicated Super Admin Owner Details
 *
 * Provides complete visibility into owner profile, performance aggregations,
 * list of all owned properties with per-venue revenue and bookings, and
 * intelligent cascading moderation controls.
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Building2,
  CalendarCheck,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Eye,
  Star,
  Clock,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

import adminService from '../services/adminService';
import PageLoader from '@shared/components/feedback/PageLoader';

const AdminOwnerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);

  // Moderation state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [moderating, setModerating] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getOwnerDetails(id);
      if (res?.data?.owner) {
        setOwner(res.data.owner);
      }
    } catch (err) {
      console.error('Error fetching owner details:', err);
      toast.error(err?.response?.data?.message || 'Failed to load owner details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleApproveOwner = async () => {
    try {
      setModerating(true);
      await adminService.restoreOwner(id);
      toast.success(`Owner "${owner.name}" approved & active listings restored!`);
      fetchDetails();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve owner');
    } finally {
      setModerating(false);
    }
  };

  const handleRejectOwner = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please specify a rejection reason');
      return;
    }
    try {
      setModerating(true);
      await adminService.rejectOwner(id, rejectReason);
      toast.success(`Owner "${owner.name}" and active listings suspended`);
      setIsRejectModalOpen(false);
      fetchDetails();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject owner');
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

  if (!owner) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center', borderRadius: 20 }}>
        <Shield size={40} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Venue owner not found</h2>
        <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
          The requested owner record could not be loaded from MongoDB.
        </p>
        <button onClick={() => navigate('/admin/owners')} className="btn btn-secondary" style={{ marginTop: 16 }}>
          Back to Owners
        </button>
      </div>
    );
  }

  const isRejected = owner.ownerStatus === 'rejected';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 50 }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate('/admin/owners')}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 10, padding: '8px 12px', fontSize: 12, gap: 6 }}
          >
            <ArrowLeft size={14} /> Back to Owners
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0, fontFamily: 'var(--font-display)' }}>
                {owner.name}
              </h1>
              <span className={`badge ${isRejected ? 'badge-error' : 'badge-success'}`} style={{ fontSize: 11 }}>
                {owner.ownerStatus}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Owner ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{owner._id}</span> • Registered: {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString('en-IN') : 'N/A'}
            </div>
          </div>
        </div>

        {/* Moderation Controls */}
        <div style={{ display: 'flex', gap: 10 }}>
          {isRejected ? (
            <button
              onClick={handleApproveOwner}
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
              <CheckCircle2 size={16} /> Approve & Restore Owner
            </button>
          ) : (
            <button
              onClick={() => {
                setRejectReason('Owner policy violation or unverified listing compliance');
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
              <XCircle size={16} /> Reject Owner
            </button>
          )}
        </div>
      </div>

      {/* Rejection Alert Banner if owner is rejected */}
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
            <div style={{ fontWeight: 800, fontSize: 14 }}>This Host Account is Suspended / Rejected</div>
            <div style={{ fontSize: 12, marginTop: 2, color: '#7f1d1d' }}>
              <strong>Reason:</strong> {owner.rejectionReason || 'No reason specified'}
            </div>
            {owner.rejectedAt && (
              <div style={{ fontSize: 11, marginTop: 4, color: '#991b1b' }}>
                Rejected on {new Date(owner.rejectedAt).toLocaleString('en-IN')}
                {owner.rejectedBy?.name && ` by ${owner.rejectedBy.name}`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Section: Owner Profile & Owner Performance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Profile Card */}
        <div className="card" style={{ padding: 24, borderRadius: 20, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Owner Profile
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#f0ebff',
                color: '#6344f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 22,
              }}
            >
              {owner.name?.charAt(0)?.toUpperCase() || 'O'}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{owner.name}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Platform Venue Partner</div>
              <span className={`badge ${isRejected ? 'badge-error' : 'badge-success'}`} style={{ fontSize: 10, marginTop: 4 }}>
                {owner.ownerStatus}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
              <Mail size={16} style={{ color: '#6344f5' }} />
              <span>{owner.email || 'No email'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
              <Phone size={16} style={{ color: '#6344f5' }} />
              <span>{owner.phone || 'No phone registered'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
              <Calendar size={16} style={{ color: '#6344f5' }} />
              <span>Partner since {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString('en-IN') : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Performance Highlights */}
        <div className="card" style={{ padding: 24, borderRadius: 20, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Owner Performance (MongoDB Real Data)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <div style={{ padding: 14, background: 'var(--bg-subtle)', borderRadius: 14 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Total Venues</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)', marginTop: 4 }}>
                {owner.totalVenues || 0}
              </div>
            </div>

            <div style={{ padding: 14, background: 'var(--bg-subtle)', borderRadius: 14 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Active Listings</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-display)', marginTop: 4 }}>
                {owner.activeVenues || 0}
              </div>
            </div>

            <div style={{ padding: 14, background: 'var(--bg-subtle)', borderRadius: 14 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Rejected Listings</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#ef4444', fontFamily: 'var(--font-display)', marginTop: 4 }}>
                {owner.rejectedVenues || 0}
              </div>
            </div>

            <div style={{ padding: 14, background: 'var(--bg-subtle)', borderRadius: 14 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Total Bookings</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#6344f5', fontFamily: 'var(--font-display)', marginTop: 4 }}>
                {owner.totalBookings || 0}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: 14, background: '#f0ebff', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: '#6344f5', fontWeight: 700, textTransform: 'uppercase' }}>Gross Revenue Generated</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#6344f5', fontFamily: 'var(--font-display)', marginTop: 2 }}>
                {formatCurrency(owner.totalRevenue)}
              </div>
            </div>
            <DollarSign size={28} style={{ color: '#6344f5', opacity: 0.8 }} />
          </div>
        </div>
      </div>

      {/* Owner Venues Section */}
      <div className="card" style={{ padding: 24, borderRadius: 20, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Owner Properties Portfolio
            </h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0 0' }}>
              All venues owned by {owner.name} ({owner.venues?.length || 0} listed)
            </p>
          </div>
        </div>

        {(!owner.venues || owner.venues.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
            <Building2 size={36} style={{ margin: '0 auto 8px auto', color: '#94a3b8' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>No properties listed</div>
            <div style={{ fontSize: 12, marginTop: 2 }}>This host has not created any venue listings yet.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {owner.venues.map((v) => {
              const vRejected = v.status === 'rejected';
              const vActive = v.status === 'active';
              const vPending = v.status === 'pending';

              return (
                <div
                  key={v._id}
                  onClick={() => navigate(`/admin/venues/${v._id}`)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 16,
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 14,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  className="hover-lift"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <img
                      src={v.coverImage?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=100'}
                      alt={v.name}
                      style={{ width: 50, height: 50, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{v.name}</span>
                        <span
                          className={`badge ${
                            vActive ? 'badge-success' : vPending ? 'badge-warning' : vRejected ? 'badge-error' : 'badge-neutral'
                          }`}
                          style={{ fontSize: 10, textTransform: 'capitalize' }}
                        >
                          {v.status}
                        </span>
                        {v.rejectionType === 'owner_cascade' && (
                          <span className="badge badge-warning" style={{ fontSize: 9 }}>
                            Cascaded
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        {v.location?.city} • {v.category?.replace('-', ' ')} • ₹{Number(v.pricePerDay || 0).toLocaleString('en-IN')}/day
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                        {v.bookingsCount || 0} Bookings
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#10b981', marginTop: 2 }}>
                        {formatCurrency(v.revenue)}
                      </div>
                    </div>

                    <Link
                      to={`/admin/venues/${v._id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: 8, padding: '6px 12px', fontSize: 12, gap: 4, textDecoration: 'none' }}
                    >
                      <Eye size={13} /> View Venue →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Owner Modal */}
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
              maxWidth: 480,
              padding: 26,
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
                  width: 44,
                  height: 44,
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
                  Reject Venue Owner
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0 0' }}>
                  {owner.name} ({owner.email})
                </p>
              </div>
            </div>

            <div
              style={{
                padding: 12,
                borderRadius: 10,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                fontSize: 12,
                color: '#991b1b',
                lineHeight: 1.5,
              }}
            >
              <strong>Cascade Effect:</strong> Rejecting this owner will suspend their account and move all {owner.activeVenues || 0} active venue listings into the rejected queue.
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                Reason for Rejection:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-subtle)',
                  fontSize: 13,
                  color: '#0f172a',
                  outline: 'none',
                  resize: 'none',
                }}
                placeholder="Enter explanation for owner rejection..."
              />
            </div>

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
                onClick={handleRejectOwner}
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

export default AdminOwnerDetailPage;
