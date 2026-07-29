const { Review, Booking, User, sequelize } = require('../models');

/**
 * @desc    Create a new review for a completed booking
 * @route   POST /api/reviews
 * @access  Private (Customer only)
 */
const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || rating === undefined || rating === null) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId and rating',
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5',
      });
    }

    // 1. Verify booking exists
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${bookingId} not found`,
      });
    }

    // 2. Verify logged-in customer owns this booking
    if (booking.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking',
      });
    }

    // 3. Verify booking status is 'completed'
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Booking status must be completed before submitting a review',
      });
    }

    // 4. Check if a review already exists for this booking
    const existingReview = await Review.findOne({
      where: { bookingId },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been reviewed',
      });
    }

    // 5. Create the review
    const review = await Review.create({
      bookingId,
      customerId: req.user.id,
      providerId: booking.providerId,
      rating: numericRating,
      comment: comment || null,
    });

    const fullReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'profileImage'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: fullReview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for a specific provider
 * @route   GET /api/reviews/provider/:providerId
 * @access  Public
 */
const getProviderReviews = async (req, res, next) => {
  try {
    const { providerId } = req.params;

    const reviews = await Review.findAll({
      where: { providerId },
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'profileImage'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get average rating & review count for a specific provider
 * @route   GET /api/reviews/provider/:providerId/average
 * @access  Public
 */
const getProviderAverageRating = async (req, res, next) => {
  try {
    const { providerId } = req.params;

    // Use Sequelize aggregation functions (AVG and COUNT)
    const result = await Review.findOne({
      where: { providerId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews'],
      ],
      raw: true,
    });

    const rawAvg = result && result.averageRating;
    const rawCount = result && result.totalReviews;

    const averageRating = rawAvg !== null && rawAvg !== undefined
      ? parseFloat(Number(rawAvg).toFixed(1))
      : 0;

    const totalReviews = rawCount !== null && rawCount !== undefined
      ? parseInt(rawCount, 10)
      : 0;

    res.status(200).json({
      success: true,
      providerId: Number(providerId),
      averageRating,
      totalReviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProviderReviews,
  getProviderAverageRating,
};
