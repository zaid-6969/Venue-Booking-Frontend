/**
 * Auth Slice — Authentication State
 *
 * State shape:
 * {
 *   user: null | UserObject,
 *   isAuthenticated: boolean,
 *   role: 'guest' | 'customer' | 'owner' | 'admin',
 *   status: 'idle' | 'loading' | 'succeeded' | 'failed',
 *   error: null | ErrorObject,
 *   isInitialized: boolean, // true after initial /me check
 * }
 */

import { createSlice } from '@reduxjs/toolkit';
import {
  loginUser,
  registerUser,
  fetchCurrentUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  changePassword,
} from './authThunks';
import { createVenue } from '@features/venues/redux/venuesThunks';
import { ROLES } from '@constants/index';

const initialState = {
  user:            null,
  isAuthenticated: false,
  role:            ROLES.GUEST,
  status:          'idle',
  error:           null,
  isInitialized:   false, // guards route rendering until auth is checked
  forgotStatus:    'idle',
  resetStatus:     'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // For manual state injection (e.g., after Google OAuth)
    setCredentials: (state, action) => {
      const { user } = action.payload;
      state.user            = user;
      state.isAuthenticated = true;
      state.role            = user.role;
      state.isInitialized   = true;
    },
    resetAuth: () => ({
      ...initialState,
      isInitialized: true,
    }),
    clearAuthError: (state) => {
      state.error = null;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },

  extraReducers: (builder) => {
    // ── Login ──
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error  = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status          = 'succeeded';
        state.user            = action.payload.user;
        state.isAuthenticated = true;
        state.role            = action.payload.user.role;
        state.isInitialized   = true;
        state.error           = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = action.payload;
      });

    // ── Register ──
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error  = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status          = 'succeeded';
        state.user            = action.payload.user;
        state.isAuthenticated = true;
        state.role            = action.payload.user.role;
        state.isInitialized   = true;
        state.error           = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = action.payload;
      });

    // ── Fetch Current User (app init) ──
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status          = 'succeeded';
        state.user            = action.payload.user;
        state.isAuthenticated = true;
        state.role            = action.payload.user.role;
        state.isInitialized   = true;
        state.error           = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status          = 'failed';
        state.user            = null;
        state.isAuthenticated = false;
        state.role            = ROLES.GUEST;
        state.isInitialized   = true; // Important: still mark initialized even on failure
      });

    // ── Logout ──
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user            = null;
      state.isAuthenticated = false;
      state.role            = ROLES.GUEST;
      state.status          = 'idle';
      state.error           = null;
    });

    // ── Forgot Password ──
    builder
      .addCase(forgotPassword.pending,   (state) => { state.forgotStatus = 'loading'; })
      .addCase(forgotPassword.fulfilled, (state) => { state.forgotStatus = 'succeeded'; })
      .addCase(forgotPassword.rejected,  (state, action) => {
        state.forgotStatus = 'failed';
        state.error = action.payload;
      });

    // ── Reset Password ──
    builder
      .addCase(resetPassword.pending,   (state) => { state.resetStatus = 'loading'; })
      .addCase(resetPassword.fulfilled, (state) => { state.resetStatus = 'succeeded'; })
      .addCase(resetPassword.rejected,  (state, action) => {
        state.resetStatus = 'failed';
        state.error = action.payload;
      });

    // ── Change Password ──
    builder
      .addCase(changePassword.pending,   (state) => { state.status = 'loading'; })
      .addCase(changePassword.fulfilled, (state) => { state.status = 'succeeded'; })
      .addCase(changePassword.rejected,  (state, action) => {
        state.status = 'failed';
        state.error  = action.payload;
      });

    // ── Venue Created — Upgrade Role to Owner ──
    builder.addCase(createVenue.fulfilled, (state) => {
      state.role = ROLES.OWNER;
      if (state.user) {
        state.user.role = ROLES.OWNER;
      }
    });
  },
});

export const {
  setCredentials,
  resetAuth,
  clearAuthError,
  setInitialized,
  updateUserProfile,
} = authSlice.actions;

// ─── Selectors ──────────────────────────────────────────────────────────────
export const selectCurrentUser     = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole        = (state) => state.auth.role;
export const selectAuthStatus      = (state) => state.auth.status;
export const selectAuthError       = (state) => state.auth.error;
export const selectIsAuthLoading   = (state) => state.auth.status === 'loading';
export const selectIsInitialized   = (state) => state.auth.isInitialized;
export const selectForgotStatus    = (state) => state.auth.forgotStatus;
export const selectResetStatus     = (state) => state.auth.resetStatus;

// Role guards
export const selectIsAdmin    = (state) => state.auth.role === 'admin';
export const selectIsOwner    = (state) => state.auth.role === 'owner';
export const selectIsCustomer = (state) => state.auth.role === 'customer';

export default authSlice.reducer;
