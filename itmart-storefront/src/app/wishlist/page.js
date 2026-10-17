'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2, Package, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { getProductBySlugClient } from '@/lib/clientApi';
import { imageUrl } from '@/lib/api';
import { formatFCFA } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';

export default function WishlistPage() {
  const wishlist = useWishlist();
  const { locale, t } = useLocale();
  const refreshed = useRef(false);

  // Once per visit: current prices, and drop products that were removed from the shop
  useEffect(() => {
    if (!wishlist?.hydrated || refreshed.current || wishlist.items.length === 0) return;
    refreshed.current = true;
    const slugs = wishlist.items.map((i) => [i.id, i.slug]);
    Promise.all(slugs.map(([id, slug]) => getProductBySlugClient(slug).then((p) => [id, p]))).then((pairs) => {
      const fresh = {};
      pairs.forEach(([id, p]) => {
        if (p === null) fresh[id] = null;
        else if (p && p.isActive !== false) fresh[id] = p;
        else if (p) fresh[id] = null;
      });
      wishlist.refresh(fresh);
    });
  }, [wishlist]);

  if (!wishlist?.hydrated) {
    return <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center text-ink-500">{t.common.loading}</div>;
  }

  if (wishlist.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Heart size={48} className="text-ink-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-navy-900 mb-1">{t.wishlist.empty}</h1>
        <p className="text-ink-500 mb-6">{t.wishlist.emptySubtitle}</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
          {t.cart.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-navy-900 mb-1">{t.wishlist.title}</h1>
      <p className="text-sm text-ink-500 mb-6">{t.wishlist.subtitle}</p>

      <div className="bg-white rounded-xl border border-surface-border divide-y divide-surface-border">
        {wishlist.items.map((item) => {
          const name = locale === 'en' ? item.nameEn : item.nameFr;
          return (
            <div key={item.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
              <Link
                href={`/products/${item.slug}`}
                className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-lg overflow-hidden bg-surface border border-surface-border"
              >
                {item.image ? (
                  <Image src={imageUrl(item.image)} alt={name} fill sizes="80px" className="object-cover" />
                ) : (
                  <span className="h-full w-full flex items-center justify-center text-ink-300">
                    <Package size={20} />
                  </span>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.slug}`} className="text-sm font-semibold text-ink-900 line-clamp-2 hover:text-brand-600">
                  {name}
                </Link>
                <p className="text-sm mt-0.5">
                  {item.discountPrice ? (
                    <>
                      <span className="font-bold text-brand-600">{formatFCFA(item.discountPrice)}</span>{' '}
                      <span className="text-xs text-ink-400 line-through">{formatFCFA(item.price)}</span>
                    </>
                  ) : (
                    <span className="font-bold text-brand-600">{formatFCFA(item.price)}</span>
                  )}
                </p>
              </div>
              <Link
                href={`/products/${item.slug}`}
                className="hidden sm:inline-flex items-center gap-1.5 shrink-0 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
              >
                {t.wishlist.view} <ArrowRight size={15} />
              </Link>
              <button
                type="button"
                onClick={() => wishlist.remove(item.id)}
                aria-label={t.wishlist.remove}
                title={t.wishlist.remove}
                className="shrink-0 h-9 w-9 rounded-full text-ink-500 hover:bg-danger-100 hover:text-danger-600 flex items-center justify-center transition-colors"
              >
                <Trash2 size={17} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
