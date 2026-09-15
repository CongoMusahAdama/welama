const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];
        console.log('Token found in Authorization header');
    } else if (req.cookies && req.cookies.token) {
        // Get token from cookie
        token = req.cookies.token;
        console.log('Token found in cookie');
    }

    if (!token) {
        console.warn('No token provided for protected route:', req.originalUrl);
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    try {
        const secret = process.env.JWT_SECRET ? process.env.JWT_SECRET.trim() : null;
        if (!secret) {
            console.error('CRITICAL: JWT_SECRET is not defined in environment variables');
        }
        
        const decoded = jwt.verify(token, secret);

        // Fetch admin from database
        req.user = await Admin.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }

        next();
    } catch (error) {
        console.error('Auth verification error:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Not authorized, token expired' });
        }
        return res.status(401).json({ success: false, message: 'Not authorized, invalidated token' });
    }
};

module.exports = { protect };
