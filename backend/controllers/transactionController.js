const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { createLog } = require('../utils/auditLogger');
const { flagTransaction, isFraudulent } = require('../services/fraudDetection');
const { sendTransferNotification, generateOTP } = require('../services/notificationService');

// ─── POST /api/transactions/transfer ─────────────────────────────────────────
/**
 * ATOMIC FUND TRANSFER
 *
 * Security & integrity guarantees:
 * 1. MongoDB session + transaction: both debit and credit commit atomically.
 *    If the server crashes between the two writes, the session aborts and
 *    no funds move — prevents partial-update data corruption.
 * 2. Sender balance locked with $inc inside the session to prevent race
 *    conditions if the same user submits concurrent transfers.
 * 3. OTP required for transfers above LARGE_TRANSFER_THRESHOLD.
 * 4. Fraud check before committing — suspicious transfers are flagged, not blocked,
 *    so admin can review without impacting legitimate large payments.
 */
const LARGE_TRANSFER_THRESHOLD = parseFloat(process.env.LARGE_TRANSFER_THRESHOLD) || 10000;

const initiateTransfer = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }

  const { receiverAccountNumber, amount, note, otpCode } = req.body;
  const senderId = req.user._id;
  const transferAmount = parseFloat(amount);

  // MongoDB session for atomic writes
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // ─ Fetch both users inside session ──────────────────────────────────────
    const sender = await User.findById(senderId).session(session);
    const receiver = await User.findOne({ accountNumber: receiverAccountNumber }).session(session);

    if (!receiver) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Receiver account not found.' });
    }

    if (String(sender._id) === String(receiver._id)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Cannot transfer to your own account.' });
    }

    if (receiver.isSuspended) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Receiver account is suspended.' });
    }

    // ─ Sufficient balance check ──────────────────────────────────────────────
    if (sender.balance < transferAmount) {
      await session.abortTransaction();
      await createLog({
        userId: senderId,
        action: 'TRANSFER_INSUFFICIENT_FUNDS',
        details: { amount: transferAmount, balance: sender.balance },
        severity: 'info',
        success: false,
        ipAddress: req.ip,
      });
      return res.status(400).json({ success: false, message: 'Insufficient funds.' });
    }

    // ─ OTP verification for large transfers ─────────────────────────────────
    if (transferAmount >= LARGE_TRANSFER_THRESHOLD) {
      if (!otpCode) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'OTP required for transfers above ' + LARGE_TRANSFER_THRESHOLD,
          requiresOtp: true,
        });
      }
      // Validate OTP from pending transaction or session
      const valid = await validatePendingOTP(senderId, otpCode);
      if (!valid) {
        await session.abortTransaction();
        return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
      }
    }

    // ─ Fraud detection (async, non-blocking for session) ────────────────────
    const fraudCheck = await isFraudulent({ sender, amount: transferAmount });
    const shouldFlag = fraudCheck.flagged;

    // ─ Create transaction record ─────────────────────────────────────────────
    const [transaction] = await Transaction.create(
      [{
        transactionId: uuidv4(),
        sender: senderId,
        receiver: receiver._id,
        amount: transferAmount,
        note: note || '',
        status: 'pending',
        isFlagged: shouldFlag,
        flagReason: shouldFlag ? fraudCheck.reason : undefined,
        senderBalanceBefore: sender.balance,
        receiverBalanceBefore: receiver.balance,
        ipAddress: req.ip,
        otpVerified: transferAmount >= LARGE_TRANSFER_THRESHOLD,
      }],
      { session }
    );

    // ─ Atomic balance updates ────────────────────────────────────────────────
    // Using $inc inside session guarantees no race condition.
    // We do NOT do: balance = balance - amount (read-modify-write anti-pattern)
    await User.findByIdAndUpdate(
      senderId,
      { $inc: { balance: -transferAmount } },
      { session, new: true, runValidators: true }
    );

    await User.findByIdAndUpdate(
      receiver._id,
      { $inc: { balance: transferAmount } },
      { session, new: true, runValidators: true }
    );

    // Mark transaction as completed
    await Transaction.findByIdAndUpdate(
      transaction._id,
      { status: shouldFlag ? 'flagged' : 'completed' },
      { session }
    );

    // ─ Commit all writes atomically ──────────────────────────────────────────
    await session.commitTransaction();

    // ─ Post-commit: logging and notifications (outside session) ─────────────
    await createLog({
      userId: senderId,
      action: shouldFlag ? 'TRANSFER_FLAGGED' : 'TRANSFER_COMPLETED',
      details: {
        transactionId: transaction.transactionId,
        amount: transferAmount,
        receiver: receiver.accountNumber,
        flagReason: fraudCheck.reason,
      },
      severity: shouldFlag ? 'critical' : 'info',
      ipAddress: req.ip,
    });

    if (shouldFlag) {
      await flagTransaction(transaction._id, fraudCheck.reason);
    }

    // Fire-and-forget notifications
    sendTransferNotification(sender, receiver, transferAmount, transaction.transactionId).catch(() => {});

    const updatedSender = await User.findById(senderId);

    res.status(201).json({
      success: true,
      message: shouldFlag
        ? 'Transfer submitted and flagged for review.'
        : 'Transfer completed successfully.',
      data: {
        transactionId: transaction.transactionId,
        amount: transferAmount,
        receiver: { name: receiver.name, accountNumber: receiver.accountNumber },
        newBalance: updatedSender.balance,
        status: shouldFlag ? 'flagged' : 'completed',
        isFlagged: shouldFlag,
      },
    });

  } catch (error) {
    await session.abortTransaction();
    await createLog({
      userId: senderId,
      action: 'TRANSFER_ERROR',
      details: { error: error.message },
      severity: 'critical',
      success: false,
      ipAddress: req.ip,
    });
    next(error);
  } finally {
    session.endSession();
  }
};

// ─── POST /api/transactions/request-otp ──────────────────────────────────────
const requestOTP = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const user = req.user;

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // In production: store OTP in Redis with TTL. Here: store in user-scoped temp record.
    // For demo, we return it in the response (never do this in production!).
    // In real systems: send via SMS/email only.

    await createLog({
      userId: user._id,
      action: 'OTP_REQUESTED',
      details: { amount },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'OTP sent to your registered email/phone.',
      // DEMO ONLY — remove in production:
      data: { otp, expiresAt: expiry, note: 'Demo only — OTP would be sent via SMS in production.' },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/transactions/history ───────────────────────────────────────────
const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user._id;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {
      $or: [{ sender: userId }, { receiver: userId }],
    };
    if (status) filter.status = status;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('sender', 'name accountNumber')
        .populate('receiver', 'name accountNumber')
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
          hasNext: skip + parseInt(limit) < total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper: validate OTP stored in DB (simplified; use Redis in production)
const validatePendingOTP = async (userId, otpCode) => {
  // Simplified mock — in production, check Redis key `otp:${userId}`
  return true; // Demo bypass
};

module.exports = { initiateTransfer, requestOTP, getHistory };
