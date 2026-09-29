import { cookies } from 'next/headers';
import en from '@/dictionaries/en.json';
import fr from '@/dictionaries/fr.json';

const dictionaries = { en, fr };

export const LANG_COOKIE = 'itmart_lang';

export async function getLocale() {
  const cookieStore = await cookies();
  const lang = cookieStore.get(LANG_COOKIE)?.value;
  return lang === 'en' ? 'en' : 'fr'; // default to French for the Cameroon market
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}

// Re-exported for convenience so Server Components can import everything
// from one place; Client Components must import these from lib/i18nHelpers
// directly, since this file pulls in next/headers (server-only).
export { pickLang, interpolate } from './i18nHelpers';
