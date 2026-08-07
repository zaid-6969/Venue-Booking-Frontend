/**
 * Reviews Slice + Thunks + Service
 */
import apiClient from '@lib/apiClient';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const BASE = '/reviews';

export const reviewsService = {
  create:     (data)   => apiClient.post(BASE, data),
  getForVenue:(venueId, params) => apiClient.get(`${BASE}/venue/${venueId}`, { params }),
  getMyReviews: ()     => apiClient.get(`${BASE}/my-reviews`),
  update:     (id, data) => apiClient.put(`${BASE}/${id}`, data),
  delete:     (id)     => apiClient.delete(`${BASE}/${id}`),
  reply:      (id, reply) => apiClient.post(`${BASE}/${id}/reply`, { reply }),
};

export const createReview = createAsyncThunk('reviews/create',
  async (data, { rejectWithValue }) => {
    try { return await reviewsService.create(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchVenueReviews = createAsyncThunk('reviews/fetchForVenue',
  async ({ venueId, params }, { rejectWithValue }) => {
    try { return await reviewsService.getForVenue(venueId, params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchMyReviews = createAsyncThunk('reviews/fetchMy',
  async (_, { rejectWithValue }) => {
    try { return await reviewsService.getMyReviews(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateReview = createAsyncThunk('reviews/update',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await reviewsService.update(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteReview = createAsyncThunk('reviews/delete',
  async (id, { rejectWithValue }) => {
    try { await reviewsService.delete(id); return id; }
    catch (err) { return rejectWithValue(err); }
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    venueReviews: [],
    myReviews: [],
    totalReviews: 0,
    averageRating: 0,
    status: 'idle',
    createStatus: 'idle',
    error: null,
  },
  reducers: {
    clearCreateStatus: (s) => { s.createStatus = 'idle'; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVenueReviews.pending,   (s) => { s.status = 'loading'; })
      .addCase(fetchVenueReviews.fulfilled, (s, { payload }) => {
        const data = payload?.data || payload || {};
        s.status        = 'succeeded';
        s.venueReviews  = Array.isArray(data) ? data : Array.isArray(data.reviews) ? data.reviews : [];
        s.totalReviews  = payload?.meta?.total ?? data.total ?? s.venueReviews.length;
        s.averageRating = data.averageRating || 0;
      })
      .addCase(fetchVenueReviews.rejected,  (s) => { s.status = 'failed'; });

    builder
      .addCase(fetchMyReviews.fulfilled, (s, { payload }) => {
        const data = payload?.data || payload || {};
        s.myReviews = Array.isArray(data) ? data : Array.isArray(data.reviews) ? data.reviews : [];
      });

    builder
      .addCase(createReview.pending,   (s) => { s.createStatus = 'loading'; })
      .addCase(createReview.fulfilled, (s, { payload }) => {
        const data = payload?.data || payload || {};
        const review = data.review || data;
        s.createStatus = 'succeeded';
        if (review && review._id) {
          s.venueReviews.unshift(review);
        }
      })
      .addCase(createReview.rejected,  (s) => { s.createStatus = 'failed'; });

    builder
      .addCase(deleteReview.fulfilled, (s, { payload: id }) => {
        s.venueReviews = s.venueReviews.filter(r => r._id !== id);
        s.myReviews    = s.myReviews.filter(r => r._id !== id);
      });
  },
});

export const { clearCreateStatus } = reviewsSlice.actions;

export const selectVenueReviews  = (s) => Array.isArray(s.reviews?.venueReviews) ? s.reviews.venueReviews : [];
export const selectMyReviews     = (s) => Array.isArray(s.reviews?.myReviews) ? s.reviews.myReviews : [];
export const selectTotalReviews  = (s) => s.reviews.totalReviews;
export const selectAverageRating = (s) => s.reviews.averageRating;
export const selectReviewStatus  = (s) => s.reviews.status;
export const selectCreateReviewStatus = (s) => s.reviews.createStatus;

export default reviewsSlice.reducer;
