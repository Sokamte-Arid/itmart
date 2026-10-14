const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { buildOrderWhatsAppLink } = require('../utils/whatsapp');
const {
  sendOrderConfirmationEmail,
  sendAdminOrderNotificationEmail,
  sendLowStockAlertEmail,
} = require('../utils/mailer');
const { notifyNewOrder, notifyLowStock } = require('../utils/push');
const { buildInvoicePdf } = require('../utils/invoicePdf');
const { stripCostPrice, stripCostPriceFromList } = require('../utils/sanitizeProduct');
const { variantLabel } = require('../utils/variants');
const { readStore, getLowStockThreshold } = require('../utils/storeSettings');

const MAX_QUANTITY_PER_LINE = 999;

const generateReference = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${random}`;
};

// ---------------------------------------------------------------------------
// PUBLIC — customer places an order (no payment, just their info)
// ---------------------------------------------------------------------------

// POST /api/orders
// body: { customerName, phone, email?, address, deliveryZoneId, notes?, items: [{productId, variantId?, quantity}], lang }
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

  // Clean the cart lines: whole quantities only, and the same product +
  // variant added twice is merged into one line.
  const lines = new Map();
  for (const raw of items) {
    const quantity = Number(raw?.quantity);
    if (typeof raw?.productId !== 'string' || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      throw new ApiError(400, lang === 'fr' ? 'Un article de la commande est invalide.' : 'An item in the order is invalid.');
    }
    const variantId = typeof raw.variantId === 'string' && raw.variantId ? raw.variantId : null;
    const key = `${raw.productId}|${variantId || ''}`;
    const line = lines.get(key) || { productId: raw.productId, variantId, quantity: 0 };
    line.quantity += quantity;
    lines.set(key, line);
  }

  // Fetch current prices/names/stock server-side — never trust the client
  const productIds = [...new Set([...lines.values()].map((l) => l.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });

  if (products.length !== productIds.length || products.some((p) => !p.isActive)) {
    throw new ApiError(
      400,
      lang === 'fr'
        ? "Un ou plusieurs articles de votre panier ne sont plus disponibles."
        : 'One or more products in the order could not be found.'
    );
  }

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  // Resolve each line's variant: a product with variants needs one chosen
  // (colour / size), and it must belong to that product.
  const resolved = [...lines.values()].map((line) => {
    const product = productMap[line.productId];
    let variant = null;
    if (product.variants.length > 0) {
      variant = product.variants.find((v) => v.id === line.variantId);
      if (!variant) {
        const name = lang === 'fr' ? product.nameFr : product.nameEn;
        throw new ApiError(
          400,
          lang === 'fr'
            ? `Veuillez choisir la couleur / taille de « ${name} » (retirez-le du panier et ajoutez-le à nouveau).`
            : `Please choose the colour / size of "${name}" (remove it from the cart and add it again).`
        );
      }
    }
    return { ...line, product, variant };
  });

  // Validate requested quantities against current stock — never trust the
  // client's cart state, since stock may have changed since it was added.
  const insufficientStock = resolved.filter(
    ({ product, variant, quantity }) => quantity > (variant ? variant.stock : product.stock)
  );

  if (insufficientStock.length > 0) {
    const details = insufficientStock.map(({ product, variant, quantity }) => ({
      productId: product.id,
      variantId: variant?.id || null,
      variantLabel: variantLabel(variant, product.variantSizeLabel, lang),
      nameEn: product.nameEn,
      nameFr: product.nameFr,
      requested: quantity,
      available: variant ? variant.stock : product.stock,
    }));
    throw new ApiError(
      409,
      lang === 'fr'
        ? 'Stock insuffisant pour un ou plusieurs articles de votre commande.'
        : 'Insufficient stock for one or more items in your order.',
      details
    );
  }

  const orderItemsData = resolved.map(({ product, variant, quantity }) => ({
    productId: product.id,
    variantId: variant?.id || null,
    // Stored in French (the shop's main language) — the text never changes afterwards
    variantLabel: variantLabel(variant, product.variantSizeLabel, 'fr'),
    quantity,
    unitPrice: product.discountPrice ?? product.price,
  }));

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
    variantLabel: i.variantLabel,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
  }));
  const store = await readStore();
  const whatsappLink = buildOrderWhatsAppLink(order, itemsForMessage, lang, store.whatsappNumber);

  // Fire-and-forget the confirmation emails — never block the order response on them
  sendOrderConfirmationEmail(order, itemsForMessage, lang).catch((err) =>
    console.error('[order] Failed to send customer confirmation email:', err.message)
  );
  sendAdminOrderNotificationEmail(order, itemsForMessage).catch((err) =>
    console.error('[order] Failed to send admin notification email:', err.message)
  );
  // Instant notification on admins' phones (admin app) — also fire-and-forget
  notifyNewOrder(order).catch((err) =>
    console.error('[order] Failed to send admin push notification:', err.message)
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
// Stock is taken out of inventory while an order is in one of these statuses
// (i.e. once the admin has confirmed it with the customer), and given back
// if the order is cancelled or moved back to pending/contacted.
const STOCK_HOLDING_STATUSES = ['CONFIRMED', 'SHIPPED', 'DELIVERED'];

// body: { status, lang? }
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const lang = req.body.lang === 'en' ? 'en' : 'fr';
  const valid = ['PENDING', 'CONTACTED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!valid.includes(status)) throw new ApiError(400, `status must be one of: ${valid.join(', ')}`);

  const threshold = await getLowStockThreshold();
  const crossedLowStock = [];

  const order = await prisma.$transaction(async (tx) => {
    const current = await tx.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } } },
    });
    if (!current) throw new ApiError(404, 'Order not found.');

    const wasHolding = STOCK_HOLDING_STATUSES.includes(current.status);
    const willHold = STOCK_HOLDING_STATUSES.includes(status);
    // Only on the transition into "confirmed" — orders confirmed before this
    // feature existed (stockDeducted = false) are left alone.
    const deduct = willHold && !wasHolding && !current.stockDeducted;
    const restore = !willHold && current.stockDeducted;

    if (deduct) {
      const missing = [];
      for (const item of current.items) {
        const baseName = (lang === 'en' ? item.product.nameEn : item.product.nameFr) || item.product.nameEn;
        const name = item.variantLabel ? `${baseName} (${item.variantLabel})` : baseName;

        // A colour / size: take it from that variant's stock first (the
        // product's stock is the total of its variants).
        if (item.variantId) {
          const vres = await tx.productVariant.updateMany({
            where: { id: item.variantId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (vres.count === 0) {
            const freshVariant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
            missing.push({ name, requested: item.quantity, available: freshVariant ? freshVariant.stock : 0 });
            continue;
          }
        }

        // Conditional decrement: never lets stock go below zero, even if two
        // admins confirm orders for the last unit at the same moment.
        const res = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (res.count === 0) {
          const fresh = await tx.product.findUnique({ where: { id: item.productId } });
          missing.push({
            name,
            requested: item.quantity,
            available: fresh ? fresh.stock : 0,
          });
        } else {
          const updated = await tx.product.findUnique({ where: { id: item.productId } });
          // Alert only when this confirmation is what brings it down to the threshold
          if (updated.stock + item.quantity > threshold && updated.stock <= threshold) crossedLowStock.push(updated);
        }
      }
      if (missing.length > 0) {
        // Throwing rolls back every decrement made above
        const list = missing
          .map((m) =>
            lang === 'en'
              ? `${m.name} (ordered ${m.requested}, in stock ${m.available})`
              : `${m.name} (commandé ${m.requested}, en stock ${m.available})`
          )
          .join(' ; ');
        throw new ApiError(
          409,
          lang === 'en'
            ? `Not enough stock to confirm this order: ${list}. Restock or edit the order first.`
            : `Stock insuffisant pour confirmer cette commande : ${list}. Réapprovisionnez d'abord.`,
          missing
        );
      }
    }

    if (restore) {
      for (const item of current.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
        // Back into the colour / size it came from (unless that variant was deleted since)
        if (item.variantId) {
          await tx.productVariant.updateMany({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }

    return tx.order.update({
      where: { id: current.id },
      data: { status, ...(deduct ? { stockDeducted: true } : {}), ...(restore ? { stockDeducted: false } : {}) },
    });
  });

  // Same alerts as a manual stock edit, sent after the change is saved
  crossedLowStock.forEach((product) => {
    sendLowStockAlertEmail(product).catch((err) =>
      console.error('[order] Failed to send low-stock alert email:', err.message)
    );
    notifyLowStock(product).catch((err) =>
      console.error('[order] Failed to send low-stock push notification:', err.message)
    );
  });

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
    o.items
      .map((i) => `${i.product?.nameEn || '—'}${i.variantLabel ? ` (${i.variantLabel})` : ''} x${i.quantity}`)
      .join('; '),
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

// ---------------------------------------------------------------------------
// ADMIN — invoice / proforma PDF
// ---------------------------------------------------------------------------

// Orders not confirmed yet get a proforma; confirmed ones get a real invoice.
const PROFORMA_STATUSES = ['PENDING', 'CONTACTED'];
const INVOICE_STATUSES = ['CONFIRMED', 'SHIPPED', 'DELIVERED'];

/**
 * Gives the order its invoice number the first time an invoice is issued:
 * FAC-<year>-0001, 0002... with no gaps or duplicates. Once set it never
 * changes, so downloading the invoice again gives the exact same document.
 */
async function ensureInvoiceNumber(order) {
  if (order.invoiceNumber) return order;

  const year = new Date().getFullYear();
  const prefix = `FAC-${year}-`;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existing = await prisma.order.findMany({
      where: { invoiceNumber: { startsWith: prefix } },
      select: { invoiceNumber: true },
    });
    const last = existing.reduce((max, o) => Math.max(max, Number(o.invoiceNumber.slice(prefix.length)) || 0), 0);
    const invoiceNumber = `${prefix}${String(last + 1).padStart(4, '0')}`;

    try {
      // `invoiceNumber: null` in the filter: if another request numbered this
      // order a moment ago, we don't overwrite it.
      await prisma.order.updateMany({
        where: { id: order.id, invoiceNumber: null },
        data: { invoiceNumber, invoicedAt: new Date() },
      });
      return prisma.order.findUnique({
        where: { id: order.id },
        include: { items: { include: { product: true } } },
      });
    } catch (err) {
      // Two orders got the same number at the same instant — try the next one
      if (err.code === 'P2002') continue;
      throw err;
    }
  }
  throw new ApiError(500, 'Could not assign an invoice number, please try again.');
}

// GET /api/orders/:id/invoice?lang=fr|en  (admin)
const downloadInvoice = asyncHandler(async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en' : 'fr';
  let order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new ApiError(404, 'Order not found.');

  let type;
  let number;
  let issuedAt;

  if (order.invoiceNumber) {
    // Already invoiced: always the same invoice, even if the status changed since
    type = 'invoice';
  } else if (INVOICE_STATUSES.includes(order.status)) {
    order = await ensureInvoiceNumber(order);
    type = 'invoice';
  } else if (PROFORMA_STATUSES.includes(order.status)) {
    type = 'proforma';
  } else {
    throw new ApiError(
      400,
      lang === 'fr'
        ? "Impossible d'établir une facture pour une commande annulée."
        : 'An invoice cannot be issued for a cancelled order.'
    );
  }

  if (type === 'invoice') {
    number = order.invoiceNumber;
    issuedAt = order.invoicedAt;
  } else {
    number = `PRO-${order.reference.replace(/^ORD-/, '')}`;
    issuedAt = new Date();
  }

  const pdf = await buildInvoicePdf(order, { type, number, issuedAt, lang });
  const filename = `${type === 'invoice' ? (lang === 'fr' ? 'facture' : 'invoice') : 'proforma'}-${number}.pdf`;

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': pdf.length,
    'X-Invoice-Number': number,
    'X-Invoice-Type': type,
  });
  res.send(pdf);
});

module.exports = {
  downloadInvoice,
  createOrder,
  trackOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  exportOrdersCsv,
  getSalesAnalytics,
};
