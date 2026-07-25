const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Name is required' },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Please provide a valid email address' },
      notEmpty: { msg: 'Email is required' },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Password is required' },
    },
  },
  role: {
    type: DataTypes.ENUM('customer', 'provider'),
    allowNull: false,
    defaultValue: 'customer',
    validate: {
      isIn: {
        args: [['customer', 'provider']],
        msg: "Role must be either 'customer' or 'provider'",
      },
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'users',
});

// Helper instance method to strip sensitive information before sending response
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
