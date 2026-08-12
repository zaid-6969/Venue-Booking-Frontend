/**
 * InvoiceModal Component
 *
 * Professional GST Tax Invoice modal viewable and printable by Customers and Venue Owners.
 */

import { X, Printer, Download, CheckCircle2, Building2, ShieldCheck } from 'lucide-react';

const InvoiceModal = ({ booking, invoiceData, onClose, isOwner = false }) => {
  if (!booking && !invoiceData) return null;

  const data = invoiceData || {};
  const ref = booking?.bookingReference || data.eventDetails?.reference || 'VH-2026-X89B';
  const invNumber = data.invoiceNumber || `INV-${ref}`;
  const issueDate = data.issueDate ? new Date(data.issueDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  const eventDate = booking?.eventDate || data.eventDetails?.date ? new Date(booking?.eventDate || data.eventDetails?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';

  const customerName = booking?.customer?.name || data.customer?.name || 'Customer';
  const customerEmail = booking?.customer?.email || data.customer?.email || 'N/A';
  const customerPhone = booking?.customer?.phone || data.customer?.phone || 'N/A';

  const venueName = booking?.venue?.name || data.venue?.name || 'Grand Banquet Hall';
  const venueAddress = booking?.venue?.location?.address || data.venue?.address || '14 Linking Road';
  const venueCity = booking?.venue?.location?.city || data.venue?.city || 'Mumbai';

  const pricing = booking?.pricing || data.pricing || {};
  const basePrice = pricing.basePrice || 150000;
  const packagePrice = pricing.packagePrice || 0;
  const extrasPrice = pricing.extrasPrice || 0;
  const taxAmount = pricing.taxAmount || Math.round((basePrice + packagePrice + extrasPrice) * 0.18);
  const totalAmount = pricing.totalAmount || (basePrice + packagePrice + extrasPrice + taxAmount);

  const platformFee = data.pricing?.platformFee || Math.round(totalAmount * 0.10);
  const ownerNetProfit = data.pricing?.ownerNetProfit || (totalAmount - platformFee);

  const transactionId = booking?.transactionId || data.transactionId || `TXN_${ref}`;
  const paymentStatus = booking?.paymentStatus || data.paymentStatus || 'success';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="card glass invoice-printable" style={{ width: '100%', maxWidth: 760, maxHeight: '92vh', overflowY: 'auto', background: '#ffffff', color: '#1e293b', borderRadius: 'var(--radius-3xl)', padding: 'var(--space-8)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        
        {/* Header bar (Hide on print) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={24} style={{ color: 'var(--brand-default)' }} />
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#0f172a' }}>TAX INVOICE PREVIEW</h2>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button onClick={handlePrint} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
              <Printer size={16} /> Print / Download PDF
            </button>
            <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: 6, color: '#64748b' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Branding Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', borderBottom: '2px solid #f1f5f9', paddingBottom: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#ff5a36' }}>VENUE</span>HUB
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>Official Platform Tax Invoice & Deposit Receipt</p>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>GSTIN: 27AABCV1234F1Z9 • SAC: 998311</p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-success" style={{ fontSize: '11px', padding: '4px 12px', textTransform: 'uppercase', background: '#dcfce7', color: '#15803d', fontWeight: 800 }}>
              {paymentStatus === 'success' || paymentStatus === 'completed' ? 'PAID & CONFIRMED' : 'PAYMENT PENDING'}
            </span>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: '#0f172a', marginTop: 6, fontFamily: 'monospace' }}>
              {invNumber}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Issued: {issueDate}</div>
          </div>
        </div>

        {/* Bill To & Venue Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)', background: '#f8fafc', padding: 'var(--space-5)', borderRadius: 'var(--radius-2xl)', border: '1px solid #e2e8f0' }}>
          <div>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Billed To (Customer)</span>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{customerName}</div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: 2 }}>Email: {customerEmail}</div>
            <div style={{ fontSize: '12px', color: '#475569' }}>Phone: {customerPhone}</div>
          </div>

          <div>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Venue Details</span>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{venueName}</div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: 2 }}>{venueAddress}, {venueCity}</div>
            <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 700, marginTop: 2 }}>Event Date: {eventDate}</div>
          </div>
        </div>

        {/* Reference & Transaction details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', background: '#fff', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-6)' }}>
          <span><strong>Booking Reference:</strong> <code style={{ color: '#ff5a36' }}>{ref}</code></span>
          <span><strong>Transaction ID:</strong> <code style={{ color: '#475569' }}>{transactionId}</code></span>
        </div>

        {/* Itemized Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 'var(--space-6)', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left', color: '#334155' }}>
              <th style={{ padding: '10px 12px', fontWeight: 800 }}>Description</th>
              <th style={{ padding: '10px 12px', fontWeight: 800, textAlign: 'right' }}>Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px 12px', color: '#1e293b', fontWeight: 600 }}>Venue Rental Charges (Base)</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>₹{basePrice.toLocaleString('en-IN')}</td>
            </tr>
            {packagePrice > 0 && (
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px', color: '#1e293b' }}>Selected Event Package</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>₹{packagePrice.toLocaleString('en-IN')}</td>
              </tr>
            )}
            {extrasPrice > 0 && (
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px', color: '#1e293b' }}>Add-on Services & Catering Extras</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>₹{extrasPrice.toLocaleString('en-IN')}</td>
              </tr>
            )}
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px 12px', color: '#64748b' }}>GST Tax (18% Mock)</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>₹{taxAmount.toLocaleString('en-IN')}</td>
            </tr>
            <tr style={{ background: '#f8fafc', fontWeight: 900, fontSize: '15px' }}>
              <td style={{ padding: '12px', color: '#0f172a' }}>Total Amount Paid</td>
              <td style={{ padding: '12px', textAlign: 'right', color: '#ff5a36' }}>₹{totalAmount.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        {/* Owner Net Payout Breakdown (visible to Owner or Admin) */}
        {isOwner && (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-6)' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#047857', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={16} /> OWNER PAYOUT SUMMARY
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#065f46', marginBottom: 2 }}>
              <span>Gross Booking Revenue:</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#065f46', marginBottom: 4 }}>
              <span>Platform Service Fee (10% Commission):</span>
              <span>- ₹{platformFee.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, color: '#047857', borderTop: '1px dashed #6ee7b7', paddingTop: 4 }}>
              <span>Net Owner Profit Credited:</span>
              <span>₹{ownerNetProfit.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ShieldCheck size={14} style={{ color: '#16a34a' }} /> Computer Generated Tax Invoice. No Signature Required.
          </div>
          <div>EventFlow Platform Services © 2026</div>
        </div>

      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-printable, .invoice-printable * { visibility: visible; }
          .invoice-printable { position: absolute; left: 0; top: 0; width: 100% !important; max-width: 100% !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default InvoiceModal;
