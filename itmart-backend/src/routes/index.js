const express = require('express');
const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const brandRoutes = require('./brandRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const bannerRoutes = require('./bannerRoutes');
const deliveryZoneRoutes = require('./deliveryZoneRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/banners', bannerRoutes);
router.use('/delivery-zones', deliveryZoneRoutes);

module.exports = router;
