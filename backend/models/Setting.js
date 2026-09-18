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
        default: 'welama.business@gmail.com'
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
    smsTemplateOrderProcessing: {
        type: String,
        default: "Hello {customer}, your {siteName} order #{orderId} is now PROCESSING. Track here: {trackingLink}"
    },
    smsTemplateOrderShipped: {
        type: String,
        default: "Hello {customer}, your {siteName} order #{orderId} has been SHIPPED. Track: {trackingLink}"
    },
    smsTemplateOrderDelivered: {
        type: String,
        default: "Hello {customer}, your {siteName} order #{orderId} has been DELIVERED. Thank you. Details: {trackingLink}"
    },
    smsTemplateOrderCancelled: {
        type: String,
        default: "Hello {customer}, your {siteName} order #{orderId} was CANCELLED. Contact us if you need help."
    },
    smsTemplateOrderStatusUpdate: {
        type: String,
        default: "Hello {customer}, your {siteName} order #{orderId} status is now {status}. Track here: {trackingLink}"
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
    },
    aboutHeroKicker: { type: String, default: 'WELAMA' },
    aboutHeroTitle: { type: String, default: 'About WELAMA' },
    aboutEstablished: { type: String, default: 'Established 2026' },
    aboutTitle: { type: String, default: 'A Legacy of Timeless Elegance.' },
    aboutBody1: {
        type: String,
        default: "WELAMA was born from a simple yet profound belief: that a woman's wardrobe should be as confident and considered as she is. We are curating clothing and bags that balance clean silhouettes with rich, tactile detail."
    },
    aboutBody2: {
        type: String,
        default: 'Our journey begins with a small capsule collection, designed for women who value quality over noise. Soon, we will be proud to be a premier destination for those who seek pieces that feel as good as they look — refined, versatile, and unmistakably WELAMA.'
    },
    aboutImageUrl: { type: String, default: '/heroframe2.png' },
    aboutPhilosophyKicker: { type: String, default: 'Our Philosophy' },
    aboutPhilosophyTitle: { type: String, default: 'Values That Define Us' },
    aboutValue1Title: { type: String, default: 'Premium Craftsmanship' },
    aboutValue1Body: {
        type: String,
        default: 'We source only the finest fabrics and materials, from supple leathers to fluid, breathable textiles, ensuring every piece is built to last.'
    },
    aboutValue2Title: { type: String, default: 'Global Reach' },
    aboutValue2Body: {
        type: String,
        default: "Our designs draw on a global sensibility, formulated to serve the modern woman's wardrobe wherever she calls home."
    },
    aboutValue3Title: { type: String, default: 'Customer Care' },
    aboutValue3Body: {
        type: String,
        default: "WELAMA is a partner in your personal style journey. We provide personalized advice for every customer's unique taste."
    },
    aboutContactIntro: {
        type: String,
        default: 'Whether you have a question about our collections, need personalized styling advice, or want to discuss a wholesale partnership, we are here to assist you.'
    },
    footerIntro: {
        type: String,
        default: 'WELAMA crafts premium clothing and bags for the woman who moves through the world with quiet confidence.'
    }
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);
    