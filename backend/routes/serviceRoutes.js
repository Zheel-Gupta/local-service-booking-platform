const express = require('express');
const router = express.Router();
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getMyServices,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getAllServices);

// Protected Provider route (my services) - MUST be declared before /:id to prevent route collision
router.get('/my-services', protect, authorize('provider'), getMyServices);

// Public route for single service by ID
router.get('/:id', getServiceById);

// Protected Provider routes
router.post('/', protect, authorize('provider'), createService);
router.put('/:id', protect, authorize('provider'), updateService);
router.delete('/:id', protect, authorize('provider'), deleteService);

module.exports = router;
