'use client';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

/**
 * Builds a wa.me link pre-filled with a question about a specific product —
 * for pre-sales inquiries, distinct from the order-confirmation WhatsApp
 * link built server-side in the backend after checkout.
 */
export function buildProductInquiryLink(product, name, locale) {
  const price = product.discountPrice ?? product.price;
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const text =
    locale === 'en'
      ? `Hello, I'm interested in this product: ${name} (${price} FCFA).\n${url}`
      : `Bonjour, je suis intéressé(e) par ce produit : ${name} (${price} FCFA).\n${url}`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function buildEmailContactLink({ subject, body } = {}) {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString();
  return `mailto:${CONTACT_EMAIL}${query ? `?${query}` : ''}`;
}

export { CONTACT_EMAIL, WHATSAPP_NUMBER };
