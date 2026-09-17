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
            process.env.MNOTIFY_API_KEY,
            process.env.NOTIFY_API_KEY,
            setting?.mnotifyApiKey,
            setting?.smsApiKey
        );
        const rawSender = firstValue(
            setting?.mnotifySenderId,
            setting?.smsSenderId,
            process.env.MNOTIFY_SENDER_ID,
            process.env.NOTIFY_SENDER_ID,
            'Welama'
        );
        const senderId = String(rawSender).replace(/\s+/g, '').slice(0, 11) || 'Welama';
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
            console.log('[mNotify SMS] MNOTIFY_API_KEY is missing. SMS was not sent.');
            return { success: false, message: 'mNotify API key is not configured' };
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

        const statusText = String(data?.status || '').toLowerCase();
        const code = String(data?.code || data?.status_code || '');
        const apiMessage = String(data?.message || data?.summary || '');
        const ok = statusText === 'success' || code === '2000';
        if (!ok) {
            const low = `${apiMessage} ${JSON.stringify(data)}`.toLowerCase();
            const noCredit = /insufficient|credit|balance|wallet/.test(low);
            return {
                success: false,
                message: noCredit
                    ? 'mNotify wallet has insufficient credit. Top up at https://apps.mnotify.net and try again.'
                    : (apiMessage || 'mNotify rejected the SMS'),
                data
            };
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

    const setting = await Setting.findOne();
    const siteName = setting?.siteName || 'WELAMA';
    
    let message = '';
    if (order.isCustomRequest) {
        message = `Hello ${order.customer}, ${siteName} received your custom request #${orderId}. We will confirm design and price shortly. Track: ${trackingLink}`;
    } else {
        const template = setting?.smsTemplateOrderConfirmation || "Hello {customer}, thank you for ordering from {siteName}. Order #{orderId}, GHS {total}. Track here: {trackingLink}";
        message = template
            .replace(/{customer}/g, order.customer)
            .replace(/{siteName}/g, siteName)
            .replace(/{orderId}/g, orderId)
            .replace(/{total}/g, order.total || 0)
            .replace(/{trackingLink}/g, trackingLink);
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

    const setting = await Setting.findOne();
    const siteName = setting?.siteName || 'WELAMA';
    const statusUpper = String(order.status || '').toUpperCase();
    
    let message = '';
    const statusKey = String(order.status || '').toLowerCase();

    if (statusKey === 'delivered') {
        const template = setting?.smsTemplateOrderDelivered || "Hello {customer}, your {siteName} order #{orderId} has been DELIVERED. Thank you. Details: {trackingLink}";
        message = template;
    } else if (statusKey === 'cancelled') {
        const template = setting?.smsTemplateOrderCancelled || "Hello {customer}, your {siteName} order #{orderId} was CANCELLED. Contact us if you need help.";
        message = template;
    } else if (statusKey === 'shipped') {
        const template = setting?.smsTemplateOrderShipped || "Hello {customer}, your {siteName} order #{orderId} has been SHIPPED. Track: {trackingLink}";
        message = template;
    } else if (statusKey === 'processing') {
        const template = setting?.smsTemplateOrderProcessing || "Hello {customer}, your {siteName} order #{orderId} is now PROCESSING. Track here: {trackingLink}";
        message = template;
    } else {
        const template = setting?.smsTemplateOrderStatusUpdate || "Hello {customer}, your {siteName} order #{orderId} status is now {status}. Track here: {trackingLink}";
        message = template.replace(/{status}/g, statusUpper);
    }

    message = message
        .replace(/{customer}/g, order.customer || 'Customer')
        .replace(/{siteName}/g, siteName)
        .replace(/{orderId}/g, orderId)
        .replace(/{total}/g, order.total || 0)
        .replace(/{trackingLink}/g, trackingLink);

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

const uniquePhones = (...values) => {
    const seen = new Set();
    return values
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .filter((value) => {
            const key = normalizePhone(value);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
};

const adminAccountPhones = async () => {
    const Admin = require('../models/Admin');
    const admins = await Admin.find({ phone: { $exists: true, $ne: '' } }).select('phone');
    return uniquePhones(...admins.map((row) => row.phone), process.env.ADMIN_PHONE);
};

const sendAdminNewOrderSMS = async (order) => {
    if (!order) return;
    const dests = await adminAccountPhones();
    if (!dests.length) return;
    const orderId = order.orderId || order._id;
    const kind = order.isCustomRequest ? 'custom request' : 'order';
    const message = `WELAMA: New ${kind} #${orderId} from ${order.customer}. GHS ${order.total || 0}. Phone: ${smsDestination(order) || order.phone}`;
    const results = await Promise.all(dests.map((phone) => sendSMS(phone, message)));
    return results[0];
};

const sendAdminLoginSMS = async (admin, loginIdentifier) => {
    const ident = String(loginIdentifier || '').trim();
    const identIsPhone = Boolean(ident) && !ident.includes('@') && /\d/.test(ident);
    const dest = identIsPhone ? ident : (admin?.phone || process.env.ADMIN_PHONE);
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
