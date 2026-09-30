const mongoose = require('mongoose');

const telecomIntegrationSchema = new mongoose.Schema(
  {
    isEnabled: {
      type: Boolean,
      default: false,
    },
    providerName: {
      type: String,
      default: 'Bangladesh Telecommunication Regulatory Interface (Direct Gateway Mock)',
      trim: true,
    },
    apiEndpoint: {
      type: String,
      default: '',
      trim: true,
    },
    apiKeyMasked: {
      type: String,
      default: '',
    },
    authorizedOfficerRole: {
      type: String,
      default: 'SUPER_ADMIN',
    },
    disclaimer: {
      type: String,
      default:
        'Standard web browsers cannot access cellular tower, SIM, or IMEI data directly. Access to telecom data requires formal statutory warrant, legal dispatch number, and authorized regulatory gateway integration.',
    },
    accessAuditLogs: [
      {
        requestedAt: { type: Date, default: Date.now },
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        officerName: String,
        caseReference: String,
        warrantNumber: String,
        status: { type: String, enum: ['DISPATCHED', 'REJECTED_UNAUTHORIZED', 'PENDING_APPROVAL', 'GATEWAY_OFFLINE'], default: 'GATEWAY_OFFLINE' },
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const TelecomIntegration = mongoose.model('TelecomIntegration', telecomIntegrationSchema);
module.exports = TelecomIntegration;
