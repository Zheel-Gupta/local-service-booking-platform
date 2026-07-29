const { Booking, Service, User } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Create a new booking (Customer only)
 * @route   POST /api/bookings
 * @access  Private (Customer only)
 */
const createBooking = async (req, res, next) => {
  try {
    const { serviceId, bookingDate, timeSlot } = req.body;

    if (!serviceId || !bookingDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide serviceId, bookingDate, and timeSlot',
      });
    }

    // 1. Verify service exists
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: `Service with ID ${serviceId} not found`,
      });
    }

    // 2. Conflict prevention check:
    // Check if the provider already has a booking for the same date & time slot
    // that is either 'pending' or 'confirmed'
    const existingBooking = await Booking.findOne({
      where: {
        providerId: service.providerId,
        bookingDate,
        timeSlot,
        status: {
          [Op.in]: ['pending', 'confirmed'],
        },
      },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked',
      });
    }

    // 3. Create the booking with providerId automatically resolved from service
    const booking = await Booking.create({
      customerId: req.user.id,
      providerId: service.providerId,
      serviceId,
      bookingDate,
      timeSlot,
      status: 'pending',
    });

    // Fetch complete booking with associated service and provider info for response
    const fullBooking = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Service,
          as: 'service',
        },
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name', 'email', 'phone'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: fullBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings made by the logged-in customer
 * @route   GET /api/bookings/my-bookings
 * @access  Private (Customer only)
 */
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      where: { customerId: req.user.id },
      include: [
        {
          model: Service,
          as: 'service',
        },
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name', 'email', 'phone', 'profileImage'],
        },
      ],
      order: [
        ['bookingDate', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings received by the logged-in provider
 * @route   GET /api/bookings/provider-bookings
 * @access  Private (Provider only)
 */
const getProviderBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      where: { providerId: req.user.id },
      include: [
        {
          model: Service,
          as: 'service',
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone', 'address', 'profileImage'],
        },
      ],
      order: [
        ['bookingDate', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booking status (Confirm, Complete, Cancel)
 * @route   PUT /api/bookings/:id/status
 * @access  Private (Provider or Customer with role-based logic)
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Please provide a valid status: ${allowedStatuses.join(', ')}`,
      });
    }

    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${req.params.id} not found`,
      });
    }

    // Role-based logic check
    if (req.user.role === 'provider') {
      // Provider must be the owner of the booking
      if (booking.providerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update status for this booking',
        });
      }

      booking.status = status;
    } else if (req.user.role === 'customer') {
      // Customer must be the owner of the booking
      if (booking.customerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update status for this booking',
        });
      }

      // Customer can ONLY cancel their own pending booking
      if (status !== 'cancelled' || booking.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Customers can only cancel pending bookings',
        });
      }

      booking.status = 'cancelled';
    } else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to perform this action',
      });
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking status updated to '${booking.status}' successfully`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
};
