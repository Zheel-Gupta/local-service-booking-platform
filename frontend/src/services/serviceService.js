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
