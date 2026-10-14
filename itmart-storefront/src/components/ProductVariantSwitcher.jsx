'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProductGallery from './ProductGallery';
import AddToCartPanel from './AddToCartPanel';
import { formatFCFA } from '@/lib/utils';
import { pickLang } from '@/lib/i18nHelpers';

const norm = (value) => (value || '').trim().toLowerCase();

/**
 * Product page: gallery + name, price, options and the Buy button.
 *
 * Two kinds of options are supported:
 *  - product.variants (current): colours and/or sizes of THIS product, each
 *    with its own stock. The customer picks a colour and a size.
 *  - colorVariants (older): separate products grouped by model name, one per
 *    colour. Still works for products set up that way.
 */
export default function ProductVariantSwitcher({ product, colorVariants, description, dict, locale }) {
  const variants = product.variants || [];
  const hasOwnVariants = variants.length > 0;

  // ---------------------------------------------- own variants (colour / size)
  // Distinct colours and sizes, in the order set in the admin
  const colors = [];
  const sizes = [];
  variants.forEach((v) => {
    if (v.colorName && !colors.some((c) => norm(c.name) === norm(v.colorName))) {
      colors.push({ name: v.colorName, hex: v.colorHex });
    }
    if (v.size && !sizes.some((s) => norm(s) === norm(v.size))) sizes.push(v.size);
  });
  const hasColorChoice = colors.length > 0;
  const hasSizeChoice = sizes.length > 0;

  const stockOf = (colorName, size) =>
    variants
      .filter(
        (v) =>
          (colorName === undefined || norm(v.colorName) === norm(colorName)) &&
          (size === undefined || norm(v.size) === norm(size))
      )
      .reduce((sum, v) => sum + v.stock, 0);

  // Start on the first colour in stock; a size is chosen by the customer
  // (unless there is only one).
  const [selectedColor, setSelectedColor] = useState(() =>
    hasColorChoice ? (colors.find((c) => stockOf(c.name) > 0) || colors[0]).name : null
  );
  const [selectedSize, setSelectedSize] = useState(() => (sizes.length === 1 ? sizes[0] : null));

  const chosenVariant = hasOwnVariants
    ? variants.find(
        (v) =>
          (!hasColorChoice || norm(v.colorName) === norm(selectedColor)) &&
          (!hasSizeChoice || norm(v.size) === norm(selectedSize))
      ) || null
    : null;

  const sizeWord = product.variantSizeLabel || dict.product.size;
  const colorWord = dict.product.color;
  const variantLabel = (v) =>
    v ? [v.colorName, v.size ? `${sizeWord} ${v.size}` : null].filter(Boolean).join(' / ') : null;

  // What still needs choosing before the Buy button works
  const missingChoice = hasOwnVariants && !chosenVariant ? (hasSizeChoice && !selectedSize ? sizeWord : colorWord) : null;

  // Photo of the chosen colour (set per colour in the admin)
  const colorImageId = hasColorChoice
    ? variants.find((v) => norm(v.colorName) === norm(selectedColor) && v.imageId)?.imageId || null
    : null;

  // -------------------------------------------- older grouped colour products
  const hasColors = !hasOwnVariants && colorVariants && colorVariants.length > 1;
  const [selectedId, setSelectedId] = useState(product.id);

  // Which product is currently "active" — matches the selected color when
  // this group has color options, otherwise it's always just this page's
  // own product.
  const selected = hasColors ? colorVariants.find((v) => v.id === selectedId) || product : product;
  const selectedIsUnavailable = selected.stock === 0 || selected.isActive === false;
  const name = pickLang(product, 'name', locale); // title stays fixed across colors

  // AddToCartPanel expects a plain product object, built from whatever is
  // selected so cart/checkout/WhatsApp all reference the right colour/size.
  const primaryImage = selected.images?.find((i) => i.isPrimary) || selected.images?.[0];
  const variantImage = colorImageId ? product.images?.find((i) => i.id === colorImageId) : null;
  const cartProduct = {
    id: selected.id,
    variantId: chosenVariant?.id || null,
    variantLabel: variantLabel(chosenVariant),
    nameEn: selected.nameEn,
    nameFr: selected.nameFr,
    price: selected.price,
    discountPrice: selected.discountPrice,
    stock: selectedIsUnavailable ? 0 : hasOwnVariants ? (chosenVariant ? chosenVariant.stock : product.stock) : selected.stock,
    images: selected.images,
    image: (variantImage || primaryImage)?.url,
  };

  const shortDescription =
    pickLang(selected, 'shortDescription', locale) || pickLang(product, 'shortDescription', locale);

  const sku = chosenVariant?.sku || selected.sku;

  return (
    <>
      <ProductGallery images={selected.images} alt={name} focusImageId={colorImageId} />

      <div>
        {product.brand && <p className="text-sm text-brand-600 font-semibold mb-1">{product.brand.name}</p>}
        <h1 className="text-2xl font-bold text-navy-900 mb-2">{name}</h1>
        <p className="text-xs text-ink-400 mb-4">
          {dict.product.sku}: <span className="font-mono">{sku}</span>
        </p>

        {/* Short description (admin: "Description courte"), before the price */}
        {shortDescription && <p className="text-sm text-ink-700 leading-relaxed -mt-1 mb-4">{shortDescription}</p>}

        <div className="flex items-baseline gap-3 mb-2">
          {selected.discountPrice ? (
            <>
              <span className="text-2xl font-bold text-brand-600">{formatFCFA(selected.discountPrice)}</span>
              <span className="text-base text-ink-400 line-through">{formatFCFA(selected.price)}</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-navy-900">{formatFCFA(selected.price)}</span>
          )}
        </div>

        {/* ---- Colour choice (variants) ---- */}
        {hasColorChoice && (
          <div className="mt-4 mb-4">
            <p className="text-sm text-ink-700 mb-2">
              {colorWord} : <span className="font-medium text-ink-900">{selectedColor}</span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((c) => {
                const soldOut = stockOf(c.name) === 0;
                const active = norm(c.name) === norm(selectedColor);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c.name);
                      // Keep the size if this colour has it in stock, otherwise choose again
                      if (selectedSize && sizes.length > 1 && stockOf(c.name, selectedSize) === 0) setSelectedSize(null);
                    }}
                    title={soldOut ? `${c.name} — ${dict.product.outOfStock}` : c.name}
                    aria-label={c.name}
                    aria-pressed={active}
                    className={`relative h-9 w-9 rounded-full border-2 transition-all ${
                      active ? 'border-brand-500 scale-110' : 'border-surface-border hover:border-ink-300'
                    } ${soldOut ? 'opacity-35' : ''}`}
                    style={{ backgroundColor: c.hex || '#e5e7eb' }}
                  >
                    {soldOut && (
                      <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                        <span className="block h-[2px] w-full rotate-45 bg-ink-700/70" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---- Size choice (variants) ---- */}
        {hasSizeChoice && (
          <div className="mt-4 mb-4">
            <p className="text-sm text-ink-700 mb-2">
              {sizeWord} :{' '}
              <span className="font-medium text-ink-900">{selectedSize || dict.product.chooseOne}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                // Sizes that don't exist in the chosen colour are hidden;
                // sizes out of stock stay visible but crossed out.
                const exists = variants.some(
                  (v) => norm(v.size) === norm(s) && (!hasColorChoice || norm(v.colorName) === norm(selectedColor))
                );
                if (!exists) return null;
                const left = stockOf(hasColorChoice ? selectedColor : undefined, s);
                const active = norm(s) === norm(selectedSize);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    disabled={left === 0}
                    aria-pressed={active}
                    title={left === 0 ? dict.product.outOfStock : undefined}
                    className={`min-w-11 h-10 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      active
                        ? 'border-navy-900 bg-navy-900 text-white'
                        : 'border-surface-border text-ink-800 hover:border-brand-400'
                    } disabled:cursor-not-allowed disabled:text-ink-300 disabled:line-through disabled:bg-surface`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---- Older grouped colour products ---- */}
        {hasColors && (
          <div className="mb-4">
            <p className="text-sm text-ink-700 mb-2">
              {colorWord} : <span className="font-medium text-ink-900">{selected.colorName}</span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              {colorVariants.map((variant) => {
                const unavailable = variant.stock === 0 || variant.isActive === false;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedId(variant.id)}
                    title={unavailable ? `${variant.colorName} — ${dict.product.outOfStock}` : variant.colorName}
                    aria-label={variant.colorName}
                    aria-pressed={variant.id === selected.id}
                    className={`h-9 w-9 rounded-full border-2 transition-all ${
                      variant.id === selected.id
                        ? 'border-brand-500 scale-110'
                        : 'border-surface-border hover:border-ink-300'
                    } ${unavailable ? 'opacity-30' : ''}`}
                    style={{ backgroundColor: variant.hexValue || '#e5e7eb' }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* key: a new colour / size starts again at quantity 1 */}
        <AddToCartPanel
          key={cartProduct.variantId || cartProduct.id}
          product={cartProduct}
          missingChoice={missingChoice}
          dict={dict}
          locale={locale}
        />

        {description && (
          <div className="mt-8 pt-6 border-t border-surface-border">
            <h2 className="text-sm font-semibold text-ink-900 mb-2">{dict.product.description}</h2>
            <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">{description}</p>
          </div>
        )}

        {product.attributeValues?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-surface-border">
            <h2 className="text-sm font-semibold text-ink-900 mb-3">{dict.product.specifications}</h2>
            <dl className="divide-y divide-surface-border text-sm">
              {/* Same order as set in the admin for the category */}
              {[...product.attributeValues]
                .sort((a, b) => (a.attribute?.sortOrder ?? 0) - (b.attribute?.sortOrder ?? 0))
                .map((av) => (
                <div key={av.id} className="flex justify-between py-2">
                  <dt className="text-ink-500">
                    {pickLang(av.attribute, 'name', locale)} {av.attribute.unit ? `(${av.attribute.unit})` : ''}
                  </dt>
                  <dd className="text-ink-900 font-medium">{av.value}</dd>
                </div>
                ))}
            </dl>
          </div>
        )}

        {/* Non-color variant groups (e.g. RAM/storage) still show as the old
            "other configurations" links — unused when this group has colors,
            since the backend returns siblings: [] in that case. */}
        {product.siblings?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-surface-border">
            <h2 className="text-sm font-semibold text-ink-900 mb-3">{dict.product.otherConfigurations}</h2>
            <div className="flex flex-wrap gap-2">
              {product.siblings.map((sib) => (
                <Link
                  key={sib.id}
                  href={`/products/${sib.slug}`}
                  className="px-3 py-2 rounded-lg border border-surface-border text-sm text-ink-700 hover:border-brand-400 hover:text-brand-600 transition-colors"
                >
                  {pickLang(sib, 'name', locale)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
