const express = require('express');
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getCategories)
    .post(protect, createCategory);

router.route('/:id')
    .delete(protect, deleteCategory);

module.exports = router;

