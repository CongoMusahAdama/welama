const express = require('express');
const { getReviews, getAllReviews, createReview, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/all', protect, getAllReviews);

router.route('/')
    .get(getReviews)
    .post(createReview);

router.route('/:id')
    .put(protect, updateReview)
    .delete(protect, deleteReview);

module.exports = router;
