const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');

// Load env
dotenv.config({ path: '../.env' });

const app = express();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later' },
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// HTTP request logging via Winston
app.use(
  morgan('short', {
    stream: logger.stream,
    skip: (req) => req.url === '/api/health',
  })
);

// Mount routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// Serve static files in production (client build)
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`BW Garments API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; // Export for testing
