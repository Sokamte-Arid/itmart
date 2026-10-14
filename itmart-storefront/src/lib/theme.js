// Shop colours chosen in the admin (Identité visuelle) → the CSS variables
// the whole design uses (Tailwind classes like bg-brand-500, text-navy-900
// read these variables, so overriding them recolours the entire site).

const HEX = /^#[0-9a-fA-F]{6}$/;

const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb) => `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;

// amount 0..1 of `target` mixed into `hex`
const mix = (hex, target, amount) => {
  const a = toRgb(hex);
  const b = toRgb(target);
  return toHex(a.map((v, i) => v + (b[i] - v) * amount));
};
const lighten = (hex, amount) => mix(hex, '#ffffff', amount);
const darken = (hex, amount) => mix(hex, '#000000', amount);

/**
 * Returns the `:root { ... }` CSS for the given branding, or '' when the
 * colours are missing/invalid (the default colours in globals.css then apply).
 * Only #RRGGBB values are ever written, so nothing else can reach the page.
 */
export function brandingCss(branding) {
  const primary = HEX.test(branding?.primaryColor || '') ? branding.primaryColor : null;
  const dark = HEX.test(branding?.darkColor || '') ? branding.darkColor : null;
  if (!primary && !dark) return '';

  const vars = {};
  if (primary) {
    // Main colour: buttons, prices, badges, links
    vars['--color-brand-50'] = lighten(primary, 0.94);
    vars['--color-brand-100'] = lighten(primary, 0.82);
    vars['--color-brand-400'] = lighten(primary, 0.2);
    vars['--color-brand-500'] = primary;
    vars['--color-brand-600'] = darken(primary, 0.12);
  }
  if (dark) {
    // Dark colour: header buttons, titles, footer
    vars['--color-navy-950'] = darken(dark, 0.35);
    vars['--color-navy-900'] = dark;
    vars['--color-navy-800'] = lighten(dark, 0.09);
    vars['--color-navy-700'] = lighten(dark, 0.2);
    vars['--color-navy-500'] = lighten(dark, 0.42);
    vars['--color-navy-300'] = lighten(dark, 0.68);
    vars['--color-navy-100'] = lighten(dark, 0.88);
  }
  return `:root{${Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';')}}`;
}

/** Only logo/icon paths written by our own backend are used. */
export const safeBrandingImage = (url) =>
  typeof url === 'string' && /^\/uploads\/branding\/[a-z0-9-]+\.(png|webp)$/.test(url) ? url : null;
