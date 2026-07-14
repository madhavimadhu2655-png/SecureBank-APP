const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be at least 0.01'],
      max: [1000000, 'Single transfer cannot exceed 1,000,000'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'flagged'],
      default: 'pending',
    },
    type: {
      type: String,
      enum: ['transfer', 'deposit', 'withdrawal'],
      default: 'transfer',
    },
    note: {
      type: String,
      maxlength: [200, 'Note cannot exceed 200 characters'],
      trim: true,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
    },
    // OTP confirmation token (mock)
    otpCode: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    senderBalanceBefore: {
      type: Number,
    },
    receiverBalanceBefore: {
      type: Number,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for fast transaction lookups by user
transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ receiver: 1, createdAt: -1 });
transactionSchema.index({ isFlagged: 1, status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
