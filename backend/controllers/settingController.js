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
    'mnotifySenderId',
    'heroTitle1',
    'heroTitle2',
    'heroTitle3',
    'heroSubtitle',
    'brandColor'
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
    if (!data.contactEmail) {
        data.contactEmail = 'welama.business@gmail.com';
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
            contactPhone: '0244374433',
            contactEmail: 'welama.business@gmail.com',
            address: 'Accra, Ghana',
            mnotifySenderId: 'Welama',
            smsEnabled: true
        });
    } else {
        let dirty = false;
        if (!String(setting.contactEmail || '').trim()) {
            setting.contactEmail = 'welama.business@gmail.com';
            dirty = true;
        }
        const sender = String(setting.mnotifySenderId || setting.smsSenderId || '').trim();
        if (!sender || /^welama$/i.test(sender)) {
            if (setting.mnotifySenderId !== 'Welama') {
                setting.mnotifySenderId = 'Welama';
                dirty = true;
            }
        }
        if (dirty) await setting.save();
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

        if (typeof body.mnotifySenderId === 'string') {
            const sender = body.mnotifySenderId.trim();
            body.mnotifySenderId = /^welama$/i.test(sender) ? 'Welama' : sender;
        }

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
