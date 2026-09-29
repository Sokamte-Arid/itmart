const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Sends an order confirmation email to the customer.
 * Silently no-ops (logs a warning) if the customer gave no email or SMTP
 * isn't configured, so it never blocks the order flow.
 */
async function sendOrderConfirmationEmail(order, items, lang = 'fr') {
  if (!order.email) return;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[mailer] SMTP not configured — skipping email send.');
    return;
  }

  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${
            lang === 'fr' ? item.nameFr || item.nameEn : item.nameEn || item.nameFr
          }</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${item.unitPrice} FCFA</td>
        </tr>`
    )
    .join('');

  const subject =
    lang === 'fr'
      ? `Confirmation de votre commande ${order.reference}`
      : `Your order ${order.reference} has been received`;

  const intro =
    lang === 'fr'
      ? `Bonjour ${order.customerName},<br/>Nous avons bien reçu votre commande. Notre équipe vous contactera très bientôt au ${order.phone}.`
      : `Hello ${order.customerName},<br/>We have received your order. Our team will contact you shortly at ${order.phone}.`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
      <h2>${subject}</h2>
      <p>${intro}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #333;">${
              lang === 'fr' ? 'Article' : 'Item'
            }</th>
            <th style="padding:8px;border-bottom:2px solid #333;">${lang === 'fr' ? 'Qté' : 'Qty'}</th>
            <th style="text-align:right;padding:8px;border-bottom:2px solid #333;">${
              lang === 'fr' ? 'Prix' : 'Price'
            }</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="margin-top:12px;text-align:right;">
        <p style="margin:2px 0;color:#666;">${lang === 'fr' ? 'Sous-total' : 'Subtotal'}: ${(
    Number(order.total) - Number(order.deliveryFee || 0)
  ).toFixed(0)} FCFA</p>
        <p style="margin:2px 0;color:#666;">${lang === 'fr' ? 'Livraison' : 'Delivery'} (${order.city}): ${Number(
    order.deliveryFee || 0
  ).toFixed(0)} FCFA</p>
        <p style="margin:2px 0;font-weight:bold;">${lang === 'fr' ? 'Total' : 'Total'}: ${order.total} FCFA</p>
      </div>
    </div>
  `;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to: order.email,
    subject,
    html,
  });
}

/**
 * Sends a new-order notification email to the admin (ADMIN_EMAIL).
 * This is a companion to the WhatsApp link — a written record that lands
 * in the admin's inbox even if they haven't opened WhatsApp yet.
 * Silently no-ops if ADMIN_EMAIL or SMTP isn't configured.
 */
async function sendAdminOrderNotificationEmail(order, items) {
  if (!process.env.ADMIN_EMAIL) return;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[mailer] SMTP not configured — skipping admin notification email.');
    return;
  }

  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.nameEn || item.nameFr}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${item.unitPrice} FCFA</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
      <h2>New order: ${order.reference}</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr><td style="padding:4px 8px;color:#666;">Customer</td><td style="padding:4px 8px;font-weight:bold;">${order.customerName}</td></tr>
        <tr><td style="padding:4px 8px;color:#666;">Phone</td><td style="padding:4px 8px;font-weight:bold;">${order.phone}</td></tr>
        <tr><td style="padding:4px 8px;color:#666;">Email</td><td style="padding:4px 8px;">${order.email || '—'}</td></tr>
        <tr><td style="padding:4px 8px;color:#666;">Address</td><td style="padding:4px 8px;">${order.address}, ${order.city}</td></tr>
        ${order.notes ? `<tr><td style="padding:4px 8px;color:#666;">Notes</td><td style="padding:4px 8px;">${order.notes}</td></tr>` : ''}
      </table>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #333;">Item</th>
            <th style="padding:8px;border-bottom:2px solid #333;">Qty</th>
            <th style="text-align:right;padding:8px;border-bottom:2px solid #333;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="margin-top:12px;text-align:right;">
        <p style="margin:2px 0;color:#666;">Subtotal: ${(Number(order.total) - Number(order.deliveryFee || 0)).toFixed(
          0
        )} FCFA</p>
        <p style="margin:2px 0;color:#666;">Delivery (${order.city}): ${Number(order.deliveryFee || 0).toFixed(0)} FCFA</p>
        <p style="margin:2px 0;font-weight:bold;">Total: ${order.total} FCFA</p>
      </div>
    </div>
  `;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `🛒 New order ${order.reference} — ${order.customerName}`,
    html,
  });
}

/**
 * Sends a low-stock alert to the admin when a product's stock is manually
 * updated and crosses at or below the configured threshold. Fired once per
 * crossing (not on every save while it stays low), to avoid spamming.
 */
async function sendLowStockAlertEmail(product) {
  if (!process.env.ADMIN_EMAIL) return;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[mailer] SMTP not configured — skipping low-stock alert email.');
    return;
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;">
      <h2>⚠️ Low stock alert</h2>
      <p><strong>${product.nameEn}</strong> (SKU: ${product.sku}) is down to <strong>${product.stock}</strong> unit(s) in stock.</p>
      <p>Consider restocking soon to avoid running out.</p>
    </div>
  `;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `⚠️ Low stock: ${product.nameEn} (${product.stock} left)`,
    html,
  });
}

/**
 * Sends a password reset link to an admin. The link contains a one-time
 * token that expires after 1 hour (see authController.forgotPassword).
 */
async function sendPasswordResetEmail(admin, resetLink) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[mailer] SMTP not configured — skipping password reset email.');
    return;
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;">
      <h2>Password reset request</h2>
      <p>Hello ${admin.name},</p>
      <p>We received a request to reset your IT Mart admin password. Click the button below to choose a new one — this link expires in 1 hour.</p>
      <p style="margin:24px 0;">
        <a href="${resetLink}" style="background:#f59e0b;color:#12151f;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset password</a>
      </p>
      <p style="color:#666;font-size:13px;">If you didn't request this, you can safely ignore this email — your password will not be changed.</p>
    </div>
  `;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to: admin.email,
    subject: 'Reset your IT Mart admin password',
    html,
  });
}

module.exports = {
  sendOrderConfirmationEmail,
  sendAdminOrderNotificationEmail,
  sendLowStockAlertEmail,
  sendPasswordResetEmail,
};
