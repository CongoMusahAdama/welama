const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a brand name'],
        unique: true,
        trim: true
    },
    logoUrl: {
        type: String,
        required: [true, 'Please provide a brand logo']
    },
    sortOrder: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Brand', BrandSchema);
