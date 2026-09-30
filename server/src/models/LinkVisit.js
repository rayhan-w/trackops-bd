const mongoose = require('mongoose');

const linkVisitSchema = new mongoose.Schema(
  {
    linkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Link',
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    visitorReferenceId: {
      type: String,
      required: true,
      index: true,
    },
    consentRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConsentRecord',
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    visitTimestamp: {
      type: Date,
      default: Date.now,
    },
    consentTimestamp: {
      type: Date,
      default: Date.now,
    },
    consentStatus: {
      type: String,
      enum: ['GRANTED', 'DENIED', 'PARTIAL', 'DISMISSED', 'SKIPPED'],
      default: 'SKIPPED',
    },
    // Distinct Permission Statuses
    locationConsentStatus: {
      type: String,
      enum: ['Granted', 'Denied', 'Not Requested', 'Unavailable'],
      default: 'Not Requested',
      index: true,
    },
    cameraConsentStatus: {
      type: String,
      enum: ['Granted', 'Denied', 'Not Requested', 'Unavailable'],
      default: 'Not Requested',
      index: true,
    },
    cameraStatus: {
      type: String,
      enum: ['Available', 'Unavailable'],
      default: 'Unavailable',
    },
    // Location shared ONLY with explicit consent
    voluntarilySharedLocation: {
      type: Boolean,
      default: false,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    accuracy: {
      type: Number,
      default: null,
    },
    // Optional Camera preview confirmation
    voluntarilySharedCamera: {
      type: Boolean,
      default: false,
    },
    cameraSnapshot: {
      type: String, // Base64 data URL if explicitly captured and confirmed by user
      default: null,
    },
    // Optional Browser Information
    browserInfoShared: {
      type: Boolean,
      default: false,
    },
    browserInfo: {
      browser: { type: String, default: null },
      os: { type: String, default: null },
      device: { type: String, default: null },
      screenResolution: { type: String, default: null },
      language: { type: String, default: null },
      referrer: { type: String, default: null },
    },
    visitorSessionId: {
      type: String,
      default: null,
      index: true,
    },
    ipHash: {
      type: String,
      default: null,
    },
    // Network & IP Intelligence
    ipAddress: {
      type: String,
      default: '103.199.109.91',
      index: true,
    },
    ipv4: {
      type: String,
      default: '103.199.109.91',
    },
    ipv6: {
      type: String,
      default: 'N/A',
    },
    internalIp: {
      type: String,
      default: '::ffff:10.0.1.6',
    },
    referrer: {
      type: String,
      default: 'https://protidinernews.xyz/',
    },
    locationSource: {
      type: String,
      enum: ['GPS (exact)', 'IP (approximate)', 'None'],
      default: 'IP (approximate)',
    },
    ipIntelligence: {
      isp: { type: String, default: 'Carnival Internet' },
      organization: { type: String, default: 'Amber IT Limited' },
      asn: { type: String, default: 'AS132602' },
      asName: { type: String, default: 'CARNIVAL-INTERNET-BD' },
      reverseDns: { type: String, default: '103.199.109.91.reverse.amberit.com.bd' },
      continent: { type: String, default: 'Asia' },
      country: { type: String, default: 'Bangladesh' },
      countryCode: { type: String, default: 'BD' },
      region: { type: String, default: 'Dhaka Division' },
      city: { type: String, default: 'Dhaka' },
      postalCode: { type: String, default: '1205' },
      timezone: { type: String, default: 'Asia/Dhaka' },
      utcOffset: { type: String, default: '+06:00' },
      currency: { type: String, default: 'BDT (৳)' },
      isMobile: { type: Boolean, default: false },
      isProxy: { type: Boolean, default: false },
      isHosting: { type: Boolean, default: false },
      coordinates: {
        latitude: { type: Number, default: 23.7004 },
        longitude: { type: Number, default: 90.4287 },
      },
    },
  },
  {
    timestamps: true,
  }
);

const LinkVisit = mongoose.model('LinkVisit', linkVisitSchema);
module.exports = LinkVisit;
