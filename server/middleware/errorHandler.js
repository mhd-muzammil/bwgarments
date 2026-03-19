const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  // Log the full error internally
  logger.error(err.message, {
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id,
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(404).json({ success: false, message: 'Resource not found' });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `Duplicate value for ${field}` });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired', expired: true });
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Maximum 5MB allowed' });
  }

  // Default: never leak internal details to client
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
