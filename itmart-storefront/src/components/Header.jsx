'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Search, ShoppingCart, Cpu, Globe, Package, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { fetchSearchSuggestions } from '@/lib/clientApi';
import { imageUrl } from '@/lib/api';
import { pickLang } from '@/lib/i18nHelpers';

export default function Header({ dict, locale, categories = [] }) {
  const router = useRouter();
  const { itemCount } = useCart();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const searchRef = useRef(null);
  const categoryNavRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (categoryNavRef.current && !categoryNavRef.current.contains(e.target)) {
        setOpenCategoryId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing stale suggestions when the query becomes too short to search, part of the debounce pattern below
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetchSearchSuggestions(query).then((data) => {
        setSuggestions(data);
        setShowSuggestions(true);
      });
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowSuggestions(false);
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  const switchLang = (lng) => {
    document.cookie = `itmart_lang=${lng};path=/;max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-surface-border">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-9 rounded-lg bg-navy-900 flex items-center justify-center text-white">
            <Cpu size={18} strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-lg text-navy-900 tracking-tight hidden sm:block">
            IT Mart
          </span>
        </Link>

        {/* Search bar */}
        <div className="flex-1 relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder={dict.nav.search}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-surface-border bg-surface text-sm text-ink-900 placeholder:text-ink-500 focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl border border-surface-border shadow-lg overflow-hidden z-50">
              {suggestions.map((p) => {
                const img = p.images?.[0]?.url;
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface transition-colors"
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl(img)}
                        alt=""
                        className="h-9 w-9 rounded-lg object-cover border border-surface-border"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-lg bg-surface flex items-center justify-center text-ink-300">
                        <Package size={16} />
                      </div>
                    )}
                    <span className="text-sm text-ink-900 truncate">{pickLang(p, 'name', locale)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Language switcher */}
        <div className="hidden sm:flex items-center rounded-lg border border-surface-border overflow-hidden text-sm shrink-0">
          <button
            onClick={() => switchLang('fr')}
            className={`px-2.5 py-1.5 flex items-center gap-1 ${
              locale === 'fr' ? 'bg-navy-900 text-white font-semibold' : 'text-ink-500 hover:bg-surface'
            }`}
          >
            <Globe size={13} /> FR
          </button>
          <button
            onClick={() => switchLang('en')}
            className={`px-2.5 py-1.5 flex items-center gap-1 border-l border-surface-border ${
              locale === 'en' ? 'bg-navy-900 text-white font-semibold' : 'text-ink-500 hover:bg-surface'
            }`}
          >
            <Globe size={13} /> EN
          </button>
        </div>

        {/* Cart */}
        <Link href="/cart" className="relative shrink-0 p-2 rounded-lg hover:bg-surface">
          <ShoppingCart size={22} className="text-navy-900" />
          {itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Link>
      </div>

      {/* Category nav */}
      <nav className="border-t border-surface-border" ref={categoryNavRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center flex-wrap gap-1">
          <Link
            href="/products"
            className="shrink-0 px-3 py-2.5 text-sm font-medium text-ink-700 hover:text-brand-600 whitespace-nowrap"
          >
            {dict.nav.allProducts}
          </Link>
          {categories.map((cat) => {
            const hasChildren = cat.children?.length > 0;
            const isOpen = openCategoryId === cat.id;

            if (!hasChildren) {
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="shrink-0 px-3 py-2.5 text-sm font-medium text-ink-700 hover:text-brand-600 whitespace-nowrap"
                >
                  {pickLang(cat, 'name', locale)}
                </Link>
              );
            }

            return (
              <div key={cat.id} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setOpenCategoryId(isOpen ? null : cat.id)}
                  aria-expanded={isOpen}
                  className={`flex items-center gap-1 px-3 py-2.5 text-sm font-medium whitespace-nowrap ${
                    isOpen ? 'text-brand-600' : 'text-ink-700 hover:text-brand-600'
                  }`}
                >
                  {pickLang(cat, 'name', locale)}
                  <ChevronDown
                    size={13}
                    className={`text-ink-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute left-0 top-full bg-white border border-surface-border rounded-lg shadow-lg py-1.5 min-w-[200px] z-50">
                    <Link
                      href={`/products?category=${cat.slug}`}
                      onClick={() => setOpenCategoryId(null)}
                      className="block px-4 py-2 text-sm font-medium text-ink-900 hover:bg-surface hover:text-brand-600"
                    >
                      {dict.nav.allInCategory} {pickLang(cat, 'name', locale)}
                    </Link>
                    <div className="border-t border-surface-border my-1" />
                    {cat.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/products?category=${child.slug}`}
                        onClick={() => setOpenCategoryId(null)}
                        className="block px-4 py-2 text-sm text-ink-700 hover:bg-surface hover:text-brand-600"
                      >
                        {pickLang(child, 'name', locale)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div className="ml-auto sm:hidden flex items-center gap-1 shrink-0 py-1.5">
            <button
              onClick={() => switchLang('fr')}
              className={`px-2 py-1 text-xs rounded ${locale === 'fr' ? 'bg-navy-900 text-white' : 'text-ink-500'}`}
            >
              FR
            </button>
            <button
              onClick={() => switchLang('en')}
              className={`px-2 py-1 text-xs rounded ${locale === 'en' ? 'bg-navy-900 text-white' : 'text-ink-500'}`}
            >
              EN
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
