const Log = require('../models/Log');
const logger = require('./logger');

/**
 * createLog — write to MongoDB audit log collection.
 * Non-blocking: failures are caught and logged to file without throwing.
 * Every sensitive action in the system calls this.
 */
const createLog = async ({
  userId = null,
  action,
  details = {},
  ipAddress = 'unknown',
  userAgent = '',
  severity = 'info',
  success = true,
}) => {
  try {
    await Log.create({ userId, action, details, ipAddress, userAgent, severity, success });
  } catch (err) {
    // Never let audit log failures crash the main request
    logger.error(`Audit log write failed for action ${action}: ${err.message}`);
  }
};

module.exports = { createLog };
