import api from './api';

/**
 * Fetch all services with optional query filters and pagination
 */
export const getAllServices = async (params = {}) => {
  const response = await api.get('/services', { params });
  return response.data; // { success, services, totalResults, totalPages, currentPage }
};

/**
 * Fetch a single service by ID
 */
export const getServiceById = async (id) => {
  const response = await api.get(`/services/${id}`);
  return response.data; // { success, data: service }
};

/**
 * Fetch services created by the logged-in provider
 */
export const getMyServices = async () => {
  const response = await api.get('/services/my-services');
  return response.data; // { success, count, data: services }
};

/**
 * Create a new service (Provider only)
 */
export const createService = async (serviceData) => {
  const response = await api.post('/services', serviceData);
  return response.data; // { success, message, data: service }
};

/**
 * Update an existing service (Provider only)
 */
export const updateService = async (id, serviceData) => {
  const response = await api.put(`/services/${id}`, serviceData);
  return response.data; // { success, message, data: service }
};

/**
 * Delete a service (Provider only)
 */
export const deleteService = async (id) => {
  const response = await api.delete(`/services/${id}`);
  return response.data; // { success, message }
};


