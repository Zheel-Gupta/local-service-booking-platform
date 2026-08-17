const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title is required' },
    },
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Category is required' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    // Now optional — a service can use subServices instead
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      isDecimalIfPresent(value) {
        if (value !== null && value !== undefined && value !== '') {
          if (isNaN(parseFloat(value))) {
            throw new Error('Price must be a valid number');
          }
          if (parseFloat(value) < 0) {
            throw new Error('Price must be greater than or equal to 0');
          }
        }
      },
    },
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in minutes (for single-price services)',
    validate: {
      isInt: { msg: 'Duration must be an integer (in minutes)' },
      min: { args: [1], msg: 'Duration must be at least 1 minute' },
    },
  },
  // ── Sub-Services (optional) ───────────────────────────────────────────────
  // Stores an array of: [{ name: string, price: number, duration: number }]
  // If present and non-empty, takes priority over the single `price` field.
  subServices: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: null,
    comment: 'Array of sub-service objects: [{ name, price, duration }]',
  },
}, {
  timestamps: true,
  tableName: 'services',
});

module.exports = Service;
