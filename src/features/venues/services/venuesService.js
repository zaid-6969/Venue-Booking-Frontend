/**
 * Venues Service — API Layer
 */
import apiClient from '@lib/apiClient';

const BASE = '/venues';

const venuesService = {
  getAll:     (params) => apiClient.get(BASE, { params }),
  getById:    (id)     => apiClient.get(`${BASE}/${id}`),
  getBySlug:  (slug)   => apiClient.get(`${BASE}/slug/${slug}`),
  getFeatured: ()      => apiClient.get(`${BASE}/featured`),
  getByOwner: ()       => apiClient.get(`${BASE}/my-venues`),
  create:     (data)   => apiClient.post(BASE, data),
  update:     (id, data) => apiClient.put(`${BASE}/${id}`, data),
  delete:     (id)     => apiClient.delete(`${BASE}/${id}`),
  search:     (params) => apiClient.get(`${BASE}/search`, { params }),
  getAvailability: (id, params) => apiClient.get(`${BASE}/${id}/availability`, { params }),
  checkAvailability: (id, data) => apiClient.post(`${BASE}/${id}/check-availability`, data),
  getSimilar: (id)     => apiClient.get(`${BASE}/${id}/similar`),
  getCities:  ()       => apiClient.get(`${BASE}/cities`),
  duplicate:  (id)     => apiClient.post(`${BASE}/${id}/duplicate`),
  updateAvailability: (id, availability) => apiClient.post(`${BASE}/${id}/availability`, { availability }),
  updateStatus: (id, status) => apiClient.patch(`${BASE}/${id}/status`, { status }),
};

export default venuesService;
