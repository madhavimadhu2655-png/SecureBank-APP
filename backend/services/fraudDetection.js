const Transaction = require('../models/Transaction');

/**
 * FRAUD DETECTION SERVICE
 *
 * Heuristic-based detection for demo purposes.
 * Production systems use ML models, velocity checks, device fingerprinting,
 * geolocation, and behavioral analytics.
 */

const LARGE_AMOUNT_THRESHOLD = parseFloat(process.env.FRAUD_LARGE_THRESHOLD) || 5000;
const VELOCITY_WINDOW_MS = 60 * 60 * 1000;   // 1 hour
const MAX_TRANSFERS_PER_HOUR = 10;
const MAX_HOURLY_VOLUME = 20000;

/**
 * Check if a transfer matches fraud patterns.
 * Returns { flagged: boolean, reason: string }
 */
const isFraudulent = async ({ sender, amount }) => {
  const reasons = [];

  // Rule 1: Large single transfer
  if (amount >= LARGE_AMOUNT_THRESHOLD) {
    reasons.push(`Large transfer: $${amount} exceeds threshold of $${LARGE_AMOUNT_THRESHOLD}`);
  }

  // Rule 2: Velocity check — too many transfers in 1 hour
  const since = new Date(Date.now() - VELOCITY_WINDOW_MS);
  const recentTxns = await Transaction.find({
    sender: sender._id,
    createdAt: { $gte: since },
    status: { $in: ['completed', 'pending', 'flagged'] },
  }).lean();

  if (recentTxns.length >= MAX_TRANSFERS_PER_HOUR) {
    reasons.push(`High velocity: ${recentTxns.length} transfers in the last hour`);
  }

  // Rule 3: Large total volume in window
  const hourlyVolume = recentTxns.reduce((sum, t) => sum + t.amount, 0) + amount;
  if (hourlyVolume > MAX_HOURLY_VOLUME) {
    reasons.push(`High volume: $${hourlyVolume.toFixed(2)} moved in 1 hour`);
  }

  // Rule 4: Transfer exceeds 80% of account balance
  if (amount > sender.balance * 0.8 && amount > 1000) {
    reasons.push(`Drains >80% of balance: $${amount} of $${sender.balance}`);
  }

  return {
    flagged: reasons.length > 0,
    reason: reasons.join('; '),
  };
};

/**
 * Mark a transaction as flagged for admin review.
 */
const flagTransaction = async (transactionId, reason) => {
  await require('../models/Transaction').findByIdAndUpdate(transactionId, {
    isFlagged: true,
    flagReason: reason,
    status: 'flagged',
  });
};

module.exports = { isFraudulent, flagTransaction };
