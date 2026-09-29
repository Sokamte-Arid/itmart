'use client';

import { useEffect, useState } from 'react';
import en from '@/dictionaries/en.json';
import fr from '@/dictionaries/fr.json';

const dictionaries = { en, fr };

/**
 * Reads the itmart_lang cookie on the client after mount. Starts at 'fr'
 * (matching the server default) so the very first client render matches
 * what the server rendered, then syncs to the real cookie value right
 * after — this is a deliberate read-from-external-storage effect, the
 * pattern React's docs describe as a valid effect use case, not derived
 * render state.
 */
export function useLocale() {
  const [locale, setLocale] = useState('fr');

  useEffect(() => {
    const match = document.cookie.match(/itmart_lang=(\w+)/);
    const detected = match?.[1] === 'en' ? 'en' : 'fr';
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from an external system (cookie), not derived render state
    setLocale(detected);
  }, []);

  return { locale, t: dictionaries[locale] };
}
