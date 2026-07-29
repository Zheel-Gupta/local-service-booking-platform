import api from './api';

/**
 * Fetch all reviews for a provider
 */
export const getProviderReviews = async (providerId) => {
  const response = await api.get(`/reviews/provider/${providerId}`);
  return response.data; // { success, count, data: reviews }
};

/**
 * Fetch average rating & total review count for a provider
 */
export const getProviderAverageRating = async (providerId) => {
  const response = await api.get(`/reviews/provider/${providerId}/average`);
  return response.data; // { success, providerId, averageRating, totalReviews }
};

/**
 * Submit a review for a completed booking
 */
export const createReview = async ({ bookingId, rating, comment }) => {
  const response = await api.post('/reviews', { bookingId, rating, comment });
  return response.data; // { success, message, data: review }
};
