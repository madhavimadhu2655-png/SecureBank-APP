const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Wallet balance cannot be negative'],
      max: [10000, 'Wallet balance cannot exceed ₹10,000'],
    },
    isActive: { type: Boolean, default: true },
    totalAdded:    { type: Number, default: 0 },
    totalSpent:    { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Wallet', walletSchema);
