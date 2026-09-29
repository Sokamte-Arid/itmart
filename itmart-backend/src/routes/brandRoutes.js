const express = require('express');
const { getBrands, createBrand, updateBrand, updateBrandLogo, deleteBrand } = require('../controllers/brandController');
const { protect } = require('../middleware/auth');
const { brandUploader } = require('../middleware/upload');

const router = express.Router();

router.get('/', getBrands);
router.post('/', protect, brandUploader.upload.single('image'), brandUploader.processImage, createBrand);
router.put('/:id', protect, updateBrand);
router.put('/:id/logo', protect, brandUploader.upload.single('image'), brandUploader.processImage, updateBrandLogo);
router.delete('/:id', protect, deleteBrand);

module.exports = router;
