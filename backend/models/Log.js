const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      required: true,
      // Examples: 'USER_LOGIN', 'TRANSFER_INITIATED', 'TRANSFER_FLAGGED', 'ADMIN_SUSPEND'
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
    success: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

logSchema.index({ userId: 1, createdAt: -1 });
logSchema.index({ severity: 1, createdAt: -1 });
logSchema.index({ action: 1 });

module.exports = mongoose.model('Log', logSchema);
