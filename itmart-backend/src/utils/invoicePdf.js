const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const sharp = require('sharp');
const { amountInWords } = require('./amountInWords');

// ---------------------------------------------------------------------------
// Builds an invoice / proforma PDF for an order.
// Company details come from .env (see .env.example, "Invoices" section).
// ---------------------------------------------------------------------------

const COLORS = {
  ink: '#1e2436',
  text: '#2a3149',
  muted: '#6b7394',
  line: '#e6e8ee',
  zebra: '#f7f8fa',
  accent: '#f59e0b',
};

const T = {
  fr: {
    invoice: 'FACTURE',
    proforma: 'FACTURE PROFORMA',
    number: 'N°',
    date: 'Date',
    order: 'Commande',
    validUntil: "Valable jusqu'au",
    billedTo: 'Facturé à',
    item: 'Désignation',
    qty: 'Qté',
    unitPrice: 'Prix unitaire',
    amount: 'Montant',
    delivery: 'Livraison',
    subtotal: 'Sous-total articles',
    totalHT: 'Total HT',
    vat: 'TVA',
    totalTTC: 'Total TTC',
    total: 'Total à payer',
    inWordsInvoice: 'Arrêtée la présente facture à la somme de',
    inWordsProforma: 'Arrêtée la présente proforma à la somme de',
    currencyWords: 'francs CFA',
    niu: 'NIU',
    rccm: 'RCCM',
    tel: 'Tél.',
    page: 'Page',
    of: 'sur',
    proformaNote: "Ce document est une proforma : il ne constitue pas une facture et ne vaut pas preuve de paiement.",
  },
  en: {
    invoice: 'INVOICE',
    proforma: 'PROFORMA INVOICE',
    number: 'No.',
    date: 'Date',
    order: 'Order',
    validUntil: 'Valid until',
    billedTo: 'Billed to',
    item: 'Description',
    qty: 'Qty',
    unitPrice: 'Unit price',
    amount: 'Amount',
    delivery: 'Delivery',
    subtotal: 'Items subtotal',
    totalHT: 'Total excl. VAT',
    vat: 'VAT',
    totalTTC: 'Total incl. VAT',
    total: 'Total due',
    inWordsInvoice: 'This invoice is set at the sum of',
    inWordsProforma: 'This proforma is set at the sum of',
    currencyWords: 'CFA francs',
    niu: 'Tax ID (NIU)',
    rccm: 'RCCM',
    tel: 'Tel.',
    page: 'Page',
    of: 'of',
    proformaNote: 'This document is a proforma: it is not an invoice and is not proof of payment.',
  },
};

// Plain spaces as thousands separators — the built-in PDF fonts can't draw
// the narrow no-break space that toLocaleString('fr-FR') produces.
const money = (n) =>
  `${Math.round(Number(n) || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;

const formatDate = (d, lang) =>
  new Date(d).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

function companyFromEnv() {
  const e = process.env;
  return {
    name: e.COMPANY_NAME || 'IT Mart',
    address: e.COMPANY_ADDRESS || '',
    city: e.COMPANY_CITY || '',
    phone: e.COMPANY_PHONE || (e.ADMIN_WHATSAPP_NUMBER ? `+${e.ADMIN_WHATSAPP_NUMBER}` : ''),
    email: e.COMPANY_EMAIL || e.ADMIN_EMAIL || '',
    niu: e.COMPANY_NIU || '',
    rccm: e.COMPANY_RCCM || '',
    logo: e.COMPANY_LOGO || '',
    footer: e.INVOICE_FOOTER || '',
    vatRate: Number(e.INVOICE_VAT_RATE || 0),
    proformaValidityDays: Number(e.PROFORMA_VALIDITY_DAYS || 15),
  };
}

// Any image format (PNG, JPG, WebP, SVG...) → PNG buffer PDFKit can embed
async function loadLogo(logoPath) {
  if (!logoPath) return null;
  const full = path.isAbsolute(logoPath) ? logoPath : path.join(process.cwd(), logoPath);
  if (!fs.existsSync(full)) {
    console.warn(`[invoice] COMPANY_LOGO not found at ${full} — invoice generated without logo.`);
    return null;
  }
  try {
    return await sharp(full).resize({ width: 400, height: 200, fit: 'inside' }).png().toBuffer();
  } catch (err) {
    console.warn('[invoice] Could not read COMPANY_LOGO:', err.message);
    return null;
  }
}

/**
 * @param {object} order   order with items[].product
 * @param {object} opts    { type: 'invoice' | 'proforma', number, issuedAt, lang }
 * @returns {Promise<Buffer>}
 */
async function buildInvoicePdf(order, { type, number, issuedAt, lang = 'fr' }) {
  const t = T[lang] || T.fr;
  const company = companyFromEnv();
  const logo = await loadLogo(company.logo);
  const isProforma = type === 'proforma';

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 60, left: 50, right: 50 },
    bufferPages: true, // needed to write "Page x of y" at the end
    info: {
      Title: `${isProforma ? t.proforma : t.invoice} ${number}`,
      Author: company.name,
    },
  });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  const L = doc.page.margins.left;
  const R = doc.page.width - doc.page.margins.right;
  const W = R - L;

  // ---------------- Header: company (left) / document info (right)
  let y = 50;
  if (logo) {
    doc.image(logo, L, y, { fit: [140, 60] });
    y += 68;
  }
  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLORS.ink).text(company.name, L, y, { width: 260 });
  y = doc.y + 2;
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.text);
  const companyLines = [
    [company.address, company.city].filter(Boolean).join(', '),
    company.phone && `${t.tel} ${company.phone}`,
    company.email,
    company.niu && `${t.niu} : ${company.niu}`,
    company.rccm && `${t.rccm} : ${company.rccm}`,
  ].filter(Boolean);
  companyLines.forEach((line) => {
    doc.text(line, L, y, { width: 260 });
    y = doc.y + 1;
  });
  const companyBottom = y;

  const boxX = L + W - 220;
  doc.font('Helvetica-Bold').fontSize(isProforma ? 16 : 20).fillColor(COLORS.ink);
  doc.text(isProforma ? t.proforma : t.invoice, boxX, 50, { width: 220, align: 'right' });
  doc.moveTo(boxX + 140, doc.y + 4).lineTo(R, doc.y + 4).lineWidth(2).strokeColor(COLORS.accent).stroke();
  let ry = doc.y + 14;
  const infoRow = (label, value) => {
    doc.font('Helvetica').fontSize(9).fillColor(COLORS.muted).text(label, boxX, ry, { width: 100 });
    doc.font('Helvetica-Bold').fillColor(COLORS.ink).text(value, boxX + 100, ry, { width: 120, align: 'right' });
    ry += 15;
  };
  infoRow(t.number, number);
  infoRow(t.date, formatDate(issuedAt, lang));
  infoRow(t.order, order.reference);
  if (isProforma) {
    const until = new Date(issuedAt);
    until.setDate(until.getDate() + company.proformaValidityDays);
    infoRow(t.validUntil, formatDate(until, lang));
  }

  // ---------------- Customer box
  y = Math.max(companyBottom, ry) + 20;
  const customerLines = [
    order.phone && `${t.tel} ${order.phone}`,
    order.email,
    [order.address, order.city].filter(Boolean).join(', '),
  ].filter(Boolean);
  const boxH = 30 + 13 * customerLines.length + 6;
  doc.roundedRect(L, y, 280, boxH, 6).fillColor(COLORS.zebra).fill();
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted).text(t.billedTo.toUpperCase(), L + 12, y + 10);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.ink).text(order.customerName, L + 12, y + 22, { width: 256 });
  let cy = doc.y + 2;
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.text);
  customerLines.forEach((line) => {
    doc.text(line, L + 12, cy, { width: 256 });
    cy = doc.y + 1;
  });
  y = Math.max(y + boxH, cy + 6) + 24;

  // ---------------- Items table
  const col = {
    item: { x: L + 8, w: W - 8 - 40 - 95 - 100 - 8 },
    qty: { x: 0, w: 40 },
    unit: { x: 0, w: 95 },
    amount: { x: 0, w: 100 },
  };
  col.qty.x = col.item.x + col.item.w;
  col.unit.x = col.qty.x + col.qty.w;
  col.amount.x = col.unit.x + col.unit.w;

  const drawTableHeader = () => {
    doc.rect(L, y, W, 24).fillColor(COLORS.ink).fill();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
    doc.text(t.item, col.item.x, y + 8, { width: col.item.w });
    doc.text(t.qty, col.qty.x, y + 8, { width: col.qty.w, align: 'center' });
    doc.text(t.unitPrice, col.unit.x, y + 8, { width: col.unit.w, align: 'right' });
    doc.text(t.amount, col.amount.x, y + 8, { width: col.amount.w - 8, align: 'right' });
    y += 24;
  };

  const pageBottom = () => doc.page.height - doc.page.margins.bottom;
  const ensureSpace = (h, withHeader = true) => {
    if (y + h > pageBottom()) {
      doc.addPage();
      y = doc.page.margins.top;
      if (withHeader) drawTableHeader();
    }
  };

  drawTableHeader();

  const rows = order.items.map((i) => {
    const p = i.product || {};
    const name = (lang === 'en' ? p.nameEn || p.nameFr : p.nameFr || p.nameEn) || '—';
    return {
      name,
      sub: p.sku || '',
      qty: i.quantity,
      unit: Number(i.unitPrice),
      amount: Number(i.unitPrice) * i.quantity,
    };
  });
  const deliveryFee = Number(order.deliveryFee || 0);
  if (deliveryFee > 0) {
    rows.push({ name: `${t.delivery} — ${order.city}`, sub: '', qty: 1, unit: deliveryFee, amount: deliveryFee });
  }

  rows.forEach((row, idx) => {
    doc.font('Helvetica').fontSize(9.5);
    const nameH = doc.heightOfString(row.name, { width: col.item.w - 8 });
    const rowH = Math.max(nameH + (row.sub ? 12 : 0), 12) + 14;
    ensureSpace(rowH);
    if (idx % 2 === 1) doc.rect(L, y, W, rowH).fillColor(COLORS.zebra).fill();
    doc.fillColor(COLORS.ink).font('Helvetica').fontSize(9.5).text(row.name, col.item.x, y + 7, { width: col.item.w - 8 });
    if (row.sub) doc.fontSize(7.5).fillColor(COLORS.muted).text(row.sub, col.item.x, doc.y + 1, { width: col.item.w - 8 });
    doc.fontSize(9.5).fillColor(COLORS.text);
    doc.text(String(row.qty), col.qty.x, y + 7, { width: col.qty.w, align: 'center' });
    doc.text(money(row.unit), col.unit.x, y + 7, { width: col.unit.w, align: 'right' });
    doc.font('Helvetica-Bold').fillColor(COLORS.ink).text(money(row.amount), col.amount.x, y + 7, {
      width: col.amount.w - 8,
      align: 'right',
    });
    y += rowH;
    doc.moveTo(L, y).lineTo(R, y).lineWidth(0.5).strokeColor(COLORS.line).stroke();
  });

  // ---------------- Totals
  const total = Number(order.total);
  const itemsSubtotal = total - deliveryFee;
  const totalLines = [];
  if (deliveryFee > 0) totalLines.push([t.subtotal, money(itemsSubtotal)], [t.delivery, money(deliveryFee)]);
  if (company.vatRate > 0) {
    // Shop prices include VAT (TTC): split the total into HT + VAT
    const ht = Math.round(total / (1 + company.vatRate / 100));
    const rateLabel = `${String(company.vatRate).replace('.', lang === 'en' ? '.' : ',')} %`;
    totalLines.push([t.totalHT, money(ht)], [`${t.vat} ${rateLabel}`, money(total - ht)]);
  }

  ensureSpace(20 + totalLines.length * 18 + 34 + 60, false);
  y += 14;
  const tx = L + W - 250;
  totalLines.forEach(([label, value]) => {
    doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.text).text(label, tx, y, { width: 140 });
    doc.text(value, tx + 140, y, { width: 102, align: 'right' });
    y += 18;
  });
  doc.roundedRect(tx - 8, y, 258, 30, 6).fillColor(COLORS.ink).fill();
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#ffffff');
  doc.text(company.vatRate > 0 ? t.totalTTC : t.total, tx, y + 10, { width: 130 });
  doc.text(money(total), tx + 110, y + 10, { width: 132, align: 'right' });
  y += 48;

  // ---------------- Amount in words
  const words = `${isProforma ? t.inWordsProforma : t.inWordsInvoice} : ${amountInWords(total, lang)} (${money(total)}) ${t.currencyWords}.`;
  doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLORS.text);
  ensureSpace(doc.heightOfString(words, { width: W }) + 10, false);
  doc.text(words, L, y, { width: W });
  y = doc.y + 12;

  if (isProforma) {
    doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.muted);
    ensureSpace(20, false);
    doc.text(t.proformaNote, L, y, { width: W });
    y = doc.y + 8;
  }

  // ---------------- Footer on every page: custom text + page numbers
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    const fy = doc.page.height - 45;
    // Writing inside the bottom margin: temporarily lift it so PDFKit doesn't add a page
    const oldBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.moveTo(L, fy - 6).lineTo(R, fy - 6).lineWidth(0.5).strokeColor(COLORS.line).stroke();
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted);
    const legal = [company.name, company.niu && `${t.niu} ${company.niu}`, company.rccm && `${t.rccm} ${company.rccm}`]
      .filter(Boolean)
      .join(' · ');
    doc.text(company.footer || legal, L, fy, { width: W - 80, lineBreak: false, ellipsis: true });
    doc.text(`${t.page} ${i - range.start + 1} ${t.of} ${range.count}`, R - 80, fy, { width: 80, align: 'right' });
    doc.page.margins.bottom = oldBottom;
  }

  doc.end();
  return done;
}

module.exports = { buildInvoicePdf };
