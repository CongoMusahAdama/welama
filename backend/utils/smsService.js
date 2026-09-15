const Setting = require('../models/Setting');

/**
 * Normalizes phone numbers for mNotify SMS sending.
 * e.g., 0244374433 -> 233244374433, +233244374433 -> 233244374433
 */
const normalizePhone = (phone) => {
    if (!phone) return '';
    let cleaned = String(phone).replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 10) {
        cleaned = '233' + cleaned.substring(1);
    }
    return cleaned;
};

const smsDestination = (order) => order?.smsPhone || order?.phone;

const sendSMS = async (to, message) => {
    try {
        const recipient = normalizePhone(to);
        if (!recipient) {
            console.warn('[mNotify SMS] Invalid recipient phone number:', to);
            return { success: false, message: 'Invalid phone number' };
        }

        const setting = await Setting.findOne();
        const firstValue = (...vals) => vals.map((v) => String(v || '').trim()).find(Boolean) || '';
        const apiKey = firstValue(
            setting?.mnotifyApiKey,
            setting?.smsApiKey,
            process.env.MNOTIFY_API_KEY,
            process.env.NOTIFY_API_KEY
        );
        const rawSender = firstValue(
            setting?.mnotifySenderId,
            setting?.smsSenderId,
            process.env.MNOTIFY_SENDER_ID,
            process.env.NOTIFY_SENDER_ID,
            'WELAMA'
        );
        const senderId = String(rawSender).replace(/\s+/g, '').slice(0, 11) || 'WELAMA';
        const isEnabled = setting?.smsEnabled !== false;

        if (!isEnabled) {
            console.log(`[mNotify SMS] SMS disabled in settings. Skipping SMS to ${recipient}`);
            return { success: true, message: 'SMS disabled in settings' };
        }

        console.log(`\n================== [mNotify SMS DISPATCH] ==================`);
        console.log(`TO: ${recipient} (${to})`);
        console.log(`SENDER: ${senderId}`);
        console.log(`MESSAGE:\n${message}`);
        console.log(`============================================================\n`);

        if (!apiKey) {
            console.log('[mNotify SMS] MNOTIFY_API_KEY not configured yet. Logged message above for testing.');
            return { success: true, message: 'mNotify API key not configured, logged to console' };
        }

        const endpoint = `https://api.mnotify.com/api/sms/quick?key=${encodeURIComponent(apiKey)}`;
        const payload = {
            recipient: [recipient],
            sender: senderId,
            message,
            is_schedule: false,
            schedule_date: ''
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({ status: response.status }));
        console.log('[mNotify SMS] mNotify API Response:', data);

        const ok = data?.status === 'success' || data?.code === '2000' || response.ok;
        if (!ok) {
            return { success: false, message: data?.message || 'mNotify rejected the SMS', data };
        }

        return { success: true, data };
    } catch (error) {
        console.error('[mNotify SMS Error]:', error.message);
        return { success: false, message: error.message };
    }
};

const sendOrderConfirmationSMS = async (order) => {
    if (!order) return;
    const dest = smsDestination(order);
    if (!dest) return;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const orderId = order.orderId || order._id;
    const trackingLink = `${clientUrl}/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(dest)}`;

    let message = '';
    if (order.isCustomRequest) {
        message = `Hello ${order.customer}, WELAMA received your custom request #${orderId}. We will confirm design and price shortly. Track: ${trackingLink}`;
    } else {
        message = `Hello ${order.customer}, thank you for ordering from WELAMA. Order #${orderId}, GHS ${order.total}. Track here: ${trackingLink}`;
    }

    return await sendSMS(dest, message);
};

const sendOrderStatusUpdateSMS = async (order) => {
    if (!order) return;
    const dest = smsDestination(order);
    if (!dest) return;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const orderId = order.orderId || order._id;
    const trackingLink = `${clientUrl}/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(dest)}`;

    let message = `Hello ${order.customer}, your WELAMA order #${orderId} is now ${String(order.status || '').toUpperCase()}. Track: ${trackingLink}`;

    if (order.status === 'Delivered') {
        message = `Hello ${order.customer}, your WELAMA order #${orderId} has been DELIVERED. Thank you. Details: ${trackingLink}`;
    } else if (order.status === 'Cancelled') {
        message = `Hello ${order.customer}, your WELAMA order #${orderId} was CANCELLED. Contact us if you need help.`;
    } else if (order.status === 'Shipped') {
        message = `Hello ${order.customer}, your WELAMA order #${orderId} has been SHIPPED. Track: ${trackingLink}`;
    }

    return await sendSMS(dest, message);
};

const sendPaymentReceivedSMS = async (order) => {
    if (!order) return;
    const dest = smsDestination(order);
    if (!dest) return;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const orderId = order.orderId || order._id;
    const trackingLink = `${clientUrl}/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(dest)}`;
    const message = `Hello ${order.customer}, payment received for WELAMA order #${orderId} (GHS ${order.total}). We are processing it. Track: ${trackingLink}`;
    return await sendSMS(dest, message);
};

const sendAdminNewOrderSMS = async (order) => {
    if (!order) return;
    const setting = await Setting.findOne();
    const adminPhone = setting?.contactPhone;
    if (!adminPhone) return;
    const orderId = order.orderId || order._id;
    const kind = order.isCustomRequest ? 'custom request' : 'order';
    const message = `WELAMA: New ${kind} #${orderId} from ${order.customer}. GHS ${order.total || 0}. Phone: ${smsDestination(order) || order.phone}`;
    return await sendSMS(adminPhone, message);
};

const sendAdminLoginSMS = async (admin) => {
    const dest = admin?.phone || process.env.ADMIN_PHONE;
    if (!dest) return;
    const when = new Date().toLocaleString('en-GH', {
        timeZone: 'Africa/Accra',
        hour: 'numeric',
        minute: '2-digit',
        day: 'numeric',
        month: 'short'
    });
    const who = admin?.name || 'Admin';
    const message = `WELAMA: ${who} signed in to the admin dashboard at ${when}. If this was not you, change your password immediately.`;
    return await sendSMS(dest, message);
};

module.exports = {
    sendSMS,
    sendOrderConfirmationSMS,
    sendOrderStatusUpdateSMS,
    sendPaymentReceivedSMS,
    sendAdminNewOrderSMS,
    sendAdminLoginSMS,
    normalizePhone
};
