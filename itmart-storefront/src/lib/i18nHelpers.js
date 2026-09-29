// Pure helper functions with no server-only dependencies (safe to import
// from Client Components). Server-only cookie/locale detection lives in
// lib/i18n.js instead.

// Picks the right bilingual field from API data, e.g.
// pickLang(product, 'name', locale) -> product.nameEn or product.nameFr
export function pickLang(obj, field, locale) {
  if (!obj) return '';
  const key = `${field}${locale === 'en' ? 'En' : 'Fr'}`;
  return obj[key] ?? obj[`${field}En`] ?? '';
}

// Simple {placeholder} interpolation for translation strings
export function interpolate(str, values = {}) {
  return str.replace(/\{(\w+)\}/g, (_, key) => (values[key] !== undefined ? values[key] : `{${key}}`));
}
