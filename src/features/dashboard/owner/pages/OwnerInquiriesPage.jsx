/**
 * OwnerInquiriesPage Component
 *
 * Dedicated page for managing customer booking inquiries / requests before confirmation:
 * - Filterable by inquiry status (All, Pending Requests, Accepted, Rejected)
 * - Customer contact details, guest specs, special requests
 * - Quick action triggers: Accept Request (notifies customer to pay), Reject Request (with reason)
 * - Details modal for full customer request specifications
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FileText, CheckCircle2, XCircle, Clock, Eye, Phone, Mail,
  User, MessageSquare, AlertCircle, X, Calendar, Building2, Users, Search
} from 'lucide-react';
import { fetchOwnerBookings, confirmBooking, rejectBooking, selectOwnerBookings } from '@features/bookings/redux/bookingsSlice';
import toast from 'react-hot-toast';

const OwnerInquiriesPage = () => {
  const dispatch = useDispatch();
  const rawBookings = useSelector(selectOwnerBookings);
  const bookings = Array.isArray(rawBookings) ? rawBookings : [];

  const [tabFilter, setTabFilter] = useState('pending'); // default to pending requests requiring action
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    dispatch(fetchOwnerBookings());
  }, [dispatch]);

  const handleConfirm = async (id) => {
    try {
      await dispatch(confirmBooking(id)).unwrap();
      toast.success('Inquiry accepted! Customer has been notified to complete payment.');
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry(prev => prev ? { ...prev, bookingStatus: 'accepted' } : null);
      }
    } catch {
      toast.error('Failed to accept inquiry');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('State reason for rejecting this request:');
    if (!reason) return;
    try {
      await dispatch(rejectBooking({ id, reason })).unwrap();
      toast.success('Inquiry rejected');
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry(prev => prev ? { ...prev, bookingStatus: 'rejected' } : null);
      }
    } catch {
      toast.error('Failed to reject inquiry');
    }
  };

  // Filter logic
  const inquiriesList = bookings.filter(b => {
    // Match tab
    let matchesTab = true;
    if (tabFilter === 'pending') matchesTab = b.bookingStatus === 'pending';
    else if (tabFilter === 'accepted') matchesTab = b.bookingStatus === 'accepted';
    else if (tabFilter === 'rejected') matchesTab = b.bookingStatus === 'rejected';

    // Match search query
    const q = searchQuery.toLowerCase().trim();
    let matchesSearch = true;
    if (q) {
      matchesSearch = (
        (b.customer?.name || '').toLowerCase().includes(q) ||
        (b.venue?.name || '').toLowerCase().includes(q) ||
        (b.bookingReference || '').toLowerCase().includes(q)
      );
    }
    return matchesTab && matchesSearch;
  });

  const pendingCount = bookings.filter(b => b.bookingStatus === 'pending').length;
  const acceptedCount = bookings.filter(b => b.bookingStatus === 'accepted').length;
  const rejectedCount = bookings.filter(b => b.bookingStatus === 'rejected').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 40 }}>
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)' }}>Booking Inquiries</h1>
            {pendingCount > 0 && (
              <span style={{
                background: '#6344f5', color: '#fff', fontSize: 12, fontWeight: 800,
                padding: '2px 10px', borderRadius: 999
              }}>
                {pendingCount} Pending Action
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Customer event requests requiring your attention before becoming confirmed reservations
          </p>
        </div>

        {/* Search Input */}
        <div style={{
          display: 'flex', alignItems: 'center', background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '6px 12px', width: 280
        }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)', marginRight: 8 }} />
          <input
            type="text"
            placeholder="Search by customer or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 13, color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex', gap: 6, background: 'var(--surface-1)', padding: 4,
        borderRadius: 14, border: '1px solid var(--border-subtle)', width: 'fit-content', flexWrap: 'wrap'
      }}>
        {[
          { key: 'pending', label: `Pending Requests (${pendingCount})` },
          { key: 'accepted', label: `Accepted (${acceptedCount})` },
          { key: 'rejected', label: `Rejected (${rejectedCount})` },
          { key: 'all', label: `All Inquiries (${bookings.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTabFilter(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              background: tabFilter === tab.key ? '#6344f5' : 'transparent',
              color: tabFilter === tab.key ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: tabFilter === tab.key ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inquiries List */}
      {inquiriesList.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--surface-1)', borderRadius: 20 }}>
          <FileText size={44} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>No Inquiries Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4, maxWidth: 420, marginInline: 'auto' }}>
            {tabFilter === 'pending'
              ? 'You currently have no pending inquiries waiting for approval.'
              : `No inquiries match the filter criteria.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
          {inquiriesList.map((item) => {
            const isPending = item.bookingStatus === 'pending';
            const isAccepted = item.bookingStatus === 'accepted';
            const isRejected = item.bookingStatus === 'rejected';

            return (
              <div key={item._id} className="card" style={{
                padding: 20, borderRadius: 20, background: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                gap: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}>
                <div>
                  {/* Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#6344f5', fontFamily: 'var(--font-mono)' }}>
                      REF: {item.bookingReference || item._id?.slice(-8)}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999,
                      background: isPending ? '#fff7ed' : isAccepted ? '#ecfdf5' : '#fef2f2',
                      color: isPending ? '#c2410c' : isAccepted ? '#047857' : '#b91c1c',
                      border: `1px solid ${isPending ? '#ffedd5' : isAccepted ? '#a7f3d0' : '#fecaca'}`
                    }}>
                      {isPending ? '⏳ Awaiting Action' : isAccepted ? '✓ Accepted' : '✕ Rejected'}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', background: '#f0ebff',
                      color: '#6344f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 18, flexShrink: 0
                    }}>
                      {item.customer?.name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {item.customer?.name || 'Guest Customer'}
                      </h3>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', gap: 12 }}>
                        <span>📞 {item.customer?.phone || '+91 98765 43210'}</span>
                        <span>✉️ {item.customer?.email || 'customer@eventflow.in'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Event & Venue Specifications Card */}
                  <div style={{
                    background: 'var(--bg-subtle)', padding: 12, borderRadius: 12,
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12
                  }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Venue Requested</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 1 }}>{item.venue?.name || 'Event Venue'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Requested Date</div>
                      <div style={{ fontWeight: 700, color: '#6344f5', marginTop: 1 }}>
                        {new Date(item.eventDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Guest Capacity</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 1 }}>{item.guestCount || 100} Guests</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Total Amount</div>
                      <div style={{ fontWeight: 800, color: '#10b981', marginTop: 1 }}>
                        ₹{(item.pricing?.totalAmount || item.totalPrice || 150000).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Special Requests snippet */}
                  {item.specialRequests && (
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)', background: '#fff', padding: 8, borderRadius: 8, border: '1px dashed var(--border-subtle)' }}>
                      💬 <em>"{item.specialRequests}"</em>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
                  <button
                    onClick={() => setSelectedInquiry(item)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, borderRadius: 10, fontSize: 12, fontWeight: 700, gap: 4, justifyContent: 'center' }}
                  >
                    <Eye size={14} /> View Details
                  </button>

                  {isPending && (
                    <>
                      <button
                        onClick={() => handleConfirm(item._id)}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, borderRadius: 10, fontSize: 12, fontWeight: 700, background: '#10b981', border: 'none', gap: 4, justifyContent: 'center' }}
                      >
                        <CheckCircle2 size={14} /> Accept
                      </button>
                      <button
                        onClick={() => handleReject(item._id)}
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#ef4444', gap: 4, justifyContent: 'center' }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card glass" style={{ width: '100%', maxWidth: 560, padding: 24, background: 'var(--surface-1)', borderRadius: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#6344f5' }}>
                  INQUIRY REF: {selectedInquiry.bookingReference || selectedInquiry._id}
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '2px 0 0 0' }}>Customer Booking Request</h3>
              </div>
              <button onClick={() => setSelectedInquiry(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                <X size={22} />
              </button>
            </div>

            {/* Customer Details */}
            <div style={{ background: 'var(--bg-subtle)', padding: 16, borderRadius: 16, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Customer Name</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{selectedInquiry.customer?.name || 'Customer'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Phone Number</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{selectedInquiry.customer?.phone || '+91 98765 43210'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Email Address</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{selectedInquiry.customer?.email || 'customer@eventflow.in'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Requested Event Date</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#6344f5', marginTop: 2 }}>
                  {new Date(selectedInquiry.eventDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Package & Pricing Breakdown */}
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Package & Estimated Pricing</h4>
              <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', padding: 12, borderRadius: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Base Venue Hire</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{(selectedInquiry.pricing?.basePrice || 120000).toLocaleString('en-IN')}</strong>
                </div>
                {selectedInquiry.selectedPackage && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Selected Package ({selectedInquiry.selectedPackage.name || 'Standard'})</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{(selectedInquiry.selectedPackage.price || 0).toLocaleString('en-IN')}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--text-tertiary)' }}>
                  <span>Estimated Taxes (18% GST)</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{(selectedInquiry.pricing?.taxAmount || 21600).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 8, marginTop: 4, fontSize: 15, fontWeight: 800 }}>
                  <span>Total Quoted Amount</span>
                  <strong style={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}>₹{(selectedInquiry.pricing?.totalAmount || 150000).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedInquiry.bookingStatus === 'pending' && (
              <div style={{ display: 'flex', gap: 12, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                <button
                  onClick={() => handleConfirm(selectedInquiry._id)}
                  className="btn btn-primary"
                  style={{ flex: 1, background: '#10b981', border: 'none', gap: 6, justifyContent: 'center' }}
                >
                  <CheckCircle2 size={16} /> Accept & Notify Customer
                </button>
                <button
                  onClick={() => handleReject(selectedInquiry._id)}
                  className="btn btn-secondary"
                  style={{ flex: 1, color: '#ef4444', gap: 6, justifyContent: 'center' }}
                >
                  <XCircle size={16} /> Reject Inquiry
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerInquiriesPage;
