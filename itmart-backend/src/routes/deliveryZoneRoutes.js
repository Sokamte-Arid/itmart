const express = require('express');
const {
  getDeliveryZones,
  getAllDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
} = require('../controllers/deliveryZoneController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/', getDeliveryZones);

// Admin
router.get('/all', protect, getAllDeliveryZones);
router.post('/', protect, createDeliveryZone);
router.put('/:id', protect, updateDeliveryZone);
router.delete('/:id', protect, deleteDeliveryZone);

module.exports = router;
