import { API_ORIGIN } from '../../api/client';

// Lengths Google shows in its results (approximately)
export const SEO_TITLE = { min: 30, max: 60, hard: 70 };
export const SEO_DESC = { min: 120, max: 160, hard: 170 };

// The shop's address, worked out from the API's (api.it-mart.tech → it-mart.tech)
export function shopHost() {
  try {
    const host = new URL(API_ORIGIN || window.location.origin).host;
    if (host.startsWith('api.')) return host.slice(4);
    if (host.startsWith('admin.')) return host.slice(6);
    if (host.startsWith('localhost')) return 'it-mart.tech';
    return host;
  } catch {
    return 'it-mart.tech';
  }
}

// "Écran PC" → "ecran pc": accents and case don't matter when checking a keyword
export const normalize = (text) =>
  String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const containsKeyword = (text, keyword) => {
  const k = normalize(keyword);
  return Boolean(k) && ` ${normalize(text)} `.includes(` ${k} `);
};

// green / orange / red for a length
export function lengthTone(length, { min, max, hard }) {
  if (length === 0) return 'danger';
  if (length < min || length > hard) return 'danger';
  if (length > max) return 'warning';
  return 'success';
}

export const firstSentences = (text, max = SEO_DESC.max) => {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
};
