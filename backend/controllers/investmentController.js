const { v4: uuidv4 } = require('uuid');
const Investment = require('../models/Investment');
const User = require('../models/User');
const { createLog } = require('../utils/auditLogger');

// GET /api/investments — get all investments for user
const getInvestments = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = { user: req.user._id, status: { $in: ['active', 'paused'] } };
    if (type) filter.type = type;
    const investments = await Investment.find(filter).sort({ createdAt: -1 });

    // Compute portfolio summary
    const summary = {
      totalInvested: investments.reduce((s, i) => s + (i.principal || i.amount || 0), 0),
      activeCount: investments.filter(i => i.status === 'active').length,
    };

    res.json({ success: true, data: { investments, summary } });
  } catch (e) { next(e); }
};

// POST /api/investments/mutual-fund — start SIP or lumpsum
const investMutualFund = async (req, res, next) => {
  try {
    const { fundName, investMode, amount, sipDate } = req.body;
    if (!fundName || !investMode || !amount) {
      return res.status(400).json({ success: false, message: 'Fund name, mode, and amount are required' });
    }
    const amt = parseFloat(amount);

    // Deduct from bank balance for lumpsum
    if (investMode === 'lumpsum') {
      const user = await User.findById(req.user._id);
      if (user.balance < amt) return res.status(400).json({ success: false, message: 'Insufficient balance' });
      await User.findByIdAndUpdate(req.user._id, { $inc: { balance: -amt } });
    }

    const inv = await Investment.create({
      user: req.user._id,
      type: 'mutual_fund',
      fundName, investMode,
      amount: amt,
      sipAmount: investMode === 'sip' ? amt : undefined,
      sipDate: investMode === 'sip' ? sipDate : undefined,
      referenceId: 'MF' + uuidv4().slice(0,8).toUpperCase(),
    });

    await createLog({ userId: req.user._id, action: 'INVESTMENT_MF', details: { fundName, investMode, amount: amt }, ipAddress: req.ip });
    res.status(201).json({ success: true, message: investMode === 'sip' ? 'SIP started!' : 'Investment placed!', data: { investment: inv } });
  } catch (e) { next(e); }
};

// POST /api/investments/gold — buy/sell digital gold
const investGold = async (req, res, next) => {
  try {
    const { action, grams, rupees, goldPricePerGram } = req.body;
    if (!action || !grams || !rupees) return res.status(400).json({ success: false, message: 'Action, grams, and rupees are required' });

    const user = await User.findById(req.user._id);
    const totalCost = action === 'buy' ? parseFloat(rupees) * 1.03 : 0; // include GST for buy

    if (action === 'buy') {
      if (user.balance < totalCost) return res.status(400).json({ success: false, message: 'Insufficient balance' });
      await User.findByIdAndUpdate(req.user._id, { $inc: { balance: -totalCost } });
      await Investment.create({
        user: req.user._id,
        type: 'gold',
        amount: parseFloat(rupees),
        grams: parseFloat(grams),
        buyPrice: parseFloat(goldPricePerGram),
        referenceId: 'GOLD' + uuidv4().slice(0,8).toUpperCase(),
      });
    } else {
      // Sell — credit back
      const proceeds = parseFloat(rupees) * 0.97; // after charges
      await User.findByIdAndUpdate(req.user._id, { $inc: { balance: proceeds } });
      await Investment.updateOne({ user: req.user._id, type: 'gold', status: 'active' }, { status: 'redeemed' });
    }

    await createLog({ userId: req.user._id, action: `GOLD_${action.toUpperCase()}`, details: { grams, rupees }, ipAddress: req.ip });
    const updatedUser = await User.findById(req.user._id);
    res.json({ success: true, message: `Gold ${action} successful`, data: { bankBalance: updatedUser.balance, transactionId: 'GOLD'+Date.now() } });
  } catch (e) { next(e); }
};

// POST /api/investments/fd — book fixed deposit
const bookFD = async (req, res, next) => {
  try {
    const { bank, amount, tenureMonths, interestRate } = req.body;
    if (!bank || !amount || !tenureMonths || !interestRate) {
      return res.status(400).json({ success: false, message: 'All FD fields are required' });
    }
    const principal = parseFloat(amount);
    const user = await User.findById(req.user._id);
    if (user.balance < principal) return res.status(400).json({ success: false, message: 'Insufficient balance' });

    // Compute maturity (quarterly compounding)
    const r = parseFloat(interestRate) / 100 / 4;
    const n = parseInt(tenureMonths) / 3;
    const maturityAmount = Math.round(principal * Math.pow(1 + r, n));
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + parseInt(tenureMonths));

    await User.findByIdAndUpdate(req.user._id, { $inc: { balance: -principal } });

    const fd = await Investment.create({
      user: req.user._id,
      type: 'fd',
      amount: principal,
      principal,
      bank,
      interestRate: parseFloat(interestRate),
      tenureMonths: parseInt(tenureMonths),
      maturityDate,
      maturityAmount,
      referenceId: 'FD' + uuidv4().slice(0,8).toUpperCase(),
    });

    await createLog({ userId: req.user._id, action: 'FD_BOOKED', details: { bank, principal, tenureMonths, maturityAmount }, ipAddress: req.ip });
    const updatedUser = await User.findById(req.user._id);
    res.status(201).json({ success: true, message: 'FD booked successfully!', data: { investment: fd, bankBalance: updatedUser.balance } });
  } catch (e) { next(e); }
};

// POST /api/investments/fd/:id/break — premature withdrawal
const breakFD = async (req, res, next) => {
  try {
    const fd = await Investment.findOne({ _id: req.params.id, user: req.user._id, type: 'fd' });
    if (!fd) return res.status(404).json({ success: false, message: 'FD not found' });

    // 0.5% penalty on premature withdrawal
    const penalty = fd.principal * 0.005;
    const returnAmount = fd.principal - penalty;
    await User.findByIdAndUpdate(req.user._id, { $inc: { balance: returnAmount } });
    await Investment.findByIdAndUpdate(fd._id, { status: 'redeemed' });

    await createLog({ userId: req.user._id, action: 'FD_BROKEN', details: { fdId: fd._id, penalty }, ipAddress: req.ip });
    res.json({ success: true, message: `FD broken. ₹${returnAmount.toFixed(2)} credited (₹${penalty.toFixed(2)} penalty deducted)` });
  } catch (e) { next(e); }
};

module.exports = { getInvestments, investMutualFund, investGold, bookFD, breakFD };
