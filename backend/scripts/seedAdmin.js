require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const { ghanaLocalPhone, phoneLookupValues } = require('../utils/phone');

async function seedAdmin() {
    try {
        const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
        const phone = ghanaLocalPhone(process.env.ADMIN_PHONE) || String(process.env.ADMIN_PHONE || '').trim();
        const password = String(process.env.ADMIN_PASSWORD || '').trim();
        const name = process.env.ADMIN_NAME || 'WELAMA Admin';

        if (!email || !phone || !password) {
            throw new Error('Set ADMIN_EMAIL, ADMIN_PHONE, and ADMIN_PASSWORD in .env');
        }

        await mongoose.connect(process.env.MONGO_URI);
        const phones = phoneLookupValues(phone);
        const matches = await Admin.find({
            $or: [{ email }, { phone: { $in: phones } }]
        }).select('+password');

        let admin = matches.find((row) => row.email === email) || matches[0] || null;
        if (matches.length > 1 && admin) {
            await Admin.deleteMany({
                _id: { $ne: admin._id },
                $or: [{ email }, { phone: { $in: phones } }]
            });
        }

        if (!admin) {
            admin = await Admin.create({
                name,
                email,
                phone,
                password,
                role: 'super-admin',
                needsPasswordChange: false
            });
            console.log('Admin created');
        } else {
            admin.name = name;
            admin.email = email;
            admin.phone = phone;
            admin.password = password;
            admin.needsPasswordChange = false;
            await admin.save();
            console.log('Admin updated from environment');
        }

        console.log(`Login phone: ${phone}`);
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

seedAdmin();
