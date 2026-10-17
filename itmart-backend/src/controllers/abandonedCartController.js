const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { variantLabel } = require('../utils/variants');

// ---------------------------------------------------------------------------
// Abandoned carts. While a customer fills in the checkout form, the shop
// saves their cart as soon as a valid phone number is typed. If no order
// follows, the admin sees it under Commandes → Paniers abandonnés and can
// follow up on WhatsApp with a link that refills the cart.
// ---------------------------------------------------------------------------

const TOKEN = /^[A-Za-z0-9-]{16,64}$/;
const MAX_LINES = 50;
const MAX_QUANTITY = 999;
// After this, an untouched cart is deleted (customers' details aren't kept forever)
const KEEP_DAYS = 30;
// An order with the same phone number within this time "recovers" the cart
const RECOVERY_WINDOW_DAYS = 14;

const digitsOf = (phone) => String(phone || '').replace(/\D/g, '');
// Cameroon numbers are written with or without 237 — compare the last 9 digits
const phoneKey = (phone) => digitsOf(phone).slice(-9);
const cleanText = (value, max) => {
  const text = String(value || '').replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, max) : null;
};

// POST /api/abandoned-carts  (public — called by the checkout page)
// body: { token, customerName?, phone, email?, deliveryZoneId?, items: [{productId, variantId?, quantity}], lang? }
const saveCart = asyncHandler(async (req, res) => {
  const { token, customerName, phone, email, deliveryZoneId, items, lang } = req.body || {};
  if (typeof token !== 'string' || !TOKEN.test(token)) throw new ApiError(400, 'Invalid cart.');

  const digits = digitsOf(phone);
  if (digits.length < 8 || digits.length > 15) {
    // Not a usable number yet — nothing to save
    return res.json({ success: true, saved: false });
  }

  const existing = await prisma.abandonedCart.findUnique({ where: { token } });
  // Already turned into an order: leave it as it is
  if (existing?.status === 'RECOVERED') return res.json({ success: true, saved: false });

  // Clean the lines and price them from the database — never from the browser
  const wanted = new Map();
  for (const raw of Array.isArray(items) ? items.slice(0, MAX_LINES) : []) {
    const quantity = Number(raw?.quantity);
    if (typeof raw?.productId !== 'string' || !Number.isInteger(quantity) || quantity < 1) continue;
    const variantId = typeof raw.variantId === 'string' && raw.variantId ? raw.variantId : null;
    const key = `${raw.productId}|${variantId || ''}`;
    const line = wanted.get(key) || { productId: raw.productId, variantId, quantity: 0 };
    line.quantity = Math.min(MAX_QUANTITY, line.quantity + quantity);
    wanted.set(key, line);
  }

  const products = wanted.size
    ? await prisma.product.findMany({
        where: { id: { in: [...new Set([...wanted.values()].map((l) => l.productId))] }, isActive: true },
        include: { variants: true, images: { where: { isPrimary: true }, take: 1 } },
      })
    : [];
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));

  const lines = [];
  for (const line of wanted.values()) {
    const product = byId[line.productId];
    if (!product) continue;
    const variant = line.variantId ? product.variants.find((v) => v.id === line.variantId) : null;
    if (line.variantId && !variant) continue;
    lines.push({
      productId: product.id,
      variantId: variant?.id || null,
      quantity: line.quantity,
      nameFr: product.nameFr,
      nameEn: product.nameEn,
      slug: product.slug,
      variantLabel: variantLabel(variant, product.variantSizeLabel, 'fr'),
      unitPrice: Number(product.discountPrice ?? product.price),
      image: product.images[0]?.url || null,
    });
  }

  // Cart emptied: forget it
  if (lines.length === 0) {
    if (existing) await prisma.abandonedCart.delete({ where: { token } });
    return res.json({ success: true, saved: false });
  }

  let city = existing?.city || null;
  if (typeof deliveryZoneId === 'string' && deliveryZoneId) {
    const zone = await prisma.deliveryZone.findUnique({ where: { id: deliveryZoneId } });
    if (zone) city = zone.city;
  }
  const cleanEmail = cleanText(email, 120);

  const data = {
    customerName: cleanText(customerName, 100),
    phone: cleanText(phone, 30),
    phoneDigits: digits,
    email: cleanEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ? cleanEmail : null,
    city,
    items: lines,
    total: lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
    lang: lang === 'en' ? 'en' : 'fr',
  };

  await prisma.abandonedCart.upsert({
    where: { token },
    create: { token, ...data },
    // A cart hidden by the admin comes back if the customer returns to it
    update: existing?.status === 'DISMISSED' ? { ...data, status: 'OPEN' } : data,
  });
  res.json({ success: true, saved: true });
});

// GET /api/abandoned-carts/restore/:token?lang=fr|en  (public — the link sent to the customer)
// The products of that cart with today's prices and stock, ready to go back
// into the cart. Never the customer's details.
const getCartForRestore = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const lang = req.query.lang === 'en' ? 'en' : 'fr';
  if (!TOKEN.test(token)) throw new ApiError(404, 'Cart not found.');
  const cart = await prisma.abandonedCart.findUnique({ where: { token } });
  if (!cart) throw new ApiError(404, 'Cart not found.');

  const lines = Array.isArray(cart.items) ? cart.items : [];
  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) }, isActive: true },
    include: { variants: true, images: { where: { isPrimary: true }, take: 1 } },
  });
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));

  const items = [];
  for (const line of lines) {
    const product = byId[line.productId];
    if (!product) continue;
    const variant = line.variantId ? product.variants.find((v) => v.id === line.variantId) : null;
    if (line.variantId && !variant) continue;
    // A product that now has variants needs the customer to choose again
    if (!variant && product.variants.length > 0) continue;
    const stock = variant ? variant.stock : product.stock;
    if (stock < 1) continue;
    const variantImage = variant?.imageId
      ? await prisma.productImage.findUnique({ where: { id: variant.imageId } })
      : null;
    items.push({
      id: product.id,
      slug: product.slug,
      variantId: variant?.id || null,
      variantLabel: variantLabel(variant, product.variantSizeLabel, lang),
      nameEn: product.nameEn,
      nameFr: product.nameFr,
      price: Number(product.price),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      stock,
      image: variantImage?.url || product.images[0]?.url || null,
      quantity: Math.min(line.quantity, stock),
    });
  }
  res.json({ success: true, data: { items } });
});

// Called after an order is placed: the matching cart is marked as recovered
async function markCartRecovered({ cartToken, phone, order }) {
  const since = new Date(Date.now() - RECOVERY_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const key = phoneKey(phone);
  const or = [];
  if (typeof cartToken === 'string' && TOKEN.test(cartToken)) or.push({ token: cartToken });
  if (key.length >= 8) or.push({ phoneDigits: { endsWith: key } });
  if (or.length === 0) return 0;
  const result = await prisma.abandonedCart.updateMany({
    where: { status: { in: ['OPEN', 'CONTACTED', 'DISMISSED'] }, updatedAt: { gte: since }, OR: or },
    data: { status: 'RECOVERED', orderId: order.id, orderReference: order.reference },
  });
  return result.count;
}

// ------------------------------------------------------------------ admin

// GET /api/abandoned-carts?status=OPEN|CONTACTED|RECOVERED|DISMISSED  (admin)
const listCarts = asyncHandler(async (req, res) => {
  // Housekeeping: old carts are deleted
  await prisma.abandonedCart.deleteMany({
    where: { updatedAt: { lt: new Date(Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000) } },
  });

  const STATUSES = ['OPEN', 'CONTACTED', 'RECOVERED', 'DISMISSED'];
  const status = STATUSES.includes(req.query.status) ? req.query.status : null;
  const where = status ? { status } : { status: { in: ['OPEN', 'CONTACTED'] } };

  const [carts, grouped] = await Promise.all([
    prisma.abandonedCart.findMany({ where, orderBy: { updatedAt: 'desc' }, take: 200 }),
    prisma.abandonedCart.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  grouped.forEach((g) => (counts[g.status] = g._count._all));

  res.json({ success: true, data: carts, counts });
});

// PATCH /api/abandoned-carts/:id  (admin)  body: { status }
const updateCart = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!['OPEN', 'CONTACTED', 'DISMISSED'].includes(status)) throw new ApiError(400, 'Invalid status.');
  const cart = await prisma.abandonedCart.findUnique({ where: { id: req.params.id } });
  if (!cart) throw new ApiError(404, 'Cart not found.');
  const updated = await prisma.abandonedCart.update({
    where: { id: cart.id },
    data: { status, contactedAt: status === 'CONTACTED' ? new Date() : cart.contactedAt },
  });
  res.json({ success: true, data: updated });
});

// DELETE /api/abandoned-carts/:id  (admin)
const deleteCart = asyncHandler(async (req, res) => {
  await prisma.abandonedCart.deleteMany({ where: { id: req.params.id } });
  res.json({ success: true });
});

module.exports = { saveCart, getCartForRestore, markCartRecovered, listCarts, updateCart, deleteCart, phoneKey };
