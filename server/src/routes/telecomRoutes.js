const express = require('express');
const router = express.Router();
const {
  getStatus,
  updateConfiguration,
  requestDispatch,
} = require('../controllers/telecomController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/status', getStatus);
router.put('/configure', authorize('SUPER_ADMIN'), updateConfiguration);
router.post('/request-dispatch', requestDispatch);

module.exports = router;
