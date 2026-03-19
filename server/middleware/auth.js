const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes — verify access token from httpOnly cookie
const protect = async (req, res, next) => {
  try {
    let token;

    // Primary: httpOnly cookie (secure)
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    // Fallback: Authorization header (for API clients / mobile)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', expired: true });
    }
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

module.exports = { protect };
