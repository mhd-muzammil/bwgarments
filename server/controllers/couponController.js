const Coupon = require('../models/Coupon');
const logger = require('../config/logger');
const logActivity = require('../middleware/activityLog');

// @desc    Get all coupons (paginated, searchable, filterable)
// @route   GET /api/coupons
// @access  Admin
exports.getCoupons = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    // Search by code
    if (req.query.search) {
      filter.code = { $regex: req.query.search, $options: 'i' };
    }

    // Filter by isActive
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const [coupons, total] = await Promise.all([
      Coupon.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email'),
      Coupon.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching coupons:', error);
    next(error);
  }
};

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Admin
exports.getCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate('createdBy', 'name email');

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.json({ success: true, data: coupon });
  } catch (error) {
    logger.error('Error fetching coupon:', error);
    next(error);
  }
};

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Admin
exports.createCoupon = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    const coupon = await Coupon.create(req.body);

    await logActivity({
      action: 'CREATE',
      actor: req.user.id,
      targetType: 'Coupon',
      targetId: coupon._id,
      description: `Created coupon "${coupon.code}"`,
    });

    logger.info(`Coupon created: ${coupon.code} by user ${req.user.id}`);

    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    logger.error('Error creating coupon:', error);
    next(error);
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Admin
exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    await logActivity({
      action: 'UPDATE',
      actor: req.user.id,
      targetType: 'Coupon',
      targetId: coupon._id,
      description: `Updated coupon "${coupon.code}"`,
    });

    logger.info(`Coupon updated: ${coupon.code} by user ${req.user.id}`);

    res.json({ success: true, data: coupon });
  } catch (error) {
    logger.error('Error updating coupon:', error);
    next(error);
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Admin
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    await logActivity({
      action: 'DELETE',
      actor: req.user.id,
      targetType: 'Coupon',
      targetId: coupon._id,
      description: `Deleted coupon "${coupon.code}"`,
    });

    logger.info(`Coupon deleted: ${coupon.code} by user ${req.user.id}`);

    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    logger.error('Error deleting coupon:', error);
    next(error);
  }
};

// @desc    Validate coupon and calculate discount
// @route   POST /api/coupons/validate
// @access  Protected (any logged-in user)
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code || orderTotal === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and order total are required',
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Coupon is not active' });
    }

    // Check if coupon is expired
    if (coupon.validUntil < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    // Check if coupon is used up
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    // Check minimum order amount
    if (orderTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ${coupon.minOrderAmount} is required`,
      });
    }

    // Check per-user limit
    const userUsageCount = coupon.usedBy.filter(
      (entry) => entry.user.toString() === req.user.id.toString()
    ).length;

    if (userUsageCount >= coupon.perUserLimit) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this coupon the maximum number of times',
      });
    }

    // Calculate discount
    let discount = 0;

    if (coupon.type === 'percentage') {
      discount = (orderTotal * coupon.value) / 100;
      // Apply max discount cap if set
      if (coupon.maxDiscount !== null && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      // flat discount
      discount = coupon.value;
    }

    // Discount should not exceed order total
    if (discount > orderTotal) {
      discount = orderTotal;
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount: Math.round(discount * 100) / 100,
        finalTotal: Math.round((orderTotal - discount) * 100) / 100,
      },
    });
  } catch (error) {
    logger.error('Error validating coupon:', error);
    next(error);
  }
};
