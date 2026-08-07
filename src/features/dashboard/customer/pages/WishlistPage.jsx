/**
 * WishlistPage Component
 *
 * Displays saved venues grid with quick remove action
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Building2 } from 'lucide-react';
import { fetchWishlist, selectWishlistVenues, selectWishlistItems, removeFromWishlist } from '@features/wishlist/redux/wishlistSlice';
import VenueCard from '@features/venues/components/VenueCard';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const wishlistVenues = useSelector(selectWishlistVenues);
  const wishlistItems  = useSelector(selectWishlistItems);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Saved Venues</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          {wishlistItems.length} venue{wishlistItems.length === 1 ? '' : 's'} saved to your wishlist
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <Heart size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--space-4) auto' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Your Wishlist is Empty</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            Explore our curated list of banquet halls and save your favorite event spaces here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          {wishlistVenues.map(venue => (
            <VenueCard key={venue._id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
