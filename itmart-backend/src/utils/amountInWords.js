// Writes a whole amount in words, for the "Arrêtée la présente facture à la
// somme de ..." line that francophone (OHADA) invoices traditionally carry.

const FR_UNITS = [
  'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
  'dix-sept', 'dix-huit', 'dix-neuf',
];
const FR_TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

// 0–99, French rules (70 = soixante-dix, 80 = quatre-vingts, 21 = vingt et un...)
function frBelow100(n, isEnd) {
  if (n < 20) return FR_UNITS[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (t === 7 || t === 9) {
    const base = t === 7 ? 'soixante' : 'quatre-vingt';
    const rest = FR_UNITS[10 + u];
    return t === 7 && u === 1 ? `${base} et ${rest}` : `${base}-${rest}`;
  }
  if (t === 8) return u === 0 ? (isEnd ? 'quatre-vingts' : 'quatre-vingt') : `quatre-vingt-${FR_UNITS[u]}`;
  if (u === 0) return FR_TENS[t];
  if (u === 1) return `${FR_TENS[t]} et un`;
  return `${FR_TENS[t]}-${FR_UNITS[u]}`;
}

// 0–999
function frBelow1000(n, isEnd) {
  const h = Math.floor(n / 100);
  const r = n % 100;
  const parts = [];
  if (h === 1) parts.push('cent');
  else if (h > 1) parts.push(r === 0 && isEnd ? `${FR_UNITS[h]} cents` : `${FR_UNITS[h]} cent`);
  if (r > 0) parts.push(frBelow100(r, isEnd));
  return parts.join(' ');
}

function frenchWords(n) {
  if (n === 0) return 'zéro';
  const scales = [
    [1e9, 'milliard', 'milliards'],
    [1e6, 'million', 'millions'],
  ];
  const parts = [];
  let rest = n;
  for (const [value, one, many] of scales) {
    const count = Math.floor(rest / value);
    if (count > 0) {
      parts.push(`${frBelow1000(count, true)} ${count > 1 ? many : one}`);
      rest %= value;
    }
  }
  const thousands = Math.floor(rest / 1000);
  if (thousands > 0) {
    // "mille" is invariable and "un mille" is never used
    parts.push(thousands === 1 ? 'mille' : `${frBelow1000(thousands, false)} mille`);
    rest %= 1000;
  }
  if (rest > 0) parts.push(frBelow1000(rest, true));
  return parts.join(' ');
}

const EN_UNITS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function enBelow1000(n) {
  const h = Math.floor(n / 100);
  const r = n % 100;
  const parts = [];
  if (h > 0) parts.push(`${EN_UNITS[h]} hundred`);
  if (r > 0) {
    if (r < 20) parts.push(EN_UNITS[r]);
    else parts.push(r % 10 ? `${EN_TENS[Math.floor(r / 10)]}-${EN_UNITS[r % 10]}` : EN_TENS[r / 10]);
  }
  return parts.join(' ');
}

function englishWords(n) {
  if (n === 0) return 'zero';
  const scales = [
    [1e9, 'billion'],
    [1e6, 'million'],
    [1e3, 'thousand'],
  ];
  const parts = [];
  let rest = n;
  for (const [value, name] of scales) {
    const count = Math.floor(rest / value);
    if (count > 0) {
      parts.push(`${enBelow1000(count)} ${name}`);
      rest %= value;
    }
  }
  if (rest > 0) parts.push(enBelow1000(rest));
  return parts.join(' ');
}

function amountInWords(amount, lang = 'fr') {
  const n = Math.round(Math.abs(Number(amount) || 0));
  const words = lang === 'en' ? englishWords(n) : frenchWords(n);
  return words.charAt(0).toUpperCase() + words.slice(1);
}

module.exports = { amountInWords };
