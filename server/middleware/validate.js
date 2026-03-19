const { body, param, query, validationResult } = require('express-validator');

// Run validation and return errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array().map((e) => e.msg).join(', '),
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth Validators ───
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  handleValidation,
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidation,
];

// ─── Product Validators ───
const createProductRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('discount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Discount must be a non-negative number'),
  body('sku')
    .trim()
    .notEmpty().withMessage('SKU is required'),
  body('mainCategory')
    .trim()
    .notEmpty().withMessage('Main category is required'),
  body('subCategory')
    .trim()
    .notEmpty().withMessage('Subcategory is required'),
  body('images')
    .custom((value) => {
      const images = typeof value === 'string' ? JSON.parse(value) : value;
      if (!Array.isArray(images) || images.length < 1 || images.length > 10) {
        throw new Error('Product must have between 1 and 10 images');
      }
      return true;
    }),
  handleValidation,
];

const updateProductRules = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('discount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Discount must be a non-negative number'),
  handleValidation,
];

// ─── Cart Validators ───
const addToCartRules = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  body('size')
    .notEmpty().withMessage('Size is required')
    .isIn(['S', 'M', 'L', 'XL', 'XXL']).withMessage('Invalid size'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),
  handleValidation,
];

const updateCartItemRules = [
  param('itemId').isMongoId().withMessage('Invalid item ID'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),
  handleValidation,
];

// ─── Order Validators ───
const checkoutRules = [
  body('shippingAddress.fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ max: 100 }).withMessage('Name too long'),
  body('shippingAddress.phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9]{10,15}$/).withMessage('Invalid phone number'),
  body('shippingAddress.addressLine1')
    .trim()
    .notEmpty().withMessage('Address line 1 is required')
    .isLength({ max: 200 }).withMessage('Address too long'),
  body('shippingAddress.addressLine2')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Address too long'),
  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('City is required'),
  body('shippingAddress.state')
    .trim()
    .notEmpty().withMessage('State is required'),
  body('shippingAddress.pincode')
    .trim()
    .notEmpty().withMessage('Pincode is required')
    .matches(/^[0-9]{5,10}$/).withMessage('Invalid pincode'),
  handleValidation,
];

const updateOrderStatusRules = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('orderStatus')
    .optional()
    .isIn(['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Invalid payment status'),
  handleValidation,
];

// ─── Category Validators ───
const createCategoryRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required'),
  body('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase alphanumeric with dashes'),
  handleValidation,
];

// ─── ID Param Validator ───
const mongoIdParam = [
  param('id').isMongoId().withMessage('Invalid ID'),
  handleValidation,
];

module.exports = {
  registerRules,
  loginRules,
  createProductRules,
  updateProductRules,
  addToCartRules,
  updateCartItemRules,
  checkoutRules,
  updateOrderStatusRules,
  createCategoryRules,
  mongoIdParam,
};
