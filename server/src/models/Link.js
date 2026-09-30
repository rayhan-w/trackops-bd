const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destinationUrl: {
      type: String,
      required: [true, 'Destination URL is required'],
      trim: true,
    },
    shortCode: {
      type: String,
      required: [true, 'Short code is required'],
      unique: true,
      trim: true,
      index: true,
    },
    domain: {
      type: String,
      default: 'trackops.link',
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'Untitled Link',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    caseReference: {
      type: String,
      trim: true,
      default: 'CASE-GENERAL',
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'EXPIRED'],
      default: 'ACTIVE',
      index: true,
    },
    expirationDate: {
      type: Date,
      default: null,
    },
    requiresConsentNotice: {
      type: Boolean,
      default: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    uniqueVisits: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify if link is currently active
linkSchema.methods.isLinkActive = function () {
  if (this.status !== 'ACTIVE') return false;
  if (this.expirationDate && new Date(this.expirationDate) < new Date()) {
    return false;
  }
  return true;
};

const Link = mongoose.model('Link', linkSchema);
module.exports = Link;
