const Setting = require('../models/Setting');
const { ghanaLocalPhone } = require('./phone');

/**
 * Normalizes phone numbers for mNotify SMS sending.
 * e.g., 0244374433 -> 233244374433, +233244374433 -> 233244374433
 */
const normalizePhone = (phone) => {
    const local = ghanaLocalPhone(phone);
    if (local && local.startsWith('0') && local.length === 10) {
        return `233${local.slice(1)}`;
    }
    let cleaned = String(phone || '').replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 10) {
        cleaned = '233' + cleaned.substring(1);
    }
    return cleaned;
};

const smsDestination = (order) => order?.smsPhone || order?.phone;

const storefrontUrl = () => (
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://welama-gh.shop' : 'http://localhost:5173')
).split(',')[0].trim().replace(/\/$/, '');

const firstValue = (...vals) => vals.map((v) => String(v || '').trim()).find(Boolean) || '';

const isMnotifySuccess = (data) => {
    if (!data || typeof data !== 'object') return false;
    const statusText = String(data.status || data.Status || '').toLowerCase();
    const code = String(data.code || data.status_code || data.statusCode || '');
    const apiMessage = String(data.message || data.summary || data.msg || '');
    return (
        data.success === true ||
        statusText === 'success' ||
        statusText === 'ok' ||
        code === '2000' ||
        code === '200' ||
        /success|sent|queued|submitted/i.test(apiMessage)
    );
};

const failMessage = (data, fallback) => {
    const apiMessage = String(data?.message || data?.summary || data?.msg || fallback || 'mNotify rejected the SMS');
    const low = `${apiMessage} ${JSON.stringify(data || {})}`.toLowerCase();
    if (/insufficient|credit|balance|wallet/.test(low)) {
        return 'mNotify wallet has insufficient credit. Top up at https://apps.mnotify.net and try again.';
    }
    if (/sender/i.test(low) && /invalid|not.?approved|pending/i.test(low)) {
        return 'mNotify sender ID is not approved. Use the exact approved sender name, or wait for approval.';
    }
    return apiMessage;
};

const canonicalSender = (value) => {
    const raw = String(value || '').replace(/\s+/g, '').slice(0, 11);
    if (/^welama$/i.test(raw)) return 'Welama';
    return raw;
};

const postMnotify = async (apiKey, senderId, recipient, message) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
        const endpoint = `https://api.mnotify.com/api/sms/quick?key=${encodeURIComponent(apiKey)}`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                Authorization: apiKey,
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            signal: controller.signal,
            body: JSON.stringify({
                recipient: [recipient],
                sender: senderId,
                message,
                is_schedule: false,
                schedule_date: ''
            })
        });
        const data = await response.json().catch(() => ({ status: response.status, message: response.statusText }));
        if (isMnotifySuccess(data)) return { data, ok: true };

        const fallback = new URL('https://apps.mnotify.net/smsapi');
        fallback.searchParams.set('key', apiKey);
        fallback.searchParams.set('to', recipient);
        fallback.searchParams.set('msg', message);
        fallback.searchParams.set('sender_id', senderId);
        const legacy = await fetch(fallback.toString(), { signal: controller.signal });
        const legacyText = await legacy.text();
        let legacyData = { status: legacyText, message: legacyText };
        try { legacyData = JSON.parse(legacyText); } catch { /* plain text ok */ }
        const legacyOk = legacy.ok && (
            isMnotifySuccess(legacyData) ||
            /^(ok|success|sent|\d+)$/i.test(String(legacyText).trim())
        );
        return { data: legacyData, ok: Boolean(legacyOk) };
    } finally {
        clearTimeout(timer);
    }
};

const sendSMS = async (to, message) => {
    try {
        const recipient = normalizePhone(to);
        if (!recipient || recipient.length < 10) {
            console.warn('[mNotify SMS] Invalid recipient phone number:', to);
            return { success: false, message: 'Invalid phone number' };
        }

        const setting = await Setting.findOne();
        const apiKey = firstValue(
            process.env.MNOTIFY_API_KEY,
            process.env.NOTIFY_API_KEY,
            setting?.mnotifyApiKey,
            setting?.smsApiKey
        );
        const rawSender = firstValue(
            process.env.MNOTIFY_SENDER_ID,
            process.env.NOTIFY_SENDER_ID,
            setting?.mnotifySenderId,
            setting?.smsSenderId,
            'Welama'
        );
        const senderId = canonicalSender(rawSender) || 'Welama';

        if (setting?.smsEnabled === false) {
            console.log(`[mNotify SMS] SMS disabled in settings. Skipping SMS to ${recipient}`);
            return { success: false, message: 'SMS is turned off in Admin Settings > mNotify SMS' };
        }

        console.log(`\n================== [mNotify SMS DISPATCH] ==================`);
        console.log(`TO: ${recipient} (${to})`);
        console.log(`SENDER: ${senderId}`);
        console.log(`MESSAGE:\n${message}`);
        console.log(`============================================================\n`);

        if (!apiKey) {
            console.log('[mNotify SMS] MNOTIFY_API_KEY is missing. SMS was not sent.');
            return {
                success: false,
                message: 'mNotify API key is missing. Add it in Admin Settings > mNotify SMS, or set MNOTIFY_API_KEY on the server.'
            };
        }

        let result = await postMnotify(apiKey, senderId, recipient, message);
        console.log('[mNotify SMS] mNotify API Response:', result.data);

        if (!result.ok && ghanaLocalPhone(to)) {
            const local = ghanaLocalPhone(to);
            if (local && local !== recipient) {
                result = await postMnotify(apiKey, senderId, local, message);
                console.log('[mNotify SMS] Retry with local number:', result.data);
            }
        }

        if (!result.ok) {
            return { success: false, message: failMessage(result.data), data: result.data };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[mNotify SMS Error]:', error.message);
        return { success: false, message: error.message };
    }
};

const sendOrderConfirmationSMS = async (order) => {
    if (!order) return;
    const dest = smsDestination(order);
    if (!dest) return;
    const clientUrl = storefrontUrl();
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
    const clientUrl = storefrontUrl();
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
    const clientUrl = storefrontUrl();
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
    const setting = await Setting.findOne();
    return uniquePhones(
        ...admins.map((row) => row.phone),
        process.env.ADMIN_PHONE,
        setting?.contactPhone
    );
};

const sendAdminNewOrderSMS = async (order) => {
    if (!order) return;
    const dests = await adminAccountPhones();
    if (!dests.length) return;
    const orderId = order.orderId || order._id;
    const kind = order.isCustomRequest ? 'custom request' : 'order';
    const items = (order.items || [])
        .map((item) => `${item.qty || 1}x ${item.name || 'Item'}`)
        .join(', ')
        .slice(0, 90);
    const dashboardLink = `${storefrontUrl()}/admin/orders?search=${encodeURIComponent(orderId)}`;
    const message = [
        `WELAMA: New ${kind} #${orderId}`,
        `${order.customer || 'Customer'} | ${smsDestination(order) || order.phone || ''} | GHS ${order.total || 0}`,
        items ? items : '',
        `Open in dashboard: ${dashboardLink}`
    ].filter(Boolean).join('\n');
    const results = await Promise.all(dests.map((phone) => sendSMS(phone, message)));
    return results[0];
};

const sendAdminLoginSMS = async (admin, loginIdentifier) => {
    const ident = String(loginIdentifier || '').trim();
    const identIsPhone = Boolean(ident) && !ident.includes('@') && /\d/.test(ident);
    const dests = uniquePhones(
        admin?.phone,
        identIsPhone ? ident : '',
        process.env.ADMIN_PHONE
    );
    if (!dests.length) return { success: false, message: 'No admin phone to SMS' };
    const when = new Date().toLocaleString('en-GH', {
        timeZone: 'Africa/Accra',
        hour: 'numeric',
        minute: '2-digit',
        day: 'numeric',
        month: 'short'
    });
    const who = admin?.name || 'Admin';
    const message = `WELAMA: Login successful. ${who} signed in to the admin dashboard at ${when}.`;
    const results = await Promise.all(dests.map((phone) => sendSMS(phone, message)));
    return results.find((row) => row?.success) || results[0];
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
