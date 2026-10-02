const express = require('express');
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  updateCategoryImage,
  deleteCategory,
  addAttribute,
  deleteAttribute,
  reorderAttributes,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { categoryUploader } = require('../middleware/upload');

const router = express.Router();

// Public
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin
router.post('/', protect, categoryUploader.upload.single('image'), categoryUploader.processImage, createCategory);
router.put('/:id', protect, updateCategory);
router.put(
  '/:id/image',
  protect,
  categoryUploader.upload.single('image'),
  categoryUploader.processImage,
  updateCategoryImage
);
router.delete('/:id', protect, deleteCategory);
router.post('/:id/attributes', protect, addAttribute);
router.put('/:id/attributes/order', protect, reorderAttributes);
router.delete('/attributes/:attributeId', protect, deleteAttribute);

module.exports = router;
