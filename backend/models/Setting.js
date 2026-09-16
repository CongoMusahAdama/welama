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
    heroTitle1: {
        type: String,
        default: 'Elegant.'
    },
    heroTitle2: {
        type: String,
        default: 'Effortless.'
    },
    heroTitle3: {
        type: String,
        default: 'Empowered.'
    },
    heroSubtitle: {
        type: String,
        default: 'Curated corporate wears & bags for the modern woman'
    },
    brandColor: {
        type: String,
        default: '#0A0A0A'
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
        default: 'Welama'
    },
    smsEnabled: {
        type: Boolean,
        default: true
    },
    smsTemplateOrderConfirmation: {
        type: String,
        default: "Hello {customer}, thank you for ordering from {siteName}. Order #{orderId}, GHS {total}. Track here: {trackingLink}"
    },
    smsTemplateOrderShipped: {
        type: String,
        default: "Hello {customer}, your {siteName} order #{orderId} has been SHIPPED. Track: {trackingLink}"
    },
    smsTemplateOrderDelivered: {
        type: String,
        default: "Hello {customer}, your {siteName} order #{orderId} has been DELIVERED. Thank you. Details: {trackingLink}"
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
    