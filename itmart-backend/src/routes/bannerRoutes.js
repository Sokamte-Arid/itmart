const express = require('express');
const {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  updateBannerImage,
  deleteBanner,
} = require('../controllers/bannerController');
const { protect } = require('../middleware/auth');
const { bannerUploader } = require('../middleware/upload');

const router = express.Router();

// Public
router.get('/', getBanners);

// Admin
router.get('/all', protect, getAllBanners);
router.post('/', protect, bannerUploader.upload.single('image'), bannerUploader.processImage, createBanner);
router.put('/:id', protect, updateBanner);
router.put(
  '/:id/image',
  protect,
  bannerUploader.upload.single('image'),
  bannerUploader.processImage,
  updateBannerImage
);
router.delete('/:id', protect, deleteBanner);

module.exports = router;
