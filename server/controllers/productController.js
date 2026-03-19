const Product = require('../models/Product');
const logger = require('../config/logger');

// @desc    Get all products (with pagination, search, filter)
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { isActive: true };

    if (req.query.mainCategory) {
      filter.mainCategory = req.query.mainCategory;
    }

    if (req.query.subCategory) {
      filter.subCategory = req.query.subCategory;
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Sort
    let sort = { createdAt: -1 };
    if (req.query.sort === 'price_asc') sort = { price: 1 };
    else if (req.query.sort === 'price_desc') sort = { price: -1 };
    else if (req.query.sort === 'newest') sort = { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (Admin) — accepts JSON with image URLs
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const { title, description, price, discount, sizes, sku, mainCategory, subCategory, images } = req.body;

    const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    const parsedImages = typeof images === 'string' ? JSON.parse(images) : images;

    const product = await Product.create({
      title,
      description,
      images: parsedImages,
      price: Number(price),
      discount: Number(discount) || 0,
      sizes: parsedSizes,
      sku,
      mainCategory,
      subCategory,
    });

    logger.info(`Product created: ${product.sku} - ${product.title}`);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updateData = { ...req.body };

    if (updateData.sizes && typeof updateData.sizes === 'string') {
      updateData.sizes = JSON.parse(updateData.sizes);
    }
    if (updateData.images && typeof updateData.images === 'string') {
      updateData.images = JSON.parse(updateData.images);
    }
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.discount !== undefined) updateData.discount = Number(updateData.discount);

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    logger.info(`Product updated: ${product.sku}`);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete product (Admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    logger.info(`Product deactivated: ${product.sku}`);
    res.status(200).json({ success: true, message: 'Product deactivated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle sold out (Admin)
// @route   PATCH /api/products/:id/soldout
exports.toggleSoldOut = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.soldOut = !product.soldOut;
    await product.save();

    logger.info(`Product ${product.sku} soldOut toggled to ${product.soldOut}`);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all products including inactive
// @route   GET /api/products/admin/all
exports.getAdminProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};
