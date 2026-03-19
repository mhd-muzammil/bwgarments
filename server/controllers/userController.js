const User = require('../models/User');
const Order = require('../models/Order');
const logger = require('../config/logger');

// @desc    Get all users (Admin) with pagination, search, and order stats
// @route   GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role && ['user', 'admin'].includes(req.query.role)) {
      filter.role = req.query.role;
    }
    if (req.query.search) {
      const search = req.query.search.trim();
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    // Get order stats for these users in one query
    const userIds = users.map((u) => u._id);
    const orderStats = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
    ]);

    const statsMap = {};
    for (const stat of orderStats) {
      statsMap[stat._id.toString()] = stat;
    }

    const enrichedUsers = users.map((u) => {
      const stats = statsMap[u._id.toString()] || {};
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        totalOrders: stats.totalOrders || 0,
        totalSpent: stats.totalSpent || 0,
        lastOrderDate: stats.lastOrderDate || null,
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedUsers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user detail with order history (Admin)
// @route   GET /api/admin/users/:id
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [orders, orderStats] = await Promise.all([
      Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(20).lean(),
      Order.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' },
          },
        },
      ]),
    ]);

    const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0, avgOrderValue: 0 };

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        stats: {
          totalOrders: stats.totalOrders,
          totalSpent: stats.totalSpent,
          avgOrderValue: Math.round(stats.avgOrderValue || 0),
        },
        orders: orders.map((o) => ({
          id: o._id,
          items: o.items.length,
          total: o.totalAmount,
          orderStatus: o.orderStatus,
          paymentStatus: o.paymentStatus,
          date: o.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Prevent demoting yourself
    if (req.params.id === req.user.id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot demote your own admin account' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    logger.info(`User role updated: ${user.email} -> ${role}`);
    res.status(200).json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};
