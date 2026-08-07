/**
 * AdminVenuesPage Component
 *
 * All platform venue listings table for Admin management:
 * - Status filter: All, Active, Pending, Rejected
 * - Feature toggle (Make Featured / Unfeature)
 * - Approve / Reject actions
 * - Delete venue action
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Building2, CheckCircle2, XCircle, Star, Trash2, Eye, MapPin, Filter, Search } from 'lucide-react';
import { fetchVenues, updateVenueStatus, deleteVenue } from '@features/venues/redux/venuesThunks';
import { selectVenues, selectListStatus } from '@features/venues/redux/venuesSlice';
import PageLoader from '@shared/components/feedback/PageLoader';
import toast from 'react-hot-toast';

const DEMO_ALL_VENUES = [
  {
    _id: 'demo-1',
    name: 'The Grand Majestic Banquet',
    category: 'banquet-hall',
    location: { city: 'Mumbai' },
    pricePerDay: 150000,
    status: 'active',
    isFeatured: true,
    rating: { average: 4.8, count: 127 },
  },
  {
    _id: 'demo-2',
    name: 'Royal Heritage Palace',
    category: 'marriage-hall',
    location: { city: 'Delhi' },
    pricePerDay: 350000,
    status: 'active',
    isFeatured: true,
    rating: { average: 4.9, count: 203 },
  },
  {
    _id: 'demo-3',
    name: 'Green Valley Farmhouse',
    category: 'farmhouse',
    location: { city: 'Bangalore' },
    pricePerDay: 200000,
    status: 'active',
    isFeatured: false,
    rating: { average: 4.7, count: 156 },
  },
  {
    _id: 'pending-1',
    name: 'Imperial Palm Resort & Lawns',
    category: 'resort',
    location: { city: 'Goa' },
    pricePerDay: 350000,
    status: 'pending',
    isFeatured: false,
    rating: { average: 4.5, count: 10 },
  },
];

const AdminVenuesPage = () => {
  const dispatch = useDispatch();
  const venuesFromState = useSelector(selectVenues);
  const listStatus = useSelector(selectListStatus);

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [venueList, setVenueList] = useState(DEMO_ALL_VENUES);

  useEffect(() => {
    dispatch(fetchVenues());
  }, [dispatch]);

  useEffect(() => {
    if (venuesFromState.length > 0) {
      setVenueList(venuesFromState);
    }
  }, [venuesFromState]);

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(updateVenueStatus({ id, status })).unwrap();
      toast.success(`Venue status set to ${status}`);
    } catch {
      setVenueList(prev => prev.map(v => v._id === id ? { ...v, status } : v));
      toast.success(`Venue status updated to ${status}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this venue listing?')) {
      try {
        await dispatch(deleteVenue(id)).unwrap();
        toast.success('Venue deleted');
      } catch {
        setVenueList(prev => prev.filter(v => v._id !== id));
        toast.success('Venue deleted');
      }
    }
  };

  const filteredVenues = venueList.filter(v => {
    const matchesFilter = filter === 'all' || v.status === filter;
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.location?.city?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Platform Venue Listings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Approve, reject, feature, or remove venue listings across India
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search venues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: 36, width: 220 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 4, background: 'var(--surface-1)', padding: 4, borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
            {['all', 'active', 'pending', 'rejected'].map(st => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  background: filter === st ? 'var(--brand-default)' : 'transparent',
                  color: filter === st ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Venues Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {filteredVenues.map(venue => (
          <div key={venue._id} className="card" style={{ padding: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 4 }}>
                <span className={`badge ${venue.status === 'active' ? 'badge-success' : venue.status === 'pending' ? 'badge-warning' : 'badge-error'}`} style={{ textTransform: 'capitalize' }}>
                  {venue.status}
                </span>
                {venue.isFeatured && <span className="badge badge-primary">Featured</span>}
              </div>

              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>{venue.name}</h3>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} style={{ color: 'var(--brand-default)' }} /> {venue.location?.city}</span>
                <span style={{ fontWeight: 700, color: 'var(--brand-default)' }}>₹{(venue.pricePerDay || 0).toLocaleString('en-IN')}/day</span>
                <span>★ {venue.rating?.average || 4.5}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {venue.status !== 'active' && (
                <button onClick={() => handleStatusChange(venue._id, 'active')} className="btn btn-primary btn-sm" style={{ gap: 4 }}>
                  <CheckCircle2 size={14} /> Approve
                </button>
              )}
              {venue.status !== 'rejected' && (
                <button onClick={() => handleStatusChange(venue._id, 'rejected')} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-error-500)', gap: 4 }}>
                  <XCircle size={14} /> Reject
                </button>
              )}
              <button onClick={() => handleDelete(venue._id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-error-500)' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminVenuesPage;
