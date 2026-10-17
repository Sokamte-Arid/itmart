const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getTrackingSettings,
  updateTrackingSettings,
  getBrandingSettings,
  updateBrandingSettings,
  uploadBrandingImage,
  getStoreSettings,
  getStoreSettingsAdmin,
  updateStoreSettings,
  getSeoSettings,
  updateSeoSettings,
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');
const ApiError = require('../utils/ApiError');

const router = express.Router();

// Logo / icon: kept in memory, then converted to PNG by the controller.
// SVG is refused on purpose (an SVG file can contain scripts).
const brandingUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new ApiError(400, 'Logo: PNG, JPG or WebP only (PNG with a transparent background is best).'), ok);
  },
});

// Public: the storefront needs these to load the tracking tools / show the brand
router.get('/tracking', getTrackingSettings);
router.get('/branding', getBrandingSettings);
router.get('/store', getStoreSettings);
router.get('/seo', getSeoSettings);

// Only a Super Admin can change them
router.get('/store/admin', protect, authorize('SUPER_ADMIN'), getStoreSettingsAdmin);
router.put('/store', protect, authorize('SUPER_ADMIN'), updateStoreSettings);
router.put('/seo', protect, authorize('SUPER_ADMIN'), updateSeoSettings);
router.put('/tracking', protect, authorize('SUPER_ADMIN'), updateTrackingSettings);
router.put('/branding', protect, authorize('SUPER_ADMIN'), updateBrandingSettings);
router.post('/branding/:kind', protect, authorize('SUPER_ADMIN'), brandingUpload.single('image'), uploadBrandingImage);

module.exports = router;
