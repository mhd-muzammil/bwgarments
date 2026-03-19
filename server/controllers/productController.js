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

// @desc    Bulk update stock for multiple products (Admin)
// @route   PUT /api/products/admin/bulk-stock
exports.bulkUpdateStock = async (req, res, next) => {
  try {
    const { updates } = req.body;
    // updates: [{ productId, size, stock }]

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No updates provided' });
    }

    if (updates.length > 100) {
      return res.status(400).json({ success: false, message: 'Maximum 100 updates per request' });
    }

    const results = [];
    for (const update of updates) {
      const { productId, size, stock } = update;
      if (!productId || !size || stock === undefined) continue;

      const product = await Product.findOneAndUpdate(
        { _id: productId, 'sizes.size': size },
        { $set: { 'sizes.$.stock': Math.max(0, Number(stock)) } },
        { new: true }
      );

      if (product) {
        results.push({ productId, size, stock: Number(stock), success: true });
      } else {
        results.push({ productId, size, success: false, error: 'Not found' });
      }
    }

    logger.info(`Bulk stock update: ${results.filter((r) => r.success).length}/${updates.length} succeeded`);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

// @desc    Export inventory as CSV (Admin)
// @route   GET /api/products/admin/export
exports.exportInventory = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ sku: 1 }).lean();

    // Build CSV
    const rows = ['SKU,Title,Main Category,Sub Category,Size,Stock,Price,Discount,Active,Sold Out'];
    for (const p of products) {
      for (const s of p.sizes) {
        rows.push([
          `"${p.sku}"`,
          `"${p.title.replace(/"/g, '""')}"`,
          `"${p.mainCategory}"`,
          `"${p.subCategory}"`,
          s.size,
          s.stock,
          p.price,
          p.discount || 0,
          p.isActive,
          p.soldOut,
        ].join(','));
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=inventory-${new Date().toISOString().slice(0, 10)}.csv`);
    res.status(200).send(rows.join('\n'));
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory overview — stock levels, alerts (Admin)
// @route   GET /api/products/admin/inventory
exports.getInventory = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.lowStockThreshold) || 5;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.stockStatus === 'low') {
      // Will filter after aggregation
    } else if (req.query.stockStatus === 'out') {
      filter.soldOut = true;
    }
    if (req.query.category) {
      filter.mainCategory = req.query.category;
    }
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    let products = await Product.find(filter).sort({ sku: 1 }).lean();

    // Compute total stock and flag low stock
    products = products.map((p) => {
      const totalStock = p.sizes.reduce((sum, s) => sum + s.stock, 0);
      return { ...p, totalStock, isLowStock: totalStock > 0 && totalStock <= threshold };
    });

    // Apply stock status filter post-query
    if (req.query.stockStatus === 'low') {
      products = products.filter((p) => p.isLowStock);
    } else if (req.query.stockStatus === 'out') {
      products = products.filter((p) => p.totalStock === 0 || p.soldOut);
    }

    const total = products.length;
    const paginated = products.slice(skip, skip + limit);

    // Summary stats
    const allProducts = await Product.find().lean();
    const allWithStock = allProducts.map((p) => ({
      ...p,
      totalStock: p.sizes.reduce((sum, s) => sum + s.stock, 0),
    }));
    const summary = {
      totalProducts: allProducts.length,
      totalStock: allWithStock.reduce((sum, p) => sum + p.totalStock, 0),
      lowStock: allWithStock.filter((p) => p.totalStock > 0 && p.totalStock <= threshold && p.isActive).length,
      outOfStock: allWithStock.filter((p) => (p.totalStock === 0 || p.soldOut) && p.isActive).length,
      activeProducts: allProducts.filter((p) => p.isActive).length,
    };

    res.status(200).json({
      success: true,
      data: paginated,
      summary,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
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
