const Link = require('../models/Link');
const LinkVisit = require('../models/LinkVisit');
const ConsentRecord = require('../models/ConsentRecord');

// @desc    Get aggregated analytics for dashboard
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const isRegularUser = req.user.role === 'USER';
    const linkMatch = isRegularUser ? { ownerId: req.user._id } : {};

    // 1. Core KPIs
    const totalLinks = await Link.countDocuments(linkMatch);
    const activeLinks = await Link.countDocuments({ ...linkMatch, status: 'ACTIVE' });
    const inactiveLinks = await Link.countDocuments({ ...linkMatch, status: 'INACTIVE' });
    const expiredLinks = await Link.countDocuments({ ...linkMatch, status: 'EXPIRED' });

    // Find all link IDs belonging to this user (or all if admin)
    const userLinks = await Link.find(linkMatch).select('_id clicks uniqueVisits');
    const userLinkIds = userLinks.map((l) => l._id);

    // Total visits & unique visits sum
    let totalVisits = 0;
    let totalUniqueVisits = 0;
    userLinks.forEach((l) => {
      totalVisits += l.clicks || 0;
      totalUniqueVisits += l.uniqueVisits || 0;
    });

    // 2. Daily Visits for the last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const dailyVisitsRaw = await LinkVisit.aggregate([
      {
        $match: {
          linkId: { $in: userLinkIds },
          timestamp: { $gte: fourteenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          visits: { $sum: 1 },
          locationsShared: {
            $sum: { $cond: ['$voluntarilySharedLocation', 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format daily visits into a continuous date array
    const dailyVisits = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = dailyVisitsRaw.find((item) => item._id === dateStr);
      dailyVisits.push({
        date: dateStr,
        visits: found ? found.visits : 0,
        locationsShared: found ? found.locationsShared : 0,
      });
    }

    // 3. Top performing links
    const topLinks = await Link.find(linkMatch)
      .sort({ clicks: -1 })
      .limit(6)
      .select('title shortCode caseReference clicks uniqueVisits status createdAt destinationUrl');

    // 4. Device and OS breakdown from real visits
    const deviceBreakdownRaw = await LinkVisit.aggregate([
      { $match: { linkId: { $in: userLinkIds } } },
      {
        $group: {
          _id: { $ifNull: ['$browserInfo.os', 'Unknown OS'] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const deviceBreakdown = deviceBreakdownRaw.map((item) => ({
      name: item._id || 'Unknown',
      value: item.count,
    }));

    // 5. Consent conversion rate
    const totalConsentRecords = await ConsentRecord.countDocuments({
      linkId: { $in: userLinkIds },
    });
    const grantedLocations = await ConsentRecord.countDocuments({
      linkId: { $in: userLinkIds },
      locationGranted: true,
    });
    const grantedCameras = await ConsentRecord.countDocuments({
      linkId: { $in: userLinkIds },
      cameraGranted: true,
    });

    res.json({
      success: true,
      stats: {
        totalLinks,
        activeLinks,
        inactiveLinks,
        expiredLinks,
        totalVisits,
        totalUniqueVisits,
        totalConsentRecords,
        grantedLocations,
        grantedCameras,
      },
      dailyVisits,
      topLinks,
      deviceBreakdown,
    });
  } catch (error) {
    next(error);
  }
};
