const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'ACCOUNT_STATUS',
        'ACCOUNT_APPROVED',
        'ACCOUNT_REJECTED',
        'ACCOUNT_SUSPENDED',
        'ACCOUNT_RESTORED',
        'ROLE_CHANGED',
        'LINK_CREATED',
        'LINK_VISIT',
        'LINK_EXPIRATION',
        'SYSTEM_UPDATE',
      ],
      default: 'SYSTEM_UPDATE',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
