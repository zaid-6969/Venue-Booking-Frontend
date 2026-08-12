/**
 * Admin Service — API Layer for Super Admin Dashboard & Management
 */

import apiClient from '@lib/apiClient';

const BASE = '/admin';

const adminService = {
  // Stats & Analytics
  getStats:          ()               => apiClient.get(`${BASE}/stats`),
  getAnalytics:      (params)         => apiClient.get(`${BASE}/analytics`, { params }),

  // Venues Management
  getVenues:         (params)         => apiClient.get(`${BASE}/venues`, { params }),
  getVenueDetails:   (id)             => apiClient.get(`${BASE}/venues/${id}`),
  getVenueBookings:  (id, params)     => apiClient.get(`${BASE}/venues/${id}/bookings`, { params }),
  rejectVenue:       (id, reason)     => apiClient.post(`${BASE}/venues/${id}/reject`, { reason }),
  restoreVenue:      (id)             => apiClient.post(`${BASE}/venues/${id}/restore`),

  // Owners Management
  getOwners:         (params)         => apiClient.get(`${BASE}/owners`, { params }),
  getOwnerDetails:   (id)             => apiClient.get(`${BASE}/owners/${id}`),
  rejectOwner:       (id, reason)     => apiClient.post(`${BASE}/owners/${id}/reject`, { reason }),
  restoreOwner:      (id)             => apiClient.post(`${BASE}/owners/${id}/restore`),

  // Moderation Queues
  getRejectedVenues: (params)         => apiClient.get(`${BASE}/rejected-venues`, { params }),
  getRejectedOwners: (params)         => apiClient.get(`${BASE}/rejected-owners`, { params }),

  // Master Bookings
  getAllBookings:    (params)         => apiClient.get(`${BASE}/bookings`, { params }),

  // User Accounts
  getUsers:          (params)         => apiClient.get(`${BASE}/users`, { params }),
  toggleUserStatus:  (id, status)     => apiClient.patch(`${BASE}/users/${id}/status`, { status }),
};

export default adminService;
