const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  saveCart,
  getCartForRestore,
  listCarts,
  updateCart,
  deleteCart,
} = require('../controllers/abandonedCartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// The checkout page saves the cart while the customer types (a few times per
// visit at most) — this only blocks scripts flooding the endpoint.
const saveLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests.' },
});

// Public
router.post('/', saveLimiter, saveCart);
router.get('/restore/:token', getCartForRestore);

// Admin
router.get('/', protect, listCarts);
router.patch('/:id', protect, updateCart);
router.delete('/:id', protect, deleteCart);

module.exports = router;
