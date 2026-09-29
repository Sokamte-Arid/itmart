/**
 * Builds a wa.me "click-to-chat" link pre-filled with the order details.
 * Opening this link (on the customer's device) opens WhatsApp with the
 * message ready to send to the admin's WhatsApp number.
 *
 * This does NOT send anything server-side — the customer's own browser/app
 * sends the message. That's what makes it free and require no API setup.
 */
function buildOrderWhatsAppLink(order, items, lang = 'fr') {
  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
  const subtotal = Number(order.total) - Number(order.deliveryFee || 0);

  const lines = [];
  if (lang === 'fr') {
    lines.push(`Nouvelle commande ${order.reference}`);
    lines.push(`Client: ${order.customerName}`);
    lines.push(`Téléphone: ${order.phone}`);
    lines.push(`Ville: ${order.city}`);
    lines.push(`Adresse: ${order.address}`);
    lines.push('');
    lines.push('Articles:');
    items.forEach((item) => {
      lines.push(`- ${item.nameFr || item.nameEn} x${item.quantity} : ${item.unitPrice} FCFA`);
    });
    lines.push('');
    lines.push(`Sous-total: ${subtotal} FCFA`);
    lines.push(`Livraison: ${order.deliveryFee || 0} FCFA`);
    lines.push(`Total: ${order.total} FCFA`);
  } else {
    lines.push(`New order ${order.reference}`);
    lines.push(`Customer: ${order.customerName}`);
    lines.push(`Phone: ${order.phone}`);
    lines.push(`City: ${order.city}`);
    lines.push(`Address: ${order.address}`);
    lines.push('');
    lines.push('Items:');
    items.forEach((item) => {
      lines.push(`- ${item.nameEn || item.nameFr} x${item.quantity}: ${item.unitPrice} FCFA`);
    });
    lines.push('');
    lines.push(`Subtotal: ${subtotal} FCFA`);
    lines.push(`Delivery: ${order.deliveryFee || 0} FCFA`);
    lines.push(`Total: ${order.total} FCFA`);
  }

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${adminNumber}?text=${text}`;
}

module.exports = { buildOrderWhatsAppLink };
