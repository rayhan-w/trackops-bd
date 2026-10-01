const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { parseUserAgent } = require('../utils/deviceParser');

// Generate JWT Token
const generateToken = (id, sessionId = null) => {
  return jwt.sign({ id, sessionId }, process.env.JWT_SECRET || 'trackops_super_secret_jwt_key_2026_bd_secure_hash', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user (Status = PENDING)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, confirmPassword, rank, currentPosting, posting } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full Name is required' });
    }

    if (!rank || !rank.trim()) {
      return res.status(400).json({ success: false, message: 'Rank is required' });
    }

    const postingValue = (currentPosting || posting || '').trim();
    if (!postingValue) {
      return res.status(400).json({ success: false, message: 'Current Posting is required' });
    }

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either an Email address or a Phone number for registration',
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Check duplicate email
    if (email) {
      const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists',
        });
      }
    }

    // Check duplicate phone
    if (phone) {
      const phoneExists = await User.findOne({ phone: phone.trim() });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this phone number already exists',
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user with PENDING status
    const user = await User.create({
      name: name.trim(),
      email: email ? email.toLowerCase().trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      passwordHash,
      role: 'USER',
      status: 'PENDING',
      rank: rank.trim(),
      posting: postingValue,
      allowedDeviceLimit: null, // Admin / Super Admin will configure as needed
      activeSessions: [],
    });

    // Notify Super Admins
    const superAdmins = await User.find({ role: 'SUPER_ADMIN' });
    for (const sa of superAdmins) {
      await Notification.create({
        userId: sa._id,
        title: 'New Account Pending Approval',
        message: `User ${user.name} (${user.rank || 'N/A'}, ${user.posting || 'N/A'}) registered and is awaiting approval.`,
        type: 'ACCOUNT_STATUS',
        metadata: { applicantId: user._id },
      });
    }

    // Audit log
    await AuditLog.create({
      action: 'USER_REGISTERED',
      targetType: 'USER',
      targetId: user._id.toString(),
      details: { name: user.name, email: user.email, phone: user.phone, rank: user.rank, posting: user.posting },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      status: 'PENDING',
      message: 'Your account has been registered successfully. Please wait for administrator approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        rank: user.rank,
        posting: user.posting,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Email or Phone number and Password',
      });
    }

    const cleanIdentifier = identifier.trim();

    // Query user by email OR phone
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { phone: cleanIdentifier },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid login credentials',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid login credentials',
      });
    }

    // 1. Check if account is expired (Requirement 5)
    if (user.role !== 'SUPER_ADMIN' && user.expiryDate) {
      const expiryTime = new Date(user.expiryDate).getTime();
      if (!isNaN(expiryTime) && expiryTime < Date.now()) {
        return res.status(403).json({
          success: false,
          status: 'EXPIRED',
          message: 'Your account access has expired. Please contact the administrator to renew access.',
        });
      }
    }

    // 2. Parse device info and check device login limit (Requirement 6)
    const userAgent = req.headers['user-agent'] || '';
    const clientHints = {
      model: req.body?.clientDevice?.model || req.headers['sec-ch-ua-model'],
      platform: req.body?.clientDevice?.platform || req.headers['sec-ch-ua-platform'],
      platformVersion: req.body?.clientDevice?.platformVersion,
    };
    const parsedUA = parseUserAgent(userAgent, clientHints);
    const userSessions = Array.isArray(user.activeSessions) ? [...user.activeSessions] : [];
    const activeSessions = userSessions.filter((s) => s.status === 'ACTIVE');

    // Super Admin & Admin are completely unrestricted by default.
    // Device limit is only enforced if the account is a regular USER and allowedDeviceLimit is explicitly set > 0.
    const isRestrictedRole = user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN';
    const allowedLimit = user.allowedDeviceLimit != null ? Number(user.allowedDeviceLimit) : null;

    if (isRestrictedRole && allowedLimit && allowedLimit > 0 && activeSessions.length >= allowedLimit) {
      if (req.body?.terminateOtherSessions) {
        // User requested to revoke other active sessions to log in here
        user.activeSessions = userSessions.map((s) => {
          if (s.status === 'ACTIVE') {
            return { ...s, status: 'REVOKED', revokedAt: new Date() };
          }
          return s;
        });
      } else {
        return res.status(403).json({
          success: false,
          status: 'DEVICE_LIMIT_REACHED',
          message: 'You have reached your maximum allowed device limit. Please log out from an existing device or contact your administrator.',
          allowedLimit,
          activeSessions,
          userId: user._id,
        });
      }
    }

    const sessionId = 'SES-' + crypto.randomBytes(8).toString('hex');
    const deviceName = parsedUA.model && parsedUA.model !== 'Model unavailable'
      ? (parsedUA.manufacturer !== 'N/A' && !parsedUA.model.includes(parsedUA.manufacturer)
          ? `${parsedUA.manufacturer} ${parsedUA.model}`
          : parsedUA.model)
      : `${parsedUA.os} (${parsedUA.browser})`;

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '127.0.0.1';

    const newSession = {
      sessionId,
      deviceName,
      manufacturer: parsedUA.manufacturer,
      model: parsedUA.model,
      deviceType: parsedUA.deviceType,
      browser: parsedUA.browser + (parsedUA.browserVersion && parsedUA.browserVersion !== 'N/A' ? ` ${parsedUA.browserVersion}` : ''),
      operatingSystem: parsedUA.os + (parsedUA.osVersion && parsedUA.osVersion !== 'N/A' ? ` ${parsedUA.osVersion}` : ''),
      ipAddress: clientIp,
      firstLogin: new Date(),
      lastActive: new Date(),
      status: 'ACTIVE',
    };

    userSessions.push(newSession);
    user.activeSessions = userSessions;
    await user.save();

    const token = generateToken(user._id, sessionId);

    // Record login audit log
    await AuditLog.create({
      performedBy: user._id,
      performedByName: user.name,
      action: 'USER_LOGIN',
      targetType: 'AUTH',
      targetId: user._id.toString(),
      details: { sessionId, deviceName, manufacturer: parsedUA.manufacturer, model: parsedUA.model, ip: clientIp },
      ipAddress: clientIp,
    });

    res.json({
      success: true,
      token,
      sessionId,
      currentSession: newSession,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        rank: user.rank,
        posting: user.posting,
        activationDate: user.activationDate,
        expiryDate: user.expiryDate,
        allowedDeviceLimit: user.allowedDeviceLimit,
        activeSessions: user.activeSessions,
        rejectionReason: user.rejectionReason,
        suspensionReason: user.suspensionReason,
        notificationPreferences: user.notificationPreferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const sessionsWithCurrent = Array.isArray(user.activeSessions)
      ? user.activeSessions.map((s) => ({
          ...s,
          isCurrent: s.sessionId === req.sessionId,
        }))
      : [];

    const userObj = user.toObject ? user.toObject() : { ...user };
    userObj.activeSessions = sessionsWithCurrent;
    userObj.currentSessionId = req.sessionId;

    res.json({
      success: true,
      currentSessionId: req.sessionId,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke all other sessions for current user
// @route   POST /api/auth/revoke-other-sessions
// @access  Private
exports.revokeOtherSessions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentSessionId = req.sessionId;
    const sessions = Array.isArray(user.activeSessions) ? [...user.activeSessions] : [];

    user.activeSessions = sessions.map((s) => {
      if (s.sessionId !== currentSessionId && s.status === 'ACTIVE') {
        return { ...s, status: 'REVOKED', revokedAt: new Date() };
      }
      return s;
    });

    await user.save();

    res.json({
      success: true,
      message: 'All other device sessions have been revoked.',
      activeSessions: user.activeSessions.map((s) => ({
        ...s,
        isCurrent: s.sessionId === currentSessionId,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, notificationPreferences } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (email && email.toLowerCase().trim() !== user.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id },
      });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      user.email = email.toLowerCase().trim();
    }
    if (phone && phone.trim() !== user.phone) {
      const phoneExists = await User.findOne({
        phone: phone.trim(),
        _id: { $ne: user._id },
      });
      if (phoneExists) {
        return res.status(400).json({ success: false, message: 'Phone already in use' });
      }
      user.phone = phone.trim();
    }

    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences,
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        notificationPreferences: user.notificationPreferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match',
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match records',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await AuditLog.create({
      performedBy: user._id,
      performedByName: user.name,
      action: 'PASSWORD_CHANGED',
      targetType: 'AUTH',
      targetId: user._id.toString(),
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
