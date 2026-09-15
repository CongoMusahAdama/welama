const Setting = require('../models/Setting');
const { sendSMS } = require('../utils/smsService');

const PUBLIC_FIELDS = [
    'siteName',
    'tagline',
    'logoUrl',
    'heroImageUrl',
    'contactPhone',
    'contactEmail',
    'address',
    'paystackPublicKey',
    'paystackEnabled',
    'smsEnabled',
    'mnotifySenderId'
];

const toPublicSettings = (setting) => {
    const src = setting?.toObject ? setting.toObject() : setting || {};
    const data = {};
    PUBLIC_FIELDS.forEach((key) => {
        data[key] = src[key];
    });
    if (!data.paystackPublicKey) {
        data.paystackPublicKey = process.env.PAYSTACK_PUBLIC_KEY || '';
    }
    return data;
};

const ensureSetting = async () => {
    let setting = await Setting.findOne();
    if (!setting) {
        setting = await Setting.create({
            siteName: 'WELAMA',
            tagline: 'The Essence of Luxury',
            logoUrl: '/welamalogo.png',
            contactPhone: '+233 24 437 4433',
            contactEmail: 'info@welama.com',
            address: 'Accra, Ghana',
            mnotifySenderId: 'WELAMA',
            smsEnabled: true
        });
    }
    return setting;
};

exports.getSettings = async (req, res) => {
    try {
        const setting = await ensureSetting();
        res.status(200).json({ success: true, data: toPublicSettings(setting) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAdminSettings = async (req, res) => {
    try {
        const setting = await ensureSetting();
        res.status(200).json({ success: true, data: setting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const body = { ...req.body };
        ['mnotifyApiKey', 'smsApiKey', 'paystackSecretKey', 'paystackPublicKey'].forEach((key) => {
            if (typeof body[key] === 'string' && !body[key].trim()) {
                delete body[key];
            }
        });

        let setting = await Setting.findOne();
        if (!setting) {
            setting = await Setting.create(body);
        } else {
            setting = await Setting.findByIdAndUpdate(setting._id, body, {
                new: true,
                runValidators: true
            });
        }
        res.status(200).json({ success: true, data: setting });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.testSms = async (req, res) => {
    try {
        const phone = req.body?.phone;
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Please provide a phone number' });
        }

        const result = await sendSMS(
            phone,
            'Hello from WELAMA. This is a test SMS via mNotify. If you received it, store notifications are working.'
        );

        return res.status(result.success ? 200 : 400).json({
            success: result.success,
            message: result.success
                ? 'Test SMS sent. Check the phone shortly.'
                : (result.message || 'mNotify did not send the SMS'),
            data: result.data || null
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
