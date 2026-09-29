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
