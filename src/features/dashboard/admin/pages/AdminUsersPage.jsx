/**
 * AdminUsersPage Component — Registered Customers Management
 *
 * Real MongoDB customer registry with booking stats, account suspension controls,
 * multi-field search, status filtering, and server-side pagination.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  UserX,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

import adminService from '../services/adminService';
import PageLoader from '@shared/components/feedback/PageLoader';
import Pagination from '@shared/components/navigation/Pagination';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [role, setRole] = useState('customer');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        status: status !== 'all' ? status : undefined,
        role: role !== 'all' ? role : undefined,
      };
      const res = await adminService.getUsers(params);
      if (res?.data) {
        setUsers(res.data);
        const pagination = res.pagination || res.meta || {};
        setTotal(pagination.total ?? res.total ?? 0);
        setTotalPages(pagination.totalPages ?? res.totalPages ?? 1);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
      toast.error(err?.response?.data?.message || 'Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    const nextStatus = user.userStatus === 'active' ? 'suspended' : 'active';
    try {
      await adminService.toggleUserStatus(user._id, nextStatus);
      toast.success(`Account status for "${user.name}" updated to ${nextStatus}`);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update user status');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#6344f5', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            COMMUNITY & CUSTOMERS
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)', margin: '2px 0 0 0' }}>
            Registered Users
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0 0' }}>
            Real-time customer account directory from MongoDB on EventFlow ({total} registered).
          </p>
        </div>

        <button
          onClick={() => fetchUsers()}
          className="btn btn-secondary"
          style={{ borderRadius: 12, padding: '8px 14px', fontSize: 13, gap: 6 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          borderRadius: 18,
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 380 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          />
          <input
            type="text"
            placeholder="Search users by name, email, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to page 1 on search
            }}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: 12,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-subtle)',
              fontSize: 13,
              outline: 'none',
              color: '#0f172a',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Users' },
            { id: 'active', label: 'Active' },
            { id: 'suspended', label: 'Suspended' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setStatus(st.id);
                setPage(1); // Reset to page 1 on filter
              }}
              style={{
                padding: '6px 14px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                border: status === st.id ? '1px solid #6344f5' : '1px solid var(--border-subtle)',
                background: status === st.id ? '#f0ebff' : 'var(--surface-1)',
                color: status === st.id ? '#6344f5' : '#64748b',
              }}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading && users.length === 0 ? (
        <PageLoader />
      ) : users.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            borderRadius: 20,
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            color: '#64748b',
          }}
        >
          <Users size={42} style={{ margin: '0 auto 12px auto', color: '#94a3b8' }} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>No users found</h3>
          <p style={{ fontSize: 13, marginTop: 4 }}>No customer accounts match your search filters.</p>
        </div>
      ) : (
        <div
          className="card"
          style={{
            borderRadius: 20,
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Customer
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Contact Phone
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Registration Date
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Total Bookings
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Total Spend
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>
                    Account Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSuspended = u.userStatus === 'suspended';

                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              background: '#f0ebff',
                              color: '#6344f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: 14,
                            }}
                          >
                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: 600 }}>
                        {u.phone || '—'}
                      </td>

                      <td style={{ padding: '14px 16px', color: '#64748b' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                        {u.totalBookings || 0}
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#10b981' }}>
                        {formatCurrency(u.totalSpent)}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span
                          className={`badge ${isSuspended ? 'badge-error' : 'badge-success'}`}
                          style={{ fontSize: 11, textTransform: 'capitalize' }}
                        >
                          {u.userStatus}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`btn ${isSuspended ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                          style={{
                            borderRadius: 8,
                            padding: '5px 12px',
                            fontSize: 12,
                            gap: 4,
                            color: isSuspended ? '#fff' : '#ef4444',
                            background: isSuspended ? '#10b981' : undefined,
                            borderColor: isSuspended ? '#10b981' : undefined,
                          }}
                        >
                          {isSuspended ? (
                            <>
                              <UserCheck size={13} /> Reactivate
                            </>
                          ) : (
                            <>
                              <UserX size={13} /> Suspend
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Server-side Pagination Component */}
      <Pagination
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        loading={loading}
        onPageChange={(newPage) => setPage(newPage)}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />
    </div>
  );
};

export default AdminUsersPage;
