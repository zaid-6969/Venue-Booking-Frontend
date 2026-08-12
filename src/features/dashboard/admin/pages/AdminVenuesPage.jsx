/**
 * AdminVenuesPage Component — Venue Management
 *
 * Professional management table and card view for all platform venues.
 * Includes server-side search, sorting, multi-filtering, server-side pagination
 * (10, 20, 50 with default 20), and moderation controls.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Search,
  LayoutGrid,
  List,
  Eye,
  CheckCircle2,
  XCircle,
  MapPin,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import adminService from '../services/adminService';
import PageLoader from '@shared/components/feedback/PageLoader';
import Pagination from '@shared/components/navigation/Pagination';
import { VENUE_CATEGORIES } from '@constants/index';

const AdminVenuesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [venues, setVenues] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'

  // Server-side Filter & Pagination state
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit, setLimit] = useState(Number(searchParams.get('limit')) || 20);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

  // Rejection modal
  const [rejectingVenue, setRejectingVenue] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVenues = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        status: status !== 'all' ? status : undefined,
        category: category !== 'all' ? category : undefined,
        city: city.trim() || undefined,
        sortBy,
        sortOrder,
      };

      const res = await adminService.getVenues(params);
      if (res?.data) {
        setVenues(res.data);
        const pagination = res.pagination || res.meta || {};
        setTotal(pagination.total ?? res.total ?? 0);
        setTotalPages(pagination.totalPages ?? res.totalPages ?? 1);
      }
    } catch (err) {
      console.error('Error fetching admin venues:', err);
      toast.error(err?.response?.data?.message || 'Failed to load venues');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, category, city, sortBy, sortOrder]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const handleApprove = async (e, venue) => {
    e.stopPropagation();
    try {
      await adminService.restoreVenue(venue._id);
      toast.success(`"${venue.name}" is now Active & Live!`);
      fetchVenues();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to restore venue');
    }
  };

  const openRejectModal = (e, venue) => {
    e.stopPropagation();
    setRejectingVenue(venue);
    setRejectReason('Does not meet platform quality standards or safety verification requirements');
  };

  const handleConfirmReject = async () => {
    if (!rejectingVenue) return;
    try {
      setIsSubmitting(true);
      await adminService.rejectVenue(rejectingVenue._id, rejectReason);
      toast.success(`"${rejectingVenue.name}" has been rejected.`);
      setRejectingVenue(null);
      fetchVenues();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject venue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#6344f5', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            PLATFORM INVENTORY
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)', margin: '2px 0 0 0' }}>
            Venue Management
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0 0' }}>
            Browse, inspect, filter, and moderate all property listings across EventFlow.
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
            onClick={() => fetchVenues()}
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
          padding: '18px 20px',
          borderRadius: 18,
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Search by venue name, city, address..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to page 1 on search change
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

          {/* Status Quick Filter Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'active', label: 'Active' },
              { id: 'pending', label: 'Pending' },
              { id: 'rejected', label: 'Rejected' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setStatus(st.id);
                  setPage(1); // Reset to page 1 on filter change
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

        {/* Secondary Filters Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            paddingTop: 12,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Type:</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1); // Reset to page 1
              }}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-subtle)',
                fontSize: 12,
                color: '#0f172a',
                outline: 'none',
              }}
            >
              <option value="all">All Categories</option>
              {VENUE_CATEGORIES?.map((cat) => {
                const id = typeof cat === 'string' ? cat : cat.id;
                const label = typeof cat === 'string' ? cat.replace('-', ' ') : cat.label;
                return (
                  <option key={id} value={id}>
                    {label.toUpperCase()}
                  </option>
                );
              })}
            </select>
          </div>

          {/* City Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>City:</span>
            <input
              type="text"
              placeholder="e.g. Mumbai"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1); // Reset to page 1
              }}
              style={{
                width: 120,
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-subtle)',
                fontSize: 12,
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1); // Reset to page 1
              }}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-subtle)',
                fontSize: 12,
                color: '#0f172a',
                outline: 'none',
              }}
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Venue Name</option>
              <option value="price">Price / Day</option>
              <option value="rating">Rating</option>
              <option value="capacity">Capacity</option>
            </select>
          </div>

          {/* Order */}
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPage(1); // Reset to page 1
            }}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-subtle)',
              fontSize: 12,
              color: '#0f172a',
              outline: 'none',
            }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Main Content: Table or Card View */}
      {loading && venues.length === 0 ? (
        <PageLoader />
      ) : venues.length === 0 ? (
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
          <Building2 size={42} style={{ margin: '0 auto 12px auto', color: '#94a3b8' }} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>No venues found</h3>
          <p style={{ fontSize: 13, marginTop: 4 }}>
            Try adjusting your search keywords, status filter, or category filters.
          </p>
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
                    Venue Name
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Owner
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Location
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Type
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Capacity
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Price/Day
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Bookings
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Revenue
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
                {venues.map((venue) => {
                  const isRejected = venue.status === 'rejected';
                  const isActive = venue.status === 'active';
                  const isPending = venue.status === 'pending';

                  return (
                    <tr
                      key={venue._id}
                      onClick={() => navigate(`/admin/venues/${venue._id}`)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={venue.coverImage?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=100'}
                            alt={venue.name}
                            style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{venue.name}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              ★ {venue.rating?.average || 4.5} ({venue.rating?.count || 0} reviews)
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{venue.owner?.name || 'Unknown Host'}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{venue.owner?.email}</div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: '#0f172a', fontWeight: 600, textTransform: 'capitalize' }}>
                          {venue.location?.city}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{venue.location?.state}</div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#6344f5',
                            background: '#f0ebff',
                            padding: '3px 8px',
                            borderRadius: 6,
                            textTransform: 'capitalize',
                          }}
                        >
                          {String(venue.category || '').replace('-', ' ')}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: 600 }}>
                        {venue.minCapacity} - {venue.maxCapacity}
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                        ₹{Number(venue.pricePerDay || 0).toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                        {venue.bookingsCount || 0}
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#10b981' }}>
                        ₹{(venue.revenue || 0).toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span
                          className={`badge ${
                            isActive
                              ? 'badge-success'
                              : isPending
                              ? 'badge-warning'
                              : isRejected
                              ? 'badge-error'
                              : 'badge-neutral'
                          }`}
                          style={{ textTransform: 'capitalize', fontSize: 11, padding: '3px 8px' }}
                        >
                          {venue.status}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/venues/${venue._id}`);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ borderRadius: 8, padding: '5px 10px', fontSize: 12, gap: 4 }}
                          >
                            <Eye size={13} /> View
                          </button>

                          {isRejected || isPending ? (
                            <button
                              onClick={(e) => handleApprove(e, venue)}
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
                              onClick={(e) => openRejectModal(e, venue)}
                              className="btn btn-secondary btn-sm"
                              style={{
                                borderRadius: 8,
                                padding: '5px 10px',
                                fontSize: 12,
                                gap: 4,
                                color: '#ef4444',
                              }}
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
          {venues.map((venue) => {
            const isRejected = venue.status === 'rejected';
            const isActive = venue.status === 'active';
            const isPending = venue.status === 'pending';

            return (
              <div
                key={venue._id}
                onClick={() => navigate(`/admin/venues/${venue._id}`)}
                className="card hover-lift"
                style={{
                  borderRadius: 18,
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ position: 'relative', height: 160, background: '#f1f5f9' }}>
                  <img
                    src={venue.coverImage?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500'}
                    alt={venue.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    className={`badge ${
                      isActive ? 'badge-success' : isPending ? 'badge-warning' : isRejected ? 'badge-error' : 'badge-neutral'
                    }`}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      textTransform: 'capitalize',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    {venue.status}
                  </span>
                </div>

                <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1, gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#6344f5', textTransform: 'uppercase' }}>
                      {String(venue.category || '').replace('-', ' ')}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                      {venue.name}
                    </h3>
                    <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <MapPin size={13} style={{ color: '#6344f5' }} /> {venue.location?.city}, {venue.location?.state}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '10px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Price / Day</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                        ₹{Number(venue.pricePerDay || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Total Revenue</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#10b981' }}>
                        ₹{(venue.revenue || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Host: <strong style={{ color: '#0f172a' }}>{venue.owner?.name || 'Unknown'}</strong> ({venue.owner?.email})
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', gap: 8 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/venues/${venue._id}`);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, borderRadius: 10, fontSize: 12, gap: 4 }}
                    >
                      <Eye size={13} /> View Details
                    </button>
                    {isRejected || isPending ? (
                      <button
                        onClick={(e) => handleApprove(e, venue)}
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
                        onClick={(e) => openRejectModal(e, venue)}
                        className="btn btn-secondary btn-sm"
                        style={{ borderRadius: 10, fontSize: 12, gap: 4, color: '#ef4444' }}
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Real Server-side Pagination Component */}
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

      {/* Reject Venue Modal */}
      {rejectingVenue && (
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
                  Reject Venue Listing
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0 0' }}>
                  {rejectingVenue.name}
                </p>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>
              Rejecting this venue will remove it from the customer marketplace. The venue remains securely in the database and can be approved again at any time.
            </p>

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
                placeholder="Enter explanation for venue rejection..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
              <button
                onClick={() => setRejectingVenue(null)}
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

export default AdminVenuesPage;
