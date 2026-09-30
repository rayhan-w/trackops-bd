const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password hash'],
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'USER'],
      default: 'USER',
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    suspensionReason: {
      type: String,
      default: null,
    },
    notificationPreferences: {
      emailAlerts: { type: Boolean, default: true },
      linkClicks: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Check if user is allowed to perform operations
userSchema.methods.canCreateLinks = function () {
  return this.status === 'APPROVED';
};

const User = mongoose.model('User', userSchema);
module.exports = User;
