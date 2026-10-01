const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  approveUser,
  rejectUser,
  suspendUser,
  restoreUser,
  changeRole,
  deleteUser,
  getAuditLogs,
  updateUserExpiry,
  updateDeviceLimit,
  getUserSessions,
  revokeUserSession,
  revokeAllUserSessions,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All user management routes require login
router.use(protect);

router.get('/audit-logs', authorize('SUPER_ADMIN', 'ADMIN'), getAuditLogs);
router.get('/', authorize('SUPER_ADMIN', 'ADMIN'), getUsers);
router.get('/:id', authorize('SUPER_ADMIN', 'ADMIN'), getUserById);

// Expiry and Device Limit management (SUPER_ADMIN, ADMIN)
router.patch('/:id/expiry', authorize('SUPER_ADMIN', 'ADMIN'), updateUserExpiry);
router.patch('/:id/device-limit', authorize('SUPER_ADMIN', 'ADMIN'), updateDeviceLimit);

// Session management
router.get('/:id/sessions', getUserSessions);
router.delete('/:id/sessions/:sessionId', revokeUserSession);
router.delete('/:id/sessions', revokeAllUserSessions);

// Actions strictly reserved for SUPER_ADMIN
router.patch('/:id/approve', authorize('SUPER_ADMIN'), approveUser);
router.patch('/:id/reject', authorize('SUPER_ADMIN'), rejectUser);
router.patch('/:id/suspend', authorize('SUPER_ADMIN'), suspendUser);
router.patch('/:id/restore', authorize('SUPER_ADMIN'), restoreUser);
router.patch('/:id/role', authorize('SUPER_ADMIN'), changeRole);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteUser);

module.exports = router;
