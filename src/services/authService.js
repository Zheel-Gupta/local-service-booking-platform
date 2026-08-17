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
  // Backend returns { success, message, data: { user, token } }
  return response.data.data; // { user: { id, name, email, role }, token }
};

/**
 * Log in an existing user.
 * @param {string} email
 * @param {string} password
 */
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  // Backend returns { success, message, data: { user, token } }
  return response.data.data; // { user: { id, name, email, role }, token }
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
