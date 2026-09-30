const crypto = require('crypto');
const Link = require('../models/Link');
const LinkVisit = require('../models/LinkVisit');
const ConsentRecord = require('../models/ConsentRecord');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// Generate safe alphanumeric short code
const generateShortCode = (length = 7) => {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
};

// Simple URL validation
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

// @desc    Create a new short link
// @route   POST /api/links
// @access  Private (APPROVED users only)
exports.createLink = async (req, res, next) => {
  try {
    const {
      destinationUrl,
      domain,
      customShortCode,
      title,
      description,
      caseReference,
      expirationDate,
      status,
      metadata,
    } = req.body;

    if (!destinationUrl) {
      return res.status(400).json({ success: false, message: 'Destination URL is required' });
    }

    if (!isValidUrl(destinationUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination URL format. Please include http:// or https://',
      });
    }

    let shortCode = customShortCode ? customShortCode.trim() : null;

    if (shortCode) {
      // Validate code characters: alphanumeric, hyphen, underscore
      if (!/^[a-zA-Z0-9_-]{3,30}$/.test(shortCode)) {
        return res.status(400).json({
          success: false,
          message: 'Custom code must be 3-30 characters containing only letters, numbers, hyphens, and underscores',
        });
      }

      // Check duplicate
      const existing = await Link.findOne({ shortCode });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Short code '${shortCode}' is already taken. Please choose another or generate randomly.`,
        });
      }
    } else {
      // Generate unique random code
      let isUnique = false;
      while (!isUnique) {
        shortCode = generateShortCode(6);
        const existing = await Link.findOne({ shortCode });
        if (!existing) isUnique = true;
      }
    }

    const link = await Link.create({
      ownerId: req.user._id,
      destinationUrl: destinationUrl.trim(),
      shortCode,
      domain: domain || 'trackops.link',
      title: title ? title.trim() : (caseReference ? `${caseReference} - Target` : 'Target Link'),
      description: description ? description.trim() : '',
      caseReference: caseReference ? caseReference.trim() : 'CASE-GENERAL',
      status: status || 'ACTIVE',
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      metadata: metadata || {},
    });

    // Notify user
    await Notification.create({
      userId: req.user._id,
      title: 'Link Created Successfully',
      message: `Link with code [${link.shortCode}] for case ${link.caseReference} is now active.`,
      type: 'LINK_CREATED',
      metadata: { linkId: link._id, shortCode: link.shortCode },
    });

    // Audit log
    await AuditLog.create({
      performedBy: req.user._id,
      performedByName: req.user.name,
      action: 'CREATE_LINK',
      targetType: 'LINK',
      targetId: link._id.toString(),
      details: { shortCode: link.shortCode, caseReference: link.caseReference },
      ipAddress: req.ip,
    });

    const fullShortUrl = `${process.env.CLIENT_URL || process.env.BASE_SHORT_DOMAIN || process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/l/${link.shortCode}`;

    res.status(201).json({
      success: true,
      message: 'Link created successfully',
      link: {
        ...link.toObject(),
        fullShortUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get links for current user (or all if Super Admin / Admin)
// @route   GET /api/links
// @access  Private
exports.getLinks = async (req, res, next) => {
  try {
    const { status, search, caseReference, page = 1, limit = 20 } = req.query;
    let query = {};

    // If regular user, only view own links
    if (req.user.role === 'USER') {
      query.ownerId = req.user._id;
    } else if (req.query.ownerId) {
      query.ownerId = req.query.ownerId;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (caseReference) {
      query.caseReference = { $regex: caseReference, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
        { destinationUrl: { $regex: search, $options: 'i' } },
        { caseReference: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Link.countDocuments(query);

    const links = await Link.find(query)
      .populate('ownerId', 'name email phone role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const baseUrl = process.env.CLIENT_URL || process.env.BASE_SHORT_DOMAIN || process.env.CLIENT_ORIGIN || 'http://localhost:3000';
    const formattedLinks = links.map((link) => ({
      ...link.toObject(),
      fullShortUrl: `${baseUrl}/l/${link.shortCode}`,
    }));

    // Calculate user summary stats
    const userQuery = req.user.role === 'USER' ? { ownerId: req.user._id } : {};
    const totalLinksCount = await Link.countDocuments(userQuery);
    
    // Aggregate clicks and unique visits
    const aggregateStats = await Link.aggregate([
      { $match: userQuery },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: '$clicks' },
          totalUniqueVisits: { $sum: '$uniqueVisits' },
        },
      },
    ]);

    const stats = {
      totalLinks: totalLinksCount,
      totalClicks: aggregateStats[0]?.totalClicks || 0,
      uniqueVisits: aggregateStats[0]?.totalUniqueVisits || 0,
    };

    res.json({
      success: true,
      stats,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
      links: formattedLinks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single link by ID with activity highlights
// @route   GET /api/links/:id
// @access  Private (Owner, Admin, Super Admin)
exports.getLinkById = async (req, res, next) => {
  try {
    const link = await Link.findById(req.params.id).populate('ownerId', 'name email phone');
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    // Role check
    if (req.user.role === 'USER' && link.ownerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized link access' });
    }

    const baseUrl = process.env.CLIENT_URL || process.env.BASE_SHORT_DOMAIN || process.env.CLIENT_ORIGIN || 'http://localhost:3000';

    // Fetch recent visits
    const recentVisits = await LinkVisit.find({ linkId: link._id })
      .sort({ timestamp: -1 })
      .limit(25);

    // Consent records summary
    const consentGrantedCount = await ConsentRecord.countDocuments({
      linkId: link._id,
      locationGranted: true,
    });

    const cameraGrantedCount = await ConsentRecord.countDocuments({
      linkId: link._id,
      cameraGranted: true,
    });

    res.json({
      success: true,
      link: {
        ...link.toObject(),
        fullShortUrl: `${baseUrl}/l/${link.shortCode}`,
      },
      stats: {
        totalVisits: link.clicks,
        uniqueVisits: link.uniqueVisits,
        locationGrantedCount,
        cameraGrantedCount,
      },
      recentVisits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update link
// @route   PUT /api/links/:id
// @access  Private (Owner, Admin, Super Admin)
exports.updateLink = async (req, res, next) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    if (req.user.role === 'USER' && link.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized modification' });
    }

    const {
      destinationUrl,
      title,
      description,
      caseReference,
      status,
      expirationDate,
    } = req.body;

    if (destinationUrl) {
      if (!isValidUrl(destinationUrl)) {
        return res.status(400).json({ success: false, message: 'Invalid destination URL format' });
      }
      link.destinationUrl = destinationUrl.trim();
    }

    if (title !== undefined) link.title = title.trim();
    if (description !== undefined) link.description = description.trim();
    if (caseReference !== undefined) link.caseReference = caseReference.trim();
    if (status !== undefined) link.status = status;
    if (expirationDate !== undefined) {
      link.expirationDate = expirationDate ? new Date(expirationDate) : null;
    }

    await link.save();

    await AuditLog.create({
      performedBy: req.user._id,
      performedByName: req.user.name,
      action: 'UPDATE_LINK',
      targetType: 'LINK',
      targetId: link._id.toString(),
      details: { title: link.title, status: link.status },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Link updated successfully',
      link,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete link
// @route   DELETE /api/links/:id
// @access  Private (Owner, Admin, Super Admin)
exports.deleteLink = async (req, res, next) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    if (req.user.role === 'USER' && link.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized deletion' });
    }

    const shortCode = link.shortCode;

    // Delete associated visits and consent records
    await LinkVisit.deleteMany({ linkId: link._id });
    await ConsentRecord.deleteMany({ linkId: link._id });
    await Link.findByIdAndDelete(link._id);

    await AuditLog.create({
      performedBy: req.user._id,
      performedByName: req.user.name,
      action: 'DELETE_LINK',
      targetType: 'LINK',
      targetId: req.params.id,
      details: { shortCode },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Link [${shortCode}] and related activity logs deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed activity and geolocation map points for a link
// @route   GET /api/links/:id/activity
// @access  Private (Owner, Admin, Super Admin)
exports.getLinkActivity = async (req, res, next) => {
  try {
    const link = await Link.findById(req.params.id).populate('ownerId', 'name email');
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    if (req.user.role === 'USER' && link.ownerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const visits = await LinkVisit.find({ linkId: link._id })
      .populate('consentRecordId')
      .sort({ timestamp: -1 })
      .limit(100);

    // Filter points that have voluntarily shared coordinates
    const geoPoints = visits
      .filter((v) => v.voluntarilySharedLocation && v.latitude && v.longitude)
      .map((v) => ({
        id: v._id,
        latitude: v.latitude,
        longitude: v.longitude,
        accuracy: v.accuracy,
        timestamp: v.timestamp,
        browser: v.browserInfo?.browser,
        os: v.browserInfo?.os,
      }));

    res.json({
      success: true,
      link,
      totalVisits: link.clicks,
      uniqueVisits: link.uniqueVisits,
      geoPoints,
      visits,
    });
  } catch (error) {
    next(error);
  }
};
