const mongoose = require('mongoose');

const consentRecordSchema = new mongoose.Schema(
  {
    linkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Link',
      required: true,
      index: true,
    },
    visitorSessionId: {
      type: String,
      required: true,
      index: true,
    },
    consentStatus: {
      type: String,
      enum: ['GRANTED', 'DENIED', 'PARTIAL', 'DISMISSED'],
      required: true,
    },
    permissionType: {
      type: String,
      enum: ['LOCATION', 'CAMERA', 'BROWSER_INFO', 'ALL', 'NONE'],
      required: true,
    },
    locationGranted: {
      type: Boolean,
      default: false,
    },
    cameraGranted: {
      type: Boolean,
      default: false,
    },
    browserInfoGranted: {
      type: Boolean,
      default: false,
    },
    noticeAcknowledged: {
      type: Boolean,
      default: true,
    },
    anonymizedIp: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const ConsentRecord = mongoose.model('ConsentRecord', consentRecordSchema);
module.exports = ConsentRecord;
