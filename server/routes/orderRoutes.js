const express = require('express');
const router = express.Router();
const {
  checkout,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect); // All order routes require auth

router.post('/checkout', checkout);
router.get('/', getMyOrders);

// Admin routes — must come before /:id
router.get('/admin/all', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatus);

router.get('/:id', getOrder);

module.exports = router;
