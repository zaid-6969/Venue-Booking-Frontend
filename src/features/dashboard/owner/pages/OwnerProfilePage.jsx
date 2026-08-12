/**
 * OwnerProfilePage Component
 *
 * Venue Owner Business Profile & Identity Management:
 * - Owner contact details (Name, Email, Phone)
 * - Registered Business Information & KYB Verification Status
 * - Payout Bank Account Details
 */

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Building2, ShieldCheck, Mail, Phone, Save, FileText, CheckCircle2, Award } from 'lucide-react';
import { selectCurrentUser, updateUserProfile } from '@features/auth/redux/authSlice';
import toast from 'react-hot-toast';

const OwnerProfilePage = () => {
  const dispatch = useDispatch();
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
    dispatch(updateUserProfile({ name: formData.name, phone: formData.phone }));
    toast.success('Owner partner business profile saved!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 880, paddingBottom: 40 }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)' }}>Partner Business Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Manage your owner contact details, verified business identity, and payout bank settings
        </p>
      </div>

      {/* Account Verification Banner */}
      <div className="card glass" style={{
        padding: 20, borderRadius: 20,
        background: 'linear-gradient(135deg, #f7f5ff 0%, #ecfdf5 100%)',
        border: '1px solid #d1fae5', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: '#10b981',
            color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Verified Venue Owner Account
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              Business tax documents & bank accounts verified by EventFlow Compliance
            </p>
          </div>
        </div>
        <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', fontSize: 12 }}>
          <CheckCircle2 size={14} /> KYB Active & Verified
        </span>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Personal Details */}
        <div className="card" style={{ padding: 24, background: 'var(--surface-1)', borderRadius: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={18} style={{ color: '#6344f5' }} /> Owner Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Business Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" required disabled style={{ opacity: 0.7 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Mobile Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input" required />
            </div>
          </div>
        </div>

        {/* Business & Tax Details */}
        <div className="card" style={{ padding: 24, background: 'var(--surface-1)', borderRadius: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={18} style={{ color: '#6344f5' }} /> Registered Business Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Registered Business Name</label>
              <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className="input" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>GSTIN Number</label>
              <input type="text" name="gstin" value={formData.gstin} onChange={handleChange} className="input" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>PAN Card Number</label>
              <input type="text" name="pan" value={formData.pan} onChange={handleChange} className="input" />
            </div>
          </div>
        </div>

        {/* Payout Bank Details */}
        <div className="card" style={{ padding: 24, background: 'var(--surface-1)', borderRadius: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} style={{ color: '#6344f5' }} /> Payout Bank Account
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Bank Name</label>
              <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="input" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Account Number</label>
              <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="input" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>IFSC Code</label>
              <input type="text" name="ifsc" value={formData.ifsc} onChange={handleChange} className="input" />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', gap: 8, padding: '12px 24px', borderRadius: 14, background: '#6344f5' }}>
          <Save size={18} /> Save Profile Details
        </button>
      </form>
    </div>
  );
};

export default OwnerProfilePage;
