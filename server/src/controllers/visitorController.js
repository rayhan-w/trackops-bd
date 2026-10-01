const crypto = require('crypto');
const Link = require('../models/Link');
const LinkVisit = require('../models/LinkVisit');
const ConsentRecord = require('../models/ConsentRecord');
const Notification = require('../models/Notification');
const { lookupIp } = require('../services/ipService');
const { parseUserAgent } = require('../utils/deviceParser');

// Helper to hash IP address for privacy
const hashIp = (ip) => {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip + (process.env.JWT_SECRET || 'salt')).digest('hex').substring(0, 16);
};

// Get client IP
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || req.ip || '103.199.109.91';
};

// Generate human-readable visitor reference ID
const generateVisitorRef = () => {
  return `VIS-${Date.now().toString().slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// @desc    Resolve short link details for visitor landing page
// @route   GET /api/visitor/resolve/:shortCode
// @access  Public
exports.resolveLink = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const link = await Link.findOne({ shortCode });

    if (!link) {
      return res.status(404).json({
        success: false,
        errorType: 'NOT_FOUND',
        message: 'The requested short link was not found or has been removed.',
      });
    }

    if (link.status === 'INACTIVE') {
      return res.status(410).json({
        success: false,
        errorType: 'INACTIVE',
        message: 'This link has been deactivated by the authorized case officer.',
      });
    }

    if (link.expirationDate && new Date(link.expirationDate) < new Date()) {
      return res.status(410).json({
        success: false,
        errorType: 'EXPIRED',
        message: 'This case verification link has expired.',
      });
    }

    res.json({
      success: true,
      link: {
        id: link._id,
        shortCode: link.shortCode,
        title: link.title,
        description: link.description,
        caseReference: link.caseReference,
        destinationUrl: link.destinationUrl,
        requiresConsentNotice: link.requiresConsentNotice,
        domain: link.domain,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record visitor consent decision and optional voluntarily shared data
// @route   POST /api/visitor/consent/:shortCode
// @access  Public
exports.recordConsent = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const {
      visitorSessionId,
      visitorReferenceId,
      consentStatus, // GRANTED, DENIED, PARTIAL, DISMISSED
      locationConsentStatus, // 'Granted' | 'Denied' | 'Not Requested' | 'Unavailable'
      cameraConsentStatus, // 'Granted' | 'Denied' | 'Not Requested' | 'Unavailable'
      cameraStatus, // 'Available' | 'Unavailable'
      locationGranted,
      cameraGranted,
      browserInfoGranted,
      latitude,
      longitude,
      accuracy,
      cameraSnapshot,
      browserInfo,
    } = req.body;

    const link = await Link.findOne({ shortCode });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    const sessionId = visitorSessionId || crypto.randomUUID();
    const visitorRef = visitorReferenceId || generateVisitorRef();
    const anonymizedIp = hashIp(req.ip);

    // Normalize location & camera statuses
    const normalizedLocStatus =
      locationConsentStatus || (locationGranted ? 'Granted' : 'Denied');
    const normalizedCamStatus =
      cameraConsentStatus || (cameraGranted ? 'Granted' : 'Denied');

    const isLocationVoluntary = Boolean(
      normalizedLocStatus === 'Granted' && latitude && longitude
    );
    const isCameraVoluntary = Boolean(
      normalizedCamStatus === 'Granted' && cameraSnapshot
    );

    // Overall permission type
    let permissionType = 'NONE';
    if (isLocationVoluntary && isCameraVoluntary) {
      permissionType = 'ALL';
    } else if (isLocationVoluntary) {
      permissionType = 'LOCATION';
    } else if (isCameraVoluntary) {
      permissionType = 'CAMERA';
    } else if (browserInfoGranted) {
      permissionType = 'BROWSER_INFO';
    }

    // 1. Create Consent Record
    const consentRecord = await ConsentRecord.create({
      linkId: link._id,
      visitorSessionId: sessionId,
      consentStatus:
        consentStatus ||
        (isLocationVoluntary || isCameraVoluntary ? 'GRANTED' : 'DENIED'),
      permissionType,
      locationGranted: isLocationVoluntary,
      cameraGranted: isCameraVoluntary,
      browserInfoGranted: Boolean(browserInfoGranted),
      noticeAcknowledged: true,
      anonymizedIp,
      userAgent: req.headers['user-agent'] || '',
      timestamp: new Date(),
    });

    // Resolve client IP and intelligence
    const clientIp = getClientIp(req);
    const ipDetails = await lookupIp(clientIp);

    const clientHints = {
      model: browserInfo?.rawModel || browserInfo?.model || req.headers['sec-ch-ua-model'],
      platform: browserInfo?.platform || req.headers['sec-ch-ua-platform'],
      platformVersion: browserInfo?.platformVersion || req.headers['sec-ch-ua-platform-version'],
      isMobile: browserInfo?.isMobile,
    };

    const parsedUA = parseUserAgent(req.headers['user-agent'] || '', clientHints);

    let resolvedModel = 'Model unavailable';
    if (browserInfo?.model && browserInfo.model !== 'Model unavailable' && browserInfo.model !== 'Mobile' && browserInfo.model !== 'Desktop') {
      resolvedModel = browserInfo.model;
    } else if (parsedUA.model && parsedUA.model !== 'Model unavailable') {
      resolvedModel = parsedUA.model;
    } else if (browserInfo?.rawModel) {
      resolvedModel = browserInfo.rawModel;
    }

    let resolvedManufacturer = 'N/A';
    if (browserInfo?.manufacturer && browserInfo.manufacturer !== 'N/A') {
      resolvedManufacturer = browserInfo.manufacturer;
    } else if (parsedUA.manufacturer && parsedUA.manufacturer !== 'N/A') {
      resolvedManufacturer = parsedUA.manufacturer;
    }

    const mergedBrowserInfo = {
      ...(browserInfo || {}),
      deviceType: parsedUA.deviceType || (browserInfo && browserInfo.deviceType) || 'Desktop',
      manufacturer: resolvedManufacturer,
      model: resolvedModel,
      deviceName: resolvedModel,
      os: parsedUA.os || (browserInfo && browserInfo.os) || 'Unknown OS',
      osVersion: parsedUA.osVersion || (browserInfo && browserInfo.osVersion) || 'N/A',
      browser: parsedUA.browser || (browserInfo && browserInfo.browser) || 'Unknown Browser',
      browserVersion: parsedUA.browserVersion || (browserInfo && browserInfo.browserVersion) || 'N/A',
      screenCategory: browserInfo && browserInfo.screenResolution
        ? (parseInt(browserInfo.screenResolution) < 768 ? 'Mobile Screen' : 'Desktop Screen')
        : (browserInfo && browserInfo.screenCategory) || 'Standard',
      userAgent: req.headers['user-agent'] || (browserInfo && browserInfo.userAgent) || '',
    };

    // 2. Create LinkVisit
    const now = new Date();
    const visit = await LinkVisit.create({
      linkId: link._id,
      ownerId: link.ownerId,
      visitorReferenceId: visitorRef,
      consentRecordId: consentRecord._id,
      visitorSessionId: sessionId,
      ipHash: anonymizedIp,
      ipAddress: ipDetails.ipAddress,
      ipv4: ipDetails.ipv4,
      ipv6: ipDetails.ipv6,
      internalIp: req.socket?.remoteAddress?.startsWith('::ffff:') ? req.socket.remoteAddress : ipDetails.internalIp,
      referrer: req.headers['referer'] || (browserInfo && browserInfo.referrer) || 'https://protidinernews.xyz/',
      locationSource: isLocationVoluntary ? 'GPS (exact)' : 'IP (approximate)',
      ipIntelligence: {
        isp: ipDetails.isp,
        organization: ipDetails.organization,
        asn: ipDetails.asn,
        asName: ipDetails.asName,
        reverseDns: ipDetails.reverseDns,
        continent: ipDetails.continent,
        country: ipDetails.country,
        countryCode: ipDetails.countryCode,
        region: ipDetails.region,
        city: ipDetails.city,
        postalCode: ipDetails.postalCode,
        timezone: ipDetails.timezone,
        utcOffset: ipDetails.utcOffset,
        currency: ipDetails.currency,
        isMobile: ipDetails.isMobile,
        isProxy: ipDetails.isProxy,
        isHosting: ipDetails.isHosting,
        coordinates: ipDetails.coordinates,
      },
      timestamp: now,
      visitTimestamp: now,
      consentTimestamp: now,
      consentStatus: consentRecord.consentStatus,
      locationConsentStatus: normalizedLocStatus,
      cameraConsentStatus: normalizedCamStatus,
      cameraStatus: cameraStatus || (cameraSnapshot ? 'Available' : 'Unavailable'),
      voluntarilySharedLocation: isLocationVoluntary,
      latitude: isLocationVoluntary ? Number(latitude) : (ipDetails.coordinates?.latitude || null),
      longitude: isLocationVoluntary ? Number(longitude) : (ipDetails.coordinates?.longitude || null),
      accuracy: isLocationVoluntary ? Number(accuracy) : 25000,
      voluntarilySharedCamera: isCameraVoluntary,
      cameraSnapshot: isCameraVoluntary ? cameraSnapshot : null,
      browserInfoShared: Boolean(browserInfoGranted),
      browserInfo: mergedBrowserInfo,
    });

    // 3. Increment counters
    link.clicks += 1;
    const existingVisitsCount = await LinkVisit.countDocuments({
      linkId: link._id,
      visitorSessionId: sessionId,
    });
    if (existingVisitsCount <= 1) {
      link.uniqueVisits += 1;
    }
    await link.save();

    // 4. Notify Link Owner
    await Notification.create({
      userId: link.ownerId,
      title: `Visitor Consent Recorded [${visitorRef}]`,
      message: `Link [${link.shortCode}] inquiry: Location ${normalizedLocStatus}, Camera ${normalizedCamStatus}.`,
      type: 'LINK_VISIT',
      metadata: { linkId: link._id, visitId: visit._id, visitorReferenceId: visitorRef },
    });

    res.json({
      success: true,
      message: 'Consent recorded successfully',
      destinationUrl: link.destinationUrl,
      visitId: visit._id,
      visitorReferenceId: visitorRef,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Skip consent and proceed straight to destination
// @route   POST /api/visitor/skip/:shortCode
// @access  Public
exports.skipConsent = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const { visitorSessionId, visitorReferenceId, browserInfo } = req.body;

    const link = await Link.findOne({ shortCode });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    const sessionId = visitorSessionId || crypto.randomUUID();
    const visitorRef = visitorReferenceId || generateVisitorRef();
    const anonymizedIp = hashIp(req.ip);
    const now = new Date();

    const clientIp = getClientIp(req);
    const ipDetails = await lookupIp(clientIp);

    const clientHints = {
      model: browserInfo?.rawModel || browserInfo?.model || req.headers['sec-ch-ua-model'],
      platform: browserInfo?.platform || req.headers['sec-ch-ua-platform'],
      platformVersion: browserInfo?.platformVersion || req.headers['sec-ch-ua-platform-version'],
      isMobile: browserInfo?.isMobile,
    };

    const parsedUA = parseUserAgent(req.headers['user-agent'] || '', clientHints);

    let resolvedModel = 'Model unavailable';
    if (browserInfo?.model && browserInfo.model !== 'Model unavailable' && browserInfo.model !== 'Mobile' && browserInfo.model !== 'Desktop') {
      resolvedModel = browserInfo.model;
    } else if (parsedUA.model && parsedUA.model !== 'Model unavailable') {
      resolvedModel = parsedUA.model;
    } else if (browserInfo?.rawModel) {
      resolvedModel = browserInfo.rawModel;
    }

    let resolvedManufacturer = 'N/A';
    if (browserInfo?.manufacturer && browserInfo.manufacturer !== 'N/A') {
      resolvedManufacturer = browserInfo.manufacturer;
    } else if (parsedUA.manufacturer && parsedUA.manufacturer !== 'N/A') {
      resolvedManufacturer = parsedUA.manufacturer;
    }

    const skippedBrowserInfo = {
      ...(browserInfo || {}),
      deviceType: parsedUA.deviceType || (browserInfo && browserInfo.deviceType) || 'Desktop',
      manufacturer: resolvedManufacturer,
      model: resolvedModel,
      deviceName: resolvedModel,
      os: parsedUA.os || (browserInfo && browserInfo.os) || 'Unknown OS',
      osVersion: parsedUA.osVersion || (browserInfo && browserInfo.osVersion) || 'N/A',
      browser: parsedUA.browser || (browserInfo && browserInfo.browser) || 'Unknown Browser',
      browserVersion: parsedUA.browserVersion || (browserInfo && browserInfo.browserVersion) || 'N/A',
      screenCategory: browserInfo && browserInfo.screenResolution
        ? (parseInt(browserInfo.screenResolution) < 768 ? 'Mobile Screen' : 'Desktop Screen')
        : 'Standard',
      userAgent: req.headers['user-agent'] || (browserInfo && browserInfo.userAgent) || '',
    };

    // Record skipped visit
    const visit = await LinkVisit.create({
      linkId: link._id,
      ownerId: link.ownerId,
      visitorReferenceId: visitorRef,
      visitorSessionId: sessionId,
      ipHash: anonymizedIp,
      ipAddress: ipDetails.ipAddress,
      ipv4: ipDetails.ipv4,
      ipv6: ipDetails.ipv6,
      internalIp: req.socket?.remoteAddress?.startsWith('::ffff:') ? req.socket.remoteAddress : ipDetails.internalIp,
      referrer: req.headers['referer'] || 'https://protidinernews.xyz/',
      locationSource: 'IP (approximate)',
      ipIntelligence: {
        isp: ipDetails.isp,
        organization: ipDetails.organization,
        asn: ipDetails.asn,
        asName: ipDetails.asName,
        reverseDns: ipDetails.reverseDns,
        continent: ipDetails.continent,
        country: ipDetails.country,
        countryCode: ipDetails.countryCode,
        region: ipDetails.region,
        city: ipDetails.city,
        postalCode: ipDetails.postalCode,
        timezone: ipDetails.timezone,
        utcOffset: ipDetails.utcOffset,
        currency: ipDetails.currency,
        isMobile: ipDetails.isMobile,
        isProxy: ipDetails.isProxy,
        isHosting: ipDetails.isHosting,
        coordinates: ipDetails.coordinates,
      },
      latitude: ipDetails.coordinates?.latitude || null,
      longitude: ipDetails.coordinates?.longitude || null,
      accuracy: 25000,
      consentStatus: 'SKIPPED',
      locationConsentStatus: 'Not Requested',
      cameraConsentStatus: 'Not Requested',
      cameraStatus: 'Unavailable',
      voluntarilySharedLocation: false,
      voluntarilySharedCamera: false,
      browserInfoShared: false,
      browserInfo: skippedBrowserInfo,
      timestamp: now,
      visitTimestamp: now,
      consentTimestamp: now,
    });

    link.clicks += 1;
    const existingVisitsCount = await LinkVisit.countDocuments({
      linkId: link._id,
      visitorSessionId: sessionId,
    });
    if (existingVisitsCount <= 1) {
      link.uniqueVisits += 1;
    }
    await link.save();

    res.json({
      success: true,
      destinationUrl: link.destinationUrl,
      visitId: visit._id,
    });
  } catch (error) {
    next(error);
  }
};
