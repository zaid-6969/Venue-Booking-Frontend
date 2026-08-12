/**
 * AdminRejectedOwnersPage Component — Rejected / Suspended Venue Owners
 *
 * Dedicated view showing suspended host accounts with reasons,
 * venues count, server-side pagination, and "Approve & Restore" capability.
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

import adminService from '../services/adminService';
import PageLoader from '@shared/components/feedback/PageLoader';
import Pagination from '@shared/components/navigation/Pagination';

const AdminRejectedOwnersPage = () => {
  const navigate = useNavigate();

  const [owners, setOwners] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [restoringId, setRestoringId] = useState(null);

  const fetchRejectedOwners = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
      };
      const res = await adminService.getRejectedOwners(params);
      if (res?.data) {
        setOwners(res.data);
        const pagination = res.pagination || res.meta || {};
        setTotal(pagination.total ?? res.total ?? 0);
        setTotalPages(pagination.totalPages ?? res.totalPages ?? 1);
      }
    } catch (err) {
      console.error('Error fetching rejected owners:', err);
      toast.error(err?.response?.data?.message || 'Failed to load rejected owners');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchRejectedOwners();
  }, [fetchRejectedOwners]);

  const handleRestore = async (owner) => {
    try {
      setRestoringId(owner._id);
      await adminService.restoreOwner(owner._id);
      toast.success(`Owner "${owner.name}" approved & active listings restored!`);
      fetchRejectedOwners();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to restore owner');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            HOST MODERATION
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)', margin: '2px 0 0 0' }}>
            Rejected Owners
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0 0' }}>
            Suspended or rejected venue host accounts ({total} records in MongoDB).
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => fetchRejectedOwners()}
            className="btn btn-secondary"
            style={{ borderRadius: 12, padding: '8px 14px', fontSize: 13, gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search Bar */}
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
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 400 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          />
          <input
            type="text"
            placeholder="Search rejected hosts by name, email, reason..."
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
      </div>

      {/* Table */}
      {loading && owners.length === 0 ? (
        <PageLoader />
      ) : owners.length === 0 ? (
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
          <CheckCircle2 size={42} style={{ margin: '0 auto 12px auto', color: '#10b981' }} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>No rejected owners</h3>
          <p style={{ fontSize: 13, marginTop: 4 }}>
            All registered venue owners are currently in active standing.
          </p>
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
                    Owner
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Email & Phone
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Venues
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Suspension Reason
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Suspended Date
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569', fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {owners.map((owner) => (
                  <tr
                    key={owner._id}
                    onClick={() => navigate(`/admin/owners/${owner._id}`)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: '#fee2e2',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 14,
                          }}
                        >
                          {owner.name?.charAt(0)?.toUpperCase() || 'O'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{owner.name}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            Member since {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString('en-IN') : '—'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{owner.email}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{owner.phone || 'No phone'}</div>
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                      {owner.venuesCount || 0} Venues
                    </td>

                    <td style={{ padding: '14px 16px', maxWidth: 280 }}>
                      <span style={{ fontSize: 12, color: '#b91c1c', background: '#fee2e2', padding: '4px 8px', borderRadius: 6, display: 'inline-block' }}>
                        {owner.rejectionReason || 'Owner account suspended by platform administrator'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: 12 }}>
                      {owner.rejectedAt ? new Date(owner.rejectedAt).toLocaleDateString('en-IN') : '—'}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-error" style={{ fontSize: 11 }}>
                        Suspended
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/owners/${owner._id}`);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ borderRadius: 8, padding: '5px 10px', fontSize: 12, gap: 4 }}
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(owner);
                          }}
                          disabled={restoringId === owner._id}
                          className="btn btn-primary btn-sm"
                          style={{
                            borderRadius: 8,
                            padding: '5px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                            gap: 4,
                            background: '#10b981',
                            border: 'none',
                            color: '#fff',
                          }}
                        >
                          <CheckCircle2 size={13} /> Approve & Restore
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

export default AdminRejectedOwnersPage;
