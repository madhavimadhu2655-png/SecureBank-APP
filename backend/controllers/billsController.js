const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');
const { createLog } = require('../utils/auditLogger');

// Bill payment helper — deducts from bank, records transaction
const processBillPayment = async ({ userId, amount, description, billType, billDetails, ipAddress }) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.balance < amount) throw new Error('Insufficient balance');

  await User.findByIdAndUpdate(userId, { $inc: { balance: -amount } });

  const txn = await Transaction.create({
    transactionId: uuidv4(),
    sender: userId,
    receiver: userId, // self — bill payment
    amount,
    status: 'completed',
    type: 'withdrawal',
    note: `${billType}: ${description}`,
    ipAddress,
  });

  await createLog({ userId, action: `BILL_${billType.toUpperCase()}`, details: { amount, ...billDetails }, ipAddress, severity: 'info' });

  const updated = await User.findById(userId);
  return { transactionId: txn.transactionId, newBalance: updated.balance };
};

// POST /api/bills/recharge
const mobileRecharge = async (req, res, next) => {
  try {
    const { phone, operator, amount, plan } = req.body;
    if (!phone || !operator || !amount) return res.status(400).json({ success: false, message: 'Phone, operator, and amount are required' });

    const result = await processBillPayment({
      userId: req.user._id,
      amount: parseFloat(amount),
      description: `${operator} recharge for ${phone}`,
      billType: 'RECHARGE',
      billDetails: { phone, operator, plan },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Recharge successful!', data: { ...result, phone, operator, plan } });
  } catch (e) {
    if (e.message === 'Insufficient balance') return res.status(400).json({ success: false, message: e.message });
    next(e);
  }
};

// POST /api/bills/electricity
const electricityBill = async (req, res, next) => {
  try {
    const { provider, accountId, amount } = req.body;
    if (!provider || !accountId || !amount) return res.status(400).json({ success: false, message: 'Provider, account ID and amount required' });

    const result = await processBillPayment({
      userId: req.user._id,
      amount: parseFloat(amount),
      description: `${provider} electricity bill`,
      billType: 'ELECTRICITY',
      billDetails: { provider, accountId },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Electricity bill paid!', data: result });
  } catch (e) {
    if (e.message === 'Insufficient balance') return res.status(400).json({ success: false, message: e.message });
    next(e);
  }
};

// POST /api/bills/credit-card
const creditCardBill = async (req, res, next) => {
  try {
    const { bank, cardNumber, amount } = req.body;
    if (!bank || !cardNumber || !amount) return res.status(400).json({ success: false, message: 'Bank, card number, and amount required' });

    const result = await processBillPayment({
      userId: req.user._id,
      amount: parseFloat(amount),
      description: `${bank} credit card bill`,
      billType: 'CREDIT_CARD',
      billDetails: { bank, cardLast4: cardNumber.slice(-4) },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Credit card bill paid!', data: result });
  } catch (e) {
    if (e.message === 'Insufficient balance') return res.status(400).json({ success: false, message: e.message });
    next(e);
  }
};

// POST /api/bills/generic — water, gas, DTH, broadband
const genericBill = async (req, res, next) => {
  try {
    const { type, provider, accountId, amount } = req.body;
    if (!type || !provider || !accountId || !amount) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const result = await processBillPayment({
      userId: req.user._id,
      amount: parseFloat(amount),
      description: `${provider} ${type} bill`,
      billType: type.toUpperCase(),
      billDetails: { type, provider, accountId },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: `${type} bill paid!`, data: result });
  } catch (e) {
    if (e.message === 'Insufficient balance') return res.status(400).json({ success: false, message: e.message });
    next(e);
  }
};

// GET /api/bills/fetch — mock bill fetch (electricity, water etc.)
const fetchBill = async (req, res, next) => {
  try {
    const { type, provider, accountId } = req.query;
    if (!provider || !accountId) return res.status(400).json({ success: false, message: 'Provider and account ID required' });

    // Mock bill generation (replace with real provider APIs in production)
    const mockBill = {
      consumerName: req.user.name,
      accountId,
      provider,
      billAmount: Math.floor(Math.random() * 3000) + 300,
      billDate: new Date(Date.now() - 15 * 86400000).toLocaleDateString('en-IN'),
      dueDate:  new Date(Date.now() + 10 * 86400000).toLocaleDateString('en-IN'),
      billPeriod: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      units: type === 'electricity' ? Math.floor(Math.random() * 200) + 50 : undefined,
    };

    res.json({ success: true, data: { bill: mockBill } });
  } catch (e) { next(e); }
};

module.exports = { mobileRecharge, electricityBill, creditCardBill, genericBill, fetchBill };
