const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { initializePaystack, verifyPaystack } = require('../controllers/paymentController');

const payLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { success: false, message: 'Too many payment attempts. Please wait a few minutes.' }
});

router.post('/paystack/initialize', payLimiter, initializePaystack);
router.get('/paystack/verify/:reference', payLimiter, verifyPaystack);

module.exports = router;
