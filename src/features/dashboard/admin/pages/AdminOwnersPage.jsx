/**
 * AdminOwnersPage Component — Venue Owners Management
 *
 * Master directory of registered venue hosts & property managers.
 * Shows real MongoDB aggregations: Total Venues, Active Venues, Rejected Venues,
 * Total Bookings, Total Revenue, server-side pagination, and Owner Moderation controls.
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Search,
  LayoutGrid,
  List,
  Eye,
  CheckCircle2,
  XCircle,
  Building2,
  CalendarCheck,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  Mail,
  Phone,
} from 'lucide-react';
import toast from 'react-hot-toast';

import adminService from '../services/adminService';
import PageLoader from '@shared/components/feedback/PageLoader';
import Pagination from '@shared/components/navigation/Pagination';

const AdminOwnersPage = () => {
  const navigate = useNavigate();

  const [owners, setOwners] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  // Rejection modal state
  const [rejectingOwner, setRejectingOwner] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOwners = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        status: status !== 'all' ? status : undefined,
      };
      const res = await adminService.getOwners(params);
      if (res?.data) {
        setOwners(res.data);
        const pagination = res.pagination || res.meta || {};
        setTotal(pagination.total ?? res.total ?? 0);
        setTotalPages(pagination.totalPages ?? res.totalPages ?? 1);
      }
    } catch (err) {
      console.error('Error fetching admin owners:', err);
      toast.error(err?.response?.data?.message || 'Failed to load venue owners');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status]);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  const handleApproveOwner = async (e, owner) => {
    e.stopPropagation();
    try {
      await adminService.restoreOwner(owner._id);
      toast.success(`Host "${owner.name}" approved & active listings restored!`);
      fetchOwners();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to restore owner');
    }
  };

  const openRejectModal = (e, owner) => {
    e.stopPropagation();
    setRejectingOwner(owner);
    setRejectReason('Host policy violation or repeated listing non-compliance');
  };

  const handleConfirmReject = async () => {
    if (!rejectingOwner) return;
    try {
      setIsSubmitting(true);
      await adminService.rejectOwner(rejectingOwner._id, rejectReason);
      toast.success(`Host "${rejectingOwner.name}" and active listings suspended.`);
      setRejectingOwner(null);
      fetchOwners();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject owner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#6344f5', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            PARTNERS & HOSTS
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)', margin: '2px 0 0 0' }}>
            Venue Owners
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0 0' }}>
            Directory of registered venue owners, properties portfolio, and revenue generation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* View Toggle */}
          <div style={{ display: 'flex', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-subtle)', padding: 3 }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                background: viewMode === 'table' ? '#6344f5' : 'transparent',
                color: viewMode === 'table' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <List size={15} /> Table View
            </button>
            <button
              onClick={() => setViewMode('card')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                background: viewMode === 'card' ? '#6344f5' : 'transparent',
                color: viewMode === 'card' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <LayoutGrid size={15} /> Card View
            </button>
          </div>

          <button
            onClick={() => fetchOwners()}
            className="btn btn-secondary"
            style={{ borderRadius: 12, padding: '8px 14px', fontSize: 13, gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          borderRadius: 18,
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          />
          <input
            type="text"
            placeholder="Search owners by name, email, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to page 1 on search
            }}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: 12,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-subtle)',
              fontSize: 13,
              outline: 'none',
              color: '#0f172a',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'all', label: 'All Owners' },
            { id: 'active', label: 'Active' },
            { id: 'rejected', label: 'Suspended / Rejected' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setStatus(st.id);
                setPage(1); // Reset to page 1 on filter
              }}
              style={{
                padding: '6px 14px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                border: status === st.id ? '1px solid #6344f5' : '1px solid var(--border-subtle)',
                background: status === st.id ? '#f0ebff' : 'var(--surface-1)',
                color: status === st.id ? '#6344f5' : '#64748b',
              }}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading && owners.length === 0 ? (
        <PageLoader />
      ) : owners.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            borderRadius: 20,
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            color: '#64748b',
          }}
        >
          <Shield size={42} style={{ margin: '0 auto 12px auto', color: '#94a3b8' }} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>No venue owners found</h3>
          <p style={{ fontSize: 13, marginTop: 4 }}>Try clearing search keywords or filter options.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div
          className="card"
          style={{
            borderRadius: 20,
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Owner
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Contact
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Registered
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Total Venues
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Active
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Rejected
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Total Bookings
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Total Revenue
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {owners.map((owner) => {
                  const isRejected = owner.ownerStatus === 'rejected';

                  return (
                    <tr
                      key={owner._id}
                      onClick={() => navigate(`/admin/owners/${owner._id}`)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              background: '#f0ebff',
                              color: '#6344f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: 14,
                            }}
                          >
                            {owner.name?.charAt(0)?.toUpperCase() || 'O'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{owner.name}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>{owner.email}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: 600 }}>
                        {owner.phone || '—'}
                      </td>

                      <td style={{ padding: '14px 16px', color: '#64748b' }}>
                        {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                        {owner.totalVenues || 0}
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10b981' }}>
                        {owner.activeVenues || 0}
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ef4444' }}>
                        {owner.rejectedVenues || 0}
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                        {owner.totalBookings || 0}
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#10b981' }}>
                        {formatCurrency(owner.totalRevenue)}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span
                          className={`badge ${isRejected ? 'badge-error' : 'badge-success'}`}
                          style={{ textTransform: 'capitalize', fontSize: 11 }}
                        >
                          {owner.ownerStatus}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/owners/${owner._id}`);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ borderRadius: 8, padding: '5px 10px', fontSize: 12, gap: 4 }}
                          >
                            <Eye size={13} /> View
                          </button>

                          {isRejected ? (
                            <button
                              onClick={(e) => handleApproveOwner(e, owner)}
                              className="btn btn-primary btn-sm"
                              style={{
                                borderRadius: 8,
                                padding: '5px 10px',
                                fontSize: 12,
                                gap: 4,
                                background: '#10b981',
                                border: 'none',
                                color: '#fff',
                              }}
                            >
                              <CheckCircle2 size={13} /> Approve
                            </button>
                          ) : (
                            <button
                              onClick={(e) => openRejectModal(e, owner)}
                              className="btn btn-secondary btn-sm"
                              style={{ borderRadius: 8, padding: '5px 10px', fontSize: 12, gap: 4, color: '#ef4444' }}
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD VIEW */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 18,
          }}
        >
          {owners.map((owner) => {
            const isRejected = owner.ownerStatus === 'rejected';

            return (
              <div
                key={owner._id}
                onClick={() => navigate(`/admin/owners/${owner._id}`)}
                className="card hover-lift"
                style={{
                  padding: 20,
                  borderRadius: 18,
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: '#f0ebff',
                        color: '#6344f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: 16,
                      }}
                    >
                      {owner.name?.charAt(0)?.toUpperCase() || 'O'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {owner.name}
                      </h3>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{owner.email}</div>
                    </div>
                  </div>

                  <span className={`badge ${isRejected ? 'badge-error' : 'badge-success'}`} style={{ fontSize: 10 }}>
                    {owner.ownerStatus}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                    padding: '10px 12px',
                    background: 'var(--bg-subtle)',
                    borderRadius: 12,
                    textAlign: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Total Venues</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{owner.totalVenues || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Active</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#10b981', marginTop: 2 }}>{owner.activeVenues || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Rejected</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#ef4444', marginTop: 2 }}>{owner.rejectedVenues || 0}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
                  <span>Total Bookings: <strong style={{ color: '#0f172a' }}>{owner.totalBookings || 0}</strong></span>
                  <span>Revenue: <strong style={{ color: '#10b981' }}>{formatCurrency(owner.totalRevenue)}</strong></span>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', gap: 8 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/owners/${owner._id}`);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, borderRadius: 10, fontSize: 12, gap: 4 }}
                  >
                    <Eye size={13} /> View Details
                  </button>
                  {isRejected ? (
                    <button
                      onClick={(e) => handleApproveOwner(e, owner)}
                      className="btn btn-primary btn-sm"
                      style={{
                        borderRadius: 10,
                        fontSize: 12,
                        gap: 4,
                        background: '#10b981',
                        border: 'none',
                        color: '#fff',
                      }}
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                  ) : (
                    <button
                      onClick={(e) => openRejectModal(e, owner)}
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: 10, fontSize: 12, gap: 4, color: '#ef4444' }}
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Server-side Pagination Component */}
      <Pagination
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        loading={loading}
        onPageChange={(newPage) => setPage(newPage)}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />

      {/* Reject Owner Modal */}
      {rejectingOwner && (
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
                  {rejectingOwner.name} ({rejectingOwner.email})
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
              <strong>Important Cascade Action:</strong> Rejecting this owner will suspend their host account and automatically mark their {rejectingOwner.activeVenues || 0} active venue listings as rejected. Nothing is deleted from MongoDB.
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                Reason for Owner Rejection:
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
                onClick={() => setRejectingOwner(null)}
                disabled={isSubmitting}
                className="btn btn-secondary"
                style={{ borderRadius: 10, padding: '8px 16px', fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isSubmitting || !rejectReason.trim()}
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
                {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOwnersPage;
