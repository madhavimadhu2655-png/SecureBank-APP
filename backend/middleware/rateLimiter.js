const rateLimit = require('express-rate-limit');

/**
 * AUTH RATE LIMITER
 * Development: 100 attempts per 15 min (relaxed for testing)
 * Production:  5 attempts per 15 min (strict for security)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins against the limit
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes.',
  },
});

/**
 * TRANSFER RATE LIMITER
 * Development: 100 per minute
 * Production:  10 per minute
 */
const transferLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Transfer rate limit exceeded. Please wait before making another transfer.',
  },
});

/**
 * OTP RATE LIMITER
 * Development: 20 per 10 min
 * Production:  3 per 10 min
 */
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 3 : 20,
  message: {
    success: false,
    message: 'Too many OTP requests. Try again in 10 minutes.',
  },
});

module.exports = { authLimiter, transferLimiter, otpLimiter };
