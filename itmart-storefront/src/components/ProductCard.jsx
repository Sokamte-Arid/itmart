'use client';

import { trackAddToCart } from '@/lib/analytics';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { imageUrl } from '@/lib/api';
import { pickLang } from '@/lib/i18nHelpers';
import { formatFCFA } from '@/lib/utils';

export default function ProductCard({ product, dict, locale }) {
  const { addItem } = useCart();
  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const name = pickLang(product, 'name', locale);
  const outOfStock = product.stock === 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem(
      {
        id: product.id,
        nameEn: product.nameEn,
        nameFr: product.nameFr,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        image: primaryImage?.url,
      },
      1
    );
    trackAddToCart(product, 1);
  };

  const discountPct = product.discountPrice
    ? Math.round((1 - Number(product.discountPrice) / Number(product.price)) * 100)
    : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col bg-white rounded-xl border border-surface-border overflow-hidden hover:border-brand-400 hover:shadow-md transition-all"
    >
      <div className="relative aspect-square bg-surface overflow-hidden">
        {primaryImage ? (
          <Image
            src={imageUrl(primaryImage.url)}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-300">
            <Package size={32} />
          </div>
        )}
        {discountPct && (
          <span className="absolute top-2 left-2 bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            -{discountPct}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-2 right-2 bg-ink-900/80 text-white text-[10px] font-semibold px-2 py-1 rounded-md">
            {dict.product.outOfStock}
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <p className="text-m font-extrabold text-ink-900 line-clamp-2 mb-1.5 flex-1">{name}</p>
        <div className="flex items-center justify-between gap-2">
          <div>
            {product.discountPrice ? (
              <div>
                <span className="text-xs text-ink-400 line-through block leading-tight">
                  {formatFCFA(product.price)}
                </span>
                <span className="text-m font-extrabold text-navy-900">{formatFCFA(product.discountPrice)}</span>
              </div>
            ) : (
              <span className="text-m font-extrabold text-navy-900">{formatFCFA(product.price)}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            aria-label={dict.product.addToCart}
            className="shrink-0 h-8 w-8 rounded-full bg-navy-900 text-white flex items-center justify-center hover:bg-brand-500 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </Link>
  );
}
