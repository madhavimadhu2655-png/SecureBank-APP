const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const User   = require('../models/User');
const { createLog } = require('../utils/auditLogger');

// GET /api/wallet — get or auto-create wallet
const getWallet = async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id, balance: 0 });
    }
    res.json({ success: true, data: { wallet } });
  } catch (e) { next(e); }
};

// POST /api/wallet/add — add money from bank account to wallet
const addMoney = async (req, res, next) => {
  const { amount } = req.body;
  const amt = parseFloat(amount);
  if (!amt || amt < 10 || amt > 10000) {
    return res.status(400).json({ success: false, message: 'Amount must be between ₹10 and ₹10,000' });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const wallet = await Wallet.findOne({ user: req.user._id }).session(session);
    if (!wallet) throw new Error('Wallet not found');

    if (wallet.balance + amt > 10000) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Would exceed wallet limit of ₹10,000' });
    }

    // Deduct from bank balance
    const user = await User.findById(req.user._id).session(session);
    if (user.balance < amt) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Insufficient bank account balance' });
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { balance: -amt } }, { session });
    await Wallet.findByIdAndUpdate(wallet._id,
      { $inc: { balance: amt, totalAdded: amt } },
      { session }
    );

    await session.commitTransaction();

    await createLog({ userId: req.user._id, action: 'WALLET_ADD', details: { amount: amt }, ipAddress: req.ip });

    const updated = await Wallet.findOne({ user: req.user._id });
    const updatedUser = await User.findById(req.user._id);
    res.json({ success: true, message: `₹${amt} added to wallet`, data: { walletBalance: updated.balance, bankBalance: updatedUser.balance } });
  } catch (e) {
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

// POST /api/wallet/send — send from wallet to UPI
const sendFromWallet = async (req, res, next) => {
  const { toUpi, amount, note } = req.body;
  const amt = parseFloat(amount);
  if (!toUpi || !amt || amt <= 0) {
    return res.status(400).json({ success: false, message: 'UPI ID and amount are required' });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const wallet = await Wallet.findOne({ user: req.user._id }).session(session);
    if (!wallet || wallet.balance < amt) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }
    await Wallet.findByIdAndUpdate(wallet._id,
      { $inc: { balance: -amt, totalSpent: amt } },
      { session }
    );
    await session.commitTransaction();
    await createLog({ userId: req.user._id, action: 'WALLET_SEND', details: { amount: amt, toUpi, note }, ipAddress: req.ip });
    const updated = await Wallet.findOne({ user: req.user._id });
    res.json({ success: true, message: 'Payment sent from wallet', data: { walletBalance: updated.balance, transactionId: 'WLT' + Date.now() } });
  } catch (e) {
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

// POST /api/wallet/withdraw — withdraw wallet balance back to bank
const withdraw = async (req, res, next) => {
  const { amount } = req.body;
  const amt = parseFloat(amount);
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const wallet = await Wallet.findOne({ user: req.user._id }).session(session);
    if (!wallet || wallet.balance < amt) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }
    await Wallet.findByIdAndUpdate(wallet._id, { $inc: { balance: -amt } }, { session });
    await User.findByIdAndUpdate(req.user._id, { $inc: { balance: amt } }, { session });
    await session.commitTransaction();
    await createLog({ userId: req.user._id, action: 'WALLET_WITHDRAW', details: { amount: amt }, ipAddress: req.ip });
    const updated = await Wallet.findOne({ user: req.user._id });
    res.json({ success: true, message: 'Withdrawn to bank account', data: { walletBalance: updated.balance } });
  } catch (e) {
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

module.exports = { getWallet, addMoney, sendFromWallet, withdraw };
