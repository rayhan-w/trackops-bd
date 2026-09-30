const User = require('../models/User');
const Link = require('../models/Link');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// @desc    Get all users (Super Admin & Admin)
// @route   GET /api/users
// @access  Private (SUPER_ADMIN, ADMIN)
exports.getUsers = async (req, res, next) => {
  try {
    const { status, role, search } = req.query;
    let query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (role && role !== 'ALL') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    // Aggregate user counts for stats
    const totalUsers = await User.countDocuments();
    const pendingUsers = await User.countDocuments({ status: 'PENDING' });
    const approvedUsers = await User.countDocuments({ status: 'APPROVED' });
    const suspendedUsers = await User.countDocuments({ status: 'SUSPENDED' });
    const totalLinks = await Link.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        pendingUsers,
        approvedUsers,
        suspendedUsers,
        totalLinks,
      },
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user details
// @route   GET /api/users/:id
// @access  Private (SUPER_ADMIN, ADMIN)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const linksCount = await Link.countDocuments({ ownerId: user._id });

    res.json({
      success: true,
      user,
      linksCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve user account
// @route   PATCH /api/users/:id/approve
// @access  Private (SUPER_ADMIN)
exports.approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = 'APPROVED';
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    user.rejectionReason = null;
    user.suspensionReason = null;
    await user.save();

    // Create notification for user
    await Notification.create({
      userId: user._id,
      title: 'Account Approved',
      message: 'Congratulations! Your TrackOps BD account has been verified and approved. You can now create and manage links.',
      type: 'ACCOUNT_APPROVED',
    });

    // Audit log
    await AuditLog.create({
      performedBy: req.user._id,
      performedByName: req.user.name,
      action: 'APPROVE_USER',
      targetType: 'USER',
      targetId: user._id.toString(),
      details: { userName: user.name, userEmail: user.email },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Account for ${user.name} approved successfully. User can now create links.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject user account
// @route   PATCH /api/users/:id/reject
// @access  Private (SUPER_ADMIN)
exports.rejectUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = 'REJECTED';
    user.rejectionReason = reason || 'Documentation verification failed or unverified entity.';
    await user.save();

    // Create notification
    await Notification.create({
      userId: user._id,
      title: 'Account Registration Rejected',
      message: `Your registration request was rejected. Reason: ${user.rejectionReason}`,
      type: 'ACCOUNT_REJECTED',
    });

    await AuditLog.create({
      performedBy: req.user._id,
      performedByName: req.user.name,
      action: 'REJECT_USER',
      targetType: 'USER',
      targetId: user._id.toString(),
      details: { userName: user.name, reason: user.rejectionReason },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `User ${user.name} has been rejected.`,
      user: {
        id: user._id,
        status: user.status,
        rejectionReason: user.rejectionReason,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend user account
// @route   PATCH /api/users/:id/suspend
// @access  Private (SUPER_ADMIN)
exports.suspendUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'SUPER_ADMIN' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot suspend your own Super Admin account' });
    }

    user.status = 'SUSPENDED';
    user.suspensionReason = reason || 'Administrative policy audit suspension.';
    await user.save();

    await Notification.create({
      userId: user._id,
      title: 'Account Suspended',
      message: `Your account has been suspended by administration. Reason: ${user.suspensionReason}`,
      type: 'ACCOUNT_SUSPENDED',
    });

    await AuditLog.create({
      performedBy: req.user._id,
      performedByName: req.user.name,
      action: 'SUSPEND_USER',
      targetType: 'USER',
      targetId: user._id.toString(),
      details: { userName: user.name, reason: user.suspensionReason },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `User ${user.name} suspended.`,
      user: {
        id: user._id,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore user account to APPROVED
// @route   PATCH /api/users/:id/restore
// @access  Private (SUPER_ADMIN)
exports.restoreUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = 'APPROVED';
    user.suspensionReason = null;
    user.rejectionReason = null;
    await user.save();

    await Notification.create({
      userId: user._id,
      title: 'Account Restored',
      message: 'Your account access has been restored to APPROVED status.',
      type: 'ACCOUNT_RESTORED',
    });

    await AuditLog.create({
      performedBy: req.user._id,
      performedByName: req.user.name,
      action: 'RESTORE_USER',
      targetType: 'USER',
      targetId: user._id.toString(),
      details: { userName: user.name },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `User ${user.name} restored to Approved.`,
      user: {
        id: user._id,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user role (SUPER_ADMIN only)
// @route   PATCH /api/users/:id/role
// @access  Private (SUPER_ADMIN)
exports.changeRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['SUPER_ADMIN', 'ADMIN', 'USER'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await Notification.create({
      userId: user._id,
      title: 'Role Updated',
      message: `Your system permissions have been updated to ${role}.`,
      type: 'ROLE_CHANGED',
    });

    await AuditLog.create({
      performedBy: req.user._id,
      performedByName: req.user.name,
      action: 'CHANGE_ROLE',
      targetType: 'USER',
      targetId: user._id.toString(),
      details: { userName: user.name, fromRole: oldRole, toRole: role },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `User role changed from ${oldRole} to ${role}`,
      user: {
        id: user._id,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account (SUPER_ADMIN only)
// @route   DELETE /api/users/:id
// @access  Private (SUPER_ADMIN)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    const userName = user.name;
    const userEmail = user.email;

    // Delete associated links
    await Link.deleteMany({ ownerId: user._id });
    await User.findByIdAndDelete(user._id);

    await AuditLog.create({
      performedBy: req.user._id,
      performedByName: req.user.name,
      action: 'DELETE_USER',
      targetType: 'USER',
      targetId: req.params.id,
      details: { name: userName, email: userEmail },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `User account ${userName} and related data deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Audit Logs
// @route   GET /api/users/audit-logs
// @access  Private (SUPER_ADMIN, ADMIN)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};
