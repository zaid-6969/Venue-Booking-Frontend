/**
 * Axios HTTP Client — Configured API Layer
 *
 * Responsibilities:
 * - Base URL configuration
 * - Request/Response interceptors
 * - JWT token injection
 * - Token refresh on 401
 * - Error normalization
 * - Request cancellation support
 *
 * Architecture Note:
 *   Components → Feature Service → This client → Backend API
 *   Never import axios directly in components or thunks.
 */

import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@constants/index';

// ─── Create Instance ────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Send cookies (httpOnly JWT) if using cookie-based auth
  // Serialize arrays as repeated params: amenities=wifi&amenities=ac
  // so Express/qs correctly parses them as arrays
  paramsSerializer: (params) => {
    const parts = [];
    Object.entries(params).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '') return;
      if (Array.isArray(val)) {
        val.forEach(v => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`));
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
      }
    });
    return parts.join('&');
  },
});

// ─── Token Helpers ──────────────────────────────────────────────────────────
const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
const setAccessToken = (token) => localStorage.setItem(ACCESS_TOKEN_KEY, token);
const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// ─── Track ongoing refresh ──────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// ─── Request Interceptor ────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(normalizeError(error))
);

// ─── Response Interceptor ───────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response.data, // Unwrap data from axios response wrapper
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 — Attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        clearTokens();
        // Dispatch logout event — caught by auth slice
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(normalizeError(error));
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const newToken = data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(normalizeError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

// ─── Error Normalizer ───────────────────────────────────────────────────────
/**
 * Normalizes all API errors into a consistent shape:
 * { message, statusCode, errors, isNetworkError }
 */
const normalizeError = (error) => {
  if (error.response) {
    // Server responded with an error status
    const { data, status } = error.response;
    return {
      message: data?.message || data?.error || 'An error occurred',
      statusCode: status,
      errors: data?.errors || null,
      isNetworkError: false,
    };
  }

  if (error.request) {
    // Request made but no response
    return {
      message: 'Network error. Please check your internet connection.',
      statusCode: 0,
      errors: null,
      isNetworkError: true,
    };
  }

  // Request setup error
  return {
    message: error.message || 'An unexpected error occurred',
    statusCode: 0,
    errors: null,
    isNetworkError: false,
  };
};

// ─── Multipart Client (for file uploads) ───────────────────────────────────
export const createMultipartClient = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // Longer timeout for uploads
    withCredentials: true,
  });

  instance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'multipart/form-data';
    return config;
  });

  instance.interceptors.response.use(
    (res) => res.data,
    (error) => Promise.reject(normalizeError(error))
  );

  return instance;
};

export default apiClient;
