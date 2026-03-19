const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  getMe,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerRules, loginRules } = require('../middleware/validate');

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
