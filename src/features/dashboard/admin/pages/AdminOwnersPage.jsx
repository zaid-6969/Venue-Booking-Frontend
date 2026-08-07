/**
 * AdminOwnersPage Component
 *
 * Venue Owner accounts directory & verification manager for Administrators
 */

import { useState } from 'react';
import { Building2, ShieldCheck, Mail, CheckCircle2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_OWNERS = [
  { _id: 'o-1', name: 'Rajesh Kumar', email: 'owner1@venuehub.in', venuesCount: 3, verified: true, joined: '2025-11-10' },
  { _id: 'o-2', name: 'Vikramaditya Singhania', email: 'owner.singhania@gmail.com', venuesCount: 1, verified: false, joined: '2026-01-20' },
  { _id: 'o-3', name: 'Kiran Kumar', email: 'kiran.k@techhub.in', venuesCount: 2, verified: true, joined: '2026-02-14' },
];

const AdminOwnersPage = () => {
  const [owners, setOwners] = useState(DEMO_OWNERS);
  const [search, setSearch] = useState('');

  const toggleVerify = (id) => {
    setOwners(prev => prev.map(o => {
      if (o._id === id) {
        const nextVerified = !o.verified;
        toast.success(`Owner verification status set to ${nextVerified ? 'Verified' : 'Unverified'}`);
        return { ...o, verified: nextVerified };
      }
      return o;
    }));
  };

  const filteredOwners = owners.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Venue Owner Directory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Verify registered venue hosts and manage property provider accounts
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search venue owners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: 36, width: 260 }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filteredOwners.map(owner => (
            <div key={owner._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-xl)', background: 'var(--brand-subtle)', color: 'var(--brand-default)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {owner.name}
                    {owner.verified && <ShieldCheck size={16} style={{ color: 'var(--color-success-500)' }} />}
                  </h3>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    {owner.email} • {owner.venuesCount} Venues Listed • Joined {owner.joined}
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleVerify(owner._id)}
                className={`btn ${owner.verified ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                style={{ gap: 4 }}
              >
                <CheckCircle2 size={14} /> {owner.verified ? 'Remove Verification' : 'Verify Host'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOwnersPage;
