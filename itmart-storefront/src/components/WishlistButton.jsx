'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';

/**
 * Heart button: adds / removes the product from the favourites.
 * variant "card" = small round button on a product photo,
 * variant "page" = larger button next to "Acheter" on the product page.
 * id / data-* attributes let you target it when creating events
 * (Meta Events Manager, Google Tag Manager…).
 */
export default function WishlistButton({ product, dict, variant = 'card', className = '' }) {
  const wishlist = useWishlist();
  if (!wishlist) return null;
  const active = wishlist.hydrated && wishlist.has(product.id);
  const label = active ? dict.wishlist.remove : dict.wishlist.add;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    wishlist.toggle(product);
  };

  const common = {
    type: 'button',
    onClick: handleClick,
    'aria-label': label,
    'aria-pressed': active,
    title: label,
    'data-product-id': product.id,
    'data-action': 'add-to-wishlist',
  };

  if (variant === 'page') {
    return (
      <button
        {...common}
        id="add-to-wishlist-button"
        className={`shrink-0 h-[52px] w-[52px] rounded-full border flex items-center justify-center transition-colors ${
          active
            ? 'border-brand-500 bg-brand-50 text-brand-600'
            : 'border-surface-border text-ink-700 hover:border-brand-400 hover:text-brand-600'
        } ${className}`}
      >
        <Heart size={21} fill={active ? 'currentColor' : 'none'} />
      </button>
    );
  }

  return (
    <button
      {...common}
      className={`h-8 w-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center transition-colors ${
        active ? 'text-brand-600' : 'text-ink-700 hover:text-brand-600'
      } ${className}`}
    >
      <Heart size={16} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}
