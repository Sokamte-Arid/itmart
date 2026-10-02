const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { isPushConfigured, notifyAdmins } = require('../utils/push');

// GET /api/push/public-key  (admin)
// The admin app needs the VAPID public key to create a subscription.
const getPublicKey = asyncHandler(async (req, res) => {
  const enabled = isPushConfigured();
  res.json({
    success: true,
    data: { enabled, publicKey: enabled ? process.env.VAPID_PUBLIC_KEY : null },
  });
});

// POST /api/push/subscribe  (admin)
// body: { subscription: { endpoint, keys: { p256dh, auth } }, lang }
// Called when an admin turns notifications on for this device — and again
// when they switch language, so notifications follow the app's language.
const subscribe = asyncHandler(async (req, res) => {
  const { subscription, lang } = req.body || {};
  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    throw new ApiError(400, 'A valid push subscription (endpoint and keys) is required.');
  }
  if (!/^https:\/\//.test(endpoint)) {
    throw new ApiError(400, 'Invalid push endpoint.');
  }

  const data = {
    adminId: req.admin.id,
    p256dh,
    auth,
    lang: lang === 'en' ? 'en' : 'fr',
    userAgent: (req.headers['user-agent'] || '').slice(0, 300) || null,
  };

  // Upsert by endpoint: the same device re-subscribing (or another admin
  // logging in on that device) just takes the subscription over.
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { endpoint, ...data },
    update: data,
  });

  res.status(201).json({ success: true, message: 'Notifications enabled on this device.' });
});

// POST /api/push/unsubscribe  (admin)
// body: { endpoint }
const unsubscribe = asyncHandler(async (req, res) => {
  const { endpoint } = req.body || {};
  if (!endpoint) throw new ApiError(400, 'endpoint is required.');

  await prisma.pushSubscription.deleteMany({ where: { endpoint, adminId: req.admin.id } });
  res.json({ success: true, message: 'Notifications disabled on this device.' });
});

// POST /api/push/test  (admin) — sends a test notification to the current admin's devices
const sendTest = asyncHandler(async (req, res) => {
  if (!isPushConfigured()) {
    throw new ApiError(503, 'Push notifications are not configured on the server (missing VAPID keys).');
  }

  const sent = await notifyAdmins(
    (lang) => ({
      title: 'IT Mart Admin',
      body:
        lang === 'fr'
          ? '✅ Les notifications fonctionnent sur cet appareil.'
          : '✅ Notifications are working on this device.',
      url: '/',
      tag: 'test',
    }),
    { adminId: req.admin.id }
  );

  res.json({ success: true, data: { sent } });
});

module.exports = { getPublicKey, subscribe, unsubscribe, sendTest };
