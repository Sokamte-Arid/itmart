'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchSearchSuggestions(q) {
  const res = await fetch(`${API_URL}/products/search-suggestions?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export async function getDeliveryZones() {
  const res = await fetch(`${API_URL}/delivery-zones`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export async function trackOrder(reference) {
  const res = await fetch(`${API_URL}/orders/track/${encodeURIComponent(reference)}`);
  const json = await res.json();
  if (!res.ok) {
    const error = new Error(json.message || 'Order not found.');
    error.status = res.status;
    throw error;
  }
  return json.data;
}

export async function submitOrder(payload) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    const error = new Error(json.message || 'Failed to submit order.');
    error.details = json.details;
    error.status = res.status;
    throw error;
  }
  return json;
}

// One product by its web address — null when it no longer exists (wishlist refresh)
export async function getProductBySlugClient(slug) {
  try {
    const res = await fetch(`${API_URL}/products/${encodeURIComponent(slug)}`);
    if (res.status === 404) return null;
    if (!res.ok) return undefined; // unknown: keep what we have
    const json = await res.json();
    return json.data || null;
  } catch {
    return undefined;
  }
}

// Checkout: saves the cart with the customer's number, so the shop can help
// if they don't finish. Never blocks or breaks the checkout.
export async function saveAbandonedCart(payload) {
  try {
    await fetch(`${API_URL}/abandoned-carts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // still sent if the customer closes the page
    });
  } catch {
    /* offline or blocked: nothing to do */
  }
}

// The link sent on WhatsApp (/cart?restore=…): the products of that cart
export async function getCartToRestore(token, lang) {
  const res = await fetch(`${API_URL}/abandoned-carts/restore/${encodeURIComponent(token)}?lang=${lang === 'en' ? 'en' : 'fr'}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data || null;
}
