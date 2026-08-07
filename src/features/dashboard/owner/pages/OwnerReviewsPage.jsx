/**
 * OwnerReviewsPage & OwnerProfilePage Components
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star, MessageSquare, User, Save, Lock } from 'lucide-react';
import { selectCurrentUser, updateUserProfile } from '@features/auth/redux/authSlice';
import toast from 'react-hot-toast';

export const OwnerReviewsPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Customer Reviews</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Feedback and ratings posted by guests for your venue listings
        </p>
      </div>

      <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
        <MessageSquare size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--space-4) auto' }} />
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>No Guest Reviews Yet</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
          Guest reviews will appear here once events are completed.
        </p>
      </div>
    </div>
  );
};

export const OwnerProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile({ name, phone }));
    toast.success('Owner profile updated');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 720 }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Owner Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Manage your business contact details
        </p>
      </div>

      <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Owner Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" required />
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Business Email</label>
            <input type="email" value={user?.email || ''} disabled className="input" style={{ opacity: 0.7 }} />
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Business Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)', gap: 'var(--space-2)' }}>
            <Save size={16} /> Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default OwnerReviewsPage;
