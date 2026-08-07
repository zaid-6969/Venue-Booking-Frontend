/**
 * Auth Service — API Layer for Authentication
 * Only this file makes HTTP calls related to auth.
 * Thunks import this; components never call this directly.
 */
import apiClient from '@lib/apiClient';

const AUTH_ENDPOINTS = {
  LOGIN:         '/auth/login',
  REGISTER:      '/auth/register',
  LOGOUT:        '/auth/logout',
  ME:            '/auth/me',
  REFRESH:       '/auth/refresh-token',
  FORGOT_PW:     '/auth/forgot-password',
  RESET_PW:      '/auth/reset-password',
  VERIFY_EMAIL:  '/auth/verify-email',
  CHANGE_PW:     '/auth/change-password',
  GOOGLE:        '/auth/google',
};

const authService = {
  login: (credentials) =>
    apiClient.post(AUTH_ENDPOINTS.LOGIN, credentials),

  register: (userData) =>
    apiClient.post(AUTH_ENDPOINTS.REGISTER, userData),

  logout: () =>
    apiClient.post(AUTH_ENDPOINTS.LOGOUT),

  getMe: () =>
    apiClient.get(AUTH_ENDPOINTS.ME),

  forgotPassword: (email) =>
    apiClient.post(AUTH_ENDPOINTS.FORGOT_PW, { email }),

  resetPassword: (token, password) =>
    apiClient.post(AUTH_ENDPOINTS.RESET_PW, { token, password }),

  verifyEmail: (token) =>
    apiClient.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { token }),

  changePassword: (data) =>
    apiClient.post(AUTH_ENDPOINTS.CHANGE_PW, data),
};

export default authService;
