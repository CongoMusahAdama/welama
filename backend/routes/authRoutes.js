const express = require('express');
const router = express.Router();
const { login, getMe, logout, updatePassword, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate Limiter for Login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    skipSuccessfulRequests: true,
    message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' }
});

router.post('/login', loginLimiter, login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
