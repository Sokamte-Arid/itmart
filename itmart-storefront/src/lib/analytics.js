'use client';

// ---------------------------------------------------------------------------
// Marketing & analytics tracking — Facebook (Meta) Pixel, Google tag
// (Google Analytics 4 + Google Ads conversions) and Microsoft Clarity.
//
// Every tool is optional: it only loads when its ID is set in .env
// (see .env.example). Each helper below is safe to call even when a tool is
// off, blocked by an ad-blocker, or the visitor declined tracking — it just
// does nothing.
// ---------------------------------------------------------------------------

export const TRACKING = {
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
  gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', // G-XXXXXXXXXX
  googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || '', // AW-XXXXXXXXXX
  googleAdsPurchaseLabel: process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL || '',
  clarityId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || '',
  // When true, nothing loads until the visitor accepts in the cookie banner
  requireConsent: process.env.NEXT_PUBLIC_REQUIRE_TRACKING_CONSENT !== 'false',
};

export const anyTrackerConfigured = () =>
  Boolean(TRACKING.metaPixelId || TRACKING.gaId || TRACKING.googleAdsId || TRACKING.clarityId);

const CURRENCY = 'XAF'; // FCFA (Central Africa) — the ISO code ad platforms expect

// ---------------------------------------------------------------- consent
const CONSENT_KEY = 'itmart_tracking_consent';
export const CONSENT_EVENT = 'itmart:consent-changed';
export const OPEN_CONSENT_EVENT = 'itmart:open-consent';

export function getConsent() {
  if (!TRACKING.requireConsent) return 'granted';
  try {
    return localStorage.getItem(CONSENT_KEY); // 'granted' | 'denied' | null (not asked yet)
  } catch {
    return null;
  }
}

export function setConsent(value) {
  const previous = getConsent();
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* private mode — consent just won't be remembered */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  // Scripts already running can't be unloaded — reload so they're gone
  if (previous === 'granted' && value === 'denied') window.location.reload();
}

export const openConsentSettings = () => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));

// ---------------------------------------------------------------- low-level
const fbq = (...args) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') window.fbq(...args);
};
const gtag = (...args) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') window.gtag(...args);
};

const priceOf = (p) => Number(p.discountPrice ?? p.price ?? 0);
const nameOf = (p) => p.nameFr || p.nameEn || p.name || '';

// Same ID as the Facebook events (the product's id), so reports line up across tools
const gaItem = (p, quantity = 1) => ({
  item_id: p.id,
  item_name: nameOf(p),
  item_brand: p.brand?.name,
  item_category: p.category?.nameFr || p.category?.nameEn,
  price: priceOf(p),
  quantity,
});

// ---------------------------------------------------------------- events

/** Every page view (called on each route change). */
export function trackPageView() {
  fbq('track', 'PageView');
  // GA4 records page views itself (including in-app navigation) — no call needed.
}

/** A product page was opened. */
export function trackViewItem(product) {
  const value = priceOf(product);
  fbq('track', 'ViewContent', {
    content_ids: [product.id],
    content_name: nameOf(product),
    content_type: 'product',
    value,
    currency: CURRENCY,
  });
  gtag('event', 'view_item', { currency: CURRENCY, value, items: [gaItem(product)] });
}

/** A product was added to the cart ("Acheter" or the cart button on a card). */
export function trackAddToCart(product, quantity = 1) {
  const value = priceOf(product) * quantity;
  fbq('track', 'AddToCart', {
    content_ids: [product.id],
    content_name: nameOf(product),
    content_type: 'product',
    contents: [{ id: product.id, quantity }],
    value,
    currency: CURRENCY,
  });
  gtag('event', 'add_to_cart', { currency: CURRENCY, value, items: [gaItem(product, quantity)] });
}

/** The checkout page was opened with items in the cart. */
export function trackBeginCheckout(cartItems, value) {
  fbq('track', 'InitiateCheckout', {
    content_ids: cartItems.map((i) => i.id),
    contents: cartItems.map((i) => ({ id: i.id, quantity: i.quantity })),
    num_items: cartItems.reduce((n, i) => n + i.quantity, 0),
    value,
    currency: CURRENCY,
  });
  gtag('event', 'begin_checkout', {
    currency: CURRENCY,
    value,
    items: cartItems.map((i) => gaItem(i, i.quantity)),
  });
}

/**
 * An order was placed. `reference` (ORD-...) is sent as the transaction /
 * event ID so a purchase is never counted twice.
 */
export function trackPurchase({ reference, value, deliveryFee = 0, cartItems }) {
  fbq(
    'track',
    'Purchase',
    {
      content_ids: cartItems.map((i) => i.id),
      contents: cartItems.map((i) => ({ id: i.id, quantity: i.quantity })),
      content_type: 'product',
      num_items: cartItems.reduce((n, i) => n + i.quantity, 0),
      value,
      currency: CURRENCY,
    },
    { eventID: reference }
  );
  gtag('event', 'purchase', {
    transaction_id: reference,
    currency: CURRENCY,
    value,
    shipping: deliveryFee,
    items: cartItems.map((i) => gaItem(i, i.quantity)),
  });
  if (TRACKING.googleAdsId && TRACKING.googleAdsPurchaseLabel) {
    gtag('event', 'conversion', {
      send_to: `${TRACKING.googleAdsId}/${TRACKING.googleAdsPurchaseLabel}`,
      value,
      currency: CURRENCY,
      transaction_id: reference,
    });
  }
}

/** A search was made from the header. */
export function trackSearch(query) {
  if (!query) return;
  fbq('track', 'Search', { search_string: query });
  gtag('event', 'search', { search_term: query });
}

/** The visitor tapped a WhatsApp / phone / email contact button. */
export function trackContact(channel) {
  fbq('track', 'Contact', { content_name: channel });
  gtag('event', 'contact', { method: channel });
}
