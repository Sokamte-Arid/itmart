// Helpers for product variants (colour / size, each with its own stock).

const HEX = /^#[0-9a-fA-F]{6}$/;
const MAX_VARIANTS = 100;

const clean = (value, max) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim().replace(/\s+/g, ' ');
  return text ? text.slice(0, max) : null;
};

/**
 * Readable text for one variant, e.g. "Noir / Pointure 42", "Rouge", "Taille XL".
 * `sizeLabel` is the product's own word for the size option (Pointure,
 * Capacité...), with "Taille" / "Size" when the admin left it empty.
 */
function variantLabel(variant, sizeLabel, lang = 'fr') {
  if (!variant) return null;
  const parts = [];
  if (variant.colorName) parts.push(variant.colorName);
  if (variant.size) parts.push(`${sizeLabel || (lang === 'en' ? 'Size' : 'Taille')} ${variant.size}`);
  return parts.join(' / ') || null;
}

/**
 * Checks and normalises the variant list sent by the admin.
 * Returns [{ id?, colorName, colorHex, size, sku, stock, imageId, sortOrder }].
 * Throws { status, message } style errors through the given ApiError class.
 */
function normaliseVariants(input, { ApiError, imageIds, lang = 'fr' }) {
  if (!Array.isArray(input)) throw new ApiError(400, 'variants must be an array.');
  if (input.length > MAX_VARIANTS) {
    throw new ApiError(400, lang === 'en' ? `At most ${MAX_VARIANTS} variants per product.` : `${MAX_VARIANTS} variantes maximum par produit.`);
  }

  const seen = new Set();
  const skus = new Set();
  return input.map((raw, index) => {
    const colorName = clean(raw.colorName, 40);
    const size = clean(raw.size, 30);
    const sku = clean(raw.sku, 60);
    const stock = Number(raw.stock);
    const line = index + 1;

    if (!colorName && !size) {
      throw new ApiError(
        400,
        lang === 'en'
          ? `Variant ${line}: enter a colour and/or a size.`
          : `Variante ${line} : indiquez une couleur et/ou une taille.`
      );
    }
    if (!Number.isInteger(stock) || stock < 0 || stock > 1000000) {
      throw new ApiError(
        400,
        lang === 'en' ? `Variant ${line}: the stock must be a whole number (0 or more).` : `Variante ${line} : le stock doit être un nombre entier (0 ou plus).`
      );
    }

    const combo = `${(colorName || '').toLowerCase()}|${(size || '').toLowerCase()}`;
    if (seen.has(combo)) {
      const name = [colorName, size].filter(Boolean).join(' / ');
      throw new ApiError(
        400,
        lang === 'en' ? `The variant "${name}" is listed twice.` : `La variante « ${name} » apparaît deux fois.`
      );
    }
    seen.add(combo);

    if (sku) {
      if (skus.has(sku.toLowerCase())) {
        throw new ApiError(400, lang === 'en' ? `The reference ${sku} is used twice.` : `La référence ${sku} est utilisée deux fois.`);
      }
      skus.add(sku.toLowerCase());
    }

    const colorHex = colorName && typeof raw.colorHex === 'string' && HEX.test(raw.colorHex) ? raw.colorHex.toUpperCase() : null;
    const imageId = raw.imageId && imageIds.has(raw.imageId) ? raw.imageId : null;

    return {
      id: typeof raw.id === 'string' && raw.id ? raw.id : undefined,
      colorName,
      colorHex,
      size,
      sku,
      stock,
      imageId,
      sortOrder: index,
    };
  });
}

module.exports = { variantLabel, normaliseVariants };
