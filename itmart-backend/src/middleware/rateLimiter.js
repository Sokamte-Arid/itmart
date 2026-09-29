const rateLimit = require('express-rate-limit');

// Protects POST /api/orders (public, unauthenticated) from being spammed —
// accidentally (double-clicks) or deliberately (scripted abuse). Real
// customers placing one order will never come close to this limit.
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 order submissions per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many orders submitted from this device. Please try again in a few minutes.',
  },
});

// Looser general limiter for the rest of the public API (search, browsing),
// mainly to blunt scraping/brute-force rather than restrict normal use.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// Tighter limiter for admin login attempts, to slow down credential guessing.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in a few minutes.',
  },
});

module.exports = { orderLimiter, generalLimiter, loginLimiter };
