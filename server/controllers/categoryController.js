const Category = require('../models/Category');
const Product = require('../models/Product');
const logger = require('../config/logger');

// @desc    Get all categories with subcategories
// @route   GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();

    // If admin requests product counts
    if (req.query.withCounts === 'true') {
      const productCounts = await Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: { mainCategory: '$mainCategory', subCategory: '$subCategory' },
            count: { $sum: 1 },
          },
        },
      ]);

      // Build count map
      const countMap = {};
      for (const item of productCounts) {
        const main = item._id.mainCategory;
        const sub = item._id.subCategory;
        if (!countMap[main]) countMap[main] = { total: 0, subs: {} };
        countMap[main].total += item.count;
        countMap[main].subs[sub] = item.count;
      }

      // Attach counts to categories
      const enriched = categories.map((cat) => ({
        ...cat,
        productCount: countMap[cat.name]?.total || 0,
        subcategories: cat.subcategories.map((sub) => ({
          ...sub,
          productCount: countMap[cat.name]?.subs[sub.name] || 0,
        })),
      }));

      return res.status(200).json({ success: true, data: enriched });
    }

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category (Admin)
// @route   POST /api/categories
exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug, subcategories } = req.body;
    const category = await Category.create({ name, slug, subcategories: subcategories || [] });
    logger.info(`Category created: ${category.name}`);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    logger.info(`Category updated: ${category.name}`);
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    // Check if products use this category
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const productCount = await Product.countDocuments({
      mainCategory: category.name,
      isActive: true,
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${productCount} active product(s) use this category. Reassign them first.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    logger.info(`Category deleted: ${category.name}`);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
