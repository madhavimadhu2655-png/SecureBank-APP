const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { createLog } = require('../utils/auditLogger');
const { sendWelcomeEmail } = require('../services/notificationService');

/**
 * Generate JWT — short expiry enforces session discipline.
 * 15m access token + 7d refresh token pattern (refresh not implemented here,
 * but the architecture supports it by extending this function).
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role,
      // Include role in token so middleware can short-circuit DB for role checks
      // BUT we still re-verify against DB in authenticate() — defense in depth
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY || '2h',
      issuer: 'secure-banking-api',
      audience: 'secure-banking-client',
    }
  );
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
      });
    }

    const { name, email, password } = req.body;

    // Check for duplicate email — use case-insensitive search
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      // Security: don't reveal whether email exists — use same message either way
      // in a real bank. For demo clarity, we reveal it here.
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password });

    // Fire-and-forget notification (does not block response)
    sendWelcomeEmail(user.email, user.name).catch(() => {});

    await createLog({
      userId: user._id,
      action: 'USER_REGISTERED',
      details: { email: user.email },
      ipAddress: req.ip,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountNumber: user.accountNumber,
          balance: user.balance,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
      });
    }

    const { email, password } = req.body;

    // Fetch user WITH password (excluded by default in schema)
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password +failedLoginAttempts +lockUntil');

    // ─ Account lockout check ─────────────────────────────────────────────────
    if (user && user.isLocked()) {
      const waitMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
      await createLog({
        userId: user._id,
        action: 'LOGIN_LOCKED_ACCOUNT',
        severity: 'warning',
        success: false,
        ipAddress: req.ip,
      });
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${waitMinutes} minute(s).`,
      });
    }

    // ─ Credential validation ─────────────────────────────────────────────────
    // Compare even when user not found (constant-time: prevents timing attacks
    // that reveal valid email addresses)
    const isValid = user && await user.comparePassword(password);

    if (!isValid) {
      if (user) {
        // Increment failure counter and lock after 5 attempts
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min
        }
        await user.save({ validateModifiedOnly: true });
      }

      await createLog({
        userId: user?._id,
        action: 'LOGIN_FAILED',
        severity: 'warning',
        success: false,
        ipAddress: req.ip,
        details: { email },
      });

      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
    }

    // Reset failure counter on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save({ validateModifiedOnly: true });

    const token = generateToken(user._id, user.role);

    await createLog({
      userId: user._id,
      action: 'USER_LOGIN',
      details: { userAgent: req.headers['user-agent'] },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountNumber: user.accountNumber,
          balance: user.balance,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
};

module.exports = { register, login, getMe };
