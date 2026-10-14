'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'itmart_cart';

// A cart line is one product in one colour / size: the same shoe in black 42
// and black 43 are two lines. Lines saved before variants existed have no
// key, so they fall back to the product id.
export const lineKey = (productId, variantId) => (variantId ? `${productId}:${variantId}` : productId);
const keyOf = (item) => item.key || lineKey(item.id, item.variantId);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating cart from localStorage (external system), intentionally deferred past SSR to avoid a hydration mismatch
      if (stored) setItems(JSON.parse(stored).map((i) => ({ ...i, key: keyOf(i) })));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // Persist on every change (after initial hydration, to avoid wiping storage on first render)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  // product: { id, variantId?, variantLabel?, nameEn, nameFr, price, discountPrice, stock, image }
  const addItem = (product, quantity = 1) => {
    const key = lineKey(product.id, product.variantId);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key
            ? { ...i, stock: product.stock, quantity: Math.min(i.quantity + quantity, product.stock || 99) }
            : i
        );
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          variantId: product.variantId || null,
          variantLabel: product.variantLabel || null,
          nameEn: product.nameEn,
          nameFr: product.nameFr,
          price: Number(product.price),
          discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
          image: product.image || null,
          stock: product.stock,
          quantity: Math.min(quantity, product.stock || 99),
        },
      ];
    });
  };

  // Both take the line's key (item.key)
  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));

  const updateQuantity = (key, quantity) => {
    if (quantity <= 0) return removeItem(key);
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + (i.discountPrice ?? i.price) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, itemCount, hydrated }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
