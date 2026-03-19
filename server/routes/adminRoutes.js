const express = require('express');
const router = express.Router();
const { getStats, getAnalytics } = require('../controllers/adminController');
const { getUsers, getUser, updateUserRole } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { mongoIdParam } = require('../middleware/validate');

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.get('/users/:id', mongoIdParam, getUser);
router.put('/users/:id/role', mongoIdParam, updateUserRole);

module.exports = router;
