'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProductGallery from './ProductGallery';
import AddToCartPanel from './AddToCartPanel';
import { formatFCFA } from '@/lib/utils';
import { pickLang } from '@/lib/i18nHelpers';

export default function ProductVariantSwitcher({ product, colorVariants, description, dict, locale }) {
  const hasColors = colorVariants && colorVariants.length > 1;
  const [selectedId, setSelectedId] = useState(product.id);

  // Which variant is currently "active" — matches the selected color when
  // this group has color options, otherwise it's always just this page's
  // own product (no other file needs to change for non-color products).
  const selected = hasColors ? colorVariants.find((v) => v.id === selectedId) || product : product;
  const selectedIsUnavailable = selected.stock === 0 || selected.isActive === false;
  const name = pickLang(product, 'name', locale); // title stays fixed across colors
  const colorLabel = locale === 'fr' ? 'Couleur' : 'Color';

  // AddToCartPanel expects a plain product object — build it from whichever
  // variant is selected so cart/checkout/WhatsApp all reference the right
  // color's id, price and real stock, not the page's original product.
  const cartProduct = {
    id: selected.id,
    nameEn: selected.nameEn,
    nameFr: selected.nameFr,
    price: selected.price,
    discountPrice: selected.discountPrice,
    stock: selectedIsUnavailable ? 0 : selected.stock,
    images: selected.images,
  };

  const shortDescription =
    pickLang(selected, 'shortDescription', locale) || pickLang(product, 'shortDescription', locale);

  return (
    <>
      <ProductGallery images={selected.images} alt={name} />

      <div>
        {product.brand && <p className="text-sm text-brand-600 font-semibold mb-1">{product.brand.name}</p>}
        <h1 className="text-2xl font-bold text-navy-900 mb-2">{name}</h1>
        <p className="text-xs text-ink-400 mb-4">
          {dict.product.sku}: <span className="font-mono">{selected.sku}</span>
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

        {hasColors && (
          <div className="mb-4">
            <p className="text-sm text-ink-700 mb-2">
              {colorLabel}: <span className="font-medium text-ink-900">{selected.colorName}</span>
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

        <AddToCartPanel product={cartProduct} dict={dict} locale={locale} />

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