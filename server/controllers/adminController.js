const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalProducts, orders, lowStockProducts] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: {
              $sum: {
                $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0],
              },
            },
            pendingOrders: {
              $sum: {
                $cond: [{ $eq: ['$orderStatus', 'processing'] }, 1, 0],
              },
            },
          },
        },
      ]),
      Product.find({ isActive: true })
        .then((products) =>
          products.filter((p) => {
            const totalStock = p.sizes.reduce((sum, s) => sum + s.stock, 0);
            return totalStock > 0 && totalStock <= 5;
          })
        ),
    ]);

    const orderStats = orders[0] || { totalOrders: 0, totalRevenue: 0, pendingOrders: 0 };

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders: orderStats.totalOrders,
        totalRevenue: orderStats.totalRevenue,
        pendingOrders: orderStats.pendingOrders,
        lowStockProducts: lowStockProducts.length,
        lowStockProductsList: lowStockProducts.map((p) => ({
          id: p._id,
          title: p.title,
          sku: p.sku,
          sizes: p.sizes,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
