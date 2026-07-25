const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in Authorization header (Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Alternatively check in cookies if present
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no authentication token provided',
    });
  }

  try {
    // Verify token signature & expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Fetch user from database
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists',
      });
    }

    // Attach user information to req.user (password already hidden via toJSON / exclude)
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Authentication Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token validation failed',
    });
  }
};

module.exports = { protect };
