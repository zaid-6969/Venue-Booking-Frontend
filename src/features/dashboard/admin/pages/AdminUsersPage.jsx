/**
 * AdminUsersPage Component
 *
 * User account management view for System Administrators:
 * - Table of registered customer accounts
 * - Role assignment & account status controls
 */

import { useState } from 'react';
import { Users, Mail, Shield, UserX, UserCheck, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_USERS = [
  { _id: 'u-1', name: 'Ananya Sharma', email: 'customer1@venuehub.in', role: 'customer', status: 'active', joined: '2026-01-15' },
  { _id: 'u-2', name: 'Vikram Malhotra', email: 'vikram.m@gmail.com', role: 'customer', status: 'active', joined: '2026-02-10' },
  { _id: 'u-3', name: 'Rohan Deshmukh', email: 'rohan.d@yahoo.com', role: 'customer', status: 'active', joined: '2026-03-04' },
  { _id: 'u-4', name: 'Sneha Patel', email: 'sneha.p@outlook.com', role: 'customer', status: 'suspended', joined: '2026-04-12' },
];

const AdminUsersPage = () => {
  const [users, setUsers] = useState(DEMO_USERS);
  const [search, setSearch] = useState('');

  const toggleUserStatus = (id) => {
    setUsers(prev => prev.map(u => {
      if (u._id === id) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        toast.success(`User account status set to ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>User Account Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            View and manage all registered customer accounts on the platform
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: 36, width: 280 }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filteredUsers.map(user => (
            <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--brand-default)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {user.name[0]}
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</h3>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{user.email} • Joined {user.joined}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-error'}`} style={{ textTransform: 'capitalize' }}>
                  {user.status}
                </span>
                <button
                  onClick={() => toggleUserStatus(user._id)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: user.status === 'active' ? 'var(--color-error-500)' : 'var(--color-success-500)' }}
                >
                  {user.status === 'active' ? 'Suspend Account' : 'Reactivate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
