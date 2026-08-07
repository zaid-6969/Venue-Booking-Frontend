/**
 * ComparePage Component
 *
 * Real-time side-by-side venue comparison matrix with up to 4 venues:
 * - Redux integration with compareSlice (persisted in localStorage)
 * - Empty state with "Please select any two venues to compare" banner & interactive selector
 * - Single venue comparison view with "+ Add Venue" slot
 * - Maximum 4 venues comparison cap
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Building2, Star, MapPin, Users, Check, X, ArrowLeft, Plus, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import {
  selectCompareVenues,
  removeFromCompare,
  addToCompare,
  clearCompare,
  selectCanAddToCompare
} from '../redux/compareSlice';
import { fetchVenues } from '@features/venues/redux/venuesThunks';
import { selectVenues } from '@features/venues/redux/venuesSlice';
import toast from 'react-hot-toast';

const ComparePage = () => {
  const dispatch = useDispatch();
  const compareVenues = useSelector(selectCompareVenues);
  const catalogVenues = useSelector(selectVenues);
  const canAddMore = useSelector(selectCanAddToCompare);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchVenues());
  }, [dispatch]);

  const handleRemove = (id) => {
    dispatch(removeFromCompare(id));
    toast.success('Venue removed from comparison');
  };

  const handleClear = () => {
    dispatch(clearCompare());
    toast.success('Comparison list cleared');
  };

  const handleAddVenue = (venue) => {
    if (!canAddMore) {
      toast.error('Maximum 4 venues can be compared at a time');
      return;
    }
    dispatch(addToCompare(venue));
    toast.success(`${venue.name} added to comparison`);
    setIsPickerOpen(false);
  };

  // Available catalog venues not yet in compare list
  const availableVenues = (catalogVenues || []).filter(
    v => !compareVenues.some(cv => cv._id === v._id) &&
    (v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     v.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--brand-default)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Venue Comparison Matrix</span>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>Compare Venues ({compareVenues.length}/4)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Compare venue pricing, features, guest capacity, and amenities side-by-side (Up to 4 venues)
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {compareVenues.length > 0 && (
            <button onClick={handleClear} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-error-500)', gap: 6 }}>
              <Trash2 size={16} /> Clear All
            </button>
          )}
          <Link to="/venues" className="btn btn-secondary btn-sm" style={{ gap: 'var(--space-2)' }}>
            <ArrowLeft size={16} /> Back to Catalog
          </Link>
        </div>
      </div>

      {/* 0 VENUES SELECTED EMPTY STATE */}
      {compareVenues.length === 0 && (
        <div className="card glass" style={{ padding: 'var(--space-16)', textAlign: 'center', background: 'var(--surface-1)', borderRadius: 'var(--radius-3xl)', border: '1px solid var(--border-subtle)' }}>
          <Building2 size={56} style={{ margin: '0 auto var(--space-4)', color: 'var(--brand-default)' }} />
          <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>Please Select Any Two Venues to Compare</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', marginTop: 8, marginBottom: 'var(--space-8)', maxWidth: 540, marginInline: 'auto' }}>
            Select at least two venues from our catalog to compare pricing, capacities, guest ratings, and amenities side-by-side.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <button onClick={() => setIsPickerOpen(true)} className="btn btn-primary btn-lg" style={{ gap: 'var(--space-2)' }}>
              <Plus size={18} /> Select Venues Now
            </button>
            <Link to="/venues" className="btn btn-secondary btn-lg">
              Browse All Venues Catalog
            </Link>
          </div>
        </div>
      )}

      {/* 1 VENUE SELECTED HINT BANNER */}
      {compareVenues.length === 1 && (
        <div className="card glass" style={{ padding: 'var(--space-4) var(--space-6)', background: 'linear-gradient(135deg, var(--surface-1) 0%, var(--brand-subtle) 100%)', border: '1px solid var(--brand-default)', borderRadius: 'var(--radius-2xl)', marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Sparkles size={20} style={{ color: 'var(--brand-default)' }} />
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--text-primary)' }}>1 Venue Selected</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Please select a second venue to view full side-by-side comparison matrix (Max 4).</div>
            </div>
          </div>

          <button onClick={() => setIsPickerOpen(true)} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
            <Plus size={16} /> Add Second Venue
          </button>
        </div>
      )}

      {/* COMPARISON MATRIX TABLE (1 TO 4 VENUES) */}
      {compareVenues.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: 'var(--surface-1)', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                <th style={{ padding: 'var(--space-6)', textAlign: 'left', width: 220, fontWeight: 800, borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                  Property Features
                </th>

                {/* Venue Header Columns */}
                {compareVenues.map(v => (
                  <th key={v._id} style={{ padding: 'var(--space-6)', textAlign: 'center', minWidth: 260, borderBottom: '1px solid var(--border-subtle)', borderLeft: '1px solid var(--border-subtle)', position: 'relative' }}>
                    <button
                      onClick={() => handleRemove(v._id)}
                      title="Remove venue from comparison"
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        background: 'rgba(0,0,0,0.5)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: 26,
                        height: 26,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 2,
                      }}
                    >
                      <X size={14} />
                    </button>

                    <img
                      src={v.coverImage?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500'}
                      alt={v.name}
                      style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-3)' }}
                    />
                    <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>{v.name}</h4>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4, textTransform: 'capitalize' }}>
                      {v.category?.replace('-', ' ')} • {v.location?.city || v.city || 'N/A'}
                    </div>
                  </th>
                ))}

                {/* Slot Column to add more venue if under max 4 */}
                {compareVenues.length < 4 && (
                  <th style={{ padding: 'var(--space-6)', textAlign: 'center', minWidth: 240, borderBottom: '1px solid var(--border-subtle)', borderLeft: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
                      <button
                        onClick={() => setIsPickerOpen(true)}
                        className="btn btn-secondary"
                        style={{ borderRadius: '50%', width: 56, height: 56, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-3)' }}
                      >
                        <Plus size={24} style={{ color: 'var(--brand-default)' }} />
                      </button>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>Add Venue Slot</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: 2 }}>Slot {compareVenues.length + 1} of 4</span>
                    </div>
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {/* Daily Rental Price */}
              <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 700, color: 'var(--text-secondary)' }}>Daily Rental Price</td>
                {compareVenues.map(v => (
                  <td key={v._id} style={{ padding: 'var(--space-4)', textAlign: 'center', fontWeight: 900, color: 'var(--brand-default)', fontSize: 'var(--text-xl)', borderLeft: '1px solid var(--border-subtle)' }}>
                    ₹{(v.pricePerDay || 0).toLocaleString('en-IN')}<span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)' }}>/day</span>
                  </td>
                ))}
                {compareVenues.length < 4 && <td style={{ borderLeft: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }} />}
              </tr>

              {/* Guest Capacity */}
              <tr style={{ background: 'var(--bg-subtle)' }}>
                <td style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 700, color: 'var(--text-secondary)' }}>Guest Capacity</td>
                {compareVenues.map(v => (
                  <td key={v._id} style={{ padding: 'var(--space-4)', textAlign: 'center', fontWeight: 800, borderLeft: '1px solid var(--border-subtle)' }}>
                    {v.minCapacity ? `${v.minCapacity} - ${v.maxCapacity}` : `Up to ${v.maxCapacity}`} Guests
                  </td>
                ))}
                {compareVenues.length < 4 && <td style={{ borderLeft: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }} />}
              </tr>

              {/* Rating & Reviews */}
              <tr>
                <td style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 700, color: 'var(--text-secondary)' }}>Rating & Reviews</td>
                {compareVenues.map(v => {
                  const ratingAvg = typeof v.rating === 'object' && v.rating !== null ? (v.rating.average ?? 4.5) : (typeof v.rating === 'number' ? v.rating : 4.5);
                  const reviewCount = typeof v.rating === 'object' && v.rating !== null ? (v.rating.count ?? 0) : (v.reviewsCount ?? 0);
                  return (
                    <td key={v._id} style={{ padding: 'var(--space-4)', textAlign: 'center', fontWeight: 700, borderLeft: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: '#f59e0b', fontWeight: 800 }}>★ {ratingAvg}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginLeft: 4 }}>({reviewCount} reviews)</span>
                    </td>
                  );
                })}
                {compareVenues.length < 4 && <td style={{ borderLeft: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }} />}
              </tr>

              {/* Location */}
              <tr style={{ background: 'var(--bg-subtle)' }}>
                <td style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 700, color: 'var(--text-secondary)' }}>Location</td>
                {compareVenues.map(v => (
                  <td key={v._id} style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-xs)', fontWeight: 600, borderLeft: '1px solid var(--border-subtle)' }}>
                    <MapPin size={14} style={{ display: 'inline', color: 'var(--brand-default)', marginRight: 4 }} />
                    {v.location?.address || v.location?.city || v.city || 'N/A'}, {v.location?.city}
                  </td>
                ))}
                {compareVenues.length < 4 && <td style={{ borderLeft: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }} />}
              </tr>

              {/* Amenities */}
              <tr>
                <td style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 700, color: 'var(--text-secondary)' }}>Included Amenities</td>
                {compareVenues.map(v => (
                  <td key={v._id} style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-xs)', borderLeft: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                      {(v.amenities || []).map((am, i) => (
                        <span key={i} className="badge badge-neutral" style={{ fontSize: '10px' }}>
                          <Check size={10} style={{ color: 'var(--color-success-500)', marginRight: 2 }} /> {am}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
                {compareVenues.length < 4 && <td style={{ borderLeft: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }} />}
              </tr>

              {/* Action Button */}
              <tr style={{ background: 'var(--bg-subtle)' }}>
                <td style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 700, color: 'var(--text-secondary)' }}>Action</td>
                {compareVenues.map(v => (
                  <td key={v._id} style={{ padding: 'var(--space-4)', textAlign: 'center', borderLeft: '1px solid var(--border-subtle)' }}>
                    <Link to={`/venues/${v.slug || v._id}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                      View Details
                    </Link>
                  </td>
                ))}
                {compareVenues.length < 4 && (
                  <td style={{ padding: 'var(--space-4)', textAlign: 'center', borderLeft: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
                    <button onClick={() => setIsPickerOpen(true)} className="btn btn-secondary btn-sm" style={{ width: '100%', gap: 4 }}>
                      <Plus size={14} /> Select Venue
                    </button>
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* VENUE PICKER MODAL */}
      {isPickerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card glass" style={{ width: '100%', maxWidth: 600, maxHeight: '85vh', overflowY: 'auto', background: 'var(--surface-1)', borderRadius: 'var(--radius-3xl)', padding: 'var(--space-6)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>Select Venue to Compare</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Choose a venue from catalog to add to matrix ({compareVenues.length}/4 selected)</p>
              </div>
              <button onClick={() => setIsPickerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by venue name or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{ marginBottom: 'var(--space-4)' }}
            />

            {/* Venues Grid List */}
            {availableVenues.length === 0 ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <AlertCircle size={32} style={{ margin: '0 auto 8px auto' }} />
                <p style={{ fontSize: 'var(--text-sm)' }}>No additional venues available to add.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {availableVenues.map(item => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <img src={item.coverImage?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500'} alt={item.name} style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', objectFit: 'cover' }} />
                      <div>
                        <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</h4>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{item.location?.city} • ₹{(item.pricePerDay || 0).toLocaleString('en-IN')}/day</div>
                      </div>
                    </div>

                    <button onClick={() => handleAddVenue(item)} className="btn btn-primary btn-sm" style={{ gap: 4 }}>
                      <Plus size={14} /> Add
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default ComparePage;
