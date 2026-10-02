const webpush = require('web-push');
const prisma = require('../config/prisma');

// ---------------------------------------------------------------------------
// Web Push notifications to admins' devices (the installable admin app).
//
// Needs a VAPID key pair in .env (generate once with `npm run push:keys`):
//   VAPID_PUBLIC_KEY=...
//   VAPID_PRIVATE_KEY=...
//   VAPID_SUBJECT=mailto:you@yourdomain.cm
// Without these keys everything still works — notifications are just skipped.
// ---------------------------------------------------------------------------

let configured = null;

function isPushConfigured() {
  if (configured !== null) return configured;

  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, ADMIN_EMAIL } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    configured = false;
    return configured;
  }

  try {
    webpush.setVapidDetails(
      VAPID_SUBJECT || `mailto:${ADMIN_EMAIL || 'admin@itmart.cm'}`,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
    configured = true;
  } catch (err) {
    console.error('[push] Invalid VAPID configuration — push notifications disabled:', err.message);
    configured = false;
  }
  return configured;
}

const formatFCFA = (amount) => `${Number(amount).toLocaleString('fr-FR')} FCFA`;

/**
 * Sends one payload to one stored subscription. Subscriptions the push
 * service reports as gone (404/410 — app uninstalled, permission revoked)
 * are deleted so we stop trying.
 */
async function sendToSubscription(sub, payload) {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 24, urgency: 'high' }
    );
    return true;
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
    } else {
      console.error(`[push] Failed to send to subscription ${sub.id}:`, err.statusCode || '', err.body || err.message);
    }
    return false;
  }
}

/**
 * Sends a notification to every subscribed admin device (or only to one
 * admin's devices when `adminId` is given). `buildPayload(lang)` returns the
 * notification in that device's language.
 */
async function notifyAdmins(buildPayload, { adminId } = {}) {
  if (!isPushConfigured()) return 0;

  const subs = await prisma.pushSubscription.findMany({
    where: adminId ? { adminId } : undefined,
  });
  const results = await Promise.all(subs.map((s) => sendToSubscription(s, buildPayload(s.lang === 'en' ? 'en' : 'fr'))));
  return results.filter(Boolean).length;
}

function notifyNewOrder(order) {
  const itemCount = (order.items || []).reduce((n, i) => n + i.quantity, 0);
  return notifyAdmins((lang) => ({
    title: lang === 'fr' ? `🛒 Nouvelle commande ${order.reference}` : `🛒 New order ${order.reference}`,
    body:
      lang === 'fr'
        ? `${order.customerName} · ${order.city} · ${itemCount} article(s) · ${formatFCFA(order.total)}`
        : `${order.customerName} · ${order.city} · ${itemCount} item(s) · ${formatFCFA(order.total)}`,
    url: `/orders?open=${order.id}`,
    tag: `order-${order.id}`,
  }));
}

function notifyLowStock(product) {
  return notifyAdmins((lang) => ({
    title: lang === 'fr' ? '⚠️ Stock faible' : '⚠️ Low stock',
    body:
      lang === 'fr'
        ? `${product.nameFr || product.nameEn} — plus que ${product.stock} en stock`
        : `${product.nameEn} — only ${product.stock} left in stock`,
    url: `/products/${product.id}`,
    tag: `stock-${product.id}`,
  }));
}

module.exports = {
  isPushConfigured,
  notifyAdmins,
  notifyNewOrder,
  notifyLowStock,
};
