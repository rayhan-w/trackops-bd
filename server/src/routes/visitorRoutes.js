const express = require('express');
const router = express.Router();
const {
  resolveLink,
  recordConsent,
  skipConsent,
} = require('../controllers/visitorController');

// Public visitor routes
router.get('/resolve/:shortCode', resolveLink);
router.post('/consent/:shortCode', recordConsent);
router.post('/skip/:shortCode', skipConsent);

module.exports = router;
