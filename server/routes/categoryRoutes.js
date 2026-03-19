const express = require('express');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { createCategoryRules, mongoIdParam } = require('../middleware/validate');

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin'), createCategoryRules, createCategory);

router.route('/:id')
  .put(protect, authorize('admin'), mongoIdParam, updateCategory)
  .delete(protect, authorize('admin'), mongoIdParam, deleteCategory);

module.exports = router;
