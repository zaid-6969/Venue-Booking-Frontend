/**
 * OwnerProfilePage Component
 *
 * Venue Owner Profile & KYB Business Settings:
 * - Personal contact information (Name, Email, Phone)
 * - Business Verification & GSTIN / Tax ID details
 * - Payout Bank Account details
 * - Password Security Management
 */

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { User, Building2, ShieldCheck, Mail, Phone, Lock, Save, FileText, CheckCircle2 } from 'lucide-react';
import { selectCurrentUser } from '@features/auth/redux/authSlice';
import toast from 'react-hot-toast';

const OwnerProfilePage = () => {
  const user = useSelector(selectCurrentUser);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '9876543210',
    businessName: 'Majestic Event Hospitality Pvt Ltd',
    gstin: '27AAAAA0000A1Z5',
    pan: 'ABCDE1234F',
    bankName: 'HDFC Bank',
    accountNumber: '•••• •••• 5678',
    ifsc: 'HDFC0001234',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Business profile & payout settings saved!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 880 }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Partner Profile & Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Manage your contact details, business tax IDs, and payout bank accounts.
        </p>
      </div>

      {/* Account Status Badge */}
      <div className="card glass" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-2xl)', background: 'linear-gradient(135deg, var(--surface-1) 0%, var(--color-success-50) 100%)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-xl)', background: 'var(--color-success-100)', color: 'var(--color-success-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>Verified Partner Account</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>KYB documents verified by VenueHub Compliance Team</p>
          </div>
        </div>
        <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <CheckCircle2 size={12} /> Active & Verified
        </span>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Personal Details */}
        <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={18} style={{ color: 'var(--brand-default)' }} /> Owner Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" required disabled style={{ opacity: 0.75 }} />
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input" required />
            </div>
          </div>
        </div>

        {/* Business & Tax Details */}
        <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={18} style={{ color: 'var(--brand-default)' }} /> Business & Tax KYB
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Registered Business Name</label>
              <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className="input" />
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>GSTIN Number</label>
              <input type="text" name="gstin" value={formData.gstin} onChange={handleChange} className="input" />
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>PAN Card Number</label>
              <input type="text" name="pan" value={formData.pan} onChange={handleChange} className="input" />
            </div>
          </div>
        </div>

        {/* Payout Bank Details */}
        <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} style={{ color: 'var(--brand-default)' }} /> Payout Bank Account Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Bank Name</label>
              <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="input" />
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Account Number</label>
              <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="input" />
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>IFSC Code</label>
              <input type="text" name="ifsc" value={formData.ifsc} onChange={handleChange} className="input" />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', gap: 'var(--space-2)' }}>
          <Save size={18} /> Save Profile & Settings
        </button>
      </form>
    </div>
  );
};

export default OwnerProfilePage;
