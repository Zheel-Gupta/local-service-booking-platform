import api from './api';

/**
 * Create a new booking (Customer)
 * Supports optional subServiceName and subServicePrice for services with sub-services.
 */
export const createBooking = async ({ serviceId, bookingDate, timeSlot, subServiceName, subServicePrice }) => {
  const payload = { serviceId, bookingDate, timeSlot };
  if (subServiceName) payload.subServiceName = subServiceName;
  if (subServicePrice !== undefined && subServicePrice !== null) payload.subServicePrice = subServicePrice;
  const response = await api.post('/bookings', payload);
  return response.data; // { success, message, data: booking }
};

/**
 * Get all bookings for current customer
 */
export const getMyBookings = async () => {
  const response = await api.get('/bookings/my-bookings');
  return response.data; // { success, count, data: bookings }
};

/**
 * Get all bookings received by current provider
 */
export const getProviderBookings = async () => {
  const response = await api.get('/bookings/provider-bookings');
  return response.data; // { success, count, data: bookings }
};

/**
 * Update booking status (e.g. customer cancelling pending booking)
 */
export const updateBookingStatus = async (bookingId, status) => {
  const response = await api.put(`/bookings/${bookingId}/status`, { status });
  return response.data; // { success, message, data: booking }
};
