const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Link = require('../models/Link');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'trackops_super_secret_jwt_key_2026_bd_secure_hash');
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'GUEST'}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

// Require approved account status
const requireApproved = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (req.user.status === 'PENDING') {
    return res.status(403).json({
      success: false,
      status: 'PENDING',
      message: 'Your account is pending administrator approval.',
    });
  }

  if (req.user.status === 'SUSPENDED') {
    return res.status(403).json({
      success: false,
      status: 'SUSPENDED',
      message: 'Your account has been suspended by an administrator.',
    });
  }

  if (req.user.status === 'REJECTED') {
    return res.status(403).json({
      success: false,
      status: 'REJECTED',
      message: 'Your account registration was rejected.',
    });
  }

  if (req.user.status !== 'APPROVED') {
    return res.status(403).json({
      success: false,
      message: 'Account is not approved to perform this action.',
    });
  }

  next();
};

// Check Link Ownership to prevent IDOR
const checkLinkOwnership = async (req, res, next) => {
  try {
    const linkId = req.params.id || req.params.linkId;
    if (!linkId) {
      return res.status(400).json({ success: false, message: 'Link ID is required' });
    }

    const link = await Link.findById(linkId);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    // Super Admin and Admin can access any link for compliance and audit
    if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN') {
      req.targetLink = link;
      return next();
    }

    // Standard User can only access own links
    if (link.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not own this link record.',
      });
    }

    req.targetLink = link;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  protect,
  authorize,
  requireApproved,
  checkLinkOwnership,
};
