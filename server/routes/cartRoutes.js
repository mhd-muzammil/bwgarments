const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const { addToCartRules, updateCartItemRules } = require('../middleware/validate');

router.use(protect); // All cart routes require auth

router.get('/', getCart);
router.post('/', addToCartRules, addToCart);
router.put('/:itemId', updateCartItemRules, updateCartItem);
router.delete('/clear', clearCart);
router.delete('/:itemId', removeCartItem);

module.exports = router;
