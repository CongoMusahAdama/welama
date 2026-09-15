const mongoose = require('mongoose');

const GalleryItemSchema = new mongoose.Schema({
    heading: {
        type: String,
        required: [true, 'Please add a heading'],
        trim: true,
        maxlength: 120
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ''
    },
    mediaUrl: {
        type: String,
        required: [true, 'Please upload an image or video']
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    category: {
        type: String,
        trim: true,
        default: ''
    },
    published: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

GalleryItemSchema.index({ published: 1, createdAt: -1 });
GalleryItemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('GalleryItem', GalleryItemSchema);
