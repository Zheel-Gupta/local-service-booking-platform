const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route (requires valid JWT)
router.get('/me', protect, getMe);

// Protected & Role-restricted route demo (only providers)
router.get('/provider-only', protect, authorize('provider'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted: Welcome to the Provider Dashboard!',
    user: req.user,
  });
});

module.exports = router;
