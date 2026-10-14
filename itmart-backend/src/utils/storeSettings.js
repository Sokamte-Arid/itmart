// Shop details entered in the admin under "Boutique & contact" (settings
// table, key "store"): WhatsApp number, contact details, social links,
// notification email, low-stock alert level and invoice details.
// Each field falls back to the old .env value when left empty in the admin.

const prisma = require('../config/prisma');

const STORE_KEY = 'store';

// field: [max length, check]
const isUrl = (v) => /^https:\/\/[^\s<>"']+$/i.test(v);
const isEmail = (v) => /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(v);
const TEXT_FIELDS = {
  whatsappNumber: [15, (v) => /^\d{8,15}$/.test(v)],
  contactPhone: [30, (v) => /^[+\d][\d\s().-]{5,29}$/.test(v)],
  contactEmail: [120, isEmail],
  notificationEmail: [120, isEmail],
  facebookUrl: [300, isUrl],
  instagramUrl: [300, isUrl],
  tiktokUrl: [300, isUrl],
  companyName: [100, () => true],
  companyAddress: [200, () => true],
  companyCity: [80, () => true],
  companyNiu: [40, () => true],
  companyRccm: [60, () => true],
  invoiceFooter: [300, () => true],
};

const envDefaults = () => {
  const e = process.env;
  return {
    whatsappNumber: e.ADMIN_WHATSAPP_NUMBER || '',
    // Shown publicly: only what's entered in the admin (empty = not shown)
    contactPhone: '',
    contactEmail: '',
    notificationEmail: e.ADMIN_EMAIL || '',
    facebookUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    companyName: e.COMPANY_NAME || 'IT Mart',
    companyAddress: e.COMPANY_ADDRESS || '',
    companyCity: e.COMPANY_CITY || '',
    companyNiu: e.COMPANY_NIU || '',
    companyRccm: e.COMPANY_RCCM || '',
    invoiceFooter: e.INVOICE_FOOTER || '',
    vatRate: Number(e.INVOICE_VAT_RATE || 0),
    proformaValidityDays: Number(e.PROFORMA_VALIDITY_DAYS || 15),
    lowStockThreshold: Number(e.LOW_STOCK_THRESHOLD || 5),
  };
};

const NUMBER_FIELDS = {
  vatRate: [0, 100],
  proformaValidityDays: [1, 365],
  lowStockThreshold: [0, 10000],
};

/**
 * Checks values sent by the admin. Returns { values, errors } where errors
 * lists the fields that are wrong. Empty text = "use the default".
 */
function validateStore(input = {}) {
  const values = {};
  const errors = [];
  for (const [field, [max, check]] of Object.entries(TEXT_FIELDS)) {
    if (input[field] === undefined) continue;
    let v = String(input[field] ?? '').trim().replace(/\s+/g, ' ');
    if (field === 'whatsappNumber') v = v.replace(/[\s+().-]/g, '');
    if (v && (v.length > max || !check(v))) errors.push(field);
    else values[field] = v;
  }
  for (const [field, [min, max]] of Object.entries(NUMBER_FIELDS)) {
    if (input[field] === undefined || input[field] === '') continue;
    const n = Number(input[field]);
    if (!Number.isFinite(n) || n < min || n > max) errors.push(field);
    else values[field] = field === 'vatRate' ? Math.round(n * 100) / 100 : Math.round(n);
  }
  return { values, errors };
}

async function readSaved() {
  const row = await prisma.setting.findUnique({ where: { key: STORE_KEY } });
  if (!row) return {};
  try {
    return validateStore(JSON.parse(row.value)).values; // re-checked on the way out
  } catch {
    return {};
  }
}

/** What the admin saved (empty fields stay empty) — for the admin form. */
async function readStoreRaw() {
  return readSaved();
}

/** Values in use: admin value, else .env value. */
async function readStore() {
  const defaults = envDefaults();
  let saved = {};
  try {
    saved = await readSaved();
  } catch (err) {
    console.error('[settings] Could not read shop settings:', err.message);
  }
  const merged = { ...defaults };
  for (const [k, v] of Object.entries(saved)) {
    if (v !== '' && v !== undefined && v !== null) merged[k] = v;
  }
  return merged;
}

async function saveStore(values) {
  const current = await readSaved();
  const next = { ...current, ...values };
  await prisma.setting.upsert({
    where: { key: STORE_KEY },
    create: { key: STORE_KEY, value: JSON.stringify(next) },
    update: { value: JSON.stringify(next) },
  });
  return next;
}

/** Stock level at or below which the admins get a low-stock alert. */
async function getLowStockThreshold() {
  return (await readStore()).lowStockThreshold;
}

// What the storefront may show publicly (no notification email, no invoice IDs)
const publicStore = (s) => ({
  whatsappNumber: s.whatsappNumber,
  contactPhone: s.contactPhone,
  contactEmail: s.contactEmail,
  facebookUrl: s.facebookUrl,
  instagramUrl: s.instagramUrl,
  tiktokUrl: s.tiktokUrl,
});

module.exports = { readStore, readStoreRaw, saveStore, validateStore, getLowStockThreshold, publicStore, envDefaults };
