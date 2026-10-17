const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Thin fetch wrapper for Server Components. Revalidates every 60s by
 * default (ISR-style) so catalog changes made in the admin dashboard show
 * up without needing a full redeploy, while still benefiting from caching.
 */
async function apiFetch(path, { revalidate = 60, ...options } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      next: { revalidate },
    });
  } catch (err) {
    // Network-level failure (backend unreachable, DNS, etc.) — degrade
    // gracefully rather than crashing the whole page.
    console.error(`[api] Network error fetching ${path}:`, err.message);
    return null;
  }

  if (!res.ok) {
    if (res.status === 404) return null;
    console.error(`[api] Request failed: ${path} (${res.status})`);
    return null;
  }

  return res.json();
}

export async function getCategories() {
  const res = await apiFetch('/categories');
  return res?.data || [];
}

export async function getCategoryBySlug(slug) {
  const res = await apiFetch(`/categories/${slug}`);
  return res?.data || null;
}

export async function getBrands() {
  const res = await apiFetch('/brands');
  return res?.data || [];
}

export async function getProducts(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (key === 'attr' && typeof value === 'object') {
      Object.entries(value).forEach(([attrId, attrVal]) => {
        query.append(`attr[${attrId}]`, attrVal);
      });
    } else {
      query.append(key, value);
    }
  });
  const res = await apiFetch(`/products?${query.toString()}`, { revalidate: 30 });
  return res || { data: [], meta: { total: 0, page: 1, pages: 1 } };
}

export async function getRandomProducts(limit = 8) {
  // revalidate: 0 — must be genuinely fresh (re-shuffled) on every page
  // load, unlike the rest of the catalog which is fine to cache briefly.
  const res = await apiFetch(`/products/random?limit=${limit}`, { revalidate: 0 });
  return res?.data || [];
}

export async function getProductBySlug(slug) {
  const res = await apiFetch(`/products/${encodeURIComponent(slug)}`, { revalidate: 30 });
  return res?.data || null;
}

export async function getBanners(placement) {
  const query = placement ? `?placement=${placement}` : '';
  const res = await apiFetch(`/banners${query}`);
  return res?.data || [];
}

// Tracking IDs entered in the admin (Suivi & publicité) — null if unreachable
export async function getTrackingSettings() {
  const res = await apiFetch('/settings/tracking', { revalidate: 60 });
  return res?.data || null;
}

// Logo + colours entered in the admin (Identité visuelle) — null if unreachable
export async function getBranding() {
  const res = await apiFetch('/settings/branding', { revalidate: 60 });
  return res?.data || null;
}

// WhatsApp number, phone, email, social links (admin → Boutique & contact).
export async function getStoreInfo() {
  const res = await apiFetch('/settings/store', { revalidate: 60 });
  const env = {
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
    contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
    facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
    instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
    tiktokUrl: '',
  };
  // The .env values are only used when the backend can't be reached
  const data = res?.data || env;
  const clean = {};
  for (const key of Object.keys(env)) clean[key] = data[key] || '';
  // Only digits in the number, only https:// links
  clean.whatsappNumber = /^\d{8,15}$/.test(clean.whatsappNumber) ? clean.whatsappNumber : '';
  for (const key of ['facebookUrl', 'instagramUrl', 'tiktokUrl']) {
    if (!/^https:\/\/[^\s<>"']+$/i.test(clean[key])) clean[key] = '';
  }
  return clean;
}

// Active delivery cities (admin → Zones de livraison), for the footer
export async function getDeliveryCities() {
  const res = await apiFetch('/delivery-zones');
  return (res?.data || []).map((z) => z.city).filter(Boolean);
}

export const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:5000';

export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
}

// Référencement of the whole site (admin → Paramètres → Référencement) — null if unreachable
export async function getSeoSettings() {
  const res = await apiFetch('/settings/seo', { revalidate: 60 });
  return res?.data || null;
}
