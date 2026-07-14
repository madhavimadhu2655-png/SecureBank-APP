const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createLog } = require('../utils/auditLogger');

/**
 * AUTHENTICATE MIDDLEWARE
 * Validates JWT on every protected route.
 *
 * Security decisions:
 * - Token extracted from Authorization header only (not cookies, to avoid CSRF)
 * - JWT_SECRET must be ≥256 bits (32+ bytes of entropy) in production
 * - Token expiry enforced by jsonwebtoken library — reject expired tokens hard
 * - Re-fetch user from DB on each request: catches suspended/deleted accounts
 *   immediately without waiting for token expiry
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      const message = jwtError.name === 'TokenExpiredError'
        ? 'Session expired. Please log in again.'
        : 'Invalid token.';
      return res.status(401).json({ success: false, message });
    }

    // Re-validate user exists and is active in DB
    const user = await User.findById(decoded.id).select('+isActive +isSuspended');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Account not found or deactivated.' });
    }

    if (user.isSuspended) {
      await createLog({
        userId: user._id,
        action: 'ACCESS_ATTEMPT_SUSPENDED',
        severity: 'warning',
        success: false,
        ipAddress: req.ip,
      });
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * AUTHORIZE MIDDLEWARE (Role-Based Access Control)
 * Usage: authorize('admin') or authorize('admin', 'user')
 *
 * Applied AFTER authenticate — guarantees req.user exists.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      createLog({
        userId: req.user._id,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        details: { requiredRoles: roles, userRole: req.user.role, path: req.path },
        severity: 'warning',
        success: false,
        ipAddress: req.ip,
      });
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.',
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
