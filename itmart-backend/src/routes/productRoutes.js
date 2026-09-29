const express = require('express');
const {
  getProducts,
  getRandomProducts,
  getLowStockProducts,
  getSearchSuggestions,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  setProductAttributes,
  getRelatedProducts,
  setRelatedProducts,
  addProductImages,
  deleteProductImage,
  setPrimaryImage,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public
router.get('/', getProducts);
router.get('/random', getRandomProducts);
router.get('/low-stock', protect, getLowStockProducts);
router.get('/search-suggestions', getSearchSuggestions);
router.get('/id/:id', protect, getProductById);
router.get('/:slug', getProductBySlug);

// Admin
router.post('/', protect, createProduct);
router.post('/:id/duplicate', protect, duplicateProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.put('/:id/attributes', protect, setProductAttributes);
router.get('/:id/related', protect, getRelatedProducts);
router.put('/:id/related', protect, setRelatedProducts);
router.post('/:id/images', protect, upload.array('images', 8), upload.processImages, addProductImages);
router.delete('/images/:imageId', protect, deleteProductImage);
router.put('/images/:imageId/primary', protect, setPrimaryImage);

module.exports = router;
