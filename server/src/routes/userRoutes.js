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
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All user management routes require login + SUPER_ADMIN or ADMIN
router.use(protect);

router.get('/audit-logs', authorize('SUPER_ADMIN', 'ADMIN'), getAuditLogs);
router.get('/', authorize('SUPER_ADMIN', 'ADMIN'), getUsers);
router.get('/:id', authorize('SUPER_ADMIN', 'ADMIN'), getUserById);

// Actions strictly reserved for SUPER_ADMIN
router.patch('/:id/approve', authorize('SUPER_ADMIN'), approveUser);
router.patch('/:id/reject', authorize('SUPER_ADMIN'), rejectUser);
router.patch('/:id/suspend', authorize('SUPER_ADMIN'), suspendUser);
router.patch('/:id/restore', authorize('SUPER_ADMIN'), restoreUser);
router.patch('/:id/role', authorize('SUPER_ADMIN'), changeRole);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteUser);

module.exports = router;
