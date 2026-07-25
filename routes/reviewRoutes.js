const express = require('express');
const router = express.Router();
const {
  createReview,
  getProviderReviews,
  getProviderAverageRating,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes
router.get('/provider/:providerId', getProviderReviews);
router.get('/provider/:providerId/average', getProviderAverageRating);

// Protected Customer route
router.post('/', protect, authorize('customer'), createReview);

module.exports = router;
