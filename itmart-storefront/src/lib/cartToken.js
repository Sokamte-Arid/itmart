'use client';

// A random id for this visitor's current cart. It links the cart saved at
// checkout (abandoned carts) to the order placed afterwards. A new one is
// made after each order.
const KEY = 'itmart_cart_token';

const randomToken = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
};

export function getCartToken() {
  try {
    let token = localStorage.getItem(KEY);
    if (!token || !/^[A-Za-z0-9-]{16,64}$/.test(token)) {
      token = randomToken();
      localStorage.setItem(KEY, token);
    }
    return token;
  } catch {
    return randomToken();
  }
}

export function setCartToken(token) {
  try {
    if (/^[A-Za-z0-9-]{16,64}$/.test(token)) localStorage.setItem(KEY, token);
  } catch {
    /* ignore */
  }
}

export function resetCartToken() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
