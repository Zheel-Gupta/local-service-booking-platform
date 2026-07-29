const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Customer routes
router.post('/', protect, authorize('customer'), createBooking);
router.get('/my-bookings', protect, authorize('customer'), getMyBookings);

// Provider routes
router.get('/provider-bookings', protect, authorize('provider'), getProviderBookings);

// Update status route (protected - role authorization handled within controller logic)
router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;
