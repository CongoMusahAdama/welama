const express = require('express');
const {
    getGalleryItems,
    getAllGalleryItems,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem
} = require('../controllers/galleryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/all', protect, getAllGalleryItems);

router.route('/')
    .get(getGalleryItems)
    .post(protect, createGalleryItem);

router.route('/:id')
    .put(protect, updateGalleryItem)
    .delete(protect, deleteGalleryItem);

module.exports = router;
