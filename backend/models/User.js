const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      // Security: never return password field by default
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    balance: {
      type: Number,
      default: 1000.00,        // Starter balance for demo purposes
      min: [0, 'Balance cannot be negative'],
      // Security: balance is modified ONLY via atomic DB transactions
    },
    accountNumber: {
      type: String,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    // Security: do not expose internal versioning keys
    versionKey: false,
  }
);

// ─── Pre-save Hook: Hash password before storing ───────────────────────────────
// Salt rounds = 12: ~300ms per hash — slow enough to deter brute force,
// fast enough for user experience. Increasing to 14+ is recommended for
// high-security environments that can absorb the latency.
userSchema.pre('save', async function (next) {
  // Only hash if password was actually modified
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Pre-save Hook: Generate account number ───────────────────────────────────
userSchema.pre('save', function (next) {
  if (this.isNew) {
    // Format: BNK + 10 random digits
    this.accountNumber = 'BNK' + Math.random().toString().slice(2, 12);
  }
  next();
});

// ─── Instance Method: Compare passwords ───────────────────────────────────────
// Constant-time comparison via bcrypt prevents timing attacks.
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance Method: Account lockout check ───────────────────────────────────
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// ─── Virtual: Never expose sensitive fields in JSON output ────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.failedLoginAttempts;
  delete obj.lockUntil;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
