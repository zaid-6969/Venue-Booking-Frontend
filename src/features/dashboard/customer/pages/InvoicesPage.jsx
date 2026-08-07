/**
 * InvoicesPage Component
 *
 * List of booking invoices with dummy PDF viewer & download simulation
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, Download, Eye, Calendar, Building2, Printer } from 'lucide-react';
import { fetchMyBookings, selectMyBookings } from '@features/bookings/redux/bookingsSlice';
import InvoiceModal from '@features/bookings/components/InvoiceModal';

const InvoicesPage = () => {
  const dispatch = useDispatch();
  const bookings = useSelector(selectMyBookings);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState(null);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const invoiceItems = bookings.filter(b => b.bookingStatus === 'confirmed' || b.bookingStatus === 'completed');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Invoices & Receipts</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Download official GST tax invoices for your confirmed venue reservations
        </p>
      </div>

      {invoiceItems.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <FileText size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--space-4) auto' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>No Invoices Available</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            Invoices are automatically generated once your venue booking is confirmed.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {invoiceItems.map((item) => (
            <div key={item._id} className="card" style={{ padding: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--brand-default)', fontFamily: 'var(--font-mono)' }}>
                  INV-{item.bookingReference}
                </div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  {item.venue?.name || 'Event Venue'}
                </h3>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  Issued Date: {new Date(item.createdAt).toLocaleDateString('en-IN')} • Amount: ₹{(item.pricing?.totalAmount || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <button onClick={() => setSelectedInvoiceBooking(item)} className="btn btn-primary btn-sm" style={{ gap: 'var(--space-2)' }}>
                <Printer size={16} /> View & Print Invoice
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedInvoiceBooking && (
        <InvoiceModal
          booking={selectedInvoiceBooking}
          onClose={() => setSelectedInvoiceBooking(null)}
          isOwner={false}
        />
      )}
    </div>
  );
};

export default InvoicesPage;
