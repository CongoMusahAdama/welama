const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

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

// Seed Admin if not exists
const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPhone = process.env.ADMIN_PHONE;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPhone || !adminPassword) {
            console.log("No ADMIN_ credentials found in .env, skipping seed.");
            return;
        }

        const adminData = {
            name: process.env.ADMIN_NAME || 'WELAMA Admin',
            email: adminEmail,
            phone: adminPhone,
            password: adminPassword,
            role: 'super-admin',
            needsPasswordChange: false
        };

        const adminExists = await Admin.findOne({
            $or: [{ email: adminEmail }, { phone: adminPhone }]
        });

        if (!adminExists) {
            await Admin.create(adminData);
            console.log('--- Default Admin Seeded Successfully ---');
        } else if (adminExists.phone !== adminPhone) {
            adminExists.phone = adminPhone;
            await adminExists.save();
        }
    } catch (error) {
        console.error('Seeding error:', error.message);
    }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await seedAdmin();
});

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
