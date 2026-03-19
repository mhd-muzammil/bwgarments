const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const logger = require('../config/logger');

// @desc    Checkout — create order with Mongo transaction
// @route   POST /api/orders/checkout
exports.checkout = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { shippingAddress } = req.body;

    // Get cart
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product')
      .session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Validate & decrement stock atomically for each item
    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive || product.soldOut) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Product "${product?.title || 'Unknown'}" is no longer available`,
        });
      }

      // Atomic stock decrement — use $elemMatch to ensure the SAME array element
      // matches both size and stock, then use positional $ to decrement it
      const updated = await Product.findOneAndUpdate(
        {
          _id: product._id,
          soldOut: false,
          isActive: true,
          sizes: { $elemMatch: { size: item.size, stock: { $gte: item.quantity } } },
        },
        {
          $inc: { 'sizes.$.stock': -item.quantity },
        },
        { new: true, session }
      );

      if (!updated) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.title}" in size ${item.size}`,
        });
      }

      const itemPrice = product.discount || product.price;
      totalAmount += itemPrice * item.quantity;

      orderItems.push({
        product: product._id,
        title: product.title,
        image: product.images[0],
        size: item.size,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    // Create order
    const order = await Order.create(
      [
        {
          user: req.user.id,
          items: orderItems,
          totalAmount,
          shippingAddress,
          paymentStatus: 'pending',
          orderStatus: 'processing',
        },
      ],
      { session }
    );

    // Clear cart
    cart.items = [];
    await cart.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    logger.info(`Order created: ${order[0]._id} by user ${req.user.id}, total: ${totalAmount}`);
    res.status(201).json({ success: true, data: order[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ user: req.user.id }),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Users can only see their own orders
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin) with history tracking
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus && orderStatus !== order.orderStatus) {
      order.statusHistory.push({
        status: `order: ${order.orderStatus} → ${orderStatus}`,
        changedBy: req.user.id,
        changedAt: new Date(),
      });
      order.orderStatus = orderStatus;
    }

    if (paymentStatus && paymentStatus !== order.paymentStatus) {
      order.statusHistory.push({
        status: `payment: ${order.paymentStatus} → ${paymentStatus}`,
        changedBy: req.user.id,
        changedAt: new Date(),
      });
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    logger.info(`Order ${order._id} status updated: order=${orderStatus}, payment=${paymentStatus}`);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Add admin note to order
// @route   POST /api/orders/:id/notes
exports.addOrderNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Note is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.adminNotes.push({
      note: note.trim(),
      author: req.user.id,
      createdAt: new Date(),
    });

    await order.save();

    // Populate author names for response
    await order.populate('adminNotes.author', 'name');

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order detail with full history (Admin)
// @route   GET /api/orders/:id/detail
exports.getOrderDetail = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email createdAt')
      .populate('adminNotes.author', 'name')
      .populate('statusHistory.changedBy', 'name')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Build timeline
    const timeline = [
      { event: 'Order placed', date: order.createdAt, type: 'created' },
    ];

    if (order.statusHistory) {
      for (const h of order.statusHistory) {
        timeline.push({
          event: h.status,
          date: h.changedAt,
          by: h.changedBy?.name || 'System',
          type: 'status',
        });
      }
    }

    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      success: true,
      data: { ...order, timeline },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.orderStatus) filter.orderStatus = req.query.orderStatus;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};
