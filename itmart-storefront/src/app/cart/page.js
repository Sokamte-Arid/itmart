'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { imageUrl } from '@/lib/api';
import { formatFCFA } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';

export default function CartPage() {
  const cart = useCart();
  const { locale, t } = useLocale();

  if (!cart?.hydrated) {
    return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center text-ink-500">{t.common.loading}</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <ShoppingBag size={48} className="text-ink-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-navy-900 mb-1">{t.cart.empty}</h1>
        <p className="text-ink-500 mb-6">{t.cart.emptySubtitle}</p>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-navy-900 mb-6">{t.cart.title}</h1>

      <div className="bg-white rounded-xl border border-surface-border divide-y divide-surface-border">
        {cart.items.map((item) => {
          const name = locale === 'en' ? item.nameEn : item.nameFr;
          const unitPrice = item.discountPrice ?? item.price;
          return (
            <div key={item.id} className="flex items-center gap-4 p-4">
              <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-surface border border-surface-border">
                {item.image ? (
                  <Image src={imageUrl(item.image)} alt={name} fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-ink-300">
                    <ShoppingBag size={20} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-900 truncate">{name}</p>
                <p className="text-sm text-ink-500">{formatFCFA(unitPrice)}</p>
              </div>

              <div className="flex items-center border border-surface-border rounded-lg shrink-0">
                <button
                  onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                  className="h-8 w-8 flex items-center justify-center text-ink-700 hover:bg-surface"
                  aria-label={t.cart.quantity}
                >
                  <Minus size={13} />
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() => cart.updateQuantity(item.id, Math.min(item.stock || 99, item.quantity + 1))}
                  className="h-8 w-8 flex items-center justify-center text-ink-700 hover:bg-surface"
                  aria-label={t.cart.quantity}
                >
                  <Plus size={13} />
                </button>
              </div>

              <p className="w-24 text-right text-sm font-semibold text-navy-900 shrink-0 hidden sm:block">
                {formatFCFA(unitPrice * item.quantity)}
              </p>

              <button
                onClick={() => cart.removeItem(item.id)}
                className="shrink-0 text-ink-400 hover:text-danger-600 p-1.5"
                aria-label={t.cart.remove}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link href="/products" className="text-sm font-medium text-brand-600 hover:underline">
          ← {t.cart.continueShopping}
        </Link>

        <div className="w-full sm:w-auto bg-white rounded-xl border border-surface-border p-5">
          <div className="flex items-center justify-between gap-8 mb-4">
            <span className="text-sm text-ink-500">{t.cart.subtotal}</span>
            <span className="text-lg font-bold text-navy-900">{formatFCFA(cart.subtotal)}</span>
          </div>
          <Link
            href="/checkout"
            className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-full py-3 px-6 transition-colors"
          >
            {t.cart.checkout} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
