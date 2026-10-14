'use client';

import { createContext, useContext } from 'react';

// Shop contact details from the admin (Boutique & contact): WhatsApp number,
// phone, email, social links. Provided once in the root layout.
const StoreContext = createContext({});

export function StoreInfoProvider({ value, children }) {
  return <StoreContext.Provider value={value || {}}>{children}</StoreContext.Provider>;
}

export const useStoreInfo = () => useContext(StoreContext);
