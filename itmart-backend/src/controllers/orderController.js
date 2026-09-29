const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { buildOrderWhatsAppLink } = require('../utils/whatsapp');
const { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } = require('../utils/mailer');
const { stripCostPrice, stripCostPriceFromList } = require('../utils/sanitizeProduct');

const generateReference = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${random}`;
};

// ---------------------------------------------------------------------------
// PUBLIC — customer places an order (no payment, just their info)
// ---------------------------------------------------------------------------

// POST /api/orders
// body: { customerName, phone, email?, address, deliveryZoneId, notes?, items: [{productId, quantity}], lang }
const createOrder = asyncHandler(async (req, res) => {
  const { customerName, phone, email, address, deliveryZoneId, notes, items, lang = 'fr' } = req.body;

  if (!customerName || !phone || !address || !deliveryZoneId) {
    throw new ApiError(400, 'customerName, phone, address and deliveryZoneId are required.');
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'The order must contain at least one item.');
  }

  const deliveryZone = await prisma.deliveryZone.findUnique({ where: { id: deliveryZoneId } });
  if (!deliveryZone || !deliveryZone.isActive) {
    throw new ApiError(400, 'Please select a valid delivery area.');
  }

  // Fetch current prices/names server-side — never trust prices from the client
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  if (products.length !== productIds.length) {
    throw new ApiError(400, 'One or more products in the order could not be found.');
  }

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  // Validate requested quantities against current stock — never trust the
  // client's cart state, since stock may have changed since it was added.
  const insufficientStock = items
    .map((i) => {
      const product = productMap[i.productId];
      return { product, requested: i.quantity };
    })
    .filter(({ product, requested }) => requested > product.stock);

  if (insufficientStock.length > 0) {
    const details = insufficientStock.map(({ product, requested }) => ({
      productId: product.id,
      nameEn: product.nameEn,
      nameFr: product.nameFr,
      requested,
      available: product.stock,
    }));
    throw new ApiError(
      409,
      lang === 'fr'
        ? 'Stock insuffisant pour un ou plusieurs articles de votre commande.'
        : 'Insufficient stock for one or more items in your order.',
      details
    );
  }

  const orderItemsData = items.map((i) => {
    const product = productMap[i.productId];
    const unitPrice = product.discountPrice ?? product.price;
    return { productId: product.id, quantity: i.quantity, unitPrice };
  });

  const subtotal = orderItemsData.reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0);
  const deliveryFee = Number(deliveryZone.fee);
  const total = subtotal + deliveryFee;

  const order = await prisma.order.create({
    data: {
      reference: generateReference(),
      customerName,
      phone,
      email: email || null,
      address,
      city: deliveryZone.city,
      deliveryFee,
      notes,
      total,
      items: { create: orderItemsData },
    },
    include: { items: { include: { product: true } } },
  });

  // Build the WhatsApp redirect link for the customer's browser to open
  const itemsForMessage = order.items.map((i) => ({
    nameEn: i.product.nameEn,
    nameFr: i.product.nameFr,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
  }));
  const whatsappLink = buildOrderWhatsAppLink(order, itemsForMessage, lang);

  // Fire-and-forget the confirmation emails — never block the order response on them
  sendOrderConfirmationEmail(order, itemsForMessage, lang).catch((err) =>
    console.error('[order] Failed to send customer confirmation email:', err.message)
  );
  sendAdminOrderNotificationEmail(order, itemsForMessage).catch((err) =>
    console.error('[order] Failed to send admin notification email:', err.message)
  );

  res.status(201).json({
    success: true,
    data: {
      order: {
        ...order,
        items: order.items.map((i) => ({ ...i, product: stripCostPrice(i.product) })),
      },
      whatsappLink,
    },
  });
});

// GET /api/orders/:reference/track  (public — customer can check their own order status)
const trackOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { reference: req.params.reference },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new ApiError(404, 'Order not found.');
  res.json({
    success: true,
    data: { ...order, items: order.items.map((i) => ({ ...i, product: stripCostPrice(i.product) })) },
  });
});

// ---------------------------------------------------------------------------
// ADMIN — manage orders
// ---------------------------------------------------------------------------

// GET /api/orders  (admin)
const getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status) where.status = status;

  const take = Math.min(Number(limit) || 20, 100);
  const skip = (Number(page) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { total, page: Number(page), limit: take, pages: Math.ceil(total / take) },
  });
});

// GET /api/orders/:id  (admin)
const getOrderById = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new ApiError(404, 'Order not found.');
  res.json({ success: true, data: order });
});

// PUT /api/orders/:id/status  (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const valid = ['PENDING', 'CONTACTED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!valid.includes(status)) throw new ApiError(400, `status must be one of: ${valid.join(', ')}`);

  const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
  res.json({ success: true, data: order });
});

// GET /api/orders/stats/summary  (admin — quick dashboard numbers)
const getOrderStats = asyncHandler(async (req, res) => {
  const [totalOrders, pendingOrders, totalRevenueResult, totalProducts] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
    prisma.product.count(),
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      pendingOrders,
      totalRevenue: totalRevenueResult._sum.total || 0,
      totalProducts,
    },
  });
});

// GET /api/orders/export  (admin — CSV download, optional ?status= filter)
const exportOrdersCsv = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const where = {};
  if (status) where.status = status;

  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // Minimal, dependency-free CSV writer — wraps every field in quotes and
  // escapes embedded quotes, which is sufficient for RFC 4180 compliance
  // without pulling in a library for something this small.
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const headers = [
    'Reference', 'Status', 'Customer', 'Phone', 'Email', 'Address', 'City',
    'Items', 'Delivery Fee (FCFA)', 'Total (FCFA)', 'Date',
  ];
  const rows = orders.map((o) => [
    o.reference,
    o.status,
    o.customerName,
    o.phone,
    o.email || '',
    o.address,
    o.city,
    o.items.map((i) => `${i.product?.nameEn || '—'} x${i.quantity}`).join('; '),
    o.deliveryFee,
    o.total,
    o.createdAt.toISOString(),
  ]);

  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="orders-${Date.now()}.csv"`);
  // Prepend a UTF-8 BOM so Excel opens accented characters (é, à, etc.) correctly
  res.send('\uFEFF' + csv);
});

// GET /api/orders/stats/analytics  (admin — revenue trend + top products for charts)
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const days = Math.min(Number(req.query.days) || 30, 90);
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since }, status: { not: 'CANCELLED' } },
    include: { items: { include: { product: true } } },
  });

  // Revenue by day — build every date in the range (even zero-revenue days)
  // so the chart doesn't have gaps.
  const byDate = new Map();
  for (let i = 0; i <= days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    byDate.set(d.toISOString().slice(0, 10), { date: d.toISOString().slice(0, 10), revenue: 0, orders: 0 });
  }
  orders.forEach((o) => {
    const key = o.createdAt.toISOString().slice(0, 10);
    const entry = byDate.get(key);
    if (entry) {
      entry.revenue += Number(o.total);
      entry.orders += 1;
    }
  });

  // Top products by revenue (quantity × unit price at time of order), plus
  // profit where a cost price is set. Products missing a cost price simply
  // don't contribute to the profit figure — we track that explicitly so the
  // admin UI can flag the total as partial rather than silently understating it.
  const productTotals = new Map();
  let totalProfit = 0;
  let hasIncompleteCostData = false;

  orders.forEach((o) => {
    o.items.forEach((item) => {
      const key = item.productId;
      const revenue = Number(item.unitPrice) * item.quantity;
      const costPrice = item.product?.costPrice;
      const profit = costPrice != null ? (Number(item.unitPrice) - Number(costPrice)) * item.quantity : 0;
      if (costPrice == null) hasIncompleteCostData = true;
      else totalProfit += profit;

      const existing = productTotals.get(key) || {
        productId: key,
        nameEn: item.product?.nameEn || '—',
        nameFr: item.product?.nameFr || '—',
        quantity: 0,
        revenue: 0,
        profit: 0,
        hasCostData: costPrice != null,
      };
      existing.quantity += item.quantity;
      existing.revenue += revenue;
      existing.profit += profit;
      if (costPrice == null) existing.hasCostData = false;
      productTotals.set(key, existing);
    });
  });
  const topProducts = [...productTotals.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  res.json({
    success: true,
    data: {
      revenueByDay: [...byDate.values()],
      topProducts,
      totalRevenue: orders.reduce((sum, o) => sum + Number(o.total), 0),
      totalOrders: orders.length,
      totalProfit,
      hasIncompleteCostData,
    },
  });
});

module.exports = {
  createOrder,
  trackOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  exportOrdersCsv,
  getSalesAnalytics,
};
