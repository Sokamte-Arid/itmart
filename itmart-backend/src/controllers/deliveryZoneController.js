const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/delivery-zones  (public — active zones, for the checkout dropdown)
const getDeliveryZones = asyncHandler(async (req, res) => {
  const zones = await prisma.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ success: true, data: zones });
});

// GET /api/delivery-zones/all  (admin — every zone, including inactive)
const getAllDeliveryZones = asyncHandler(async (req, res) => {
  const zones = await prisma.deliveryZone.findMany({ orderBy: { sortOrder: 'asc' } });
  res.json({ success: true, data: zones });
});

// POST /api/delivery-zones  (admin)
const createDeliveryZone = asyncHandler(async (req, res) => {
  const { city, fee, isActive, sortOrder } = req.body;
  if (!city || fee === undefined) throw new ApiError(400, 'city and fee are required.');

  const zone = await prisma.deliveryZone.create({
    data: {
      city: city.trim(),
      fee,
      isActive: isActive ?? true,
      sortOrder: sortOrder ?? 0,
    },
  });
  res.status(201).json({ success: true, data: zone });
});

// PUT /api/delivery-zones/:id  (admin)
const updateDeliveryZone = asyncHandler(async (req, res) => {
  const { city, fee, isActive, sortOrder } = req.body;
  const data = {};
  if (city !== undefined) data.city = city.trim();
  if (fee !== undefined) data.fee = fee;
  if (isActive !== undefined) data.isActive = isActive;
  if (sortOrder !== undefined) data.sortOrder = sortOrder;

  const zone = await prisma.deliveryZone.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: zone });
});

// DELETE /api/delivery-zones/:id  (admin)
const deleteDeliveryZone = asyncHandler(async (req, res) => {
  await prisma.deliveryZone.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Delivery zone deleted.' });
});

module.exports = {
  getDeliveryZones,
  getAllDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
};
