/**
 * Wishlist Slice
 * Persists to localStorage for guest users; syncs with backend for authenticated users
 */
import apiClient from '@lib/apiClient';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { WISHLIST_STORAGE_KEY } from '@constants/index';

const BASE = '/wishlist';

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const saveToStorage = (items) => {
  try { localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items)); }
  catch {}
};

export const wishlistService = {
  getAll:  ()   => apiClient.get(BASE),
  add:     (id) => apiClient.post(BASE, { venueId: id }),
  remove:  (id) => apiClient.delete(`${BASE}/${id}`),
};

export const fetchWishlist = createAsyncThunk('wishlist/fetchAll',
  async (_, { rejectWithValue }) => {
    try { return await wishlistService.getAll(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const addToWishlist = createAsyncThunk('wishlist/add',
  async (venueId, { rejectWithValue }) => {
    try { return await wishlistService.add(venueId); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const removeFromWishlist = createAsyncThunk('wishlist/remove',
  async (venueId, { rejectWithValue }) => {
    try { await wishlistService.remove(venueId); return venueId; }
    catch (err) { return rejectWithValue(err); }
  }
);

export const syncWishlist = createAsyncThunk('wishlist/sync',
  async (venueIds, { rejectWithValue }) => {
    try { return await wishlistService.sync(venueIds); }
    catch (err) { return rejectWithValue(err); }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items:  loadFromStorage(), // venue IDs for guest, full venue objects for auth user
    venues: [],
    status: 'idle',
  },
  reducers: {
    // Optimistic toggle for guest users (local only)
    toggleLocalWishlist: (state, action) => {
      const id = action.payload;
      const exists = state.items.includes(id);
      if (exists) {
        state.items = state.items.filter(i => i !== id);
      } else {
        state.items.push(id);
      }
      saveToStorage(state.items);
    },
    clearWishlist: (state) => {
      state.items  = [];
      state.venues = [];
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWishlist.fulfilled, (s, { payload }) => {
      const data = payload?.data || payload || {};
      const venues = Array.isArray(data.venues) ? data.venues : [];
      s.status = 'succeeded';
      s.venues = venues;
      s.items  = venues.map(v => v._id || v);
    });

    builder.addCase(addToWishlist.fulfilled, (s, { payload }) => {
      const data = payload?.data || payload || {};
      const venues = Array.isArray(data.venues) ? data.venues : [];
      s.venues = venues;
      s.items  = venues.map(v => v._id || v);
    });

    builder.addCase(removeFromWishlist.fulfilled, (s, { payload }) => {
      const id = typeof payload === 'string' ? payload : payload?.venueId;
      if (id) {
        s.items  = s.items.filter(i => i !== id);
        s.venues = s.venues.filter(v => v._id !== id);
      }
    });
  },
});

export const { toggleLocalWishlist, clearWishlist } = wishlistSlice.actions;

export const selectWishlistItems  = (s) => s.wishlist.items;
export const selectWishlistVenues = (s) => s.wishlist.venues;
export const selectIsWishlisted   = (venueId) => (s) => s.wishlist.items.includes(venueId);

export default wishlistSlice.reducer;
