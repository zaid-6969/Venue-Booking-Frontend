/**
 * AdminReviewsPage Component
 *
 * Customer reviews moderation dashboard for Administrators
 */

import { useState } from 'react';
import { Star, Trash2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_REVIEWS = [
  { _id: 'r-1', author: 'Ananya Sharma', venue: 'The Grand Majestic Banquet', rating: 5, comment: 'Found our dream wedding venue in less than 15 minutes! Virtual tour was super accurate.', date: '2026-07-28' },
  { _id: 'r-2', author: 'Vikram Malhotra', venue: 'Royal Heritage Palace', rating: 5, comment: 'Booked corporate convention center for 500+ attendees. Smooth coordination.', date: '2026-08-01' },
];

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState(DEMO_REVIEWS);

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this review?')) {
      setReviews(prev => prev.filter(r => r._id !== id));
      toast.success('Review removed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Reviews Moderation</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Monitor customer reviews and remove inappropriate content
        </p>
      </div>

      <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {reviews.map(rev => (
            <div key={rev._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 'var(--space-4)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ display: 'flex', gap: 4, color: 'var(--color-warning-500)', marginBottom: 4 }}>
                  {[...Array(rev.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>{rev.venue}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>"{rev.comment}"</p>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 6 }}>By {rev.author} • {rev.date}</div>
              </div>

              <button onClick={() => handleDelete(rev._id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-error-500)' }}>
                <Trash2 size={14} /> Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReviewsPage;
