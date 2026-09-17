const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Brand = require('./models/Brand');
const defaultBrands = require('./data/defaultBrands');
const { ghanaLocalPhone, phoneLookupValues, phonesMatch } = require('./utils/phone');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
});

const extraOrigins = [process.env.CLIENT_URL, process.env.FRONTEND_URL]
    .filter(Boolean)
    .flatMap((value) => String(value).split(','))
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://welama.vercel.app',
    'https://welama-gh.shop',
    'https://www.welama-gh.shop',
    ...extraOrigins
];

const stripMongoOperators = (value) => {
    if (Array.isArray(value)) return value.map(stripMongoOperators);
    if (value && typeof value === 'object') {
        const clean = {};
        Object.keys(value).forEach((key) => {
            if (key.startsWith('$') || key.includes('.')) return;
            clean[key] = stripMongoOperators(value[key]);
        });
        return clean;
    }
    return value;
};

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else if (/^https:\/\/welama[a-z0-9-]*\.vercel\.app$/.test(origin)) {
            callback(null, true);
        } else if (process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            console.warn(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
}));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 400,
    standardHeaders: true,
    skip: (req) => req.originalUrl.includes('/paystack/webhook')
});
app.use('/api', apiLimiter);

const { paystackWebhook } = require('./controllers/paymentController');
app.post(
    '/api/payment/paystack/webhook',
    express.raw({ type: 'application/json' }),
    (req, res, next) => {
        req.rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
        try {
            req.body = JSON.parse(req.rawBody.toString('utf8') || '{}');
        } catch {
            req.body = {};
        }
        next();
    },
    paystackWebhook
);

app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        req.body = stripMongoOperators(req.body);
    }
    next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// Server frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));

    app.get('/*path', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../', 'dist', 'index.html'));
    });
} else {
    // Root route for development
    app.get('/', (req, res) => {
        res.send('WELAMA API is running in development mode...');
    });
}

const waitForDb = async () => {
    if (mongoose.connection.readyState === 1) return;
    await mongoose.connection.asPromise();
};

const seedAdmin = async () => {
    try {
        await waitForDb();
        const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
        const adminPhone = ghanaLocalPhone(process.env.ADMIN_PHONE) || String(process.env.ADMIN_PHONE || '').trim();
        const adminPassword = String(process.env.ADMIN_PASSWORD || '').trim();
        const adminName = process.env.ADMIN_NAME || 'WELAMA Admin';

        if (!adminEmail || !adminPhone || !adminPassword) {
            console.log("No ADMIN_ credentials found in .env, skipping seed.");
            return;
        }

        const phones = phoneLookupValues(adminPhone);
        const matches = await Admin.find({
            $or: [{ email: adminEmail }, { phone: { $in: phones } }]
        }).select('+password');

        let admin = matches.find((row) => row.email === adminEmail) || matches[0] || null;

        if (matches.length > 1 && admin) {
            const keepId = String(admin._id);
            await Admin.deleteMany({
                _id: { $ne: keepId },
                $or: [{ email: adminEmail }, { phone: { $in: phones } }]
            });
        }

        if (!admin) {
            const count = await Admin.countDocuments();
            if (count === 1) {
                admin = await Admin.findOne().select('+password');
            }
        }

        if (!admin) {
            await Admin.create({
                name: adminName,
                email: adminEmail,
                phone: adminPhone,
                password: adminPassword,
                role: 'super-admin',
                needsPasswordChange: false
            });
            console.log('--- Default Admin Seeded Successfully ---');
            return;
        }

        admin.name = admin.name || adminName;
        admin.email = adminEmail;
        admin.phone = adminPhone;
        admin.role = admin.role || 'super-admin';
        const passwordOk = await admin.matchPassword(adminPassword);
        if (!passwordOk) {
            admin.password = adminPassword;
        }
        await admin.save();
        console.log('--- Admin credentials synced from environment ---');
    } catch (error) {
        console.error('Seeding error:', error.message);
    }
};

const seedExtraAdmin = async () => {
    try {
        await waitForDb();
        const phone = ghanaLocalPhone('0506626068');
        const password = 'admin1234';
        if (!phone) return;

        const phones = phoneLookupValues(phone);
        let extra = await Admin.findOne({ phone: { $in: phones } }).select('+password');
        if (!extra) {
            const candidates = await Admin.find().select('+password').limit(50);
            extra = candidates.find((row) => phonesMatch(row.phone, phone)) || null;
        }

        if (!extra) {
            await Admin.create({
                name: 'WELAMA Admin',
                phone,
                password,
                role: 'admin',
                needsPasswordChange: false
            });
            console.log('--- Extra admin account ready ---');
            return;
        }

        extra.phone = phone;
        extra.needsPasswordChange = false;
        extra.role = extra.role || 'admin';
        const passwordOk = await extra.matchPassword(password);
        if (!passwordOk) extra.password = password;
        await extra.save();
        console.log('--- Extra admin account synced ---');
    } catch (error) {
        console.error('Extra admin seeding error:', error.message);
    }
};

const seedBrands = async () => {
    try {
        await waitForDb();
        const count = await Brand.countDocuments();
        if (count > 0) return;
        await Brand.insertMany(defaultBrands);
        console.log('--- Default brands seeded ---');
    } catch (error) {
        console.error('Brand seeding error:', error.message);
    }
};

const PORT = process.env.PORT || 5000;

const start = async () => {
    await connectDB();
    app.listen(PORT, async () => {
        console.log(`Server running on port ${PORT}`);
        await seedAdmin();
        await seedExtraAdmin();
        await seedBrands();
    });
};

start();

// Global Error Handler (Hides stack traces in production)
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.error('FULL ERROR:', err);
    } else {
        console.error(err.message);
    }

    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});
