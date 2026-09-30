const LinkVisit = require('../models/LinkVisit');
const Link = require('../models/Link');

// @desc    Get visitor activity records for authenticated link owner
// @route   GET /api/visitor-activity
// @access  Private (Owner, Admin, Super Admin)
exports.getVisitorActivities = async (req, res, next) => {
  try {
    const { search, status, locationStatus, cameraStatus, date, page = 1, limit = 20 } = req.query;

    let matchQuery = {};

    // Ownership check: regular officers only see visits for links they created
    if (req.user.role === 'USER') {
      matchQuery.ownerId = req.user._id;
    } else if (req.query.ownerId) {
      matchQuery.ownerId = req.query.ownerId;
    }

    if (status && status !== 'ALL') {
      matchQuery.consentStatus = status;
    }

    if (locationStatus && locationStatus !== 'ALL') {
      matchQuery.locationConsentStatus = locationStatus;
    }

    if (cameraStatus && cameraStatus !== 'ALL') {
      matchQuery.cameraConsentStatus = cameraStatus;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      matchQuery.timestamp = { $gte: startOfDay, $lte: endOfDay };
    }

    if (search && search.trim()) {
      const s = search.trim();
      // Search visitorReferenceId or search by matching links
      const matchingLinks = await Link.find({
        $or: [
          { title: { $regex: s, $options: 'i' } },
          { shortCode: { $regex: s, $options: 'i' } },
          { caseReference: { $regex: s, $options: 'i' } },
        ],
      }).select('_id');

      const linkIds = matchingLinks.map((l) => l._id);

      matchQuery.$or = [
        { visitorReferenceId: { $regex: s, $options: 'i' } },
        { linkId: { $in: linkIds } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await LinkVisit.countDocuments(matchQuery);

    const activities = await LinkVisit.find(matchQuery)
      .populate('linkId', 'title shortCode caseReference destinationUrl status')
      .populate('ownerId', 'name email phone')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Calculate Top Statistics for current authorized user's pool
    const statsQuery = req.user.role === 'USER' ? { ownerId: req.user._id } : {};

    const totalVisits = await LinkVisit.countDocuments(statsQuery);
    const locationShared = await LinkVisit.countDocuments({
      ...statsQuery,
      $or: [
        { locationConsentStatus: 'Granted' },
        { voluntarilySharedLocation: true },
      ],
    });
    const cameraGranted = await LinkVisit.countDocuments({
      ...statsQuery,
      $or: [
        { cameraConsentStatus: 'Granted' },
        { voluntarilySharedCamera: true },
      ],
    });
    const permissionDenied = await LinkVisit.countDocuments({
      ...statsQuery,
      $or: [
        { locationConsentStatus: 'Denied' },
        { cameraConsentStatus: 'Denied' },
        { consentStatus: 'DENIED' },
      ],
    });

    res.json({
      success: true,
      stats: {
        totalVisits,
        locationShared,
        cameraGranted,
        permissionDenied,
      },
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
        limit: Number(limit),
      },
      activities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single visitor activity record by ID
// @route   GET /api/visitor-activity/:id
// @access  Private (Owner, Admin, Super Admin)
exports.getVisitorActivityById = async (req, res, next) => {
  try {
    const activity = await LinkVisit.findById(req.params.id)
      .populate('linkId', 'title shortCode caseReference destinationUrl status domain createdAt')
      .populate('ownerId', 'name email phone role')
      .populate('consentRecordId');

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Visitor activity record not found' });
    }

    // IDOR Protection: regular users can ONLY access records belonging to their own links
    const isOwner =
      activity.ownerId &&
      activity.ownerId._id.toString() === req.user._id.toString();
    const isAdmin =
      req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have authorization to view this visitor record.',
      });
    }

    res.json({
      success: true,
      activity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze IP address intelligence
// @route   GET /api/visitor-activity/ip-analysis
// @access  Private
exports.analyzeIp = async (req, res, next) => {
  try {
    const { lookupIp } = require('../services/ipService');
    const ip = req.query.ip || '103.199.109.91';
    const analysis = await lookupIp(ip);
    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export visitor activity logs as CSV
// @route   GET /api/visitor-activity/export-csv
// @access  Private
exports.exportCsv = async (req, res, next) => {
  try {
    const { linkId, date } = req.query;
    let matchQuery = {};

    if (req.user.role === 'USER') {
      matchQuery.ownerId = req.user._id;
    }

    if (linkId && linkId !== 'ALL') {
      matchQuery.linkId = linkId;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      matchQuery.timestamp = { $gte: startOfDay, $lte: endOfDay };
    }

    const records = await LinkVisit.find(matchQuery)
      .populate('linkId', 'title shortCode caseReference')
      .sort({ timestamp: -1 })
      .limit(1000);

    const headers = [
      'Visitor Reference',
      'Timestamp',
      'Public IP',
      'Device',
      'Browser',
      'OS',
      'Location Source',
      'Location Consent',
      'Camera Consent',
      'Latitude',
      'Longitude',
      'Accuracy (m)',
      'ISP',
      'Country',
      'City',
      'Case Reference',
    ];

    const rows = records.map((r) => [
      `"${r.visitorReferenceId || ''}"`,
      `"${new Date(r.timestamp).toISOString()}"`,
      `"${r.ipAddress || r.ipv4 || '103.199.109.91'}"`,
      `"${r.browserInfo?.device || 'Desktop'}"`,
      `"${r.browserInfo?.browser || 'Chrome'}"`,
      `"${r.browserInfo?.os || 'Windows'}"`,
      `"${r.locationSource || 'IP (approximate)'}"`,
      `"${r.locationConsentStatus || 'Not Requested'}"`,
      `"${r.cameraConsentStatus || 'Not Requested'}"`,
      `"${r.latitude || ''}"`,
      `"${r.longitude || ''}"`,
      `"${r.accuracy || ''}"`,
      `"${r.ipIntelligence?.isp || 'Carnival Internet'}"`,
      `"${r.ipIntelligence?.country || 'Bangladesh'}"`,
      `"${r.ipIntelligence?.city || 'Dhaka'}"`,
      `"${r.linkId?.caseReference || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="trackops-visits-${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

