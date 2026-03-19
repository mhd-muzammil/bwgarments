const express = require('express');
const router = express.Router();
const {
  checkout,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  addOrderNote,
  getOrderDetail,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { checkoutRules, updateOrderStatusRules, mongoIdParam } = require('../middleware/validate');

router.use(protect); // All order routes require auth

router.post('/checkout', checkoutRules, checkout);
router.get('/', getMyOrders);

// Admin routes — must come before /:id
router.get('/admin/all', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatusRules, updateOrderStatus);
router.post('/:id/notes', authorize('admin'), mongoIdParam, addOrderNote);
router.get('/:id/detail', authorize('admin'), mongoIdParam, getOrderDetail);

router.get('/:id', mongoIdParam, getOrder);

module.exports = router;
