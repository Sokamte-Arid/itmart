// Simple landscape PDF with a title and a table (customer lists, order
// exports). Rows that don't fit go onto new pages, with the header repeated.

const PDFDocument = require('pdfkit');

/**
 * @param {object} o
 * @param {string} o.title
 * @param {string[]} [o.subtitleLines]
 * @param {{ header: string, width: number, align?: 'left'|'right'|'center' }[]} o.columns  widths are relative
 * @param {string[][]} o.rows
 * @param {string} [o.footer]          left part of the footer, e.g. the shop name
 * @param {{ ink: string, accent: string }} [o.colors]
 * @returns {Promise<Buffer>}
 */
function buildTablePdf({ title, subtitleLines = [], columns, rows, footer = '', colors = {} }) {
  const C = { ink: colors.ink || '#1e2436', accent: colors.accent || '#f59e0b', text: '#2a3149', muted: '#6b7394', zebra: '#f7f8fa', line: '#e6e8ee' };
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margins: { top: 40, bottom: 45, left: 36, right: 36 }, bufferPages: true });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  const L = doc.page.margins.left;
  const R = doc.page.width - doc.page.margins.right;
  const W = R - L;
  const bottom = () => doc.page.height - doc.page.margins.bottom;

  // Column positions from relative widths
  const total = columns.reduce((s, c) => s + c.width, 0);
  let x = L;
  const cols = columns.map((c) => {
    const w = (c.width / total) * W;
    const col = { ...c, x, w };
    x += w;
    return col;
  });

  let y = doc.page.margins.top;
  doc.font('Helvetica-Bold').fontSize(16).fillColor(C.ink).text(title, L, y, { width: W });
  y = doc.y + 2;
  doc.moveTo(L, y).lineTo(L + 120, y).lineWidth(2).strokeColor(C.accent).stroke();
  y += 8;
  doc.font('Helvetica').fontSize(9).fillColor(C.muted);
  subtitleLines.filter(Boolean).forEach((line) => {
    doc.text(line, L, y, { width: W });
    y = doc.y + 1;
  });
  y += 10;

  const drawHeader = () => {
    doc.rect(L, y, W, 20).fillColor(C.ink).fill();
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff');
    cols.forEach((c) => doc.text(c.header, c.x + 4, y + 6, { width: c.w - 8, align: c.align || 'left', lineBreak: false, ellipsis: true }));
    y += 20;
  };
  drawHeader();

  if (rows.length === 0) {
    doc.font('Helvetica-Oblique').fontSize(9).fillColor(C.muted).text('—', L + 4, y + 6);
  }

  rows.forEach((row, idx) => {
    doc.font('Helvetica').fontSize(8);
    const h = Math.max(...cols.map((c, i) => doc.heightOfString(String(row[i] ?? ''), { width: c.w - 8 }))) + 10;
    if (y + h > bottom()) {
      doc.addPage();
      y = doc.page.margins.top;
      drawHeader();
    }
    if (idx % 2 === 1) doc.rect(L, y, W, h).fillColor(C.zebra).fill();
    doc.fillColor(C.text).font('Helvetica').fontSize(8);
    cols.forEach((c, i) => doc.text(String(row[i] ?? ''), c.x + 4, y + 5, { width: c.w - 8, align: c.align || 'left' }));
    y += h;
    doc.moveTo(L, y).lineTo(R, y).lineWidth(0.4).strokeColor(C.line).stroke();
  });

  // Footer on every page: shop name / page x of y
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i += 1) {
    doc.switchToPage(range.start + i);
    const fy = doc.page.height - doc.page.margins.bottom + 15;
    doc.font('Helvetica').fontSize(7.5).fillColor(C.muted);
    doc.text(footer, L, fy, { width: W / 2, lineBreak: false });
    doc.text(`${i + 1} / ${range.count}`, L + W / 2, fy, { width: W / 2, align: 'right', lineBreak: false });
  }

  doc.end();
  return done;
}

module.exports = { buildTablePdf };
