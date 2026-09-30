const express = require('express');
const router = express.Router();
const {
  getVisitorActivities,
  getVisitorActivityById,
  analyzeIp,
  exportCsv,
} = require('../controllers/visitorActivityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getVisitorActivities);
router.get('/ip-analysis', analyzeIp);
router.get('/export-csv', exportCsv);
router.get('/:id', getVisitorActivityById);

module.exports = router;

