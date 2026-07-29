const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    validate: {
      notNull: { msg: 'Customer ID is required' },
    },
  },
  providerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    validate: {
      notNull: { msg: 'Provider ID is required' },
    },
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'services',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    validate: {
      notNull: { msg: 'Service ID is required' },
    },
  },
  bookingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notNull: { msg: 'Booking date is required' },
      isDate: { msg: 'Please provide a valid date' },
    },
  },
  timeSlot: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Time slot is required' },
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'confirmed', 'completed', 'cancelled']],
        msg: "Status must be 'pending', 'confirmed', 'completed', or 'cancelled'",
      },
    },
  },
}, {
  timestamps: true,
  tableName: 'bookings',
});

module.exports = Booking;
