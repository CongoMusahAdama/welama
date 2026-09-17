const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { ghanaLocalPhone, phoneLookupValues, phonesMatch } = require('../utils/phone');
const { sendAdminLoginSMS } = require('../utils/smsService');

// Generate Token and set cookie
const sendTokenResponse = (admin, statusCode, res) => {
    const secret = process.env.JWT_SECRET ? process.env.JWT_SECRET.trim() : null;
    const token = jwt.sign({ id: admin._id }, secret, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
    };

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            needsPasswordChange: admin.needsPasswordChange
        });
};

// @desc    Login Admin
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const identifier = String(req.body.identifier || '').trim();
        const password = String(req.body.password || '').trim();
        const email = identifier.toLowerCase();
        const phones = phoneLookupValues(identifier);

        let admin = await Admin.findOne({
            $or: [
                { email },
                { phone: { $in: phones } }
            ]
        }).select('+password');

        if (!admin && ghanaLocalPhone(identifier)) {
            const candidates = await Admin.find().select('+password').limit(20);
            admin = candidates.find((row) => phonesMatch(row.phone, identifier)) || null;
        }

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await admin.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        sendAdminLoginSMS(admin, identifier).catch((err) => console.error('[Login SMS Error]:', err.message));
        sendTokenResponse(admin, 200, res);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// @desc    Get Current Logged in Admin
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        res.status(200).json({
            success: true,
            data: admin,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Logout Admin / Clear Cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        data: {},
    });
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).select('+password');

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        // Check current password
        const isMatch = await admin.matchPassword(req.body.currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }

        admin.password = req.body.newPassword;
        admin.needsPasswordChange = false;
        await admin.save();

        sendTokenResponse(admin, 200, res);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const name = String(req.body.name || '').trim();
        if (!name) {
            return res.status(400).json({ success: false, message: 'Please provide your name' });
        }

        const admin = await Admin.findByIdAndUpdate(
            req.user.id,
            { name },
            { new: true, runValidators: true }
        );

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        res.status(200).json({
            success: true,
            data: admin
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
