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

// @desc    Get analytics data (revenue timeline, top products, order breakdown)
// @route   GET /api/admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    let daysBack = 30;
    if (period === '7d') daysBack = 7;
    else if (period === '90d') daysBack = 90;
    else if (period === '12m') daysBack = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    startDate.setHours(0, 0, 0, 0);

    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - daysBack);

    // Run all analytics queries in parallel
    const [
      revenueTimeline,
      orderStatusBreakdown,
      topProducts,
      recentOrders,
      recentUsers,
      currentPeriodStats,
      previousPeriodStats,
      dailyOrders,
    ] = await Promise.all([
      // 1. Revenue timeline (grouped by day or month)
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: period === '12m'
              ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
              : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
            paidRevenue: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] },
            },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]),

      // 2. Order status breakdown
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      ]),

      // 3. Top selling products
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            title: { $first: '$items.title' },
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
      ]),

      // 4. Recent orders (last 8)
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),

      // 5. Recent signups (last 8)
      User.find({ role: 'user' })
        .sort({ createdAt: -1 })
        .limit(8)
        .select('name email createdAt')
        .lean(),

      // 6. Current period totals
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$totalAmount' },
            paidRevenue: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] },
            },
          },
        },
      ]),

      // 7. Previous period totals (for comparison)
      Order.aggregate([
        { $match: { createdAt: { $gte: prevStartDate, $lt: startDate } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$totalAmount' },
          },
        },
      ]),

      // 8. Daily order count for sparkline
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Format revenue timeline
    const formattedTimeline = revenueTimeline.map((item) => {
      const date = period === '12m'
        ? `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
        : `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
      return {
        date,
        revenue: item.revenue,
        paidRevenue: item.paidRevenue,
        orders: item.orders,
      };
    });

    // Format order status breakdown
    const statusColors = {
      processing: '#f59e0b',
      confirmed: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444',
    };
    const formattedStatusBreakdown = orderStatusBreakdown.map((item) => ({
      name: item._id,
      value: item.count,
      color: statusColors[item._id] || '#6b7280',
    }));

    // Calculate comparison percentages
    const current = currentPeriodStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, paidRevenue: 0 };
    const previous = previousPeriodStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

    const calcChange = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    res.status(200).json({
      success: true,
      data: {
        period,
        summary: {
          totalRevenue: current.totalRevenue,
          paidRevenue: current.paidRevenue,
          totalOrders: current.totalOrders,
          avgOrderValue: Math.round(current.avgOrderValue || 0),
          revenueChange: calcChange(current.totalRevenue, previous.totalRevenue),
          ordersChange: calcChange(current.totalOrders, previous.totalOrders),
          avgOrderChange: calcChange(current.avgOrderValue || 0, previous.avgOrderValue || 0),
        },
        revenueTimeline: formattedTimeline,
        orderStatusBreakdown: formattedStatusBreakdown,
        topProducts,
        recentOrders: recentOrders.map((o) => ({
          id: o._id,
          customer: o.user?.name || 'Unknown',
          email: o.user?.email,
          total: o.totalAmount,
          status: o.orderStatus,
          paymentStatus: o.paymentStatus,
          items: o.items.length,
          date: o.createdAt,
        })),
        recentUsers: recentUsers.map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          joined: u.createdAt,
        })),
        dailyOrders: dailyOrders.map((d) => ({ date: d._id, orders: d.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};
