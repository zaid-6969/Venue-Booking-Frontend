/**
 * SearchPage Component
 *
 * Full search page allowing users to search venues by keyword, city, category, and price range.
 */

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, Star, Building2, Filter } from 'lucide-react';
import VenueCard from '../components/VenueCard';

const DEMO_SEARCH_RESULTS = [
  {
    _id: '1',
    name: 'The Grand Majestic Banquet',
    slug: 'the-grand-majestic-banquet',
    category: 'banquet-hall',
    location: { city: 'Mumbai', address: 'Bandra West, Mumbai' },
    pricePerDay: 150000,
    minCapacity: 100,
    maxCapacity: 800,
    coverImage: { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800' },
    rating: { average: 4.8, count: 127 },
    isFeatured: true,
  },
  {
    _id: '2',
    name: 'Royal Heritage Palace',
    slug: 'royal-heritage-palace',
    category: 'marriage-hall',
    location: { city: 'Delhi', address: 'South Extension, Delhi' },
    pricePerDay: 350000,
    minCapacity: 250,
    maxCapacity: 1500,
    coverImage: { url: 'https://images.unsplash.com/photo-1545232979-fbf34fc30907?w=800' },
    rating: { average: 4.9, count: 203 },
    isFeatured: true,
  },
  {
    _id: '3',
    name: 'Green Valley Farmhouse',
    slug: 'green-valley-farmhouse',
    category: 'farmhouse',
    location: { city: 'Bangalore', address: 'Whitefield, Bangalore' },
    pricePerDay: 200000,
    minCapacity: 50,
    maxCapacity: 500,
    coverImage: { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' },
    rating: { average: 4.7, count: 156 },
    isFeatured: false,
  },
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (query) params.q = query;
    if (selectedCity) params.city = selectedCity;
    if (selectedCategory) params.category = selectedCategory;
    setSearchParams(params);
  };

  const filteredVenues = DEMO_SEARCH_RESULTS.filter(v => {
    const qMatch = !query || v.name.toLowerCase().includes(query.toLowerCase()) || v.location.city.toLowerCase().includes(query.toLowerCase());
    const cityMatch = !selectedCity || v.location.city.toLowerCase() === selectedCity.toLowerCase();
    const catMatch = !selectedCategory || v.category === selectedCategory;
    return qMatch && cityMatch && catMatch;
  });

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      {/* Header Search Box */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)', background: 'var(--surface-1)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
          Search Venues & Event Spaces
        </h1>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search by venue name or city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: 42 }}
            />
          </div>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="input"
            style={{ width: 180 }}
          >
            <option value="">All Cities</option>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
            <option value="bangalore">Bangalore</option>
            <option value="goa">Goa</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input"
            style={{ width: 200 }}
          >
            <option value="">All Categories</option>
            <option value="banquet-hall">Banquet Hall</option>
            <option value="marriage-hall">Marriage Lawn</option>
            <option value="farmhouse">Farmhouse</option>
            <option value="resort">Resort</option>
          </select>

          <button type="submit" className="btn btn-primary" style={{ gap: 'var(--space-2)' }}>
            <Search size={18} /> Search
          </button>
        </form>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
          Showing {filteredVenues.length} results
        </p>
        <Link to="/venues" className="btn btn-secondary btn-sm" style={{ gap: 'var(--space-2)' }}>
          <SlidersHorizontal size={14} /> Full Filter Catalog
        </Link>
      </div>

      {/* Venues Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        {filteredVenues.map(venue => (
          <VenueCard key={venue._id} venue={venue} />
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
