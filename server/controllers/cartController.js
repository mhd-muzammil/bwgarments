const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      'items.product',
      'title images price discount sizes soldOut isActive'
    );

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart (with atomic stock validation)
// @route   POST /api/cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, size, quantity } = req.body;

    // Validate product exists, is active, and not sold out
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
      soldOut: false,
    });

    if (!product) {
      return res.status(400).json({ success: false, message: 'Product not available' });
    }

    // Validate size exists and has sufficient stock
    const sizeData = product.sizes.find((s) => s.size === size);
    if (!sizeData) {
      return res.status(400).json({ success: false, message: 'Invalid size selected' });
    }

    if (sizeData.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${sizeData.stock} items available in size ${size}`,
      });
    }

    // Atomic cart update using findOneAndUpdate to prevent race conditions
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (existingItemIndex > -1) {
      const newQty = cart.items[existingItemIndex].quantity + quantity;
      if (newQty > sizeData.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${sizeData.stock} available in size ${size}`,
        });
      }
      cart.items[existingItemIndex].quantity = newQty;
    } else {
      cart.items.push({ product: productId, size, quantity });
    }

    await cart.save();

    // Populate for response
    cart = await Cart.findById(cart._id).populate(
      'items.product',
      'title images price discount sizes soldOut isActive'
    );

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    // Validate stock
    const product = await Product.findById(item.product);
    const sizeData = product?.sizes.find((s) => s.size === item.size);

    if (!sizeData || sizeData.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${sizeData?.stock || 0} available`,
      });
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      'items.product',
      'title images price discount sizes soldOut isActive'
    );

    res.status(200).json({ success: true, data: updatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
exports.removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      'items.product',
      'title images price discount sizes soldOut isActive'
    );

    res.status(200).json({ success: true, data: updatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ success: true, data: { items: [] } });
  } catch (error) {
    next(error);
  }
};
