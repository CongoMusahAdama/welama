const crypto = require('crypto');
const Order = require('../models/Order');
const Setting = require('../models/Setting');
const { sendPaymentReceivedSMS } = require('../utils/smsService');
const { markOrderPaid } = require('./orderController');

const getPaystackSecret = (setting) =>
    (setting?.paystackSecretKey || process.env.PAYSTACK_SECRET_KEY || '').trim();

// @desc    Initialize Paystack Transaction
// @route   POST /api/payment/paystack/initialize
// @access  Public
exports.initializePaystack = async (req, res) => {
    try {
        const { orderId, customerEmail, customerName, customerPhone } = req.body;

        if (!orderId) {
            return res.status(400).json({ success: false, message: 'Order ID is required' });
        }

        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.payment === 'Paid') {
            return res.status(400).json({ success: false, message: 'This order is already paid' });
        }

        const setting = await Setting.findOne();
        const secretKey = getPaystackSecret(setting);
        const clientUrl = (
            process.env.CLIENT_URL ||
            process.env.FRONTEND_URL ||
            (process.env.NODE_ENV === 'production' ? 'https://welama.vercel.app' : 'http://localhost:5173')
        ).split(',')[0].trim().replace(/\/$/, '');

        const amountInPesewas = Math.round(Number(order.total) * 100);
        const email = customerEmail || `${(customerPhone || order.phone || 'customer').replace(/[^0-9]/g, '')}@welama.com`;
        const callbackUrl = `${clientUrl}/checkout?paystack_ref=${encodeURIComponent(orderId)}`;

        // If Paystack Secret Key is not configured yet, provide simulated/demo checkout response
        if (!secretKey) {
            console.log(`[Paystack Warning] PAYSTACK_SECRET_KEY not set in .env or Settings. Providing fallback for testing.`);
            return res.status(200).json({
                success: true,
                isMock: true,
                message: 'Paystack keys not added yet. Simulating transaction.',
                data: {
                    authorization_url: `${clientUrl}/checkout?paystack_mock=true&orderId=${encodeURIComponent(orderId)}`,
                    access_code: `mock_code_${Date.now()}`,
                    reference: `REF_${orderId}_${Date.now()}`
                }
            });
        }

        const paystackPayload = {
            email,
            amount: amountInPesewas,
            currency: 'GHS',
            reference: `WELAMA_${orderId}_${Date.now()}`,
            callback_url: callbackUrl,
            metadata: {
                orderId,
                customerName,
                customerPhone,
                custom_fields: [
                    { display_name: "Customer Name", variable_name: "customer_name", value: customerName },
                    { display_name: "Phone Number", variable_name: "phone_number", value: customerPhone },
                    { display_name: "Order ID", variable_name: "order_id", value: orderId }
                ]
            }
        };

        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paystackPayload)
        });

        const data = await response.json();

        if (data.status) {
            return res.status(200).json({
                success: true,
                data: data.data
            });
        } else {
            return res.status(400).json({
                success: false,
                message: data.message || 'Could not initialize Paystack payment'
            });
        }
    } catch (error) {
        console.error('Paystack Initialize Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Paystack Transaction
// @route   GET /api/payment/paystack/verify/:reference
// @access  Public
exports.verifyPaystack = async (req, res) => {
    try {
        const { reference } = req.params;
        const { orderId } = req.query;

        if (!reference) {
            return res.status(400).json({ success: false, message: 'Reference is required' });
        }

        const setting = await Setting.findOne();
        const secretKey = getPaystackSecret(setting);
        const isDemoRef = reference.startsWith('REF_') || reference.startsWith('MOCK_');
        const allowMock = !secretKey && process.env.NODE_ENV !== 'production' && (req.query.mock === 'true' || isDemoRef);

        if (allowMock) {
            const targetOrderId = orderId || reference.split('_')[1];
            const order = await markOrderPaid({
                orderId: targetOrderId,
                paymentMethod: 'Paystack (Verified)',
                paystackReference: reference
            });
            if (order) {
                sendPaymentReceivedSMS(order).catch(err => console.error('[SMS Error]:', err.message));
            }
            const paidOrder = order || await Order.findOne({ $or: [{ orderId: targetOrderId }, { _id: targetOrderId }] });
            return res.status(200).json({
                success: true,
                message: 'Payment verified (Demo/Mock mode)',
                data: paidOrder
            });
        }

        if (!secretKey) {
            return res.status(400).json({ success: false, message: 'Paystack is not configured' });
        }

        const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.status && data.data.status === 'success') {
            const resolvedOrderId = data.data.metadata?.orderId || orderId;

            if (resolvedOrderId) {
                const order = await markOrderPaid({
                    orderId: resolvedOrderId,
                    paymentMethod: `Paystack (${data.data.channel || 'Online'})`,
                    paystackReference: reference
                });
                if (order) {
                    sendPaymentReceivedSMS(order).catch(err => console.error('[SMS Error]:', err.message));
                }
                const paidOrder = order || await Order.findOne({ $or: [{ orderId: resolvedOrderId }, { _id: resolvedOrderId }] });
                return res.status(200).json({
                    success: true,
                    message: 'Payment verified successfully',
                    data: paidOrder || data.data
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                data: data.data
            });
        } else {
            return res.status(400).json({
                success: false,
                message: data.message || 'Payment verification failed'
            });
        }
    } catch (error) {
        console.error('Paystack Verify Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Paystack Webhook Handler
// @route   POST /api/payment/paystack/webhook
// @access  Public
exports.paystackWebhook = async (req, res) => {
    try {
        const setting = await Setting.findOne();
        const secretKey = getPaystackSecret(setting);
        const signature = req.headers['x-paystack-signature'];
        const rawBody = req.rawBody;

        if (!secretKey || !signature || !rawBody) {
            return res.status(401).send('Unauthorized');
        }

        const hash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');
        const expected = Buffer.from(hash);
        const received = Buffer.from(String(signature));
        if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
            return res.status(401).send('Unauthorized');
        }

        const event = req.body;

        if (event && event.event === 'charge.success') {
            const { metadata } = event.data;
            const orderId = metadata?.orderId;

            if (orderId) {
                const order = await markOrderPaid({
                    orderId,
                    paymentMethod: `Paystack (${event.data.channel || 'Online'})`,
                    paystackReference: event.data.reference
                });
                if (order) {
                    sendPaymentReceivedSMS(order).catch(err => console.error('[SMS Error]:', err.message));
                }
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Paystack Webhook Error:', error);
        res.status(500).send('Webhook Error');
    }
};
