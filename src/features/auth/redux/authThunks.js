/**
 * Auth Thunks — Async Actions for Authentication
 *
 * Pattern:
 * - createAsyncThunk wraps async logic
 * - Service calls are isolated in authService
 * - Token management on success/failure
 * - Thunks are imported by components via dispatch
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/authService';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@constants/index';

// ─── Login ──────────────────────────────────────────────────────────────────
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      const data = response.data || response;
      if (data.accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      }
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ─── Register ───────────────────────────────────────────────────────────────
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      const data = response.data || response;
      if (data.accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      }
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ─── Get Current User ────────────────────────────────────────────────────────
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ─── Logout ─────────────────────────────────────────────────────────────────
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors — clear local state regardless
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem('venuehub_user');
      localStorage.removeItem('venuehub_role');
      sessionStorage.clear();
    }
  }
);

// ─── Forgot Password ─────────────────────────────────────────────────────────
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ─── Reset Password ──────────────────────────────────────────────────────────
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      return await authService.resetPassword(token, password);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ─── Change Password ─────────────────────────────────────────────────────────
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data, { rejectWithValue }) => {
    try {
      return await authService.changePassword(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
