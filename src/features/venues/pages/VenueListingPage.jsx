/**
 * VenueListingPage — Premium Customer Venue Discovery Marketplace
 *
 * Features:
 * - Hero search banner
 * - Quick event-type category chips
 * - Advanced sidebar filters (City, Category, Price Range, Capacity, Rating, Amenities)
 * - Sort toolbar + Grid/List view toggle
 * - Screen Settings popover (toggle card fields on/off, persisted in localStorage)
 * - Venue cards (grid & list) with wishlist, compare, quick-view
 * - Realistic skeleton loading
 * - Empty & error states
 * - Server-side pagination with page-size selector
 * - Responsive mobile filter drawer
 * - URL ↔ filter state sync
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  RotateCcw,
  X,
  MapPin,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Heart,
  Building2,
  Eye,
  GitCompare,
  Check,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Filter,
} from 'lucide-react'

import { fetchVenues } from '../redux/venuesThunks'
import {
  selectVenues,
  selectTotalVenues,
  selectTotalPages,
  selectCurrentPage,
  selectListStatus,
  selectListError,
} from '../redux/venuesSlice'
import {
  toggleLocalWishlist,
  selectWishlistItems,
  addToWishlist,
  removeFromWishlist,
} from '@features/wishlist/redux/wishlistSlice'
import {
  addToCompare,
  removeFromCompare,
  selectIsInCompare,
  selectCanAddToCompare,
} from '@features/compare/redux/compareSlice'
import { selectIsAuthenticated } from '@features/auth/redux/authSlice'
import { VENUE_CATEGORIES, POPULAR_CITIES, AMENITIES, SORT_OPTIONS } from '@constants/index'
import { ImagePresets } from '@lib/imagekit'
import QuickPreviewModal from '../components/QuickPreviewModal'

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_CATEGORIES = [
  { id: '', emoji: '✨', label: 'All Events' },
  { id: 'marriage-hall', emoji: '💍', label: 'Wedding' },
  { id: 'party-hall', emoji: '🎂', label: 'Birthday' },
  { id: 'banquet-hall', emoji: '🥂', label: 'Reception' },
  { id: 'corporate', emoji: '🏢', label: 'Corporate' },
  { id: 'convention-center', emoji: '🎤', label: 'Conference' },
  { id: 'lawn', emoji: '🌿', label: 'Outdoor' },
  { id: 'rooftop', emoji: '🌇', label: 'Rooftop' },
  { id: 'hotel-ballroom', emoji: '🎉', label: 'Party' },
  { id: 'farmhouse', emoji: '🏡', label: 'Farmhouse' },
  { id: 'resort', emoji: '🌴', label: 'Resort' },
]

const SCREEN_SETTINGS_DEFAULT = {
  image: true,
  location: true,
  venueType: true,
  capacity: true,
  price: true,
  rating: true,
  reviews: true,
  amenities: true,
  availability: true,
}

const SCREEN_SETTINGS_KEY = 'vh_listing_screen_settings'

const AMENITY_ICONS = {
  parking: '🅿️',
  ac: '❄️',
  catering: '🍽️',
  decoration: '🌸',
  music: '🎵',
  projector: '📽️',
  wifi: '📶',
  dj: '🎧',
  valet: '🚗',
  security: '🛡️',
  lift: '🛗',
  'backup-power': '⚡',
  cctv: '📷',
  bar: '🍸',
  stage: '🎤',
  'green-room': '🛋️',
}

const DEMO_VENUES = [
  {
    _id: 'demo-1',
    name: 'The Grand Majestic Banquet',
    slug: 'grand-majestic-banquet',
    tagline: 'Where dreams become celebrations',
    description:
      "Mumbai's most prestigious event venue offering 15,000 sq ft of luxury space with state-of-the-art facilities.",
    category: 'banquet-hall',
    location: { city: 'Mumbai', state: 'Maharashtra' },
    minCapacity: 100,
    maxCapacity: 800,
    pricePerDay: 150000,
    rating: { average: 4.8, count: 127 },
    isFeatured: true,
    amenities: ['parking', 'ac', 'catering', 'decoration', 'dj'],
    coverImage: { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800' },
  },
  {
    _id: 'demo-2',
    name: 'Royal Heritage Palace',
    slug: 'royal-heritage-palace',
    tagline: 'A royal experience for your royal occasion',
    description: 'Stunning heritage property in Delhi spread across 3 acres of lush gardens.',
    category: 'marriage-hall',
    location: { city: 'Delhi', state: 'Delhi' },
    minCapacity: 200,
    maxCapacity: 2000,
    pricePerDay: 350000,
    rating: { average: 4.9, count: 203 },
    isFeatured: true,
    amenities: ['parking', 'ac', 'catering', 'valet', 'security'],
    coverImage: { url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800' },
  },
  {
    _id: 'demo-3',
    name: 'Green Valley Farmhouse',
    slug: 'green-valley-farmhouse',
    tagline: "Nature's luxury for your celebration",
    description: 'Sprawling 5-acre property on the outskirts of Bangalore with open-air gardens.',
    category: 'farmhouse',
    location: { city: 'Bangalore', state: 'Karnataka' },
    minCapacity: 100,
    maxCapacity: 1000,
    pricePerDay: 200000,
    rating: { average: 4.7, count: 156 },
    isFeatured: true,
    amenities: ['parking', 'catering', 'decoration', 'backup-power'],
    coverImage: { url: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800' },
  },
  {
    _id: 'demo-4',
    name: 'Skyline Rooftop Events',
    slug: 'skyline-rooftop-events',
    tagline: 'Celebrate under the stars',
    description: 'Breathtaking 360° view of South Mumbai skyline and the Arabian Sea.',
    category: 'rooftop',
    location: { city: 'Mumbai', state: 'Maharashtra' },
    minCapacity: 50,
    maxCapacity: 250,
    pricePerDay: 85000,
    rating: { average: 4.6, count: 89 },
    isFeatured: true,
    amenities: ['ac', 'music', 'wifi', 'bar'],
    coverImage: { url: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800' },
  },
  {
    _id: 'demo-5',
    name: "Nizam's Grand Convention",
    slug: 'nizams-grand-convention',
    tagline: 'The grandeur of Nizami traditions',
    description: 'Inspired by the royal Nizam era, combining opulence with contemporary luxury.',
    category: 'convention-center',
    location: { city: 'Hyderabad', state: 'Telangana' },
    minCapacity: 200,
    maxCapacity: 1500,
    pricePerDay: 280000,
    rating: { average: 4.9, count: 178 },
    isFeatured: false,
    amenities: ['parking', 'ac', 'catering', 'projector', 'wifi'],
    coverImage: { url: 'https://images.unsplash.com/photo-1611519779883-e1a68f0f5826?w=800' },
  },
  {
    _id: 'demo-6',
    name: 'TechHub Corporate Suites',
    slug: 'techhub-corporate-suites',
    tagline: 'Innovation meets celebration',
    description:
      "Bangalore's most tech-forward event venue designed for corporate summits and conferences.",
    category: 'corporate',
    location: { city: 'Bangalore', state: 'Karnataka' },
    minCapacity: 20,
    maxCapacity: 300,
    pricePerDay: 75000,
    rating: { average: 4.4, count: 44 },
    isFeatured: false,
    amenities: ['ac', 'projector', 'wifi', 'security'],
    coverImage: { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' },
  },
  {
    _id: 'demo-7',
    name: 'Pearl Garden Resort',
    slug: 'pearl-garden-resort',
    tagline: 'An enchanting escape for your celebration',
    description:
      'Picturesque 8-acre resort with multiple banquet halls, lawns, and a stunning lake-view.',
    category: 'resort',
    location: { city: 'Jaipur', state: 'Rajasthan' },
    minCapacity: 300,
    maxCapacity: 3000,
    pricePerDay: 450000,
    rating: { average: 4.9, count: 312 },
    isFeatured: true,
    amenities: ['parking', 'ac', 'catering', 'valet', 'security', 'dj'],
    coverImage: { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' },
  },
  {
    _id: 'demo-8',
    name: 'Lotus Convention Center',
    slug: 'lotus-convention-center',
    tagline: 'Where ideas come to life',
    description: 'A world-class convention center in Chennai with cutting-edge AV technology.',
    category: 'convention-center',
    location: { city: 'Chennai', state: 'Tamil Nadu' },
    minCapacity: 100,
    maxCapacity: 2500,
    pricePerDay: 180000,
    rating: { average: 4.5, count: 67 },
    isFeatured: false,
    amenities: ['parking', 'ac', 'wifi', 'projector', 'backup-power'],
    coverImage: { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800' },
  },
  {
    _id: 'demo-9',
    name: 'The Imperial Lawn & Garden',
    slug: 'imperial-lawn-garden',
    tagline: 'Open skies, royal vibes',
    description:
      'A sprawling 4-acre open lawn in Pune perfect for outdoor weddings and receptions.',
    category: 'lawn',
    location: { city: 'Pune', state: 'Maharashtra' },
    minCapacity: 200,
    maxCapacity: 2000,
    pricePerDay: 120000,
    rating: { average: 4.6, count: 93 },
    isFeatured: false,
    amenities: ['parking', 'catering', 'decoration', 'music'],
    coverImage: { url: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800' },
  },
  {
    _id: 'demo-10',
    name: 'Crown Plaza Ballroom',
    slug: 'crown-plaza-ballroom',
    tagline: 'Luxury redefined for your special day',
    description:
      'An exquisite hotel ballroom in Kolkata with crystal chandeliers and marble flooring.',
    category: 'hotel-ballroom',
    location: { city: 'Kolkata', state: 'West Bengal' },
    minCapacity: 100,
    maxCapacity: 600,
    pricePerDay: 220000,
    rating: { average: 4.7, count: 115 },
    isFeatured: true,
    amenities: ['parking', 'ac', 'catering', 'valet', 'bar'],
    coverImage: { url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800' },
  },
  {
    _id: 'demo-11',
    name: 'Vivid Party Hall',
    slug: 'vivid-party-hall',
    tagline: 'The life of every party',
    description: 'A vibrant and modern party hall in Hyderabad with customisable LED lighting.',
    category: 'party-hall',
    location: { city: 'Hyderabad', state: 'Telangana' },
    minCapacity: 50,
    maxCapacity: 400,
    pricePerDay: 60000,
    rating: { average: 4.3, count: 57 },
    isFeatured: false,
    amenities: ['ac', 'music', 'dj', 'decoration'],
    coverImage: { url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800' },
  },
  {
    _id: 'demo-12',
    name: 'Sunshine Farmhouse Estate',
    slug: 'sunshine-farmhouse-estate',
    tagline: 'Country luxury for city celebrations',
    description: 'A pristine farmhouse estate near Delhi with multiple event lawns and a pool.',
    category: 'farmhouse',
    location: { city: 'Delhi', state: 'Delhi' },
    minCapacity: 150,
    maxCapacity: 800,
    pricePerDay: 175000,
    rating: { average: 4.8, count: 142 },
    isFeatured: false,
    amenities: ['parking', 'catering', 'decoration', 'security', 'backup-power'],
    coverImage: { url: 'https://images.unsplash.com/photo-1587131785264-46e6f0a24d38?w=800' },
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const buildCleanParams = (f) => {
  const p = {}
  if (f.search?.trim()) p.search = f.search.trim()
  if (f.city) p.city = f.city
  if (f.category) p.category = f.category
  if (f.minPrice) p.minPrice = f.minPrice
  if (f.maxPrice) p.maxPrice = f.maxPrice
  if (f.minCapacity) p.minCapacity = f.minCapacity
  if (f.minRating) p.rating = f.minRating
  if (f.amenities?.length) p.amenities = f.amenities
  if (f.sortBy && f.sortBy !== 'relevance') p.sortBy = f.sortBy
  p.page = f.page || 1
  p.limit = f.limit || 12
  return p
}

const hasActiveFilters = (f) =>
  !!(
    f.search ||
    f.city ||
    f.category ||
    f.minPrice ||
    f.maxPrice ||
    f.minCapacity ||
    f.minRating ||
    f.amenities?.length
  )

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n || 0)

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Skeleton card for loading state */
const SkeletonCard = () => (
  <div className="card" style={{ overflow: 'hidden' }}>
    <div className="skeleton" style={{ height: 220, borderRadius: 0 }} />
    <div
      style={{
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <div className="skeleton" style={{ height: 10, width: '60%', borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 18, width: '85%', borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 10, width: '50%', borderRadius: 6 }} />
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 22, width: 60, borderRadius: 20 }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <div className="skeleton" style={{ height: 10, width: '40%', borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 18, width: '30%', borderRadius: 6 }} />
      </div>
      <div className="skeleton" style={{ height: 36, borderRadius: 10, marginTop: 4 }} />
    </div>
  </div>
)

/** Skeleton list row */
const SkeletonListRow = () => (
  <div
    className="card"
    style={{
      padding: 'var(--space-4)',
      display: 'flex',
      gap: 'var(--space-4)',
      alignItems: 'flex-start',
    }}
  >
    <div
      className="skeleton"
      style={{ width: 180, height: 130, borderRadius: 12, flexShrink: 0 }}
    />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div className="skeleton" style={{ height: 10, width: '30%', borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 20, width: '65%', borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 10, width: '40%', borderRadius: 6 }} />
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 22, width: 64, borderRadius: 20 }} />
        ))}
      </div>
    </div>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'flex-end',
        flexShrink: 0,
      }}
    >
      <div className="skeleton" style={{ height: 24, width: 90, borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 34, width: 110, borderRadius: 10 }} />
    </div>
  </div>
)

/** Individual Venue Grid Card */
const VenueGridCard = ({ venue, onQuickView, screenSettings }) => {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const wishlistItems = useSelector(selectWishlistItems)
  const isInCompare = useSelector(selectIsInCompare(venue._id))
  const canAddToCompare = useSelector(selectCanAddToCompare)
  const isWishlisted = wishlistItems.includes(venue._id)

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAuthenticated) {
      isWishlisted ? dispatch(removeFromWishlist(venue._id)) : dispatch(addToWishlist(venue._id))
    } else {
      dispatch(toggleLocalWishlist(venue._id))
    }
  }

  const handleCompare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInCompare) dispatch(removeFromCompare(venue._id))
    else if (canAddToCompare) dispatch(addToCompare(venue))
  }

  const coverUrl = venue.coverImage?.url
    ? venue.coverImage.url.includes('unsplash')
      ? venue.coverImage.url
      : ImagePresets?.venueCard?.(venue.coverImage.url) || venue.coverImage.url
    : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'

  const visibleAmenities = (venue.amenities || []).slice(0, 3)
  const extraAmenities = Math.max(0, (venue.amenities || []).length - 3)

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = ''
      }}
    >
      {/* Image */}
      {screenSettings.image && (
        <div
          style={{
            position: 'relative',
            height: 220,
            overflow: 'hidden',
            background: 'var(--bg-subtle)',
          }}
        >
          <img
            src={coverUrl}
            alt={venue.name}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 400ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'
            }}
          />

          {/* Overlay Top Row */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              right: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ display: 'flex', gap: 6 }}>
              {venue.isFeatured && (
                <span
                  style={{
                    background: '#6D4CFF',
                    color: '#fff',
                    padding: '3px 10px',
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  ⭐ Featured
                </span>
              )}
            </div>
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 6 }}>
              {onQuickView && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onQuickView(venue)
                  }}
                  title="Quick Preview"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Eye size={14} />
                </button>
              )}
              <button
                onClick={handleCompare}
                title={isInCompare ? 'Remove from Compare' : 'Compare'}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isInCompare ? '#6D4CFF' : 'rgba(255,255,255,0.9)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  color: isInCompare ? '#fff' : 'var(--text-primary)',
                }}
              >
                {isInCompare ? <Check size={14} /> : <GitCompare size={14} />}
              </button>
              <button
                onClick={handleWishlist}
                title={isWishlisted ? 'Remove from Wishlist' : 'Save Venue'}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  color: isWishlisted ? '#ef4444' : 'var(--text-primary)',
                  transition: 'all 150ms ease',
                }}
              >
                <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Category Badge bottom-left */}
          <span
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              background: 'rgba(0,0,0,0.65)',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: 9999,
              fontSize: 11,
              fontWeight: 500,
              backdropFilter: 'blur(4px)',
              textTransform: 'capitalize',
            }}
          >
            {(venue.category || 'venue').replace(/-/g, ' ')}
          </span>
        </div>
      )}

      {/* Body */}
      <div
        style={{
          padding: 'var(--space-4) var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: 'var(--space-2)',
        }}
      >
        {/* Location + Rating */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {screenSettings.location && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--text-tertiary)',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              <MapPin size={13} style={{ color: 'var(--brand-default)', flexShrink: 0 }} />
              <span>{venue.location?.city || 'India'}</span>
              {venue.location?.state && <span style={{ color: 'var(--text-disabled)' }}>·</span>}
              {venue.location?.state && (
                <span style={{ color: 'var(--text-disabled)' }}>{venue.location.state}</span>
              )}
            </div>
          )}
          {screenSettings.rating && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'var(--color-warning-50)',
                color: 'var(--color-warning-700)',
                padding: '2px 8px',
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <Star size={11} fill="currentColor" />
              <span>{venue.rating?.average || '4.5'}</span>
              {screenSettings.reviews && (
                <span style={{ fontWeight: 400, color: 'var(--color-warning-700)', opacity: 0.75 }}>
                  ({venue.rating?.count || 0})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Name */}
        <Link
          to={`/venues/${venue.slug || venue._id}`}
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            textDecoration: 'none',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {venue.name}
        </Link>

        {/* Tagline */}
        {venue.tagline && (
          <p
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              margin: 0,
            }}
          >
            {venue.tagline}
          </p>
        )}

        {/* Amenities */}
        {screenSettings.amenities && (venue.amenities || []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
            {visibleAmenities.map((am) => (
              <span
                key={am}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <span>{AMENITY_ICONS[am] || '✓'}</span>
                <span style={{ textTransform: 'capitalize' }}>{am.replace(/-/g, ' ')}</span>
              </span>
            ))}
            {extraAmenities > 0 && (
              <span
                style={{
                  background: 'var(--brand-subtle)',
                  color: 'var(--brand-default)',
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  fontWeight: 600,
                }}
              >
                +{extraAmenities} more
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Footer: Capacity + Price */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 'var(--space-3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {screenSettings.capacity && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--text-secondary)',
                fontSize: 12,
              }}
            >
              <Users size={13} />
              <span>
                {venue.minCapacity || 50}–{venue.maxCapacity || 500}
              </span>
            </div>
          )}
          {screenSettings.price && (
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 800,
                  color: 'var(--brand-default)',
                  fontFamily: 'var(--font-display)',
                  lineHeight: 1,
                }}
              >
                {fmt(venue.pricePerDay)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>starting/event</div>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          to={`/venues/${venue.slug || venue._id}`}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', gap: 6, marginTop: 4 }}
        >
          View Details <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}

/** Individual Venue List Row */
const VenueListRow = ({ venue, onQuickView, screenSettings }) => {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const wishlistItems = useSelector(selectWishlistItems)
  const isWishlisted = wishlistItems.includes(venue._id)

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAuthenticated) {
      isWishlisted ? dispatch(removeFromWishlist(venue._id)) : dispatch(addToWishlist(venue._id))
    } else {
      dispatch(toggleLocalWishlist(venue._id))
    }
  }

  const coverUrl = venue.coverImage?.url
    ? venue.coverImage.url.includes('unsplash')
      ? venue.coverImage.url
      : ImagePresets?.venueCard?.(venue.coverImage.url) || venue.coverImage.url
    : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'

  const visibleAmenities = (venue.amenities || []).slice(0, 4)
  const extraAmenities = Math.max(0, (venue.amenities || []).length - 4)

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = ''
      }}
    >
      {/* Image */}
      {screenSettings.image && (
        <div
          style={{
            position: 'relative',
            width: 200,
            minWidth: 200,
            overflow: 'hidden',
            background: 'var(--bg-subtle)',
            flexShrink: 0,
          }}
        >
          <img
            src={coverUrl}
            alt={venue.name}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 400ms ease',
              minHeight: 160,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'
            }}
          />
          {venue.isFeatured && (
            <span
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                background: '#6D4CFF',
                color: '#fff',
                padding: '3px 8px',
                borderRadius: 9999,
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              ⭐ Featured
            </span>
          )}
          <button
            onClick={handleWishlist}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isWishlisted ? '#ef4444' : 'var(--text-primary)',
            }}
          >
            <Heart size={13} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, padding: 'var(--space-5)', display: 'flex', gap: 'var(--space-4)' }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
              flexWrap: 'wrap',
            }}
          >
            {screenSettings.venueType && (
              <span
                style={{
                  background: 'var(--brand-subtle)',
                  color: 'var(--brand-default)',
                  padding: '2px 10px',
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {(venue.category || 'venue').replace(/-/g, ' ')}
              </span>
            )}
            {screenSettings.rating && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'var(--color-warning-50)',
                  color: 'var(--color-warning-700)',
                  padding: '2px 8px',
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                <Star size={11} fill="currentColor" />
                {venue.rating?.average || '4.5'}
                {screenSettings.reviews && (
                  <span style={{ fontWeight: 400 }}> ({venue.rating?.count || 0})</span>
                )}
              </span>
            )}
          </div>

          <h3
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 4,
            }}
          >
            <Link
              to={`/venues/${venue.slug || venue._id}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {venue.name}
            </Link>
          </h3>

          {screenSettings.location && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--text-secondary)',
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              <MapPin size={14} style={{ color: 'var(--brand-default)', flexShrink: 0 }} />
              <span>
                {venue.location?.city}
                {venue.location?.state ? `, ${venue.location.state}` : ''}
              </span>
            </div>
          )}

          <p
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              marginBottom: 10,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {venue.tagline || venue.description}
          </p>

          {screenSettings.amenities && (venue.amenities || []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {visibleAmenities.map((am) => (
                <span
                  key={am}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 9999,
                  }}
                >
                  {AMENITY_ICONS[am] || '✓'} {am.replace(/-/g, ' ')}
                </span>
              ))}
              {extraAmenities > 0 && (
                <span
                  style={{
                    background: 'var(--brand-subtle)',
                    color: 'var(--brand-default)',
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    fontWeight: 600,
                  }}
                >
                  +{extraAmenities} more
                </span>
              )}
            </div>
          )}

          {screenSettings.capacity && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--text-secondary)',
                fontSize: 12,
                marginTop: 10,
              }}
            >
              <Users size={13} />
              <span>
                Capacity: {venue.minCapacity || 50}–{venue.maxCapacity || 500} guests
              </span>
            </div>
          )}
        </div>

        {/* Right: Price + CTA */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexShrink: 0,
            minWidth: 150,
          }}
        >
          {screenSettings.price && (
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 800,
                  color: 'var(--brand-default)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {fmt(venue.pricePerDay)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>starting / event</div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
            {onQuickView && (
              <button
                onClick={() => onQuickView(venue)}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', gap: 4 }}
              >
                <Eye size={14} /> Quick View
              </button>
            )}
            <Link
              to={`/venues/${venue.slug || venue._id}`}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'center', gap: 4 }}
            >
              View Details <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Screen Settings Popover ──────────────────────────────────────────────────

const ScreenSettingsPopover = ({ settings, onChange, onClose }) => {
  const FIELDS = [
    { key: 'image', label: 'Venue Image' },
    { key: 'location', label: 'Location' },
    { key: 'venueType', label: 'Venue Type' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'price', label: 'Starting Price' },
    { key: 'rating', label: 'Rating' },
    { key: 'reviews', label: 'Review Count' },
    { key: 'amenities', label: 'Amenities' },
    { key: 'availability', label: 'Availability' },
  ]

  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: '110%',
        zIndex: 999,
        background: 'var(--surface-1)',
        border: '1px solid var(--border-normal)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-xl)',
        padding: 'var(--space-4)',
        minWidth: 230,
        animation: 'fadeInUp 150ms ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-3)',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
          Screen Settings
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-tertiary)',
          }}
        >
          <X size={16} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {FIELDS.map((f) => (
          <label
            key={f.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: 8,
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <input
              type="checkbox"
              checked={settings[f.key]}
              onChange={() => onChange(f.key)}
              style={{
                accentColor: 'var(--brand-default)',
                width: 15,
                height: 15,
                cursor: 'pointer',
              }}
            />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {f.label}
            </span>
          </label>
        ))}
      </div>
      <div
        style={{
          marginTop: 'var(--space-3)',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 'var(--space-3)',
        }}
      >
        <button
          onClick={() => onChange('__reset__')}
          style={{
            fontSize: 12,
            color: 'var(--brand-default)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Reset to Default
        </button>
      </div>
    </div>
  )
}

// ─── Mobile Filter Drawer ─────────────────────────────────────────────────────

const MobileFilterDrawer = ({
  open,
  filters,
  onFilterChange,
  onAmenityToggle,
  onReset,
  onClose,
}) => {
  if (!open) return null
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 998, display: 'flex', alignItems: 'flex-end' }}
    >
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'relative',
          background: 'var(--surface-1)',
          borderRadius: '24px 24px 0 0',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-2xl)',
          animation: 'fadeInUp 200ms ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-5)',
          }}
        >
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Filters</h3>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-subtle)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <FilterBody
          filters={filters}
          onFilterChange={onFilterChange}
          onAmenityToggle={onAmenityToggle}
        />

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-6)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <button onClick={onReset} className="btn btn-secondary" style={{ flex: 1 }}>
            Clear All
          </button>
          <button onClick={onClose} className="btn btn-primary" style={{ flex: 2 }}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}

/** Shared filter body for sidebar + drawer */
const FilterBody = ({ filters, onFilterChange, onAmenityToggle }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
    {/* City */}
    <div>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
          display: 'block',
        }}
      >
        City
      </label>
      <select
        value={filters.city}
        onChange={(e) => onFilterChange('city', e.target.value)}
        className="input"
        style={{ fontSize: 13 }}
      >
        <option value="">All Cities</option>
        {POPULAR_CITIES.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
    </div>

    {/* Venue Type */}
    <div>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
          display: 'block',
        }}
      >
        Venue Type
      </label>
      <select
        value={filters.category}
        onChange={(e) => onFilterChange('category', e.target.value)}
        className="input"
        style={{ fontSize: 13 }}
      >
        <option value="">All Types</option>
        {VENUE_CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    </div>

    {/* Price Range */}
    <div>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
          display: 'block',
        }}
      >
        Price Range (₹/day)
      </label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="number"
          placeholder="Min"
          value={filters.minPrice}
          onChange={(e) => onFilterChange('minPrice', e.target.value)}
          className="input"
          style={{ fontSize: 13, padding: '8px 12px' }}
        />
        <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>–</span>
        <input
          type="number"
          placeholder="Max"
          value={filters.maxPrice}
          onChange={(e) => onFilterChange('maxPrice', e.target.value)}
          className="input"
          style={{ fontSize: 13, padding: '8px 12px' }}
        />
      </div>
    </div>

    {/* Capacity */}
    <div>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
          display: 'block',
        }}
      >
        Min Guest Capacity
      </label>
      <input
        type="number"
        placeholder="e.g. 200"
        value={filters.minCapacity}
        onChange={(e) => onFilterChange('minCapacity', e.target.value)}
        className="input"
        style={{ fontSize: 13 }}
      />
    </div>

    {/* Rating */}
    <div>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
          display: 'block',
        }}
      >
        Min Rating
      </label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[
          ['', 'Any'],
          ['3', '3★+'],
          ['4', '4★+'],
          ['4.5', '4.5★+'],
        ].map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => onFilterChange('minRating', val)}
            style={{
              padding: '5px 14px',
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: `1.5px solid ${filters.minRating === val ? 'var(--brand-default)' : 'var(--border-normal)'}`,
              background: filters.minRating === val ? 'var(--brand-default)' : 'transparent',
              color: filters.minRating === val ? '#fff' : 'var(--text-secondary)',
              transition: 'all 150ms',
            }}
          >
            {lbl}
          </button>
        ))}
      </div>
    </div>

    {/* Amenities */}
    <div>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
          display: 'block',
        }}
      >
        Amenities
      </label>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          maxHeight: 220,
          overflowY: 'auto',
        }}
      >
        {AMENITIES.map((am) => (
          <label
            key={am.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={filters.amenities.includes(am.id)}
              onChange={() => onAmenityToggle(am.id)}
              style={{
                accentColor: 'var(--brand-default)',
                width: 15,
                height: 15,
                cursor: 'pointer',
              }}
            />
            <span>
              {AMENITY_ICONS[am.id] || '✓'} {am.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────

const VenueListingPage = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()

  // Redux
  const venues = useSelector(selectVenues)
  const totalVenues = useSelector(selectTotalVenues)
  const totalPages = useSelector(selectTotalPages)
  const listStatus = useSelector(selectListStatus)
  const listError = useSelector(selectListError)

  // Local UI state
  const [viewMode, setViewMode] = useState('grid')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [previewVenue, setPreviewVenue] = useState(null)
  const [showScreenSettings, setShowScreenSettings] = useState(false)
  const settingsBtnRef = useRef(null)

  // Screen settings (persisted)
  const [screenSettings, setScreenSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SCREEN_SETTINGS_KEY)
      return saved ? { ...SCREEN_SETTINGS_DEFAULT, ...JSON.parse(saved) } : SCREEN_SETTINGS_DEFAULT
    } catch {
      return SCREEN_SETTINGS_DEFAULT
    }
  })

  // Filters (synced from URL)
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
  })

  const [searchInput, setSearchInput] = useState(filters.search)
  const debounceRef = useRef(null)

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }))
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [searchInput])

  // Sync URL + fire API
  useEffect(() => {
    const clean = buildCleanParams(filters)
    const url = {}
    if (clean.search) url.search = clean.search
    if (clean.city) url.city = clean.city
    if (clean.category) url.category = clean.category
    if (clean.minPrice) url.minPrice = clean.minPrice
    if (clean.maxPrice) url.maxPrice = clean.maxPrice
    if (clean.minCapacity) url.capacity = clean.minCapacity
    if (clean.minRating) url.minRating = clean.minRating
    if (clean.amenities?.length) url.amenities = clean.amenities
    if (clean.sortBy && clean.sortBy !== 'relevance') url.sortBy = clean.sortBy
    if (clean.page > 1) url.page = clean.page
    if (clean.limit !== 12) url.limit = clean.limit
    setSearchParams(url)
    dispatch(fetchVenues(clean))
  }, [filters, dispatch, setSearchParams])

  // Persist screen settings
  useEffect(() => {
    localStorage.setItem(SCREEN_SETTINGS_KEY, JSON.stringify(screenSettings))
  }, [screenSettings])

  // Close screen settings on outside click
  useEffect(() => {
    if (!showScreenSettings) return
    const handler = (e) => {
      if (settingsBtnRef.current && !settingsBtnRef.current.contains(e.target)) {
        setShowScreenSettings(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showScreenSettings])

  // Handlers
  const handleFilterChange = (key, value) => {
    if (key === 'search') {
      setSearchInput(value)
      return
    }
    const resetPage = key !== 'page' && key !== 'limit'
    setFilters((prev) => ({ ...prev, [key]: value, ...(resetPage ? { page: 1 } : {}) }))
  }

  const handleAmenityToggle = (id) => {
    setFilters((prev) => {
      const exists = prev.amenities.includes(id)
      return {
        ...prev,
        amenities: exists ? prev.amenities.filter((a) => a !== id) : [...prev.amenities, id],
        page: 1,
      }
    })
  }

  const handleReset = () => {
    setSearchInput('')
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
    })
  }

  const handlePageChange = (p) => setFilters((prev) => ({ ...prev, page: p }))

  const handleScreenSetting = (key) => {
    if (key === '__reset__') {
      setScreenSettings(SCREEN_SETTINGS_DEFAULT)
      return
    }
    setScreenSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleCategoryClick = (catId) => {
    setFilters((prev) => ({ ...prev, category: catId, page: 1 }))
  }

  // Derived
  const safeVenues = Array.isArray(venues) ? venues : []
  const filtersActive = hasActiveFilters(filters)
  const displayVenues = filtersActive
    ? safeVenues
    : safeVenues.length > 0
      ? safeVenues
      : listStatus === 'loading'
        ? []
        : DEMO_VENUES
  const displayTotal = filtersActive ? safeVenues.length : totalVenues || displayVenues.length
  const displayPages = totalPages || Math.ceil(displayTotal / filters.limit) || 1

  // Active filter pills
  const filterPills = [
    filters.search && { key: 'search', label: `"${filters.search}"` },
    filters.city && { key: 'city', label: `📍 ${filters.city}` },
    filters.category && {
      key: 'category',
      label: VENUE_CATEGORIES.find((c) => c.id === filters.category)?.label || filters.category,
    },
    filters.maxPrice && {
      key: 'maxPrice',
      label: `Max ₹${Number(filters.maxPrice).toLocaleString('en-IN')}`,
    },
    filters.minPrice && {
      key: 'minPrice',
      label: `Min ₹${Number(filters.minPrice).toLocaleString('en-IN')}`,
    },
    filters.minCapacity && { key: 'minCapacity', label: `${filters.minCapacity}+ guests` },
    filters.minRating && { key: 'minRating', label: `${filters.minRating}★+` },
    ...filters.amenities.map((a) => ({
      key: `am_${a}`,
      label: `${AMENITY_ICONS[a] || '✓'} ${a.replace(/-/g, ' ')}`,
      isAmenity: true,
      amenityId: a,
    })),
  ].filter(Boolean)

  const removeFilterPill = (pill) => {
    if (pill.isAmenity) handleAmenityToggle(pill.amenityId)
    else {
      setFilters((prev) => ({ ...prev, [pill.key]: '', page: 1 }))
      if (pill.key === 'search') setSearchInput('')
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* ================================================================ */}
      {/* 1. HERO SEARCH BANNER                                             */}
      {/* ================================================================ */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a0a3d 0%, #2d1b69 45%, #4c2a85 75%, #6D4CFF 100%)',
          padding: 'var(--space-16) var(--space-6) var(--space-10)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(109,76,255,0.15)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -40,
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'rgba(109,76,255,0.1)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 9999,
              padding: '6px 18px',
              marginBottom: 'var(--space-5)',
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            <TrendingUp size={13} /> 2,400+ Venues Listed Across India
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: 'var(--space-4)',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
            }}
          >
            Find the Perfect Venue
            <br />
            for Your Event
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: 'var(--text-base)',
              lineHeight: 1.65,
              marginBottom: 'var(--space-8)',
            }}
          >
            Discover beautiful venues for weddings, parties, conferences, celebrations, and more.
          </p>

          {/* Hero Search Box */}
          <div
            style={{
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(12px)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-4)',
              display: 'flex',
              gap: 'var(--space-3)',
              alignItems: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <Search
              size={20}
              style={{ color: 'var(--brand-default)', flexShrink: 0, marginLeft: 4 }}
            />
            <input
              type="text"
              placeholder="Search by venue name, location or event type..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }))
              }
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-primary)',
                background: 'transparent',
                fontFamily: 'var(--font-sans)',
              }}
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('')
                  setFilters((prev) => ({ ...prev, search: '', page: 1 }))
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  display: 'flex',
                  padding: 4,
                }}
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }))}
              className="btn btn-primary"
              style={{ flexShrink: 0 }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 2. EVENT CATEGORY CHIPS                                           */}
      {/* ================================================================ */}
      <div
        style={{
          background: 'var(--surface-1)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBlock: 'var(--space-5)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              overflowX: 'auto',
              paddingBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                flexShrink: 0,
              }}
            >
              Browse:
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
              {EVENT_CATEGORIES.map((cat) => {
                const isActive = filters.category === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      borderRadius: 9999,
                      border: `1.5px solid ${isActive ? 'var(--brand-default)' : 'var(--border-normal)'}`,
                      background: isActive ? 'var(--brand-default)' : 'var(--surface-1)',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 150ms ease',
                      boxShadow: isActive ? '0 2px 8px rgba(109,76,255,0.25)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'var(--brand-default)'
                        e.currentTarget.style.color = 'var(--brand-default)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'var(--border-normal)'
                        e.currentTarget.style.color = 'var(--text-secondary)'
                      }
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* MAIN CONTENT AREA                                                 */}
      {/* ================================================================ */}
      <div
        className="container"
        style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}
      >
        {/* ── TOOLBAR: Count + Sort + View + Settings ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-5)',
            background: 'var(--surface-1)',
            padding: 'var(--space-4) var(--space-5)',
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}
            >
              <span
                style={{
                  color: 'var(--brand-default)',
                  fontWeight: 900,
                  fontSize: 'var(--text-base)',
                }}
              >
                {displayTotal}
              </span>{' '}
              venues{filtersActive ? ' found' : ' available'}
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'none' }}
              id="mobile-filter-btn"
            >
              <Filter size={15} /> Filters {filterPills.length > 0 && `(${filterPills.length})`}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              flexWrap: 'wrap',
            }}
          >
            {/* Sort */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600 }}>
                Sort:
              </span>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-normal)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Per Page */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600 }}>
                Show:
              </span>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-normal)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {[12, 24, 36, 48].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            <div
              style={{
                display: 'flex',
                border: '1px solid var(--border-normal)',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              {[
                { mode: 'grid', Icon: Grid3X3 },
                { mode: 'list', Icon: List },
              ].map(({ mode, Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: '7px 11px',
                    background: viewMode === mode ? 'var(--brand-default)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: viewMode === mode ? '#fff' : 'var(--text-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 150ms',
                  }}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>

            {/* Screen Settings */}
            <div style={{ position: 'relative' }} ref={settingsBtnRef}>
              <button
                onClick={() => setShowScreenSettings((s) => !s)}
                className={`btn btn-secondary btn-sm`}
                style={{
                  gap: 6,
                  background: showScreenSettings ? 'var(--brand-subtle)' : undefined,
                  borderColor: showScreenSettings ? 'var(--brand-default)' : undefined,
                  color: showScreenSettings ? 'var(--brand-default)' : undefined,
                }}
              >
                <Settings2 size={15} /> Settings
              </button>
              {showScreenSettings && (
                <ScreenSettingsPopover
                  settings={screenSettings}
                  onChange={handleScreenSetting}
                  onClose={() => setShowScreenSettings(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Active Filter Pills ── */}
        {filterPills.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 'var(--space-5)',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Active:
            </span>
            {filterPills.map((pill) => (
              <span
                key={pill.key}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'var(--brand-subtle)',
                  color: 'var(--brand-default)',
                  border: '1px solid var(--brand-muted)',
                  borderRadius: 9999,
                  padding: '3px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {pill.label}
                <button
                  onClick={() => removeFilterPill(pill)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'inherit',
                    display: 'flex',
                    padding: 0,
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              onClick={handleReset}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <RotateCcw size={12} /> Clear all
            </button>
          </div>
        )}

        {/* ── MAIN GRID: Sidebar + Results ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            gap: 'var(--space-8)',
            alignItems: 'start',
          }}
          className="venue-listing-main"
        >
          {/* ============================================================ */}
          {/* SIDEBAR FILTERS (Desktop only)                                */}
          {/* ============================================================ */}
          <aside style={{ position: 'sticky', top: 'calc(var(--header-height, 72px) + 20px)' }}>
            <div className="card" style={{ padding: 'var(--space-5)', overflow: 'visible' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--space-5)',
                }}
              >
                <h3
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <SlidersHorizontal size={17} style={{ color: 'var(--brand-default)' }} />
                  Filters
                </h3>
                {filtersActive && (
                  <button
                    onClick={handleReset}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--brand-default)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                )}
              </div>

              {/* Sidebar Search */}
              <div style={{ position: 'relative', marginBottom: 'var(--space-5)' }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search venues..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 36, fontSize: 13 }}
                />
              </div>

              <FilterBody
                filters={filters}
                onFilterChange={handleFilterChange}
                onAmenityToggle={handleAmenityToggle}
              />
            </div>
          </aside>

          {/* ============================================================ */}
          {/* RESULTS                                                        */}
          {/* ============================================================ */}
          <main>
            {/* Error State */}
            {listStatus === 'failed' && !displayVenues.length && (
              <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
                <AlertCircle
                  size={48}
                  style={{ color: 'var(--color-error-500)', margin: '0 auto var(--space-4) auto' }}
                />
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 8 }}>
                  Unable to Load Venues
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                  Something went wrong while loading venues. Please try again.
                </p>
                <button
                  onClick={() => dispatch(fetchVenues(buildCleanParams(filters)))}
                  className="btn btn-primary"
                  style={{ gap: 6 }}
                >
                  <RefreshCw size={16} /> Try Again
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {listStatus === 'loading' &&
              (viewMode === 'grid' ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
                    gap: 'var(--space-6)',
                  }}
                >
                  {Array.from({ length: filters.limit }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonListRow key={i} />
                  ))}
                </div>
              ))}

            {/* Empty State */}
            {listStatus !== 'loading' && displayVenues.length === 0 && (
              <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
                <Building2
                  size={56}
                  style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--space-4) auto' }}
                />
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 8 }}>
                  No Venues Found
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                  Try adjusting your search or filters to discover more venues.
                </p>
                <div
                  style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
                >
                  <button onClick={handleReset} className="btn btn-secondary">
                    Clear Filters
                  </button>
                  <Link to="/venues" className="btn btn-primary">
                    Browse All Venues
                  </Link>
                </div>
              </div>
            )}

            {/* Venue Cards */}
            {listStatus !== 'loading' && displayVenues.length > 0 && (
              <>
                {viewMode === 'grid' ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
                      gap: 'var(--space-6)',
                    }}
                  >
                    {displayVenues.map((v) => (
                      <VenueGridCard
                        key={v._id}
                        venue={v}
                        onQuickView={setPreviewVenue}
                        screenSettings={screenSettings}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {displayVenues.map((v) => (
                      <VenueListRow
                        key={v._id}
                        venue={v}
                        onQuickView={setPreviewVenue}
                        screenSettings={screenSettings}
                      />
                    ))}
                  </div>
                )}

                {/* ── PAGINATION ── */}
                <div style={{ marginTop: 'var(--space-10)' }}>
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-4)',
                    }}
                  >
                    Showing{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {Math.min((filters.page - 1) * filters.limit + 1, displayTotal)}–
                      {Math.min(filters.page * filters.limit, displayTotal)}
                    </strong>{' '}
                    of <strong style={{ color: 'var(--text-primary)' }}>{displayTotal}</strong>{' '}
                    venues
                  </div>
                  {displayPages > 1 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        flexWrap: 'wrap',
                      }}
                    >
                      <button
                        disabled={filters.page <= 1}
                        onClick={() => handlePageChange(filters.page - 1)}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: 4 }}
                      >
                        <ChevronLeft size={16} /> Prev
                      </button>

                      {Array.from({ length: displayPages }, (_, i) => i + 1)
                        .filter(
                          (p) => p === 1 || p === displayPages || Math.abs(p - filters.page) <= 1
                        )
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
                          acc.push(p)
                          return acc
                        }, [])
                        .map((p, idx) =>
                          p === '…' ? (
                            <span
                              key={`e-${idx}`}
                              style={{ padding: '0 6px', color: 'var(--text-tertiary)' }}
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => handlePageChange(p)}
                              className={
                                filters.page === p
                                  ? 'btn btn-primary btn-sm'
                                  : 'btn btn-secondary btn-sm'
                              }
                              style={{ minWidth: 36 }}
                            >
                              {p}
                            </button>
                          )
                        )}

                      <button
                        disabled={filters.page >= displayPages}
                        onClick={() => handlePageChange(filters.page + 1)}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: 4 }}
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* ── Quick Preview Modal ── */}
      <QuickPreviewModal venue={previewVenue} onClose={() => setPreviewVenue(null)} />

      {/* ── Mobile Filter Drawer ── */}
      <MobileFilterDrawer
        open={showMobileFilters}
        filters={filters}
        onFilterChange={handleFilterChange}
        onAmenityToggle={handleAmenityToggle}
        onReset={handleReset}
        onClose={() => setShowMobileFilters(false)}
      />

      {/* ── Responsive CSS ── */}
      <style>{`
        @media (max-width: 1024px) {
          .venue-listing-main { grid-template-columns: 1fr !important; }
          .venue-listing-main aside { display: none !important; }
          #mobile-filter-btn { display: flex !important; }
        }
        @media (max-width: 640px) {
          .venue-listing-main { grid-template-columns: 1fr !important; }
        }
        .vh-category-strip::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

export default VenueListingPage
