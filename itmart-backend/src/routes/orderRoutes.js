const express = require('express');
const {
  createOrder,
  trackOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  exportOrders,
  getOrderedProducts,
  getSalesAnalytics,
  downloadInvoice,
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
// Excel (CSV) or PDF; ?productId= for the customers of one product
router.get('/export', protect, exportOrders);
router.get('/export/products', protect, getOrderedProducts);
router.get('/', protect, getOrders);
router.get('/:id/invoice', protect, downloadInvoice);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
