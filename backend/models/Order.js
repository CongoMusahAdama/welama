const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    customer: {
        type: String,
        required: [true, 'Please provide a customer name'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide a contact number'],
        trim: true,
        index: true
    },
    smsPhone: {
        type: String,
        default: '',
        trim: true
    },
    location: {
        type: String,
        default: 'N/A'
    },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
            name: { type: String, required: true },
            image: { type: String, default: '' },
            category: { type: String, default: 'Luxury' },
            qty: { type: Number, required: true, default: 1, min: 1 },
            size: { type: String, default: 'M' },
            color: { type: String, default: '' }
        }
    ],
    total: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    notes: {
        type: String,
        default: ''
    },
    isCustomRequest: {
        type: Boolean,
        default: false,
        index: true
    },
    payment: {
        type: String,
        enum: ['Paid', 'Unpaid'],
        default: 'Unpaid',
        index: true
    },
    paymentScreenshot: {
        type: String,
        default: null
    },
    paymentMethod: {
        type: String,
        default: 'Direct Transfer'
    },
    paystackReference: {
        type: String,
        default: null,
        unique: true,
        sparse: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Blocked'],
        default: 'Pending',
        index: true
    },
    date: {
        type: String,
        default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    }
}, { timestamps: true });

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ phone: 1, orderId: 1 });

module.exports = mongoose.model('Order', OrderSchema);
