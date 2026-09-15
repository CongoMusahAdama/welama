const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: 'WELAMA'
    },
    tagline: {
        type: String,
        default: 'The Essence of Luxury'
    },
    logoUrl: {
        type: String,
        default: '/welamalogo.png'
    },
    heroImageUrl: {
        type: String,
        default: '/shophero.png'
    },
    contactPhone: {
        type: String,
        default: '0244374433'
    },
    contactEmail: {
        type: String,
        default: 'info@welama.com'
    },
    address: {
        type: String,
        default: 'Accra, Ghana'
    },
    // mNotify SMS Service
    mnotifyApiKey: {
        type: String,
        default: ''
    },
    mnotifySenderId: {
        type: String,
        default: 'WELAMA'
    },
    smsEnabled: {
        type: Boolean,
        default: true
    },
    // Paystack Payment Gateway
    paystackPublicKey: {
        type: String,
        default: ''
    },
    paystackSecretKey: {
        type: String,
        default: ''
    },
    paystackEnabled: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);
