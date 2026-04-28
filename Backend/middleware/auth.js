const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies the JWT token from the Authorization header
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;

    // Fetch user role for authorization checks
    const user = await User.findById(decoded.id).select('role name');
    if (user) {
      req.user = { id: decoded.id, role: user.role, name: user.name };
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token is invalid',
    });
  }
};

/**
 * Police role verification middleware
 * Checks if the authenticated user has 'police' role
 * Must be used after the `protect` middleware
 */
const isPolice = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, user not found',
    });
  }

  if (req.user.role !== 'police') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Police role is required for this action.',
    });
  }

  next();
};

/**
 * Role-based authorization middleware
 * Allows specifying which roles have access to a route
 * Usage: requireRole('police') or requireRole('police', 'admin')
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = {
  protect,
  isPolice,
  requireRole,
};

