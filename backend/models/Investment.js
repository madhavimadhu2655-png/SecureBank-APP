const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['mutual_fund', 'gold', 'fd', 'rd'],
      required: true,
    },
    // Mutual Fund fields
    fundName:    { type: String },
    investMode:  { type: String, enum: ['sip', 'lumpsum'] },
    sipAmount:   { type: Number },
    sipDate:     { type: Number, min: 1, max: 28 },

    // Gold fields
    grams:       { type: Number },
    buyPrice:    { type: Number },

    // FD fields
    bank:         { type: String },
    principal:    { type: Number },
    interestRate: { type: Number },
    tenureMonths: { type: Number },
    maturityDate: { type: Date },
    maturityAmount:{ type: Number },

    // Common
    amount:      { type: Number, required: true },
    status:      { type: String, enum: ['active', 'paused', 'matured', 'redeemed'], default: 'active' },
    referenceId: { type: String },
  },
  { timestamps: true, versionKey: false }
);

investmentSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Investment', investmentSchema);
