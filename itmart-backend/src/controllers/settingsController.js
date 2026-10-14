const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { readBranding, saveBranding, HEX } = require('../utils/branding');

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
// body: { primaryColor, darkColor, removeLogo?, removeIcon?, lang? }
const updateBrandingSettings = asyncHandler(async (req, res) => {
  const lang = req.body.lang === 'en' ? 'en' : 'fr';
  const current = await readBranding();
  const next = { ...current };

  for (const field of ['primaryColor', 'darkColor']) {
    if (req.body[field] === undefined) continue;
    if (!HEX.test(String(req.body[field]))) {
      throw new ApiError(
        400,
        lang === 'en' ? 'Colours must be in the #RRGGBB format (e.g. #FF6B35).' : 'Les couleurs doivent être au format #RRGGBB (ex. #FF6B35).'
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

  res.json({ success: true, data: await saveBranding(next) });
});

// POST /api/settings/branding/logo | /api/settings/branding/icon  (super admin, multipart "image")
// The logo keeps its transparency (PNG) so it can also go on invoices; the
// icon is made square (512×512) for the browser tab and phone home screens.
const uploadBrandingImage = asyncHandler(async (req, res) => {
  const kind = req.params.kind;
  if (!['logo', 'icon'].includes(kind)) throw new ApiError(404, 'Not found.');
  if (!req.file) throw new ApiError(400, 'An image file is required (field "image").');

  fs.mkdirSync(BRANDING_DIR, { recursive: true });
  const filename = `${kind}-${Date.now()}-${Math.round(Math.random() * 1e6)}.png`;
  const dest = path.join(BRANDING_DIR, filename);

  try {
    const image = sharp(req.file.buffer).rotate();
    if (kind === 'logo') {
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
  const field = kind === 'logo' ? 'logoUrl' : 'iconUrl';
  removeBrandingFile(current[field]);
  const saved = await saveBranding({ ...current, [field]: `/uploads/branding/${filename}` });
  res.json({ success: true, data: saved });
});

module.exports = {
  getTrackingSettings,
  updateTrackingSettings,
  getBrandingSettings,
  updateBrandingSettings,
  uploadBrandingImage,
  TRACKING_FIELDS,
};
