'use client';

// WhatsApp / email links. The number and email come from the admin
// (Boutique & contact) through useStoreInfo() — see context/StoreContext.jsx.

/**
 * Builds a wa.me link pre-filled with a question about a specific product —
 * for pre-sales inquiries, distinct from the order-confirmation WhatsApp
 * link built server-side in the backend after checkout.
 */
export function buildProductInquiryLink(product, name, locale, whatsappNumber) {
  const price = product.discountPrice ?? product.price;
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const text =
    locale === 'en'
      ? `Hello, I'm interested in this product: ${name} (${price} FCFA).\n${url}`
      : `Bonjour, je suis intéressé(e) par ce produit : ${name} (${price} FCFA).\n${url}`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Builds a wa.me link with a general question (floating WhatsApp button),
 * mentioning the page the customer is on.
 */
export function buildGeneralWhatsAppLink(locale, whatsappNumber) {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const text =
    locale === 'en'
      ? `Hello, I have a question about your products.\n${url}`
      : `Bonjour, j'ai une question concernant vos produits.\n${url}`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function buildEmailContactLink(email, { subject, body } = {}) {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString();
  return `mailto:${email}${query ? `?${query}` : ''}`;
}
