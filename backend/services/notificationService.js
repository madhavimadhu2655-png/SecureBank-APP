const logger = require('../utils/logger');

/**
 * NOTIFICATION SERVICE (Mock Implementation)
 * In production: integrate with SendGrid (email), Twilio (SMS),
 * Firebase (push), or AWS SNS for multi-channel delivery.
 *
 * All functions are async and fire-and-forget safe — the caller should
 * .catch(() => {}) to prevent unhandled rejections if notifications fail.
 */

/**
 * Generate a 6-digit OTP
 * Uses crypto-safe random — not Math.random() which is not cryptographically secure.
 */
const generateOTP = () => {
  const { randomInt } = require('crypto');
  return String(randomInt(100000, 999999));
};

const sendWelcomeEmail = async (email, name) => {
  logger.info(`[MOCK EMAIL] Welcome email sent to ${email} for ${name}`);
  // Production: await sendGrid.send({ to: email, template: 'welcome', ... })
  return { success: true };
};

const sendTransferNotification = async (sender, receiver, amount, transactionId) => {
  logger.info(`[MOCK SMS] Transfer notification: ${sender.name} → ${receiver.name}: $${amount} (${transactionId})`);
  // Production:
  // await twilioClient.messages.create({ to: sender.phone, body: `You sent $${amount}` });
  // await twilioClient.messages.create({ to: receiver.phone, body: `You received $${amount}` });
  return { success: true };
};

const sendOTPEmail = async (email, otp) => {
  logger.info(`[MOCK OTP EMAIL] OTP ${otp} sent to ${email} (expires in 10 minutes)`);
  return { success: true, otp }; // Return OTP for demo only
};

const sendFraudAlert = async (adminEmail, transaction) => {
  logger.warn(`[MOCK FRAUD ALERT] Flagged transaction ${transaction.transactionId} sent to ${adminEmail}`);
  return { success: true };
};

module.exports = {
  generateOTP,
  sendWelcomeEmail,
  sendTransferNotification,
  sendOTPEmail,
  sendFraudAlert,
};
