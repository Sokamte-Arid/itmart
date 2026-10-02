// Links to call or WhatsApp a customer straight from the admin (handy on a phone).

const digitsOnly = (phone) => String(phone || '').replace(/\D/g, '');

// Cameroon numbers are often typed without the country code (e.g. 6 77 12 34 56).
// WhatsApp needs the full international number, so add 237 to 9-digit local numbers.
export function internationalNumber(phone) {
  let d = digitsOnly(phone);
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 9 && /^[62]/.test(d)) d = `237${d}`;
  return d;
}

export const telHref = (phone) => {
  const raw = String(phone || '').trim();
  return `tel:${raw.startsWith('+') ? '+' : ''}${digitsOnly(raw)}`;
};

export const whatsappHref = (phone, text = '') =>
  `https://wa.me/${internationalNumber(phone)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
