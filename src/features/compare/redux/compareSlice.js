/**
 * Compare Slice — Venue Comparison
 * Max 3 venues can be compared at once
 */
import { createSlice } from '@reduxjs/toolkit';
const COMPARE_STORAGE_KEY = 'venuehub_compare';

const loadCompareFromStorage = () => {
  try {
    const saved = localStorage.getItem(COMPARE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCompareToStorage = (venues) => {
  try {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(venues));
  } catch {}
};

const MAX_COMPARE_LIMIT = 4;

const compareSlice = createSlice({
  name: 'compare',
  initialState: {
    venues: loadCompareFromStorage(), // Array of venue objects (max 4)
  },
  reducers: {
    addToCompare: (state, action) => {
      const venue = action.payload;
      const exists = state.venues.some(v => v._id === venue._id);
      if (!exists && state.venues.length < MAX_COMPARE_LIMIT) {
        state.venues.push(venue);
        saveCompareToStorage(state.venues);
      }
    },
    removeFromCompare: (state, action) => {
      state.venues = state.venues.filter(v => v._id !== action.payload);
      saveCompareToStorage(state.venues);
    },
    clearCompare: (state) => {
      state.venues = [];
      localStorage.removeItem(COMPARE_STORAGE_KEY);
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions;

export const selectCompareVenues    = (s) => s.compare.venues;
export const selectCompareCount     = (s) => s.compare.venues.length;
export const selectCanAddToCompare  = (s) => s.compare.venues.length < MAX_COMPARE_LIMIT;
export const selectIsInCompare      = (id) => (s) => s.compare.venues.some(v => v._id === id);

export default compareSlice.reducer;
