const GalleryItem = require('../models/GalleryItem');

exports.getGalleryItems = async (req, res) => {
    try {
        const items = await GalleryItem.find({ published: true }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: items.length, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllGalleryItems = async (req, res) => {
    try {
        const items = await GalleryItem.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: items.length, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createGalleryItem = async (req, res) => {
    try {
        const item = await GalleryItem.create({
            heading: req.body.heading,
            description: req.body.description || '',
            mediaUrl: req.body.mediaUrl,
            mediaType: req.body.mediaType,
            category: req.body.category || '',
            published: req.body.published !== false
        });
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateGalleryItem = async (req, res) => {
    try {
        const item = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found' });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteGalleryItem = async (req, res) => {
    try {
        const item = await GalleryItem.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found' });
        await item.deleteOne();
        res.status(200).json({ success: true, message: 'Gallery item removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
