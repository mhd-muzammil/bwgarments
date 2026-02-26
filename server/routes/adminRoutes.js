const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/stats', protect, authorize('admin'), getStats);

module.exports = router;
