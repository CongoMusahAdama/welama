const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: 1,
        max: 5
    },
    text: {
        type: String,
        required: [true, 'Please share a few words about your experience'],
        trim: true,
        maxlength: 1000
    },
    productName: {
        type: String,
        trim: true,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true });

ReviewSchema.index({ status: 1, createdAt: -1 });
ReviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema);
