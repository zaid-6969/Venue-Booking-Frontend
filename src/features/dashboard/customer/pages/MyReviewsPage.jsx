/**
 * MyReviewsPage Component
 *
 * List of customer reviews with star rating breakdown
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Trash2, Edit3, MessageSquare } from 'lucide-react';
import { fetchMyReviews, deleteReview, selectMyReviews } from '@features/reviews/redux/reviewsSlice';
import toast from 'react-hot-toast';

const MyReviewsPage = () => {
  const dispatch = useDispatch();
  const reviews = useSelector(selectMyReviews);

  useEffect(() => {
    dispatch(fetchMyReviews());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await dispatch(deleteReview(id)).unwrap();
        toast.success('Review deleted');
      } catch {
        toast.error('Failed to delete review');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>My Reviews</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Feedback and ratings you have shared for visited venues
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <MessageSquare size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--space-4) auto' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>No Reviews Posted</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            After completing a venue booking, you can share your feedback here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {reviews.map((rev) => (
            <div key={rev._id} className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>{rev.venue?.name || 'Venue Review'}</h3>
                  <div style={{ display: 'flex', gap: 2, color: 'var(--color-warning-500)', marginTop: 4 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < rev.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
                <button onClick={() => handleDelete(rev._id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error-500)' }}>
                  <Trash2 size={16} />
                </button>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rev.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviewsPage;
