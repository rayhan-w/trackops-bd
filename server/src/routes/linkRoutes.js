const express = require('express');
const router = express.Router();
const {
  createLink,
  getLinks,
  getLinkById,
  updateLink,
  deleteLink,
  getLinkActivity,
} = require('../controllers/linkController');
const { protect, requireApproved, checkLinkOwnership } = require('../middleware/auth');

router.use(protect);

// Regular users must be APPROVED to create links
router.post('/', requireApproved, createLink);
router.get('/', getLinks);
router.get('/:id', checkLinkOwnership, getLinkById);
router.put('/:id', checkLinkOwnership, updateLink);
router.delete('/:id', checkLinkOwnership, deleteLink);
router.get('/:id/activity', checkLinkOwnership, getLinkActivity);

module.exports = router;
