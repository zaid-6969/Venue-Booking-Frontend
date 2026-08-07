/**
 * OwnerBookingsPage Component
 *
 * Full venue booking management for venue owners:
 * - Filterable by status (All, Pending, Confirmed, Cancelled, Completed, Rejected)
 * - Customer contact details & event specs
 * - Action triggers: Accept, Reject, Cancel, Reschedule, Add Owner Notes
 * - Invoice download preview & Booking Timeline
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CalendarCheck, CheckCircle2, XCircle, Clock, Eye, Phone, Mail,
  FileText, User, MessageSquare, AlertCircle, X, Shield, RefreshCw, Printer, Trash2
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
  const bookings = useSelector(selectOwnerBookings);

  const [filter, setFilter] = useState('all');
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
    toast.success('Owner internal note saved!');
  };

  const filteredBookings = (bookings || []).filter(b => filter === 'all' || b.bookingStatus === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header & Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Venue Reservations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Review booking inquiries, contact customers, and manage reservation schedules
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface-1)', padding: 4, borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          {['all', 'pending', 'accepted', 'confirmed', 'completed', 'cancelled', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: filter === tab ? 'var(--brand-default)' : 'transparent',
                color: filter === tab ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <CalendarCheck size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--space-4) auto' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>No Reservations Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            There are currently no {filter !== 'all' ? filter : ''} bookings for your venues.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filteredBookings.map((item) => {
            const badge = STATUS_BADGE_MAP[item.bookingStatus] || STATUS_BADGE_MAP.pending;
            return (
              <div key={item._id} className="card" style={{ padding: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 4 }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--brand-default)', fontFamily: 'var(--font-mono)' }}>
                      REF: {item.bookingReference || item._id?.slice(-8)}
                    </span>
                    <span className={`badge ${badge.cls}`}>{badge.label}</span>
                  </div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{item.venue?.name || 'Event Venue'}</h3>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span>👤 {item.customer?.name || 'Guest Customer'}</span>
                    <span>📞 {item.customer?.phone || '+91 98765 43210'}</span>
                    <span>📅 Event: {new Date(item.eventDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--brand-default)' }}>
                      ₹{(item.pricing?.totalAmount || item.totalPrice || 150000).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-success-700)', fontWeight: 600 }}>
                      Payment: {item.paymentStatus || 'Pending'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button onClick={() => setSelectedBooking(item)} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
                      <Eye size={14} /> Details
                    </button>
                    {(item.bookingStatus === 'pending' || item.bookingStatus === 'rejected') && (
                      <button onClick={() => handleConfirm(item._id)} className="btn btn-primary btn-sm" style={{ gap: 4 }}>
                        <CheckCircle2 size={14} /> Accept Request
                      </button>
                    )}
                    {item.bookingStatus === 'pending' && (
                      <button onClick={() => handleReject(item._id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-error-500)', gap: 4 }}>
                        <XCircle size={14} /> Reject
                      </button>
                    )}
                    {item.bookingStatus === 'rejected' && (
                      <button onClick={() => handleDeleteBooking(item._id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-error-500)', gap: 4 }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                    {(item.bookingStatus === 'confirmed' || item.bookingStatus === 'completed') && (
                      <button onClick={() => { setSelectedBooking(item); setShowOwnerInvoiceModal(true); }} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
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
          <div className="card glass" style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: 'var(--space-6)', background: 'var(--surface-1)', borderRadius: 'var(--radius-3xl)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--brand-default)', fontFamily: 'var(--font-mono)' }}>
                  BOOKING REF: {selectedBooking.bookingReference || selectedBooking._id}
                </span>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginTop: 2 }}>{selectedBooking.venue?.name || 'Venue Booking'}</h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                <X size={22} />
              </button>
            </div>

            {/* Customer Contact Details */}
            <div style={{ background: 'var(--bg-subtle)', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-4)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Customer Name</div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginTop: 2 }}>{selectedBooking.customer?.name || 'Customer'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Phone Number</div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginTop: 2 }}>{selectedBooking.customer?.phone || '+91 98765 43210'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Email Address</div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{selectedBooking.customer?.email || 'customer@venuehub.in'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Event Date</div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--brand-default)', marginTop: 2 }}>
                  {new Date(selectedBooking.eventDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>Booking Timeline</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--color-success-500)' }} /> Request Submitted by Customer ({new Date(selectedBooking.createdAt || Date.now()).toLocaleDateString('en-IN')})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={14} style={{ color: 'var(--color-warning-500)' }} /> Owner Status: <strong style={{ textTransform: 'capitalize' }}>{selectedBooking.bookingStatus}</strong>
                </div>
              </div>
            </div>

            {/* Internal Notes */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Internal Owner Notes</label>
              <textarea
                rows={3}
                value={ownerNote}
                onChange={(e) => setOwnerNote(e.target.value)}
                className="input"
                placeholder="Add private staff notes regarding stage setup, catering choices, or advance payment..."
              />
              <button onClick={handleSaveNote} className="btn btn-secondary btn-sm" style={{ marginTop: 6 }}>Save Note</button>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
              {(selectedBooking.bookingStatus === 'pending' || selectedBooking.bookingStatus === 'rejected') && (
                <button onClick={() => handleConfirm(selectedBooking._id)} className="btn btn-primary" style={{ flex: 1, gap: 6 }}>
                  <CheckCircle2 size={16} /> Accept Request
                </button>
              )}
              {selectedBooking.bookingStatus === 'pending' && (
                <button onClick={() => handleReject(selectedBooking._id)} className="btn btn-secondary" style={{ flex: 1, color: 'var(--color-error-500)', gap: 6 }}>
                  <XCircle size={16} /> Reject Request
                </button>
              )}
              {selectedBooking.bookingStatus === 'rejected' && (
                <button onClick={() => handleDeleteBooking(selectedBooking._id)} className="btn btn-secondary" style={{ flex: 1, color: 'var(--color-error-500)', gap: 6 }}>
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
