import api from './api';

/**
 * Register a new user.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @param {'customer'|'provider'} role
 */
export const registerUser = async (name, email, password, role) => {
  const response = await api.post('/auth/register', { name, email, password, role });
  return response.data; // { success, token, user: { id, name, email, role } }
};

/**
 * Log in an existing user.
 * @param {string} email
 * @param {string} password
 */
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data; // { success, token, user: { id, name, email, role } }
};

/**
 * Fetch the currently authenticated user's profile.
 * @param {string} token  JWT token
 */
export const getMe = async (token) => {
  const response = await api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
