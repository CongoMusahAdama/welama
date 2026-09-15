const express = require('express');
const router = express.Router();
const { upload, galleryUpload } = require('../config/upload');
const { uploadToCloudinary } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/upload
// @desc    Upload image(s) to Cloudinary
// @access  Private (admin only)
router.post('/', protect, upload.array('images', 16), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded.' });
        }

        // Upload each file to Cloudinary in parallel
        const uploadPromises = req.files.map(file => 
            uploadToCloudinary(file.buffer, 'welama/products')
        );

        const urls = await Promise.all(uploadPromises);

        res.status(200).json({
            success: true,
            urls,
            message: `${urls.length} image(s) uploaded successfully to Cloudinary.`
        });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ success: false, message: 'Image upload failed.', error: error.message });
    }
});

// @route   POST /api/upload/screenshot
// @desc    Upload payment screenshot to Cloudinary (Public)
// @access  Public
router.post('/screenshot', upload.single('screenshot'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        const secureUrl = await uploadToCloudinary(req.file.buffer, 'welama/payments');

        res.status(200).json({
            success: true,
            url: secureUrl,
            message: 'Screenshot uploaded successfully to Cloudinary.'
        });
    } catch (error) {
        console.error('Screenshot upload error:', error);
        res.status(500).json({ success: false, message: 'Screenshot upload failed.', error: error.message });
    }
});

// @route   POST /api/upload/logo
// @desc    Upload brand logo to Cloudinary (Admin only)
// @access  Private
router.post('/logo', protect, upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No logo file provided.' });
        }

        const secureUrl = await uploadToCloudinary(req.file.buffer, 'welama/brand');

        res.status(200).json({
            success: true,
            url: secureUrl,
            message: 'Logo uploaded successfully to Cloudinary.'
        });
    } catch (error) {
        console.error('Logo upload error:', error);
        res.status(500).json({ success: false, message: 'Logo upload failed.', error: error.message });
    }
});

// @route   POST /api/upload/hero
// @desc    Upload hero background image to Cloudinary (Admin only)
// @access  Private
router.post('/hero', protect, upload.single('hero'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No hero image file provided.' });
        }

        const secureUrl = await uploadToCloudinary(req.file.buffer, 'welama/brand');

        res.status(200).json({
            success: true,
            url: secureUrl,
            message: 'Hero image uploaded successfully to Cloudinary.'
        });
    } catch (error) {
        console.error('Hero upload error:', error);
        res.status(500).json({ success: false, message: 'Hero upload failed.', error: error.message });
    }
});

// @route   POST /api/upload/gallery
// @desc    Upload gallery image or video to Cloudinary (Admin only)
// @access  Private
router.post('/gallery', protect, galleryUpload.single('media'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No media file provided.' });
        }

        const mime = req.file.mimetype || '';
        const isVideo = mime.startsWith('video/');
        const isImage = mime.startsWith('image/');

        if (!isVideo && !isImage) {
            return res.status(400).json({ success: false, message: 'Please upload an image or video file.' });
        }

        const url = await uploadToCloudinary(req.file.buffer, 'welama/gallery');

        res.status(200).json({
            success: true,
            url,
            mediaType: isVideo ? 'video' : 'image',
            message: 'Gallery media uploaded successfully.'
        });
    } catch (error) {
        console.error('Gallery upload error:', error);
        res.status(500).json({ success: false, message: 'Gallery upload failed.', error: error.message });
    }
});

module.exports = router;
