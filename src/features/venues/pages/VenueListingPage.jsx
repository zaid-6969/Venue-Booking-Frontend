/**
 * VenueListingPage Component
 *
 * Full Venue Marketplace Listing with:
 * - URL SearchParams Synchronization
 * - Sidebar Filter Controls (City, Category, Price Range, Capacity, Amenities)
 * - Sorting Options (Price, Rating, Capacity, Relevance)
 * - Grid / List layout toggle
 * - Active filter pills & clear buttons
 * - Pagination control
 * - Empty & Loading states with skeletons
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Filter, Grid, List, SlidersHorizontal, RotateCcw, Search, MapPin, Building2,
  Users, DollarSign, Star, ChevronLeft, ChevronRight, X
} from 'lucide-react';

import { fetchVenues } from '../redux/venuesThunks';
import {
  selectVenues, selectTotalVenues, selectTotalPages,
  selectCurrentPage, selectListStatus, setAppliedFilters, resetFilters
} from '../redux/venuesSlice';
import { VENUE_CATEGORIES, POPULAR_CITIES, AMENITIES, SORT_OPTIONS } from '@constants/index';
import VenueCard from '../components/VenueCard';
import QuickPreviewModal from '../components/QuickPreviewModal';

/**
 * Build a clean params object — strips empty strings, defaults, and undefined
 * so the backend query is clean and minimal.
 */
const buildCleanParams = (filters) => {
  const p = {};
  if (filters.search?.trim())       p.search      = filters.search.trim();
  if (filters.city)                  p.city        = filters.city;
  if (filters.category)              p.category    = filters.category;
  if (filters.minPrice)              p.minPrice    = filters.minPrice;
  if (filters.maxPrice)              p.maxPrice    = filters.maxPrice;
  if (filters.minCapacity)           p.minCapacity = filters.minCapacity;
  if (filters.minRating)             p.rating      = filters.minRating;
  if (filters.amenities?.length > 0) p.amenities   = filters.amenities;
  if (filters.sortBy && filters.sortBy !== 'relevance') p.sortBy = filters.sortBy;
  p.page  = filters.page  || 1;
  p.limit = filters.limit || 12;
  return p;
};

/** Returns true if any non-default filter is active */
const hasActiveFilters = (filters) =>
  !!(filters.search || filters.city || filters.category || filters.minPrice ||
     filters.maxPrice || filters.minCapacity || filters.minRating || filters.amenities?.length > 0);

// Demo fallback data if API returns empty
const DEMO_LISTING_VENUES = [
  {
    _id: 'demo-1',
    name: 'The Grand Majestic Banquet',
    slug: 'the-grand-majestic-banquet',
    tagline: 'Where dreams become celebrations',
    description: 'Mumbai\'s most prestigious event venue offering 15,000 sq ft of luxury space.',
    category: 'banquet-hall',
    location: { city: 'Mumbai' },
    minCapacity: 100, maxCapacity: 800,
    pricePerDay: 150000,
    rating: { average: 4.8, count: 127 },
    isFeatured: true,
    coverImage: { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800' }
  },
  {
    _id: 'demo-2',
    name: 'Royal Heritage Palace',
    slug: 'royal-heritage-palace',
    tagline: 'A royal experience for your royal occasion',
    description: 'Stunning heritage property nestled in Delhi spread across 3 acres of gardens.',
    category: 'marriage-hall',
    location: { city: 'Delhi' },
    minCapacity: 200, maxCapacity: 2000,
    pricePerDay: 350000,
    rating: { average: 4.9, count: 203 },
    isFeatured: true,
    coverImage: { url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800' }
  },
  {
    _id: 'demo-3',
    name: 'Green Valley Farmhouse',
    slug: 'green-valley-farmhouse',
    tagline: 'Nature\'s luxury for your celebration',
    description: 'Sprawling 5-acre property situated on the outskirts of Bangalore.',
    category: 'farmhouse',
    location: { city: 'Bangalore' },
    minCapacity: 100, maxCapacity: 1000,
    pricePerDay: 200000,
    rating: { average: 4.7, count: 156 },
    isFeatured: true,
    coverImage: { url: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800' }
  },
  {
    _id: 'demo-4',
    name: 'Skyline Rooftop Events',
    slug: 'skyline-rooftop-events',
    tagline: 'Celebrate under the stars',
    description: 'Breathtaking 360-degree view of South Mumbai skyline and Arabian Sea.',
    category: 'rooftop',
    location: { city: 'Mumbai' },
    minCapacity: 50, maxCapacity: 250,
    pricePerDay: 85000,
    rating: { average: 4.6, count: 89 },
    isFeatured: true,
    coverImage: { url: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800' }
  },
  {
    _id: 'demo-5',
    name: 'Nizam\'s Grand Palace',
    slug: 'nizams-grand-palace',
    tagline: 'The grandeur of Nizami traditions',
    description: 'Inspired by the royal Nizam era, combining opulence with contemporary luxury.',
    category: 'marriage-hall',
    location: { city: 'Hyderabad' },
    minCapacity: 200, maxCapacity: 1500,
    pricePerDay: 280000,
    rating: { average: 4.9, count: 178 },
    isFeatured: false,
    coverImage: { url: 'https://images.unsplash.com/photo-1611519779883-e1a68f0f5826?w=800' }
  },
  {
    _id: 'demo-6',
    name: 'TechHub Conference Suites',
    tagline: 'Innovation meets celebration',
    description: 'Bangalore\'s most tech-forward event venue designed for corporate summits.',
    category: 'corporate',
    location: { city: 'Bangalore' },
    minCapacity: 20, maxCapacity: 300,
    pricePerDay: 75000,
    rating: { average: 4.4, count: 44 },
    isFeatured: false,
    coverImage: { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' }
  }
];

const VenueListingPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux Selectors
  const venues = useSelector(selectVenues);
  const totalVenues = useSelector(selectTotalVenues);
  const totalPages = useSelector(selectTotalPages);
  const currentPage = useSelector(selectCurrentPage);
  const listStatus = useSelector(selectListStatus);

  // View mode & preview state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [previewVenue, setPreviewVenue] = useState(null);

  // Filter State initialized from URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minCapacity: searchParams.get('capacity') || '',
    minRating: searchParams.get('minRating') || '',
    amenities: searchParams.getAll('amenities') || [],
    sortBy: searchParams.get('sortBy') || 'relevance',
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 12,
  });

  // Separate debounced search value so search doesn't hit API on every keystroke
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceTimer = useRef(null);

  // Debounce: update filters.search 400ms after user stops typing
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchInput]);

  // Build clean params & sync URL + fire API call whenever filters change
  useEffect(() => {
    const clean = buildCleanParams(filters);

    // Sync URL search params
    const urlParams = {};
    if (clean.search)      urlParams.search    = clean.search;
    if (clean.city)        urlParams.city       = clean.city;
    if (clean.category)    urlParams.category   = clean.category;
    if (clean.minPrice)    urlParams.minPrice   = clean.minPrice;
    if (clean.maxPrice)    urlParams.maxPrice   = clean.maxPrice;
    if (clean.minCapacity) urlParams.capacity   = clean.minCapacity;
    if (clean.minRating)   urlParams.minRating  = clean.minRating;
    if (clean.amenities?.length) urlParams.amenities = clean.amenities;
    if (clean.sortBy && clean.sortBy !== 'relevance') urlParams.sortBy = clean.sortBy;
    if (clean.page > 1)    urlParams.page       = clean.page;
    if (clean.limit !== 12) urlParams.limit     = clean.limit;
    setSearchParams(urlParams);

    // Dispatch with cleaned params (no empty strings sent to API)
    dispatch(fetchVenues(clean));
  }, [filters, dispatch, setSearchParams]);

  const handleFilterChange = (key, value) => {
    // Search is handled separately via debounce
    if (key === 'search') {
      setSearchInput(value);
      return;
    }
    // Don't reset page when changing the page itself
    const shouldResetPage = key !== 'page' && key !== 'limit';
    setFilters(prev => ({ ...prev, [key]: value, ...(shouldResetPage ? { page: 1 } : {}) }));
  };

  // Dedicated page navigation — does NOT reset page to 1
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };


  const handleAmenityToggle = (amenityId) => {
    setFilters(prev => {
      const exists = prev.amenities.includes(amenityId);
      const updated = exists
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId];
      return { ...prev, amenities: updated, page: 1 };
    });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setFilters({
      search: '',
      city: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      minCapacity: '',
      minRating: '',
      amenities: [],
      sortBy: 'relevance',
      page: 1,
      limit: 12,
    });
  };

  // Build active filter pill labels for display
  const activeFilterPills = [
    filters.search && { key: 'search', label: `Name: "${filters.search}"` },
    filters.city && { key: 'city', label: `City: ${filters.city}` },
    filters.category && { key: 'category', label: `Type: ${VENUE_CATEGORIES.find(c => c.id === filters.category)?.label || filters.category}` },
    filters.maxPrice && { key: 'maxPrice', label: `Budget ≤ ₹${Number(filters.maxPrice).toLocaleString('en-IN')}` },
    filters.minPrice && { key: 'minPrice', label: `Budget ≥ ₹${Number(filters.minPrice).toLocaleString('en-IN')}` },
    filters.minCapacity && { key: 'minCapacity', label: `Capacity ≥ ${filters.minCapacity}` },
    filters.minRating && { key: 'minRating', label: `Rating ≥ ${filters.minRating}★` },
    ...filters.amenities.map(a => ({ key: `amenity_${a}`, label: AMENITIES.find(am => am.id === a)?.label || a, isAmenity: true, amenityId: a })),
  ].filter(Boolean);

  const removeFilterPill = (pill) => {
    if (pill.isAmenity) {
      handleAmenityToggle(pill.amenityId);
    } else {
      setFilters(prev => ({ ...prev, [pill.key]: pill.key === 'amenities' ? [] : '', page: 1 }));
      if (pill.key === 'search') setSearchInput('');
    }
  };

  const filtersActive = hasActiveFilters(filters);
  const safeVenues    = Array.isArray(venues) ? venues : [];
  // Only fall back to demo data on initial load (no filters applied, API idle/loading for first time)
  const displayVenues = filtersActive
    ? safeVenues                  // show real results (could be empty) when filters are active
    : safeVenues.length > 0
      ? safeVenues                // real data loaded, show it
      : listStatus === 'loading'
        ? []                      // loading — don't flash demo data
        : DEMO_LISTING_VENUES;    // initial idle state — show demo until real data loads
  const count = filtersActive ? safeVenues.length : (totalVenues || displayVenues.length);

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-20)' }}>
      <div className="container">

        {/* ============================================================ */}
        {/* PAGE HEADER                                                  */}
        {/* ============================================================ */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Event Venues & Banquet Halls
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Compare pricing, check availability, and book verified event spaces across India
          </p>
        </div>

        {/* ============================================================ */}
        {/* TOP BAR: SEARCH, RESULTS COUNT & CONTROLS                    */}
        {/* ============================================================ */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--surface-1)',
          padding: 'var(--space-4) var(--space-6)',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 'var(--space-6)',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}>
          {/* Debounced Venue Name Search Bar */}
          <div style={{ flex: '1 1 300px', minWidth: 260, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-default)' }} />
            <input
              type="text"
              placeholder="Search venues by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input"
              style={{ paddingLeft: 42, paddingRight: searchInput ? 36 : 14, borderRadius: 'var(--radius-xl)' }}
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); setFilters(prev => ({ ...prev, search: '', page: 1 })); }}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Results Count & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Showing <span style={{ color: 'var(--brand-default)', fontWeight: 800 }}>{count}</span> venues
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </button>

            {/* Sort Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>Sort By:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-normal)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '6px 12px',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Items Per Page Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>Show:</span>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-normal)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '6px 12px',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value={12}>12 / page</option>
                <option value={24}>24 / page</option>
                <option value={48}>48 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Pills */}
        {activeFilterPills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--space-4)', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Active:</span>
            {activeFilterPills.map(pill => (
              <span key={pill.key} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(var(--brand-rgb, 249 115 22) / 0.1)', color: 'var(--brand-default)',
                border: '1px solid var(--brand-default)', borderRadius: 9999,
                padding: '3px 10px', fontSize: 'var(--text-xs)', fontWeight: 600,
              }}>
                {pill.label}
                <button onClick={() => removeFilterPill(pill)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0, lineHeight: 1 }}><X size={12} /></button>
              </span>
            ))}
            <button onClick={handleResetFilters} style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
              <RotateCcw size={11} /> Clear all
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* MAIN LAYOUT: SIDEBAR FILTERS + VENUES GRID                    */}
        {/* ============================================================ */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-8)' }} className="venue-listing-grid">

          {/* ============================================================ */}
          {/* SIDEBAR FILTER PANEL                                         */}
          {/* ============================================================ */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="card" style={{ padding: 'var(--space-6)', position: 'sticky', top: 'calc(var(--header-height) + 20px)' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Filter size={18} style={{ color: 'var(--brand-default)' }} />
                  Filters
                </h3>
                <button
                  onClick={handleResetFilters}
                  style={{ background: 'none', border: 'none', color: 'var(--brand-default)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>

              {/* Sidebar Search Input (debounced) */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', display: 'block' }}>
                  Venue Name
                </label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    placeholder="Search venue name..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="input"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>

              {/* City Filter */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', display: 'block' }}>
                  City
                </label>
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="input"
                >
                  <option value="">All Cities</option>
                  {POPULAR_CITIES.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', display: 'block' }}>
                  Venue Type
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input"
                >
                  <option value="">All Categories</option>
                  {VENUE_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Max Budget Range */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', display: 'block' }}>
                  Max Budget per Day (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 200000"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="input"
                />
              </div>

              {/* Guest Capacity */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', display: 'block' }}>
                  Min Guest Capacity
                </label>
                <input
                  type="number"
                  placeholder="e.g. 200"
                  value={filters.minCapacity}
                  onChange={(e) => handleFilterChange('minCapacity', e.target.value)}
                  className="input"
                />
              </div>

              {/* Amenities Checklist */}
              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-3)', display: 'block' }}>
                  Amenities
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: 220, overflowY: 'auto' }}>
                  {AMENITIES.map(am => (
                    <label key={am.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(am.id)}
                        onChange={() => handleAmenityToggle(am.id)}
                        style={{ accentColor: 'var(--brand-default)', width: 16, height: 16, cursor: 'pointer' }}
                      />
                      <span>{am.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Min Rating Filter */}
              <div style={{ marginTop: 'var(--space-6)' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', display: 'block' }}>
                  Minimum Rating
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[['', 'Any'], ['3', '3★+'], ['4', '4★+'], ['4.5', '4.5★+']].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => handleFilterChange('minRating', val)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 9999,
                        border: `1.5px solid ${filters.minRating === val ? 'var(--brand-default)' : 'var(--border-normal)'}`,
                        background: filters.minRating === val ? 'var(--brand-default)' : 'transparent',
                        color: filters.minRating === val ? '#fff' : 'var(--text-secondary)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* ============================================================ */}
          {/* VENUES GRID                                                  */}
          {/* ============================================================ */}
          <main>
            {listStatus === 'loading' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
                {[...Array(filters.limit || 12)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 360, borderRadius: 'var(--radius-2xl)' }} />
                ))}
              </div>
            ) : displayVenues.length === 0 ? (
              <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
                <Building2 size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--space-4) auto' }} />
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>No Venues Found</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                  Try resetting your filters or adjusting your search parameters.
                </p>
                <button onClick={handleResetFilters} className="btn btn-primary">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
                  {displayVenues.map(venue => (
                    <VenueCard key={venue._id} venue={venue} onQuickView={(v) => setPreviewVenue(v)} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-12)' }}>
                    <button
                      disabled={filters.page <= 1}
                      onClick={() => handlePageChange(Number(filters.page) - 1)}
                      className="btn btn-secondary btn-sm"
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>

                    {/* Page number pills */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - filters.page) <= 1)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === '...'
                          ? <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>…</span>
                          : <button
                              key={p}
                              onClick={() => handlePageChange(p)}
                              className={filters.page === p ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                              style={{ minWidth: 36 }}
                            >{p}</button>
                      )
                    }

                    <button
                      disabled={filters.page >= totalPages}
                      onClick={() => handlePageChange(Number(filters.page) + 1)}
                      className="btn btn-secondary btn-sm"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>

      </div>

      {/* Quick Preview Modal */}
      <QuickPreviewModal venue={previewVenue} onClose={() => setPreviewVenue(null)} />

      <style>{`
        @media (max-width: 1024px) {
          .venue-listing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default VenueListingPage;
