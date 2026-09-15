const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { getOrders, createOrder, updateOrder, deleteOrder, trackOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const orderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many orders from this network. Please wait a few minutes.' }
});

router.get('/track', trackOrders);

router.route('/')
    .get(protect, getOrders)
    .post(orderLimiter, createOrder); 

router.route('/:id')
    .put(protect, updateOrder)
    .delete(protect, deleteOrder);

module.exports = router;
