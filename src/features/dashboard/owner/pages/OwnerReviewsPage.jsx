/**
 * OwnerReviewsPage Component
 *
 * Customer Feedback & Rating Reviews for Owner Venue Listings
 */

import { useState } from 'react';
import { Star, MessageSquare, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@features/auth/redux/authSlice';

const OwnerReviewsPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 40 }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)' }}>Guest Reviews & Ratings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Feedback and star ratings posted by event organizers for your venue listings
        </p>
      </div>

      <div className="card" style={{ padding: '64px 24px', textAlign: 'center', background: 'var(--surface-1)', borderRadius: 24 }}>
        <MessageSquare size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px auto' }} />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>No Guest Reviews Submitted Yet</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4, maxWidth: 400, marginInline: 'auto' }}>
          Guest ratings and reviews from completed events will appear here automatically.
        </p>
      </div>
    </div>
  );
};

export default OwnerReviewsPage;
