const { Service, User, Review, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Create a new service
 * @route   POST /api/services
 * @access  Private (Provider only)
 */
const createService = async (req, res, next) => {
  try {
    const { title, category, description, price, duration, subServices } = req.body;

    // Basic required fields
    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and category for the service',
      });
    }

    // Parse and validate subServices if provided
    let parsedSubServices = null;
    if (subServices && Array.isArray(subServices) && subServices.length > 0) {
      for (let i = 0; i < subServices.length; i++) {
        const ss = subServices[i];
        if (!ss.name || ss.name.toString().trim() === '') {
          return res.status(400).json({
            success: false,
            message: `Sub-service #${i + 1} is missing a name`,
          });
        }
        if (ss.price === undefined || ss.price === null || ss.price === '' || isNaN(parseFloat(ss.price))) {
          return res.status(400).json({
            success: false,
            message: `Sub-service #${i + 1} ("${ss.name}") is missing a valid price`,
          });
        }
        if (parseFloat(ss.price) < 0) {
          return res.status(400).json({
            success: false,
            message: `Sub-service #${i + 1} ("${ss.name}") price cannot be negative`,
          });
        }
      }
      parsedSubServices = subServices.map((ss) => ({
        name: ss.name.toString().trim(),
        price: parseFloat(parseFloat(ss.price).toFixed(2)),
        duration: ss.duration ? parseInt(ss.duration, 10) : null,
      }));
    }

    // Must provide either a base price OR at least one sub-service
    const hasBasePrice = price !== undefined && price !== null && price !== '';
    const hasSubServices = parsedSubServices && parsedSubServices.length > 0;

    if (!hasBasePrice && !hasSubServices) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a base price or at least one sub-service with a price',
      });
    }

    const service = await Service.create({
      providerId: req.user.id,
      title,
      category,
      description,
      price: hasBasePrice ? price : null,
      duration: duration || null,
      subServices: parsedSubServices,
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all services with search, filter, sort & pagination
 * @route   GET /api/services
 * @access  Public
 * @query   search, category, minPrice, maxPrice, minRating, sortBy, page, limit
 */
const getAllServices = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
      page = 1,
      limit = 10,
    } = req.query;

    // --- 1. Build WHERE clause for Service filters ---
    const whereClause = {};

    // Exact category match
    if (category) {
      whereClause.category = category;
    }

    // Case-insensitive partial match on title OR category using Op.iLike
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Price range filter using Op.gte / Op.lte (only applies to base price)
    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.price = {};
      if (minPrice !== undefined) {
        whereClause.price[Op.gte] = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        whereClause.price[Op.lte] = Number(maxPrice);
      }
    }

    // --- 2. Build ORDER clause ---
    let order;
    switch (sortBy) {
      case 'price_asc':
        order = [['price', 'ASC']];
        break;
      case 'price_desc':
        order = [['price', 'DESC']];
        break;
      case 'newest':
      default:
        order = [['createdAt', 'DESC']];
        break;
    }

    // --- 3. Calculate pagination offset ---
    const pageNum   = Math.max(1, parseInt(page, 10));
    const limitNum  = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset    = (pageNum - 1) * limitNum;

    // --- 4. Fetch services with count (for pagination metadata) ---
    const { count: totalResults, rows: services } = await Service.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name', 'email', 'phone', 'profileImage'],
        },
      ],
      order,
      limit: limitNum,
      offset,
      distinct: true, // Required for accurate count with includes
    });

    // --- 5. Apply minRating filter via post-query aggregation ---
    // We fetch per-provider average ratings in a single aggregation query,
    // then filter the returned services in memory.
    let filteredServices = services;
    let filteredTotal    = totalResults;

    if (minRating !== undefined) {
      const minRatingNum = parseFloat(minRating);

      // Get average ratings for all provider IDs in the current result set
      const providerIds = [...new Set(services.map(s => s.providerId))];

      const avgRatings = await Review.findAll({
        where: { providerId: { [Op.in]: providerIds } },
        attributes: [
          'providerId',
          [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        ],
        group: ['providerId'],
        raw: true,
      });

      // Build a quick lookup map: { providerId -> averageRating }
      const ratingMap = {};
      avgRatings.forEach(r => {
        ratingMap[r.providerId] = parseFloat(Number(r.averageRating).toFixed(1));
      });

      // Keep only services whose provider meets the minRating threshold
      filteredServices = services.filter(s => {
        const avg = ratingMap[s.providerId] || 0;
        return avg >= minRatingNum;
      });
      filteredTotal = filteredServices.length;
    }

    const totalPages = Math.ceil(
      (minRating !== undefined ? filteredTotal : totalResults) / limitNum
    );

    res.status(200).json({
      success: true,
      services: filteredServices,
      totalResults: minRating !== undefined ? filteredTotal : totalResults,
      totalPages,
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single service by ID
 * @route   GET /api/services/:id
 * @access  Public
 */
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name', 'email', 'phone', 'profileImage'],
        },
      ],
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: `Service with ID ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a service
 * @route   PUT /api/services/:id
 * @access  Private (Service Owner Provider only)
 */
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: `Service with ID ${req.params.id} not found`,
      });
    }

    // Check ownership
    if (service.providerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service',
      });
    }

    const { title, category, description, price, duration, subServices } = req.body;

    if (title !== undefined) service.title = title;
    if (category !== undefined) service.category = category;
    if (description !== undefined) service.description = description;
    if (duration !== undefined) service.duration = duration;

    // Handle subServices update
    if (subServices !== undefined) {
      if (Array.isArray(subServices) && subServices.length > 0) {
        // Validate each sub-service entry
        for (let i = 0; i < subServices.length; i++) {
          const ss = subServices[i];
          if (!ss.name || ss.name.toString().trim() === '') {
            return res.status(400).json({
              success: false,
              message: `Sub-service #${i + 1} is missing a name`,
            });
          }
          if (ss.price === undefined || ss.price === null || ss.price === '' || isNaN(parseFloat(ss.price))) {
            return res.status(400).json({
              success: false,
              message: `Sub-service #${i + 1} ("${ss.name}") is missing a valid price`,
            });
          }
        }
        service.subServices = subServices.map((ss) => ({
          name: ss.name.toString().trim(),
          price: parseFloat(parseFloat(ss.price).toFixed(2)),
          duration: ss.duration ? parseInt(ss.duration, 10) : null,
        }));
      } else {
        // Empty array or null = clear sub-services
        service.subServices = null;
      }
    }

    // Handle price update
    if (price !== undefined) {
      service.price = (price === null || price === '') ? null : price;
    }

    // After updates, ensure the service still has either a price or sub-services
    const hasBasePrice = service.price !== undefined && service.price !== null && service.price !== '';
    const hasSubServices = service.subServices && Array.isArray(service.subServices) && service.subServices.length > 0;

    if (!hasBasePrice && !hasSubServices) {
      return res.status(400).json({
        success: false,
        message: 'Service must have either a base price or at least one sub-service',
      });
    }

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a service
 * @route   DELETE /api/services/:id
 * @access  Private (Service Owner Provider only)
 */
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: `Service with ID ${req.params.id} not found`,
      });
    }

    // Check ownership
    if (service.providerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service',
      });
    }

    await service.destroy();

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in provider's services
 * @route   GET /api/services/my-services
 * @access  Private (Provider only)
 */
const getMyServices = async (req, res, next) => {
  try {
    const services = await Service.findAll({
      where: { providerId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getMyServices,
};
