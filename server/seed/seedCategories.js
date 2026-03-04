const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const connectDB = require('../config/db');

dotenv.config({ path: '../.env' });

const categories = [
  {
    name: 'Men',
    slug: 'men',
    subcategories: [
      { name: 'Shirts', slug: 'shirts' },
      { name: 'T-Shirts', slug: 't-shirts' },
      { name: 'Pants', slug: 'pants' },
      { name: 'Formals', slug: 'formals' },
    ]
  },
  {
    name: 'Women',
    slug: 'women',
    subcategories: [
      { name: 'Kurtis', slug: 'kurtis' },
      { name: 'Sarees', slug: 'sarees' },
      { name: 'Tops', slug: 'tops' },
      { name: 'Jeans', slug: 'jeans' },
    ]
  },
  {
    name: 'Kids',
    slug: 'kids',
    subcategories: [
      { name: 'Boys Wear', slug: 'boys-wear' },
      { name: 'Girls Wear', slug: 'girls-wear' },
      { name: 'School Wear', slug: 'school-wear' },
    ]
  }
];

const seedCategories = async () => {
  try {
    await connectDB();
    await Category.deleteMany();
    await Category.insertMany(categories);
    console.log('Categories Seeded Successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedCategories();
