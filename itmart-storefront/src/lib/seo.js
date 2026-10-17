// Référencement (SEO) helpers for server pages: page titles and descriptions
// (admin fields first, then sensible fallbacks), and the "structured data"
// (JSON-LD) that lets Google show price, stock and breadcrumbs in results.
import { imageUrl } from './api';
import { pickLang } from './i18nHelpers';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

const DEFAULT_TAGLINE = {
  fr: 'Matériel informatique au Cameroun',
  en: 'IT Equipment in Cameroon',
};
const DEFAULT_DESCRIPTION = {
  fr: 'Ordinateurs portables, accessoires, matériel réseau et plus, livrés partout au Cameroun. Produits authentiques, prix honnêtes.',
  en: 'Laptops, accessories, networking gear and more, delivered across Cameroon. Genuine products, honest prices.',
};

export const siteNameOf = (seo) => seo?.siteName || 'IT Mart';
export const homeTitleOf = (seo, locale) => seo?.homeTitle || `${siteNameOf(seo)} — ${DEFAULT_TAGLINE[locale] || DEFAULT_TAGLINE.fr}`;
export const homeDescriptionOf = (seo, locale) => seo?.homeDescription || DEFAULT_DESCRIPTION[locale] || DEFAULT_DESCRIPTION.fr;

// One line, cut at a word, with "…" when shortened
export function clip(text, max = 160) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

const priceOf = (p) => Number(p.discountPrice ?? p.price ?? 0);
const primaryImageOf = (p) => p.images?.find((i) => i.isPrimary) || p.images?.[0];

/** Title / description / image of a product page (Google + social sharing). */
export function productSeo(product, locale) {
  const name = pickLang(product, 'name', locale);
  const title = product.seoTitle || name;
  const description = clip(
    product.seoDescription ||
      pickLang(product, 'shortDescription', locale) ||
      pickLang(product, 'description', locale) ||
      (locale === 'en'
        ? `${name} — available at IT Mart, delivered across Cameroon.`
        : `${name} — disponible chez IT Mart, livré partout au Cameroun.`)
  );
  const image = primaryImageOf(product);
  return { title, description, image: image ? imageUrl(image.url) : null, name };
}

/** Structured data for a product: name, photos, price in FCFA, stock. */
export function productJsonLd(product, locale) {
  const { description, name } = productSeo(product, locale);
  const url = `${SITE_URL}/products/${product.slug}`;
  const images = (product.images || []).map((i) => imageUrl(i.url)).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    sku: product.sku,
    url,
    ...(images.length ? { image: images } : {}),
    ...(product.brand?.name ? { brand: { '@type': 'Brand', name: product.brand.name } } : {}),
    ...(product.category ? { category: pickLang(product.category, 'name', locale) } : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'XAF',
      price: priceOf(product),
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };
}

/** Breadcrumb shown by Google above the result: Accueil › Catégorie › Produit. */
export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** The shop itself: name, logo, social pages (shown on every page). */
export function organizationJsonLd({ seo, logoUrl, store }) {
  const sameAs = [store?.facebookUrl, store?.instagramUrl, store?.tiktokUrl].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: siteNameOf(seo),
    url: SITE_URL,
    ...(logoUrl ? { logo: imageUrl(logoUrl), image: imageUrl(logoUrl) } : {}),
    ...(store?.contactPhone ? { telephone: store.contactPhone } : {}),
    ...(store?.contactEmail ? { email: store.contactEmail } : {}),
    address: { '@type': 'PostalAddress', addressCountry: 'CM' },
    currenciesAccepted: 'XAF',
    ...(sameAs.length ? { sameAs } : {}),
  };
}

// Safe to put inside <script type="application/ld+json">
export const jsonLd = (data) => ({ __html: JSON.stringify(data).replace(/</g, '\\u003c') });
