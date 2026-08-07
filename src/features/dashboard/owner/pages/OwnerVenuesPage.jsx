/**
 * OwnerVenuesPage Component
 *
 * List of venues owned by the user with status indicators, edit, delete, and add new actions
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Building2, Plus, Edit3, Trash2, Eye, MapPin, Copy, ExternalLink } from 'lucide-react';
import { fetchMyVenues, deleteVenue, duplicateVenue } from '@features/venues/redux/venuesThunks';
import { selectMyVenues } from '@features/venues/redux/venuesSlice';
import QuickPreviewModal from '@features/venues/components/QuickPreviewModal';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  active:    { label: 'Published', cls: 'badge-success' },
  pending:   { label: 'Pending Approval', cls: 'badge-warning' },
  draft:     { label: 'Draft', cls: 'badge-neutral' },
  rejected:  { label: 'Rejected', cls: 'badge-error' },
  suspended: { label: 'Suspended', cls: 'badge-error' },
};

const OwnerVenuesPage = () => {
  const dispatch = useDispatch();
  const myVenues = useSelector(selectMyVenues);
  const [previewVenue, setPreviewVenue] = useState(null);

  useEffect(() => {
    dispatch(fetchMyVenues());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this venue listing?')) {
      try {
        await dispatch(deleteVenue(id)).unwrap();
        toast.success('Venue deleted successfully');
      } catch {
        toast.error('Failed to delete venue');
      }
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await dispatch(duplicateVenue(id)).unwrap();
      toast.success('Venue duplicated as copy!');
    } catch {
      toast.error('Failed to duplicate venue');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>My Venue Listings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Manage details, availability, pricing packages, and preview customer views
          </p>
        </div>

        <Link to="/owner/venues/new" className="btn btn-primary" style={{ gap: 'var(--space-2)' }}>
          <Plus size={18} /> Add New Venue
        </Link>
      </div>

      {myVenues.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <Building2 size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--space-4) auto' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>No Venues Listed Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
            Start receiving booking inquiries by adding your first banquet hall or event venue.
          </p>
          <Link to="/owner/venues/new" className="btn btn-primary">
            Create First Listing
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          {myVenues.map((venue) => {
            const st = STATUS_BADGE[venue.status] || STATUS_BADGE.pending;
            return (
              <div key={venue._id} className="card" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Image & Status Badge */}
                <div style={{ position: 'relative', height: 180, borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'var(--bg-subtle)' }}>
                  <img src={venue.coverImage?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'} alt={venue.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span className={`badge ${st.cls}`} style={{ position: 'absolute', top: 12, left: 12 }}>
                    {st.label}
                  </span>
                </div>

                {/* Title & Info */}
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{venue.name}</h3>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={14} style={{ color: 'var(--brand-default)' }} /> {venue.location?.city || 'Location N/A'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                  <span>Cap: {venue.minCapacity} - {venue.maxCapacity}</span>
                  <span style={{ fontWeight: 800, color: 'var(--brand-default)' }}>₹{(venue.pricePerDay || 0).toLocaleString('en-IN')}/day</span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'auto', flexWrap: 'wrap' }}>
                  <button onClick={() => setPreviewVenue(venue)} className="btn btn-secondary btn-sm" style={{ flex: 1, gap: 4 }}>
                    <Eye size={14} /> Preview
                  </button>
                  <Link to={`/owner/venues/${venue._id}/edit`} className="btn btn-secondary btn-sm" style={{ flex: 1, gap: 4 }}>
                    <Edit3 size={14} /> Edit
                  </Link>
                  <button onClick={() => handleDuplicate(venue._id)} title="Duplicate Venue" className="btn btn-secondary btn-sm">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => handleDelete(venue._id)} title="Delete Venue" className="btn btn-secondary btn-sm" style={{ color: 'var(--color-error-500)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Preview Modal for Owner */}
      <QuickPreviewModal venue={previewVenue} onClose={() => setPreviewVenue(null)} />
    </div>
  );
};

export default OwnerVenuesPage;
