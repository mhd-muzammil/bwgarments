const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const Product = require('../models/Product');
const User = require('../models/User');

dotenv.config({ path: '../.env' });

const products = [
  {
    title: 'Noir Elegance Kurta — Black Chikankari',
    description: 'Premium black cotton kurta with intricate chikankari hand embroidery. A timeless piece that blends traditional craftsmanship with modern elegance. Perfect for both festive occasions and everyday luxury.',
    images: [
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800',
    ],
    price: 1999,
    discount: 1049,
    sizes: [
      { size: 'S', stock: 12 },
      { size: 'M', stock: 18 },
      { size: 'L', stock: 15 },
      { size: 'XL', stock: 8 },
      { size: 'XXL', stock: 5 },
    ],
    sku: 'BWG-BLK-CHK-001',
    mainCategory: 'Women',
    subCategory: 'Kurtis',
  },
  {
    title: 'Ivory Pearl Anarkali — White Gold Collection',
    description: 'Stunning white anarkali with delicate golden border work. This flowing silhouette features premium georgette fabric with subtle pearl embellishments, creating an ethereal look for special occasions.',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800',
    ],
    price: 2499,
    discount: 1299,
    sizes: [
      { size: 'S', stock: 8 },
      { size: 'M', stock: 14 },
      { size: 'L', stock: 10 },
      { size: 'XL', stock: 6 },
      { size: 'XXL', stock: 3 },
    ],
    sku: 'BWG-WHT-ANK-002',
    mainCategory: 'Women',
    subCategory: 'Kurtis',
  },
  {
    title: 'Midnight Palazzo Set — Monochrome Edit',
    description: 'Sleek black and white palazzo set featuring geometric print. This co-ord set is crafted from premium crepe fabric, offering comfort and style in equal measure. Includes matching palazzo pants.',
    images: [
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
      'https://images.unsplash.com/photo-1583391733975-dda1a0a09571?w=800',
    ],
    price: 1799,
    discount: 949,
    sizes: [
      { size: 'S', stock: 6 },
      { size: 'M', stock: 12 },
      { size: 'L', stock: 9 },
      { size: 'XL', stock: 4 },
      { size: 'XXL', stock: 0 },
    ],
    sku: 'BWG-BLK-PLZ-003',
    mainCategory: 'Women',
    subCategory: 'Tops',
  },
  {
    title: 'Shadow Grey Straight Kurta — Minimal Edit',
    description: 'Minimalist straight-cut kurta in charcoal grey. Features clean lines, mandarin collar, and premium cotton-silk blend. The perfect fusion of understated elegance and everyday practicality.',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
    ],
    price: 1299,
    discount: 699,
    sizes: [
      { size: 'S', stock: 15 },
      { size: 'M', stock: 20 },
      { size: 'L', stock: 18 },
      { size: 'XL', stock: 10 },
      { size: 'XXL', stock: 7 },
    ],
    sku: 'BWG-GRY-STR-004',
    mainCategory: 'Women',
    subCategory: 'Kurtis',
  },
  {
    title: 'Onyx Velvet Gown — Evening Collection',
    description: 'Luxurious black velvet gown with silver threadwork. This statement piece features a flattering A-line silhouette with intricate silver zari embroidery along the neckline and sleeves.',
    images: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
      'https://images.unsplash.com/photo-1583391733981-8b530c07a7e1?w=800',
    ],
    price: 3499,
    discount: 1849,
    sizes: [
      { size: 'S', stock: 4 },
      { size: 'M', stock: 8 },
      { size: 'L', stock: 6 },
      { size: 'XL', stock: 3 },
      { size: 'XXL', stock: 2 },
    ],
    sku: 'BWG-BLK-VLV-005',
    mainCategory: 'Women',
    subCategory: 'Sarees',
  },
  {
    title: 'Pearl White A-Line Kurti — Summer Collection',
    description: 'Breezy white cotton A-line kurti with subtle black embroidery accents. Lightweight and breathable, this piece is perfect for summer styling with its relaxed fit and quarter sleeves.',
    images: [
      'https://images.unsplash.com/photo-1583391733975-dda1a0a09571?w=800',
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800',
    ],
    price: 999,
    discount: 529,
    sizes: [
      { size: 'S', stock: 20 },
      { size: 'M', stock: 25 },
      { size: 'L', stock: 22 },
      { size: 'XL', stock: 15 },
      { size: 'XXL', stock: 10 },
    ],
    sku: 'BWG-WHT-ALN-006',
    mainCategory: 'Women',
    subCategory: 'Kurtis',
  },
  {
    title: 'Charcoal Silk Dupatta Set — Festive Edit',
    description: 'Elegant charcoal dupatta set with gold zari border. This 3-piece set includes kurta, palazzos, and a matching silk dupatta. Perfect for festive occasions and family celebrations.',
    images: [
      'https://images.unsplash.com/photo-1583391733981-8b530c07a7e1?w=800',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
    ],
    price: 2799,
    discount: 1479,
    sizes: [
      { size: 'S', stock: 5 },
      { size: 'M', stock: 10 },
      { size: 'L', stock: 8 },
      { size: 'XL', stock: 4 },
      { size: 'XXL', stock: 0 },
    ],
    sku: 'BWG-GRY-DPT-007',
    mainCategory: 'Women',
    subCategory: 'Sarees',
  },
  {
    title: 'Obsidian Sharara Set — Party Collection',
    description: 'Show-stopping black sharara set with mirror work and sequin embellishments. Features a crop top with sharara pants and organza dupatta. The ultimate party wear for making a lasting impression.',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800',
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800',
    ],
    price: 3999,
    discount: 0,
    soldOut: true,
    sizes: [
      { size: 'S', stock: 0 },
      { size: 'M', stock: 0 },
      { size: 'L', stock: 0 },
      { size: 'XL', stock: 0 },
      { size: 'XXL', stock: 0 },
    ],
    sku: 'BWG-BLK-SHR-008',
    mainCategory: 'Women',
    subCategory: 'Tops',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});

    // Use env vars for passwords, or fixed dev defaults that match the Auth page demo box
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@1234';
    const userPassword = process.env.SEED_USER_PASSWORD || 'User@1234';

    // Create admin user
    await User.create({
      name: 'Admin',
      email: 'admin@bwgarments.com',
      password: adminPassword,
      role: 'admin',
    });

    // Create test user
    await User.create({
      name: 'Test User',
      email: 'user@bwgarments.com',
      password: userPassword,
      role: 'user',
    });

    // Seed products
    await Product.insertMany(products);

    console.log('Database seeded successfully!');
    console.log(`Admin: admin@bwgarments.com / ${adminPassword}`);
    console.log(`User:  user@bwgarments.com / ${userPassword}`);
    console.log(`${products.length} products created`);
    console.log('\nSave these credentials! They are generated fresh each time.');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error.message);
    process.exit(1);
  }
};

seedDB();
