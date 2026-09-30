const TelecomIntegration = require('../models/TelecomIntegration');
const AuditLog = require('../models/AuditLog');

// @desc    Get telecom integration configuration and status
// @route   GET /api/telecom/status
// @access  Private (Admin, Super Admin, Officer)
exports.getStatus = async (req, res, next) => {
  try {
    let config = await TelecomIntegration.findOne();
    if (!config) {
      config = await TelecomIntegration.create({
        isEnabled: false,
        providerName: 'Bangladesh BTRC Lawful Gateway Interface (Strict Statutory Dispatch)',
        apiEndpoint: '',
        apiKeyMasked: '',
      });
    }

    res.json({
      success: true,
      config: {
        isEnabled: config.isEnabled,
        providerName: config.providerName,
        apiEndpoint: config.apiEndpoint ? `${config.apiEndpoint.substring(0, 15)}...[SECURED]` : 'Not Configured',
        disclaimer: config.disclaimer,
        accessAuditLogs: config.accessAuditLogs.slice(-20).reverse(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update telecom integration settings (SUPER_ADMIN only)
// @route   PUT /api/telecom/configure
// @access  Private (SUPER_ADMIN)
exports.updateConfiguration = async (req, res, next) => {
  try {
    const { isEnabled, providerName, apiEndpoint, apiKey } = req.body;

    let config = await TelecomIntegration.findOne();
    if (!config) {
      config = new TelecomIntegration();
    }

    if (isEnabled !== undefined) config.isEnabled = isEnabled;
    if (providerName) config.providerName = providerName.trim();
    if (apiEndpoint !== undefined) config.apiEndpoint = apiEndpoint.trim();
    if (apiKey) {
      config.apiKeyMasked = apiKey.slice(0, 4) + '****************' + apiKey.slice(-4);
    }

    await config.save();

    await AuditLog.create({
      performedBy: req.user._id,
      performedByName: req.user.name,
      action: 'UPDATE_TELECOM_CONFIG',
      targetType: 'TELECOM',
      details: { isEnabled: config.isEnabled, providerName: config.providerName },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Telecom integration settings updated',
      config: {
        isEnabled: config.isEnabled,
        providerName: config.providerName,
        disclaimer: config.disclaimer,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit an authorized telecom inquiry request (Strict statutory warrant required)
// @route   POST /api/telecom/request-dispatch
// @access  Private (Approved Officers, Admins)
exports.requestDispatch = async (req, res, next) => {
  try {
    const { caseReference, warrantNumber, notes } = req.body;

    if (!caseReference || !warrantNumber) {
      return res.status(400).json({
        success: false,
        message: 'Case Reference and Statutory Court Warrant Number are mandatory for telecom queries.',
      });
    }

    const config = await TelecomIntegration.findOne();
    const isOnline = config && config.isEnabled && config.apiEndpoint;

    const logEntry = {
      requestedAt: new Date(),
      requestedBy: req.user._id,
      officerName: req.user.name,
      caseReference,
      warrantNumber,
      status: isOnline ? 'PENDING_APPROVAL' : 'GATEWAY_OFFLINE',
      notes: isOnline
        ? 'Statutory request queued for ministry clearance.'
        : 'Cell tower information is not available through standard browser access. Statutory gateway is currently disabled/offline.',
    };

    if (config) {
      config.accessAuditLogs.push(logEntry);
      await config.save();
    }

    await AuditLog.create({
      performedBy: req.user._id,
      performedByName: req.user.name,
      action: 'TELECOM_QUERY_SUBMITTED',
      targetType: 'TELECOM',
      details: { caseReference, warrantNumber, status: logEntry.status },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      status: logEntry.status,
      message: logEntry.notes,
      technicalNotice:
        'Cell tower information is not available through standard browser access. Browser APIs strictly cannot intercept cellular subscriber towers or IMEI data.',
      requestDetails: logEntry,
    });
  } catch (error) {
    next(error);
  }
};
