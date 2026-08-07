/**
 * Venues Slice
 */
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchVenues, fetchVenueById, fetchVenueBySlug,
  fetchFeaturedVenues, fetchMyVenues,
  createVenue, updateVenue, deleteVenue,
  searchVenues, fetchVenueAvailability, updateVenueStatus,
  duplicateVenue, updateVenueAvailability,
} from './venuesThunks';

const initialState = {
  // Listing
  venues:          [],
  totalVenues:     0,
  totalPages:      0,
  currentPage:     1,
  listStatus:      'idle',
  listError:       null,

  // Single venue detail
  selectedVenue:   null,
  detailStatus:    'idle',
  detailError:     null,

  // Featured venues (home page)
  featuredVenues:  [],
  featuredStatus:  'idle',

  // Owner's venues
  myVenues:        [],
  myVenuesStatus:  'idle',

  // Availability
  availability:    [],
  availabilityStatus: 'idle',

  // Search
  searchResults:   [],
  searchStatus:    'idle',

  // Filters applied
  appliedFilters: {
    city:       '',
    category:   '',
    minPrice:   '',
    maxPrice:   '',
    capacity:   '',
    amenities:  [],
    rating:     '',
    sortBy:     'relevance',
  },

  // Mutation state
  mutateStatus: 'idle',
  mutateError:  null,
};

const venuesSlice = createSlice({
  name: 'venues',
  initialState,
  reducers: {
    setAppliedFilters: (state, action) => {
      state.appliedFilters = { ...state.appliedFilters, ...action.payload };
    },
    resetFilters: (state) => {
      state.appliedFilters = initialState.appliedFilters;
    },
    clearSelectedVenue: (state) => {
      state.selectedVenue = null;
      state.detailStatus  = 'idle';
      state.detailError   = null;
    },
    clearMutateState: (state) => {
      state.mutateStatus = 'idle';
      state.mutateError  = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },

  extraReducers: (builder) => {
    // ── Fetch Venues List ──
    builder
      .addCase(fetchVenues.pending,   (s) => { s.listStatus = 'loading'; s.listError = null; })
      .addCase(fetchVenues.fulfilled, (s, { payload }) => {
        s.listStatus = 'succeeded';

        // Extract venues array from sendPaginated structure (payload.data is array)
        if (Array.isArray(payload?.data)) {
          s.venues = payload.data;
        } else if (Array.isArray(payload?.data?.venues)) {
          s.venues = payload.data.venues;
        } else if (Array.isArray(payload?.venues)) {
          s.venues = payload.venues;
        } else {
          s.venues = [];
        }

        s.totalVenues = payload?.meta?.total ?? payload?.data?.total ?? payload?.total ?? s.venues.length;
        s.totalPages  = payload?.meta?.totalPages ?? payload?.data?.totalPages ?? payload?.totalPages ?? 1;
        s.currentPage = payload?.meta?.page ?? payload?.data?.currentPage ?? payload?.currentPage ?? 1;
      })
      .addCase(fetchVenues.rejected,  (s, { payload }) => { s.listStatus = 'failed'; s.listError = payload; });

    // ── Fetch By ID ──
    builder
      .addCase(fetchVenueById.pending,   (s) => { s.detailStatus = 'loading'; s.detailError = null; })
      .addCase(fetchVenueById.fulfilled, (s, { payload }) => {
        const data = payload?.data || payload || {};
        s.detailStatus  = 'succeeded';
        s.selectedVenue = data.venue || data;
      })
      .addCase(fetchVenueById.rejected,  (s, { payload }) => { s.detailStatus = 'failed'; s.detailError = payload; });

    // ── Fetch By Slug ──
    builder
      .addCase(fetchVenueBySlug.pending,   (s) => { s.detailStatus = 'loading'; })
      .addCase(fetchVenueBySlug.fulfilled, (s, { payload }) => {
        const data = payload?.data || payload || {};
        s.detailStatus  = 'succeeded';
        s.selectedVenue = data.venue || data;
      })
      .addCase(fetchVenueBySlug.rejected,  (s, { payload }) => { s.detailStatus = 'failed'; s.detailError = payload; });

    // ── Featured Venues ──
    builder
      .addCase(fetchFeaturedVenues.pending,   (s) => { s.featuredStatus = 'loading'; })
      .addCase(fetchFeaturedVenues.fulfilled, (s, { payload }) => {
        const data = payload?.data || payload || {};
        s.featuredStatus = 'succeeded';
        s.featuredVenues = Array.isArray(data.venues) ? data.venues : Array.isArray(data) ? data : [];
      })
      .addCase(fetchFeaturedVenues.rejected,  (s) => { s.featuredStatus = 'failed'; });

    // ── My Venues ──
    builder
      .addCase(fetchMyVenues.pending,   (s) => { s.myVenuesStatus = 'loading'; })
      .addCase(fetchMyVenues.fulfilled, (s, { payload }) => {
        const data = payload?.data || payload || {};
        s.myVenuesStatus = 'succeeded';
        s.myVenues       = Array.isArray(data.venues) ? data.venues : Array.isArray(data) ? data : [];
      })
      .addCase(fetchMyVenues.rejected,  (s) => { s.myVenuesStatus = 'failed'; });

    // ── Create & Duplicate ──
    builder
      .addCase(createVenue.pending,   (s) => { s.mutateStatus = 'loading'; s.mutateError = null; })
      .addCase(createVenue.fulfilled, (s, { payload }) => {
        const data = payload?.data || payload || {};
        const newVenue = data.venue || data;
        s.mutateStatus = 'succeeded';
        if (newVenue && newVenue._id) s.myVenues.unshift(newVenue);
      })
      .addCase(createVenue.rejected,  (s, { payload }) => { s.mutateStatus = 'failed'; s.mutateError = payload; });

    builder.addCase(duplicateVenue.fulfilled, (s, { payload }) => {
      const data = payload?.data || payload || {};
      const newVenue = data.venue || data;
      if (newVenue && newVenue._id) s.myVenues.unshift(newVenue);
    });

    builder.addCase(updateVenueAvailability.fulfilled, (s, { payload }) => {
      const data = payload?.data || payload || {};
      const venue = data.venue || data;
      const index = s.myVenues.findIndex(v => v._id === venue._id);
      if (index !== -1) s.myVenues[index] = venue;
      if (s.selectedVenue?._id === venue._id) s.selectedVenue = venue;
    });

    // ── Update ──
    builder
      .addCase(updateVenue.pending,   (s) => { s.mutateStatus = 'loading'; })
      .addCase(updateVenue.fulfilled, (s, { payload }) => {
        const data = payload?.data || payload || {};
        const updatedVenue = data.venue || data;
        s.mutateStatus = 'succeeded';
        if (updatedVenue && updatedVenue._id) {
          const idx = s.myVenues.findIndex(v => v._id === updatedVenue._id);
          if (idx !== -1) s.myVenues[idx] = updatedVenue;
          if (s.selectedVenue?._id === updatedVenue._id) s.selectedVenue = updatedVenue;
        }
      })
      .addCase(updateVenue.rejected,  (s, { payload }) => { s.mutateStatus = 'failed'; s.mutateError = payload; });

    // ── Delete ──
    builder
      .addCase(deleteVenue.fulfilled, (s, { payload: id }) => {
        s.myVenues = s.myVenues.filter(v => v._id !== id);
        s.venues   = s.venues.filter(v => v._id !== id);
      });

    // ── Search ──
    builder
      .addCase(searchVenues.pending,   (s) => { s.searchStatus = 'loading'; })
      .addCase(searchVenues.fulfilled, (s, { payload }) => {
        const data = payload?.data || payload || {};
        s.searchStatus  = 'succeeded';
        s.searchResults = Array.isArray(data.venues) ? data.venues : Array.isArray(data) ? data : [];
      })
      .addCase(searchVenues.rejected,  (s) => { s.searchStatus = 'failed'; });

    // ── Availability ──
    builder
      .addCase(fetchVenueAvailability.pending,   (s) => { s.availabilityStatus = 'loading'; })
      .addCase(fetchVenueAvailability.fulfilled, (s, { payload }) => {
        const data = payload?.data || payload || {};
        s.availabilityStatus = 'succeeded';
        s.availability       = data.availability || [];
      })
      .addCase(fetchVenueAvailability.rejected,  (s) => { s.availabilityStatus = 'failed'; });

    // ── Update Status ──
    builder.addCase(updateVenueStatus.fulfilled, (s, { payload }) => {
      const data = payload?.data || payload || {};
      const venue = data.venue || data;
      if (venue && venue._id) {
        const idx = s.venues.findIndex(v => v._id === venue._id);
        if (idx !== -1) s.venues[idx] = venue;
      }
    });
  },
});

export const {
  setAppliedFilters,
  resetFilters,
  clearSelectedVenue,
  clearMutateState,
  setCurrentPage,
} = venuesSlice.actions;

// ─── Selectors ──────────────────────────────────────────────────────────────
export const selectVenues          = (s) => s.venues.venues || [];
export const selectTotalVenues     = (s) => s.venues.totalVenues || 0;
export const selectTotalPages      = (s) => s.venues.totalPages || 0;
export const selectCurrentPage     = (s) => s.venues.currentPage || 1;
export const selectListStatus      = (s) => s.venues.listStatus;
export const selectListError       = (s) => s.venues.listError;
export const selectSelectedVenue   = (s) => s.venues.selectedVenue;
export const selectDetailStatus    = (s) => s.venues.detailStatus;
export const selectDetailError     = (s) => s.venues.detailError;
export const selectFeaturedVenues  = (s) => s.venues.featuredVenues || [];
export const selectFeaturedStatus  = (s) => s.venues.featuredStatus;
export const selectMyVenues        = (s) => s.venues.myVenues || [];
export const selectMyVenuesStatus  = (s) => s.venues.myVenuesStatus;
export const selectSearchResults   = (s) => s.venues.searchResults || [];
export const selectSearchStatus    = (s) => s.venues.searchStatus;
export const selectAvailability    = (s) => s.venues.availability || [];
export const selectAppliedFilters  = (s) => s.venues.appliedFilters;
export const selectMutateStatus    = (s) => s.venues.mutateStatus;

export default venuesSlice.reducer;
