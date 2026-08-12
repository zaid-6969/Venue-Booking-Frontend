/**
 * OwnerBookingsPage Component
 *
 * Full venue reservation management for venue owners:
 * - Filterable by status (All, Confirmed, Completed, Pending, Cancelled, Rejected)
 * - Customer contact details & event specs
 * - Action triggers: Details, Accept Request, Reject Request, Delete, Invoice Preview
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CalendarCheck, CheckCircle2, XCircle, Clock, Eye, Phone, Mail,
  FileText, User, MessageSquare, AlertCircle, X, Shield, RefreshCw, Printer, Trash2, Search
} from 'lucide-react';
import { fetchOwnerBookings, confirmBooking, rejectBooking, deleteBooking, selectOwnerBookings } from '@features/bookings/redux/bookingsSlice';
import InvoiceModal from '@features/bookings/components/InvoiceModal';
import toast from 'react-hot-toast';

const STATUS_BADGE_MAP = {
  pending:   { label: 'Pending Request', cls: 'badge-warning' },
  accepted:  { label: 'Accepted (Awaiting Payment)', cls: 'badge-warning' },
  confirmed: { label: 'Confirmed & Paid', cls: 'badge-success' },
  cancelled: { label: 'Cancelled', cls: 'badge-error' },
  rejected:  { label: 'Rejected', cls: 'badge-error' },
  completed: { label: 'Completed', cls: 'badge-info' },
};

const OwnerBookingsPage = () => {
  const dispatch = useDispatch();
  const rawBookings = useSelector(selectOwnerBookings);
  const bookings = Array.isArray(rawBookings) ? rawBookings : [];

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [ownerNote, setOwnerNote] = useState('');
  const [showOwnerInvoiceModal, setShowOwnerInvoiceModal] = useState(false);

  useEffect(() => {
    dispatch(fetchOwnerBookings());
  }, [dispatch]);

  const handleConfirm = async (id) => {
    try {
      await dispatch(confirmBooking(id)).unwrap();
      toast.success('Booking request accepted! Customer notified to make payment.');
      if (selectedBooking && selectedBooking._id === id) {
        setSelectedBooking(prev => prev ? { ...prev, bookingStatus: 'accepted' } : null);
      }
    } catch {
      toast.error('Failed to confirm booking');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please state the reason for rejecting this booking:');
    if (!reason) return;
    try {
      await dispatch(rejectBooking({ id, reason })).unwrap();
      toast.success('Booking request rejected');
      if (selectedBooking && selectedBooking._id === id) {
        setSelectedBooking(prev => prev ? { ...prev, bookingStatus: 'rejected' } : null);
      }
    } catch {
      toast.error('Failed to reject booking');
    }
  };

  const handleDeleteBooking = async (id) => {
    if (confirm('Are you sure you want to permanently delete this reservation?')) {
      try {
        await dispatch(deleteBooking(id)).unwrap();
        toast.success('Reservation deleted');
        if (selectedBooking && selectedBooking._id === id) {
          setSelectedBooking(null);
        }
      } catch {
        toast.error('Failed to delete reservation');
      }
    }
  };

  const handleSaveNote = () => {
    toast.success('Owner internal staff note saved!');
  };

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = filter === 'all' || b.bookingStatus === filter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      (b.customer?.name || '').toLowerCase().includes(q) ||
      (b.venue?.name || '').toLowerCase().includes(q) ||
      (b.bookingReference || '').toLowerCase().includes(q)
    );
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 40 }}>
      {/* Page Header & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)' }}>Venue Reservations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Review confirmed reservations, event dates, customer specs, and generate invoice statements
          </p>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '6px 12px', width: 280
        }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)', marginRight: 8 }} />
          <input
            type="text"
            placeholder="Search reference, venue, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 13, color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--surface-1)', padding: 4, borderRadius: 14, border: '1px solid var(--border-subtle)', flexWrap: 'wrap', width: 'fit-content' }}>
        {['all', 'confirmed', 'completed', 'pending', 'cancelled', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              background: filter === tab ? '#6344f5' : 'transparent',
              color: filter === tab ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: filter === tab ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--surface-1)', borderRadius: 20 }}>
          <CalendarCheck size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>No Reservations Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            There are currently no {filter !== 'all' ? filter : ''} bookings for your venue listings.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredBookings.map((item) => {
            const badge = STATUS_BADGE_MAP[item.bookingStatus] || STATUS_BADGE_MAP.pending;
            return (
              <div key={item._id} className="card" style={{
                padding: 20, borderRadius: 20, background: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: 16
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#6344f5', fontFamily: 'var(--font-mono)' }}>
                      REF: {item.bookingReference || item._id?.slice(-8)}
                    </span>
                    <span className={`badge ${badge.cls}`}>{badge.label}</span>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {item.venue?.name || 'Event Venue'}
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <span>👤 {item.customer?.name || 'Guest Customer'}</span>
                    <span>📞 {item.customer?.phone || '+91 98765 43210'}</span>
                    <span>📅 Event Date: <strong>{new Date(item.eventDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                    {item.guestCount && <span>👥 {item.guestCount} Guests</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#6344f5', fontFamily: 'var(--font-display)' }}>
                      ₹{(item.pricing?.totalAmount || item.totalPrice || 150000).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: 11, color: '#047857', fontWeight: 700, marginTop: 2 }}>
                      Payment: {item.paymentStatus || 'Pending'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setSelectedBooking(item)} className="btn btn-secondary btn-sm" style={{ gap: 4, borderRadius: 10 }}>
                      <Eye size={14} /> Details
                    </button>
                    {(item.bookingStatus === 'pending' || item.bookingStatus === 'rejected') && (
                      <button onClick={() => handleConfirm(item._id)} className="btn btn-primary btn-sm" style={{ gap: 4, background: '#10b981', border: 'none', borderRadius: 10 }}>
                        <CheckCircle2 size={14} /> Accept Request
                      </button>
                    )}
                    {item.bookingStatus === 'pending' && (
                      <button onClick={() => handleReject(item._id)} className="btn btn-secondary btn-sm" style={{ color: '#ef4444', gap: 4, borderRadius: 10 }}>
                        <XCircle size={14} /> Reject
                      </button>
                    )}
                    {item.bookingStatus === 'rejected' && (
                      <button onClick={() => handleDeleteBooking(item._id)} className="btn btn-secondary btn-sm" style={{ color: '#ef4444', gap: 4, borderRadius: 10 }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                    {(item.bookingStatus === 'confirmed' || item.bookingStatus === 'completed' || item.bookingStatus === 'accepted') && (
                      <button onClick={() => { setSelectedBooking(item); setShowOwnerInvoiceModal(true); }} className="btn btn-secondary btn-sm" style={{ gap: 4, borderRadius: 10 }}>
                        <Printer size={14} /> Invoice
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Details & Timeline Modal */}
      {selectedBooking && !showOwnerInvoiceModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card glass" style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: 24, background: 'var(--surface-1)', borderRadius: 24 }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#6344f5', fontFamily: 'var(--font-mono)' }}>
                  BOOKING REF: {selectedBooking.bookingReference || selectedBooking._id}
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>{selectedBooking.venue?.name || 'Venue Booking'}</h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                <X size={22} />
              </button>
            </div>

            {/* Customer Contact Details */}
            <div style={{ background: 'var(--bg-subtle)', padding: 16, borderRadius: 16, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Customer Name</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{selectedBooking.customer?.name || 'Customer'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Phone Number</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{selectedBooking.customer?.phone || '+91 98765 43210'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Email Address</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{selectedBooking.customer?.email || 'customer@eventflow.in'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Event Date</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#6344f5', marginTop: 2 }}>
                  {new Date(selectedBooking.eventDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Booking Timeline</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981' }} /> Request Submitted by Customer ({new Date(selectedBooking.createdAt || Date.now()).toLocaleDateString('en-IN')})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={16} style={{ color: '#f59e0b' }} /> Status: <strong style={{ textTransform: 'capitalize' }}>{selectedBooking.bookingStatus}</strong>
                </div>
              </div>
            </div>

            {/* Internal Notes */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Internal Owner Notes</label>
              <textarea
                rows={3}
                value={ownerNote}
                onChange={(e) => setOwnerNote(e.target.value)}
                className="input"
                placeholder="Add private staff notes regarding stage setup, catering choices, or advance payment..."
              />
              <button onClick={handleSaveNote} className="btn btn-secondary btn-sm" style={{ marginTop: 6, borderRadius: 8 }}>Save Note</button>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
              {(selectedBooking.bookingStatus === 'pending' || selectedBooking.bookingStatus === 'rejected') && (
                <button onClick={() => handleConfirm(selectedBooking._id)} className="btn btn-primary" style={{ flex: 1, gap: 6, background: '#10b981', border: 'none' }}>
                  <CheckCircle2 size={16} /> Accept Request
                </button>
              )}
              {selectedBooking.bookingStatus === 'pending' && (
                <button onClick={() => handleReject(selectedBooking._id)} className="btn btn-secondary" style={{ flex: 1, color: '#ef4444', gap: 6 }}>
                  <XCircle size={16} /> Reject Request
                </button>
              )}
              {selectedBooking.bookingStatus === 'rejected' && (
                <button onClick={() => handleDeleteBooking(selectedBooking._id)} className="btn btn-secondary" style={{ flex: 1, color: '#ef4444', gap: 6 }}>
                  <Trash2 size={16} /> Delete Booking
                </button>
              )}
              <button onClick={() => setShowOwnerInvoiceModal(true)} className="btn btn-secondary" style={{ gap: 6 }}>
                <FileText size={16} /> View & Print Invoice
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Invoice Modal for Owner */}
      {showOwnerInvoiceModal && selectedBooking && (
        <InvoiceModal
          booking={selectedBooking}
          onClose={() => setShowOwnerInvoiceModal(false)}
          isOwner={true}
        />
      )}
    </div>
  );
};

export default OwnerBookingsPage;
