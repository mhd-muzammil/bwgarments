const mongoose = require('mongoose');

const sizeStockSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      enum: ['S', 'M', 'L', 'XL', 'XXL'],
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length >= 1 && v.length <= 10;
        },
        message: 'Product must have between 1 and 10 images',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    sizes: {
      type: [sizeStockSchema],
      required: [true, 'At least one size is required'],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: 'Product must have at least one size',
      },
    },
    soldOut: {
      type: Boolean,
      default: false,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    mainCategory: {
      type: String,
      required: [true, 'Main category is required'],
      trim: true,
    },
    subCategory: {
      type: String,
      required: [true, 'Subcategory is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: compute total stock from sizes
productSchema.virtual('stock').get(function () {
  if (!this.sizes || this.sizes.length === 0) return 0;
  return this.sizes.reduce((total, s) => total + s.stock, 0);
});

// Virtual: compute discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (!this.price || this.price === 0 || !this.discount) return 0;
  return Math.round(((this.price - this.discount) / this.price) * 100);
});

// Validate discount < price
productSchema.pre('validate', function () {
  if (this.discount && this.discount >= this.price) {
    this.invalidate('discount', 'Discount price must be less than original price');
  }
});

// When soldOut is true, zero all size stocks
productSchema.pre('save', function () {
  if (this.soldOut) {
    this.sizes.forEach((s) => {
      s.stock = 0;
    });
  }
});

// Indexes for performance
productSchema.index({ mainCategory: 1, subCategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ title: 'text' });
productSchema.index({ isActive: 1 });
module.exports = mongoose.model('Product', productSchema);
