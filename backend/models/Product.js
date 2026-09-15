const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        default: 'Luxury',
        index: true
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0, 'Price cannot be negative'],
        default: 0
    },
    discountPrice: {
        type: Number,
        default: null,
        min: [0, 'Discount price cannot be negative']
    },
    stock: {
        type: Number,
        required: [true, 'Please provide stock count'],
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        default: '/welamalogo.png'
    },
    images: [String],
    sizes: {
        type: [String],
        default: []
    },
    colors: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Sold Out'],
        default: 'Active',
        index: true
    },
    soldOutAt: {
        type: Date,
        default: null
    },
    comesWithPouch: {
        type: Boolean,
        default: false
    },
    sku: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    }
}, { timestamps: true });

ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ name: 1 });

ProductSchema.pre('save', async function () {
    if (!this.sku) {
        let unique = false;
        while (!unique) {
            const candidate = 'WLM-' + Math.random().toString(36).toUpperCase().slice(2, 8);
            const existing = await mongoose.model('Product').findOne({ sku: candidate });
            if (!existing) {
                this.sku = candidate;
                unique = true;
            }
        }
    }
});

module.exports = mongoose.model('Product', ProductSchema);
