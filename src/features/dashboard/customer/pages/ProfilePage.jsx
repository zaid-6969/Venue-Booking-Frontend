/**
 * ProfilePage Component
 *
 * Account management for customer (Personal info & Change password)
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Phone, Lock, Save, ShieldCheck } from 'lucide-react';
import { selectCurrentUser, updateUserProfile } from '@features/auth/redux/authSlice';
import { changePassword } from '@features/auth/redux/authThunks';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleProfileSave = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile({ name, phone }));
    toast.success('Profile information updated');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    try {
      await dispatch(changePassword({ currentPassword, newPassword })).unwrap();
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', maxWidth: 720 }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Account Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Manage your personal details and security settings
        </p>
      </div>

      {/* Personal Info Form */}
      <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={20} style={{ color: 'var(--brand-default)' }} /> Personal Details
        </h3>

        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" required />
          </div>

          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Email Address</label>
            <input type="email" value={email} disabled className="input" style={{ opacity: 0.7, cursor: 'not-allowed' }} />
          </div>

          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="9876543210" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)', gap: 'var(--space-2)' }}>
            <Save size={16} /> Save Changes
          </button>
        </form>
      </div>

      {/* Security Form */}
      <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={20} style={{ color: 'var(--brand-default)' }} /> Change Password
        </h3>

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input" required />
          </div>

          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" required minLength={8} />
          </div>

          <button type="submit" className="btn btn-secondary" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)', gap: 'var(--space-2)' }}>
            <ShieldCheck size={16} /> Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
