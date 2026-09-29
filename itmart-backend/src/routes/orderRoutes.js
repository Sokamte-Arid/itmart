const express = require('express');
const {
  createOrder,
  trackOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  exportOrdersCsv,
  getSalesAnalytics,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { orderLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public
router.post('/', orderLimiter, createOrder);
router.get('/track/:reference', trackOrder);

// Admin — specific routes before the /:id catch-all
router.get('/stats/summary', protect, getOrderStats);
router.get('/stats/analytics', protect, getSalesAnalytics);
router.get('/export', protect, exportOrdersCsv);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
