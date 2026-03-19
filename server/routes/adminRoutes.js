const express = require('express');
const router = express.Router();
const { getStats, getAnalytics } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/stats', protect, authorize('admin'), getStats);
router.get('/analytics', protect, authorize('admin'), getAnalytics);

module.exports = router;
