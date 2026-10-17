const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { readBranding, saveBranding, HEX, isLight } = require('../utils/branding');
const { cleanSeo } = require('../utils/seo');
const { readStore, readStoreRaw, saveStore, validateStore, publicStore, envDefaults } = require('../utils/storeSettings');

// ---------------------------------------------------------------------------
// Tracking IDs (Meta Pixel, Google Analytics, Google Ads, Microsoft Clarity),
// entered in the admin under "Paramètres" instead of in the storefront's .env.
//
// These IDs end up inside <script> tags on every storefront page, so each one
// is checked against the exact format the tool uses. Anything else (a
// pasted snippet, a typo, an attempt to inject code) is refused.
// ---------------------------------------------------------------------------

const TRACKING_KEY = 'tracking';

const TRACKING_FIELDS = {
  metaPixelId: {
    pattern: /^\d{6,20}$/,
    fr: "L'ID du Pixel Meta doit contenir uniquement des chiffres (ex. 1234567890123456).",
    en: 'The Meta Pixel ID must contain digits only (e.g. 1234567890123456).',
  },
  gaMeasurementId: {
    pattern: /^G-[A-Z0-9]{4,16}$/,
    fr: "L'ID de mesure Google Analytics commence par G- (ex. G-AB12CD34EF).",
    en: 'The Google Analytics measurement ID starts with G- (e.g. G-AB12CD34EF).',
  },
  googleAdsId: {
    pattern: /^AW-\d{6,15}$/,
    fr: "L'ID Google Ads commence par AW- suivi de chiffres (ex. AW-123456789).",
    en: 'The Google Ads ID starts with AW- followed by digits (e.g. AW-123456789).',
  },
  googleAdsPurchaseLabel: {
    pattern: /^[A-Za-z0-9_-]{4,40}$/,
    fr: "Le libellé de conversion Google Ads ne contient que des lettres, chiffres, - et _ (ex. AbC-D_efG123).",
    en: 'The Google Ads conversion label only contains letters, digits, - and _ (e.g. AbC-D_efG123).',
  },
  clarityProjectId: {
    pattern: /^[a-z0-9]{6,20}$/,
    fr: "L'ID de projet Clarity contient des lettres minuscules et des chiffres (ex. k2x9abc1de).",
    en: 'The Clarity project ID contains lowercase letters and digits (e.g. k2x9abc1de).',
  },
};

const DEFAULT_TRACKING = {
  metaPixelId: '',
  gaMeasurementId: '',
  googleAdsId: '',
  googleAdsPurchaseLabel: '',
  clarityProjectId: '',
  requireConsent: true,
};

async function readTracking() {
  const row = await prisma.setting.findUnique({ where: { key: TRACKING_KEY } });
  if (!row) return { ...DEFAULT_TRACKING };
  try {
    const saved = JSON.parse(row.value);
    // Re-check on the way out too, so a bad value can never reach the storefront
    const clean = { ...DEFAULT_TRACKING };
    for (const [field, rule] of Object.entries(TRACKING_FIELDS)) {
      if (typeof saved[field] === 'string' && rule.pattern.test(saved[field])) clean[field] = saved[field];
    }
    clean.requireConsent = saved.requireConsent !== false;
    return clean;
  } catch {
    return { ...DEFAULT_TRACKING };
  }
}

// GET /api/settings/tracking  (public — the storefront reads it on every page)
const getTrackingSettings = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ success: true, data: await readTracking() });
});

// PUT /api/settings/tracking  (super admin)
// body: { metaPixelId, gaMeasurementId, googleAdsId, googleAdsPurchaseLabel, clarityProjectId, requireConsent, lang? }
const updateTrackingSettings = asyncHandler(async (req, res) => {
  const lang = req.body.lang === 'en' ? 'en' : 'fr';
  const next = { ...DEFAULT_TRACKING };

  for (const [field, rule] of Object.entries(TRACKING_FIELDS)) {
    const raw = req.body[field];
    const value = typeof raw === 'string' ? raw.trim() : '';
    if (value && !rule.pattern.test(value)) throw new ApiError(400, rule[lang]);
    next[field] = value;
  }
  if (next.googleAdsPurchaseLabel && !next.googleAdsId) {
    throw new ApiError(
      400,
      lang === 'en'
        ? 'Enter the Google Ads ID (AW-…) as well as the conversion label.'
        : "Saisissez aussi l'ID Google Ads (AW-…) en plus du libellé de conversion."
    );
  }
  next.requireConsent = req.body.requireConsent !== false;

  const value = JSON.stringify(next);
  await prisma.setting.upsert({
    where: { key: TRACKING_KEY },
    create: { key: TRACKING_KEY, value },
    update: { value },
  });

  res.json({ success: true, data: next });
});

// ---------------------------------------------------------------------------
// Branding: logo, icon and colours of the shop (admin → Identité visuelle)
// ---------------------------------------------------------------------------

const BRANDING_DIR = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', 'branding');

// Deletes a logo file we no longer use (only inside uploads/branding)
function removeBrandingFile(url) {
  if (!url || !url.startsWith('/uploads/branding/')) return;
  const file = path.join(BRANDING_DIR, path.basename(url));
  fs.promises.unlink(file).catch(() => {});
}

// GET /api/settings/branding  (public — the storefront reads it on every page)
const getBrandingSettings = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ success: true, data: await readBranding() });
});

// PUT /api/settings/branding  (super admin)
// body: { primaryColor, darkColor, backgroundColor, removeLogo?, removeIcon?, removeLogoDark?, lang? }
const updateBrandingSettings = asyncHandler(async (req, res) => {
  const lang = req.body.lang === 'en' ? 'en' : 'fr';
  const current = await readBranding();
  const next = { ...current };

  for (const field of ['primaryColor', 'darkColor', 'backgroundColor']) {
    if (req.body[field] === undefined) continue;
    if (!HEX.test(String(req.body[field]))) {
      throw new ApiError(
        400,
        lang === 'en' ? 'Colours must be in the #RRGGBB format (e.g. #FF6B35).' : 'Les couleurs doivent être au format #RRGGBB (ex. #FF6B35).'
      );
    }
    if (field === 'backgroundColor' && !isLight(String(req.body[field]))) {
      throw new ApiError(
        400,
        lang === 'en'
          ? 'The background colour must be light (white, cream, light grey…) so the text stays readable.'
          : 'La couleur de fond doit être claire (blanc, crème, gris clair…) pour que le texte reste lisible.'
      );
    }
    next[field] = String(req.body[field]).toUpperCase();
  }
  if (req.body.removeLogo === true) {
    removeBrandingFile(current.logoUrl);
    next.logoUrl = null;
  }
  if (req.body.removeIcon === true) {
    removeBrandingFile(current.iconUrl);
    next.iconUrl = null;
  }
  if (req.body.removeLogoDark === true) {
    removeBrandingFile(current.logoDarkUrl);
    next.logoDarkUrl = null;
  }

  res.json({ success: true, data: await saveBranding(next) });
});

// POST /api/settings/branding/logo | /icon | /logoDark  (super admin, multipart "image")
// logoDark = optional version of the logo made for dark backgrounds (footer).
// The logo keeps its transparency (PNG) so it can also go on invoices; the
// icon is made square (512×512) for the browser tab and phone home screens.
const uploadBrandingImage = asyncHandler(async (req, res) => {
  const kind = req.params.kind;
  if (!['logo', 'icon', 'logoDark'].includes(kind)) throw new ApiError(404, 'Not found.');
  if (!req.file) throw new ApiError(400, 'An image file is required (field "image").');

  fs.mkdirSync(BRANDING_DIR, { recursive: true });
  const filename = `${kind === 'logoDark' ? 'logo-dark' : kind}-${Date.now()}-${Math.round(Math.random() * 1e6)}.png`;
  const dest = path.join(BRANDING_DIR, filename);

  try {
    const image = sharp(req.file.buffer).rotate();
    if (kind === 'logo' || kind === 'logoDark') {
      await image.resize({ width: 800, height: 240, fit: 'inside', withoutEnlargement: true }).png().toFile(dest);
    } else {
      await image
        .resize({ width: 512, height: 512, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(dest);
    }
  } catch {
    throw new ApiError(400, 'Could not read this image. Please use a PNG, JPG or WebP file.');
  }

  const current = await readBranding();
  const field = { logo: 'logoUrl', icon: 'iconUrl', logoDark: 'logoDarkUrl' }[kind];
  removeBrandingFile(current[field]);
  const saved = await saveBranding({ ...current, [field]: `/uploads/branding/${filename}` });
  res.json({ success: true, data: saved });
});

// ---------------------------------------------------------------------------
// Shop details: WhatsApp, contact, social links, notifications, invoices
// (admin → Boutique & contact)
// ---------------------------------------------------------------------------

// GET /api/settings/store  (public — only what the storefront shows)
const getStoreSettings = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ success: true, data: publicStore(await readStore()) });
});

// GET /api/settings/store/admin  (super admin — saved values + the .env defaults shown as hints)
const getStoreSettingsAdmin = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { saved: await readStoreRaw(), defaults: envDefaults() } });
});

const STORE_ERRORS = {
  whatsappNumber: ['WhatsApp : indicatif pays + numéro, chiffres uniquement (ex. 237690000000).', 'WhatsApp: country code + number, digits only (e.g. 237690000000).'],
  contactPhone: ['Téléphone invalide (ex. +237 690 00 00 00).', 'Invalid phone number (e.g. +237 690 00 00 00).'],
  contactEmail: ['E-mail de contact invalide.', 'Invalid contact email.'],
  notificationEmail: ['E-mail de notification invalide.', 'Invalid notification email.'],
  facebookUrl: ['Lien Facebook invalide : il doit commencer par https://', 'Invalid Facebook link: it must start with https://'],
  instagramUrl: ['Lien Instagram invalide : il doit commencer par https://', 'Invalid Instagram link: it must start with https://'],
  tiktokUrl: ['Lien TikTok invalide : il doit commencer par https://', 'Invalid TikTok link: it must start with https://'],
  vatRate: ['Taux de TVA : entre 0 et 100.', 'VAT rate: between 0 and 100.'],
  proformaValidityDays: ['Validité de la proforma : entre 1 et 365 jours.', 'Proforma validity: between 1 and 365 days.'],
  lowStockThreshold: ['Seuil de stock bas : un nombre entre 0 et 10000.', 'Low-stock level: a number between 0 and 10000.'],
};

// PUT /api/settings/store  (super admin)
const updateStoreSettings = asyncHandler(async (req, res) => {
  const lang = req.body.lang === 'en' ? 'en' : 'fr';
  const { values, errors } = validateStore(req.body);
  if (errors.length) {
    const message = errors.map((f) => (STORE_ERRORS[f] || [`${f} invalide.`, `Invalid ${f}.`])[lang === 'en' ? 1 : 0]).join(' ');
    throw new ApiError(400, message, errors);
  }
  const saved = await saveStore(values);
  res.json({ success: true, data: { saved, defaults: envDefaults() } });
});

// ---------------------------------------------------------------------------
// Référencement (SEO) of the whole site: shop name in titles, home page
// title / description shown by Google, Google Search Console verification.
// (admin → Paramètres → Référencement). Products and categories have their
// own SEO fields on their edit forms.
// ---------------------------------------------------------------------------

const SEO_KEY = 'seo';
const DEFAULT_SEO = { siteName: 'IT Mart', homeTitle: '', homeDescription: '', googleVerification: '' };
const GOOGLE_VERIFICATION = /^[A-Za-z0-9_-]{10,100}$/;

async function readSeo() {
  const row = await prisma.setting.findUnique({ where: { key: SEO_KEY } });
  if (!row) return { ...DEFAULT_SEO };
  try {
    const saved = JSON.parse(row.value);
    return {
      siteName: cleanSeo(saved.siteName, 'keyword') || DEFAULT_SEO.siteName,
      homeTitle: cleanSeo(saved.homeTitle, 'title') || '',
      homeDescription: cleanSeo(saved.homeDescription, 'description') || '',
      googleVerification: GOOGLE_VERIFICATION.test(saved.googleVerification || '') ? saved.googleVerification : '',
    };
  } catch {
    return { ...DEFAULT_SEO };
  }
}

// GET /api/settings/seo  (public — the storefront reads it for page titles)
const getSeoSettings = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ success: true, data: await readSeo() });
});

// PUT /api/settings/seo  (super admin)
const updateSeoSettings = asyncHandler(async (req, res) => {
  const lang = req.body.lang === 'en' ? 'en' : 'fr';
  // People often paste the whole <meta name="google-site-verification" content="…"> tag
  let verification = String(req.body.googleVerification || '').trim();
  const fromTag = verification.match(/content\s*=\s*["']([^"']+)["']/i);
  if (fromTag) verification = fromTag[1].trim();
  if (verification && !GOOGLE_VERIFICATION.test(verification)) {
    throw new ApiError(
      400,
      lang === 'en'
        ? 'The Google verification code looks wrong: paste the code given by Search Console (letters, digits, - and _).'
        : 'Le code de vérification Google semble incorrect : collez le code donné par Search Console (lettres, chiffres, - et _).'
    );
  }
  const next = {
    siteName: cleanSeo(req.body.siteName, 'keyword') || DEFAULT_SEO.siteName,
    homeTitle: cleanSeo(req.body.homeTitle, 'title') || '',
    homeDescription: cleanSeo(req.body.homeDescription, 'description') || '',
    googleVerification: verification,
  };
  const value = JSON.stringify(next);
  await prisma.setting.upsert({ where: { key: SEO_KEY }, create: { key: SEO_KEY, value }, update: { value } });
  res.json({ success: true, data: next });
});

module.exports = {
  getSeoSettings,
  updateSeoSettings,
  getStoreSettings,
  getStoreSettingsAdmin,
  updateStoreSettings,
  getTrackingSettings,
  updateTrackingSettings,
  getBrandingSettings,
  updateBrandingSettings,
  uploadBrandingImage,
  TRACKING_FIELDS,
};
