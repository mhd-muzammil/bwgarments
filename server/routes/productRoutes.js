const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleSoldOut,
  getAdminProducts,
  bulkUpdateStock,
  exportInventory,
  getInventory,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { createProductRules, updateProductRules, mongoIdParam } = require('../middleware/validate');

// Admin routes — must be before /:id
router.get('/admin/all', protect, authorize('admin'), getAdminProducts);
router.get('/admin/inventory', protect, authorize('admin'), getInventory);
router.get('/admin/export', protect, authorize('admin'), exportInventory);
router.put('/admin/bulk-stock', protect, authorize('admin'), bulkUpdateStock);
router.post('/', protect, authorize('admin'), createProductRules, createProduct);

// Public
router.get('/', getProducts);
router.get('/:id', mongoIdParam, getProduct);

// Admin — parameterized
router.put('/:id', protect, authorize('admin'), updateProductRules, updateProduct);
router.delete('/:id', protect, authorize('admin'), mongoIdParam, deleteProduct);
router.patch('/:id/soldout', protect, authorize('admin'), mongoIdParam, toggleSoldOut);

module.exports = router;
