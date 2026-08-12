/**
 * AdminBookingsPage Component — Platform-wide Bookings Registry
 *
 * Real MongoDB master ledger of all customer reservations across all venues.
 * Features multi-parameter search, status filtering, sorting, server-side pagination, and details modal.
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Search,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import adminService from '../services/adminService';
import PageLoader from '@shared/components/feedback/PageLoader';
import Pagination from '@shared/components/navigation/Pagination';

const AdminBookingsPage = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [bookingStatus, setBookingStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Booking detail modal
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        bookingStatus: bookingStatus !== 'all' ? bookingStatus : undefined,
        paymentStatus: paymentStatus !== 'all' ? paymentStatus : undefined,
        sortBy,
        sortOrder,
      };
      const res = await adminService.getAllBookings(params);
      if (res?.data) {
        setBookings(res.data);
        const pagination = res.pagination || res.meta || {};
        setTotal(pagination.total ?? res.total ?? 0);
        setTotalPages(pagination.totalPages ?? res.totalPages ?? 1);
      }
    } catch (err) {
      console.error('Error fetching platform bookings:', err);
      toast.error(err?.response?.data?.message || 'Failed to load platform bookings');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, bookingStatus, paymentStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#6344f5', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            TRANSACTION & RESERVATION LEDGER
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)', margin: '2px 0 0 0' }}>
            Platform Bookings
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0 0' }}>
            Master list of all customer reservations across all venues on EventFlow ({total} total).
          </p>
        </div>

        <button
          onClick={() => fetchBookings()}
          className="btn btn-secondary"
          style={{ borderRadius: 12, padding: '8px 14px', fontSize: 13, gap: 6 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
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
              placeholder="Search reference (VH-2026-...), requests..."
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

          {/* Quick Status Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'completed', label: 'Completed' },
              { id: 'pending', label: 'Pending' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setBookingStatus(st.id);
                  setPage(1); // Reset to page 1 on filter
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: bookingStatus === st.id ? '1px solid #6344f5' : '1px solid var(--border-subtle)',
                  background: bookingStatus === st.id ? '#f0ebff' : 'var(--surface-1)',
                  color: bookingStatus === st.id ? '#6344f5' : '#64748b',
                }}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Line */}
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
          {/* Payment Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Payment:</span>
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1); // Reset to page 1 on filter
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
              <option value="all">All Payments</option>
              <option value="success">Success / Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Sort Field */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1); // Reset to page 1 on sort
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
              <option value="eventDate">Event Date</option>
              <option value="amount">Total Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading && bookings.length === 0 ? (
        <PageLoader />
      ) : bookings.length === 0 ? (
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
          <CalendarCheck size={42} style={{ margin: '0 auto 12px auto', color: '#94a3b8' }} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>No bookings found</h3>
          <p style={{ fontSize: 13, marginTop: 4 }}>No platform reservations match your selected criteria.</p>
        </div>
      ) : (
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
                    Booking ID
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Customer
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Venue
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Owner
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Event Date
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Amount
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Payment
                  </th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b._id}
                    onClick={() => setSelectedBooking(b)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#6344f5', fontFamily: 'var(--font-mono)' }}>
                      {b.bookingReference}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.customer?.name || 'Customer'}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{b.customer?.email}</div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.venue?.name || 'Venue'}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{b.venue?.location?.city}</div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ color: '#0f172a', fontWeight: 600 }}>{b.owner?.name || 'Owner'}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{b.owner?.email}</div>
                    </td>

                    <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: 600 }}>
                      {b.eventDate ? new Date(b.eventDate).toLocaleDateString('en-IN') : '—'}
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                      {formatCurrency(b.pricing?.totalAmount || 0)}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
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

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        className={`badge ${
                          b.paymentStatus === 'success' ? 'badge-success' : 'badge-neutral'
                        }`}
                        style={{ fontSize: 11, textTransform: 'capitalize' }}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(b);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ borderRadius: 8, padding: '5px 10px', fontSize: 12, gap: 4 }}
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {/* Booking Details Modal */}
      {selectedBooking && (
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
              maxWidth: 560,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 26,
              borderRadius: 20,
              background: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#6344f5', fontFamily: 'var(--font-mono)' }}>
                  {selectedBooking.bookingReference}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: '2px 0 0 0' }}>
                  Booking Inspection
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 12 }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Booking Status</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2, textTransform: 'capitalize' }}>
                  {selectedBooking.bookingStatus}
                </div>
              </div>
              <div style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 12 }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Payment Status</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2, textTransform: 'capitalize' }}>
                  {selectedBooking.paymentStatus}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: '#64748b' }}>Venue</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>{selectedBooking.venue?.name || 'Venue'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: '#64748b' }}>Customer</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedBooking.customer?.name} ({selectedBooking.customer?.email})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: '#64748b' }}>Host / Owner</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedBooking.owner?.name} ({selectedBooking.owner?.email})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: '#64748b' }}>Event Date</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>
                  {selectedBooking.eventDate ? new Date(selectedBooking.eventDate).toLocaleDateString('en-IN') : '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: '#64748b' }}>Guest Count</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedBooking.guestCount} Guests</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: '#64748b' }}>Total Gross Amount</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#6344f5' }}>
                  {formatCurrency(selectedBooking.pricing?.totalAmount || 0)}
                </span>
              </div>
            </div>

            {selectedBooking.specialRequests && (
              <div>
                <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Special Requests</span>
                <p style={{ fontSize: 12, color: '#334155', background: 'var(--bg-subtle)', padding: 10, borderRadius: 8, margin: 0 }}>
                  {selectedBooking.specialRequests}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
              <button
                onClick={() => setSelectedBooking(null)}
                className="btn btn-secondary"
                style={{ borderRadius: 10, padding: '8px 16px', fontSize: 13 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
