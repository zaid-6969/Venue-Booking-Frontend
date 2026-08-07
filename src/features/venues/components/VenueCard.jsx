/**
 * VenueCard Component
 *
 * Displays a single venue with image carousel/badge, key details, capacity, price,
 * rating, wishlist button, and compare toggle.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Star, Users, MapPin, GitCompare, Check, Building2, Eye } from 'lucide-react';
import { toggleLocalWishlist, selectWishlistItems, addToWishlist, removeFromWishlist } from '@features/wishlist/redux/wishlistSlice';
import { addToCompare, removeFromCompare, selectIsInCompare, selectCanAddToCompare } from '@features/compare/redux/compareSlice';
import { selectIsAuthenticated } from '@features/auth/redux/authSlice';
import { ImagePresets } from '@lib/imagekit';

const VenueCard = ({ venue, compact = false, onQuickView = null }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const wishlistItems = useSelector(selectWishlistItems);
  const isInCompare = useSelector(selectIsInCompare(venue._id));
  const canAddToCompare = useSelector(selectCanAddToCompare);

  const isWishlisted = wishlistItems.includes(venue._id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      if (isWishlisted) {
        dispatch(removeFromWishlist(venue._id));
      } else {
        dispatch(addToWishlist(venue._id));
      }
    } else {
      dispatch(toggleLocalWishlist(venue._id));
    }
  };

  const handleCompareToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCompare) {
      dispatch(removeFromCompare(venue._id));
    } else {
      if (canAddToCompare) {
        dispatch(addToCompare(venue));
      }
    }
  };

  const coverUrl = venue.coverImage?.url
    ? ImagePresets.venueCard(venue.coverImage.url)
    : '/placeholder-venue.jpg';

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(venue.pricePerDay || 0);

  return (
    <div
      className="card hover-lift"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        background: 'var(--surface-1)',
        borderRadius: 'var(--radius-2xl)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
      }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', width: '100%', height: compact ? 180 : 220, overflow: 'hidden', background: 'var(--bg-subtle)' }}>
        <img
          src={coverUrl}
          alt={venue.name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          className="venue-card-img"
        />

        {/* Featured Badge */}
        {venue.isFeatured && (
          <span
            className="badge badge-primary"
            style={{
              position: 'absolute',
              top: 'var(--space-3)',
              left: 'var(--space-3)',
              boxShadow: 'var(--shadow-sm)',
              backdropFilter: 'blur(8px)',
            }}
          >
            Featured
          </span>
        )}

        {/* Category Badge */}
        <span
          style={{
            position: 'absolute',
            bottom: 'var(--space-3)',
            left: 'var(--space-3)',
            background: 'rgba(0, 0, 0, 0.65)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            backdropFilter: 'blur(4px)',
            textTransform: 'capitalize',
          }}
        >
          {venue.category ? venue.category.replace('-', ' ') : 'Venue'}
        </span>

        {/* Actions Overlay: Quick View, Compare & Wishlist */}
        <div style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
          {/* Quick View Button */}
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(venue);
              }}
              title="Quick Preview"
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.85)',
                color: 'var(--text-primary)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Eye size={16} />
            </button>
          )}

          {/* Compare Button */}
          <button
            onClick={handleCompareToggle}
            title={isInCompare ? 'Remove from Compare' : 'Add to Compare'}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: isInCompare ? 'var(--brand-default)' : 'rgba(255, 255, 255, 0.85)',
              color: isInCompare ? '#fff' : 'var(--text-primary)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)',
            }}
          >
            {isInCompare ? <Check size={16} /> : <GitCompare size={16} />}
          </button>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.85)',
              color: isWishlisted ? 'var(--color-error-500)' : 'var(--text-primary)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* City & Rating */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', fontWeight: 500, textTransform: 'capitalize' }}>
            <MapPin size={14} style={{ color: 'var(--brand-default)' }} />
            <span>{venue.location?.city || 'Location N/A'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--color-warning-50)', color: 'var(--color-warning-700)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
            <Star size={12} fill="currentColor" />
            <span>{venue.rating?.average || '4.5'}</span>
            <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>({venue.rating?.count || 0})</span>
          </div>
        </div>

        {/* Title */}
        <Link
          to={`/venues/${venue.slug || venue._id}`}
          style={{
            fontSize: compact ? 'var(--text-base)' : 'var(--text-lg)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            textDecoration: 'none',
            lineHeight: 1.3,
            marginBottom: 'var(--space-2)',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {venue.name}
        </Link>

        {/* Tagline or Description */}
        <p style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-4)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.5,
          flex: 1,
        }}>
          {venue.tagline || venue.description}
        </p>

        {/* Capacity & Price */}
        <div style={{
          paddingTop: 'var(--space-3)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
            <Users size={14} />
            <span>{venue.minCapacity || 50} - {venue.maxCapacity || 500} guests</span>
          </div>

          <div>
            <span style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--brand-default)', fontFamily: 'var(--font-display)' }}>
              {formattedPrice}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginLeft: 2 }}>/day</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
