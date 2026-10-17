'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { trackAddToWishlist } from '@/lib/analytics';

// Favourites ("liste d'envies"), kept in the visitor's browser — no account
// needed. Each entry is a small copy of the product so the list shows
// straight away; the wishlist page refreshes prices and stock from the shop.
const WishlistContext = createContext(null);
const STORAGE_KEY = 'itmart_wishlist';
const MAX_ITEMS = 100;

// Only what the list needs
const snapshot = (p) => ({
  id: p.id,
  slug: p.slug,
  nameFr: p.nameFr,
  nameEn: p.nameEn,
  price: Number(p.price),
  discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
  image: p.image || (p.images?.find((i) => i.isPrimary) || p.images?.[0])?.url || null,
  addedAt: Date.now(),
});

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the saved list (external storage) after the first render, like the cart
      if (Array.isArray(stored)) setItems(stored.filter((i) => i && i.id && i.slug));
    } catch {
      /* corrupt or blocked storage: start empty */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* private mode: the list just isn't remembered */
    }
  }, [items, hydrated]);

  // Other tabs: keep in sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        setItems(JSON.parse(e.newValue || '[]'));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const has = useCallback((id) => items.some((i) => i.id === id), [items]);

  // Returns true when the product is now in the list
  const toggle = useCallback(
    (product) => {
      if (items.some((i) => i.id === product.id)) {
        setItems((prev) => prev.filter((i) => i.id !== product.id));
        return false;
      }
      setItems((prev) => [snapshot(product), ...prev.filter((i) => i.id !== product.id)].slice(0, MAX_ITEMS));
      trackAddToWishlist(product);
      return true;
    },
    [items]
  );

  const remove = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  // Fresh data from the shop (wishlist page); products that no longer exist are dropped
  const refresh = useCallback(
    (fresh) =>
      setItems((prev) =>
        prev
          .map((i) => (fresh[i.id] === null ? null : fresh[i.id] ? { ...snapshot(fresh[i.id]), addedAt: i.addedAt } : i))
          .filter(Boolean)
      ),
    []
  );

  return (
    <WishlistContext.Provider value={{ items, count: items.length, has, toggle, remove, refresh, hydrated }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
