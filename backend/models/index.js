const { sequelize } = require('../config/db');
const User = require('./User');
const Service = require('./Service');
const Booking = require('./Booking');
const Review = require('./Review');

// User <-> Service Associations
User.hasMany(Service, {
  foreignKey: 'providerId',
  as: 'services',
  onDelete: 'CASCADE',
});

Service.belongsTo(User, {
  foreignKey: 'providerId',
  as: 'provider',
});

// User <-> Booking Associations
User.hasMany(Booking, {
  foreignKey: 'customerId',
  as: 'customerBookings',
  onDelete: 'CASCADE',
});

User.hasMany(Booking, {
  foreignKey: 'providerId',
  as: 'providerBookings',
  onDelete: 'CASCADE',
});

Booking.belongsTo(User, {
  foreignKey: 'customerId',
  as: 'customer',
});

Booking.belongsTo(User, {
  foreignKey: 'providerId',
  as: 'provider',
});

// Service <-> Booking Associations
Service.hasMany(Booking, {
  foreignKey: 'serviceId',
  as: 'bookings',
  onDelete: 'CASCADE',
});

Booking.belongsTo(Service, {
  foreignKey: 'serviceId',
  as: 'service',
});

// Review Associations
Booking.hasOne(Review, {
  foreignKey: 'bookingId',
  as: 'review',
  onDelete: 'CASCADE',
});

Review.belongsTo(Booking, {
  foreignKey: 'bookingId',
  as: 'booking',
});

Review.belongsTo(User, {
  foreignKey: 'customerId',
  as: 'customer',
});

Review.belongsTo(User, {
  foreignKey: 'providerId',
  as: 'provider',
});

User.hasMany(Review, {
  foreignKey: 'providerId',
  as: 'reviews',
  onDelete: 'CASCADE',
});

module.exports = {
  sequelize,
  User,
  Service,
  Booking,
  Review,
};
