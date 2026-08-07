/**
 * Redux Store — Root Configuration
 *
 * Architecture:
 * - Feature-based slice organization
 * - Middleware: thunk (default) + custom logger in dev
 * - Serializable check disabled for specific paths (dates, etc.)
 *
 * Scalability:
 * - Each feature owns its slice — no cross-feature slice dependencies
 * - Selectors are co-located with slices
 * - Async logic lives in thunks, not reducers
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';

// Feature Slices
import authReducer          from '@features/auth/redux/authSlice';
import venuesReducer        from '@features/venues/redux/venuesSlice';
import bookingsReducer      from '@features/bookings/redux/bookingsSlice';
import reviewsReducer       from '@features/reviews/redux/reviewsSlice';
import paymentsReducer      from '@features/payments/redux/paymentsSlice';
import notificationsReducer from '@features/notifications/redux/notificationsSlice';
import wishlistReducer      from '@features/wishlist/redux/wishlistSlice';
import compareReducer       from '@features/compare/redux/compareSlice';
import uiReducer            from './slices/uiSlice';

// ─── Dev Middleware ─────────────────────────────────────────────────────────
const isDevelopment = import.meta.env.DEV;

const combinedReducer = combineReducers({
  auth:          authReducer,
  venues:        venuesReducer,
  bookings:      bookingsReducer,
  reviews:       reviewsReducer,
  payments:      paymentsReducer,
  notifications: notificationsReducer,
  wishlist:      wishlistReducer,
  compare:       compareReducer,
  ui:            uiReducer,
});

// Root Reducer with state reset on logout
const rootReducer = (state, action) => {
  if (action.type === 'auth/logoutUser/fulfilled' || action.type === 'auth/resetAuth') {
    const currentTheme = state?.ui?.theme;
    state = undefined;
    if (currentTheme) {
      state = { ui: { theme: currentTheme } };
    }
  }
  return combinedReducer(state, action);
};

// ─── Store ──────────────────────────────────────────────────────────────────
const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: [
          'auth/setCredentials',
          'bookings/setSelectedDate',
        ],
        // Ignore these field paths in state
        ignoredPaths: [
          'bookings.selectedDate',
          'ui.modals',
        ],
      },
    }),

  devTools: isDevelopment,
});

export default store;
