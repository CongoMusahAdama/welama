const express = require('express');
const { getBrands, createBrand, updateBrand, deleteBrand } = require('../controllers/brandController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getBrands)
    .post(protect, createBrand);

router.route('/:id')
    .put(protect, updateBrand)
    .delete(protect, deleteBrand);

module.exports = router;
