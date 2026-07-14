const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Log = require('../models/Log');
const { createLog } = require('../utils/auditLogger');

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { accountNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalCount: total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/transactions ──────────────────────────────────────────────
const getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, flagged } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status) filter.status = status;
    if (flagged === 'true') filter.isFlagged = true;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('sender', 'name email accountNumber')
        .populate('receiver', 'name email accountNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalCount: total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/alerts ────────────────────────────────────────────────────
const getFraudAlerts = async (req, res, next) => {
  try {
    const [flaggedTxns, criticalLogs, stats] = await Promise.all([
      Transaction.find({ isFlagged: true })
        .populate('sender', 'name email accountNumber')
        .populate('receiver', 'name email accountNumber')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Log.find({ severity: 'critical' })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      // Summary stats
      Promise.all([
        Transaction.countDocuments({ isFlagged: true }),
        Transaction.countDocuments({ status: 'failed' }),
        User.countDocuments({ isSuspended: true }),
      ]),
    ]);

    res.json({
      success: true,
      data: {
        flaggedTransactions: flaggedTxns,
        criticalLogs,
        summary: {
          totalFlagged: stats[0],
          totalFailed: stats[1],
          suspendedUsers: stats[2],
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/admin/users/:id/suspend ────────────────────────────────────────
const suspendUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { suspend, reason } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot suspend admin accounts.' });
    }

    user.isSuspended = suspend;
    await user.save();

    await createLog({
      userId: req.user._id,
      action: suspend ? 'ADMIN_SUSPEND_USER' : 'ADMIN_UNSUSPEND_USER',
      details: { targetUser: id, reason },
      severity: 'warning',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `User ${suspend ? 'suspended' : 'unsuspended'} successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalTransactions,
      todayTransactions,
      flaggedCount,
      totalVolumeResult,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Transaction.countDocuments(),
      Transaction.countDocuments({ createdAt: { $gte: today } }),
      Transaction.countDocuments({ isFlagged: true }),
      Transaction.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTransactions,
        todayTransactions,
        flaggedCount,
        totalVolume: totalVolumeResult[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/admin/transactions/:id/resolve ──────────────────────────────────
const resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'reject'

    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found.' });

    transaction.isFlagged = false;
    transaction.status = action === 'approve' ? 'completed' : 'failed';
    await transaction.save();

    await createLog({
      userId: req.user._id,
      action: `ADMIN_ALERT_${action.toUpperCase()}`,
      details: { transactionId: transaction.transactionId },
      severity: 'info',
      ipAddress: req.ip,
    });

    res.json({ success: true, message: `Transaction ${action}d.` });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getAllTransactions, getFraudAlerts, suspendUser, getDashboardStats, resolveAlert };
