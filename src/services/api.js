import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken = null;

/**
 * Helper to update the in-memory auth token used by interceptors
 */
export const setAuthToken = (token) => {
  authToken = token;
};

// Axios Request Interceptor:
// Automatically attaches Bearer JWT token to outgoing requests if available
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
