const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const { createLog } = require('../utils/auditLogger');

router.use(authenticate);

// GET /api/user/profile
router.get('/profile', async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

// GET /api/user/balance
router.get('/balance', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('balance accountNumber');
    res.json({ success: true, data: { balance: user.balance, accountNumber: user.accountNumber } });
  } catch (e) { next(e); }
});

// PUT /api/user/profile — update name only (email/password have separate flows)
router.put('/profile', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Invalid name.' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );
    await createLog({ userId: req.user._id, action: 'PROFILE_UPDATED', ipAddress: req.ip });
    res.json({ success: true, data: { user } });
  } catch (e) { next(e); }
});

module.exports = router;
