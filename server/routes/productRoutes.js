const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleSoldOut,
  getCategories,
  getAdminProducts,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');

// Public routes — static paths FIRST
router.get('/categories', getCategories);

// Admin routes — must be before /:id
router.get('/admin/all', protect, authorize('admin'), getAdminProducts);
router.post('/', protect, authorize('admin'), upload.array('images', 5), createProduct);

// Public — parameterized LAST
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin — parameterized
router.put('/:id', protect, authorize('admin'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.patch('/:id/soldout', protect, authorize('admin'), toggleSoldOut);

module.exports = router;
