require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const PHONE = '0244374433';
const PASSWORD = 'Peggy12345';
const NAME = 'Peggy Admin';

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if an admin already exists with this phone
        let admin = await Admin.findOne({ phone: PHONE });

        if (admin) {
            // Update password
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(PASSWORD, salt);
            admin.name = NAME;
            admin.needsPasswordChange = false;
            // Use updateOne to avoid triggering pre-save hash again
            await Admin.updateOne({ _id: admin._id }, {
                name: NAME,
                phone: PHONE,
                password: await bcrypt.hash(PASSWORD, salt),
                needsPasswordChange: false
            });
            console.log(`✅ Admin updated — Phone: ${PHONE}`);
        } else {
            // Create new admin (pre-save hook will hash password)
            const newAdmin = await Admin.create({
                name: NAME,
                phone: PHONE,
                password: PASSWORD,
                role: 'admin',
                needsPasswordChange: false
            });
            console.log(`✅ Admin created — Phone: ${PHONE} | ID: ${newAdmin._id}`);
        }

        console.log('\n🔑 Login Credentials:');
        console.log(`   Phone:    ${PHONE}`);
        console.log(`   Password: ${PASSWORD}`);
        console.log('\n🌐 Login at: http://localhost:5173/auth');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

seedAdmin();
