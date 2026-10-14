// Shop branding (logo + colours), entered in the admin under "Identité
// visuelle" and stored in the settings table (key "branding").

const prisma = require('../config/prisma');

const BRANDING_KEY = 'branding';
const HEX = /^#[0-9a-fA-F]{6}$/;
// Only files this server wrote into uploads/branding can be used as logo
const BRANDING_FILE = /^\/uploads\/branding\/[a-z0-9-]+\.(png|webp)$/;

// Relative luminance (0 = black, 1 = white). The page text is dark, so the
// background must stay light enough for it to be read comfortably.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const isLight = (hex) => luminance(hex) >= 0.7;

const DEFAULT_BRANDING = {
  primaryColor: '#FF6B35', // buttons, prices, highlights
  darkColor: '#1E2436', // header buttons, titles, footer
  backgroundColor: '#FFFFFF', // page background (light colours only)
  logoUrl: null, // wide logo (header, footer, invoices)
  iconUrl: null, // square icon (browser tab, phone home screen)
};

function cleanBranding(saved = {}) {
  return {
    primaryColor: HEX.test(saved.primaryColor || '') ? saved.primaryColor.toUpperCase() : DEFAULT_BRANDING.primaryColor,
    darkColor: HEX.test(saved.darkColor || '') ? saved.darkColor.toUpperCase() : DEFAULT_BRANDING.darkColor,
    backgroundColor:
      HEX.test(saved.backgroundColor || '') && isLight(saved.backgroundColor)
        ? saved.backgroundColor.toUpperCase()
        : DEFAULT_BRANDING.backgroundColor,
    logoUrl: BRANDING_FILE.test(saved.logoUrl || '') ? saved.logoUrl : null,
    iconUrl: BRANDING_FILE.test(saved.iconUrl || '') ? saved.iconUrl : null,
  };
}

async function readBranding() {
  const row = await prisma.setting.findUnique({ where: { key: BRANDING_KEY } });
  if (!row) return { ...DEFAULT_BRANDING };
  try {
    return cleanBranding(JSON.parse(row.value));
  } catch {
    return { ...DEFAULT_BRANDING };
  }
}

async function saveBranding(branding) {
  const value = JSON.stringify(cleanBranding(branding));
  await prisma.setting.upsert({
    where: { key: BRANDING_KEY },
    create: { key: BRANDING_KEY, value },
    update: { value },
  });
  return cleanBranding(branding);
}

module.exports = { readBranding, saveBranding, DEFAULT_BRANDING, HEX, isLight };
