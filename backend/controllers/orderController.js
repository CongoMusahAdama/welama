const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { sendOrderConfirmationSMS, sendOrderStatusUpdateSMS, sendPaymentReceivedSMS, sendAdminNewOrderSMS } = require('../utils/smsService');
const { withTransaction, isDuplicateKey } = require('../utils/withTransaction');
const { decrementStock, restoreStock } = require('../utils/inventory');

const isMongoId = (value) => /^[a-fA-F0-9]{24}$/.test(String(value || ''));

const generateOrderId = () => {
    const stamp = Date.now().toString(36).toUpperCase();
    const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `WLM-${stamp}-${rand}`;
};

const markOrderPaid = async ({ orderId, paymentMethod, paystackReference }) => {
    if (!orderId && !paystackReference) return null;

    const filter = { payment: { $ne: 'Paid' } };
    if (orderId && mongoose.isValidObjectId(orderId)) {
        filter.$or = [{ orderId }, { _id: orderId }];
    } else if (orderId) {
        filter.orderId = orderId;
    }

    const $set = {
        payment: 'Paid',
        status: 'Processing'
    };
    if (paymentMethod) $set.paymentMethod = paymentMethod;
    if (paystackReference) $set.paystackReference = paystackReference;

    return Order.findOneAndUpdate(filter, { $set }, { new: true, runValidators: true });
};

exports.markOrderPaid = markOrderPaid;

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).lean();
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        if (!req.body.smsPhone && req.body.phone) {
            req.body.smsPhone = req.body.phone;
        }

        let lastError;
        for (let attempt = 0; attempt < 5; attempt += 1) {
            const payload = {
                ...req.body,
                orderId: generateOrderId(),
                payment: 'Unpaid',
                paystackReference: undefined
            };
            delete payload.paystackReference;
            if (Array.isArray(payload.items)) {
                payload.items = payload.items.map((item) => ({
                    ...item,
                    productId: isMongoId(item.productId) ? item.productId : null
                }));
            }
            if (!['Pending', 'Processing'].includes(payload.status)) {
                payload.status = 'Pending';
            }

            try {
                const order = await withTransaction(async (session) => {
                    const [created] = await Order.create([payload], { session });
                    if (!payload.isCustomRequest) {
                        await decrementStock(created.items, session);
                    }
                    return created;
                });

                sendOrderConfirmationSMS(order).catch((err) => console.error('[Order SMS Error]:', err.message));
                sendAdminNewOrderSMS(order).catch((err) => console.error('[Admin Order SMS Error]:', err.message));

                return res.status(201).json({ success: true, data: order });
            } catch (error) {
                lastError = error;
                if (isDuplicateKey(error)) {
                    continue;
                }
                throw error;
            }
        }

        throw lastError || new Error('Could not allocate a unique order ID');
    } catch (error) {
        const status = error.status || (isDuplicateKey(error) ? 409 : 400);
        res.status(status).json({ success: false, message: error.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const existing = await Order.findById(req.params.id);
        if (!existing) return res.status(404).json({ success: false, message: 'Order not found' });

        const previousStatus = existing.status;
        const previousPayment = existing.payment;
        const becomingCancelled = req.body.status === 'Cancelled' && previousStatus !== 'Cancelled';
        const leavingCancelled = previousStatus === 'Cancelled' && req.body.status && req.body.status !== 'Cancelled';

        const order = await withTransaction(async (session) => {
            if (becomingCancelled && !existing.isCustomRequest) {
                await restoreStock(existing.items, session);
            }
            if (leavingCancelled && !existing.isCustomRequest) {
                await decrementStock(existing.items, session);
            }

            return Order.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
                session
            });
        });

        if (req.body.status && req.body.status !== previousStatus) {
            sendOrderStatusUpdateSMS(order).catch((err) => console.error('[Order Status SMS Error]:', err.message));
        } else if (req.body.payment === 'Paid' && previousPayment !== 'Paid') {
            sendPaymentReceivedSMS(order).catch((err) => console.error('[Order Payment SMS Error]:', err.message));
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        const status = error.status || 400;
        res.status(status).json({ success: false, message: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        await withTransaction(async (session) => {
            const order = await Order.findById(req.params.id).session(session);
            if (!order) {
                const err = new Error('Order not found');
                err.status = 404;
                throw err;
            }
            if (order.status !== 'Cancelled' && !order.isCustomRequest) {
                await restoreStock(order.items, session);
            }
            await order.deleteOne({ session });
        });

        res.status(200).json({ success: true, message: 'Order removed' });
    } catch (error) {
        res.status(error.status || 500).json({ success: false, message: error.message });
    }
};

exports.trackOrders = async (req, res) => {
    try {
        const { orderId, phone } = req.query;
        if (!orderId || !phone) {
            return res.status(400).json({ success: false, message: 'Order ID and Phone number are required' });
        }

        const normalizedInput = phone.replace(/[^0-9]/g, '');
        const order = await Order.findOne({
            orderId: orderId.trim(),
            phone: { $regex: normalizedInput.slice(-9) }
        }).lean();

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found. Please check your ID and Phone.' });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
