'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { pickLang } from '@/lib/i18nHelpers';

export default function FilterSidebar({ dict, locale, categories, brands, selectedCategory, currentFilters }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || '');

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page'); // reset pagination on filter change
    router.push(`/products?${params.toString()}`);
  };

  const updateAttr = (attributeId, value) => {
    const params = new URLSearchParams(searchParams.toString());
    const key = `attr[${attributeId}]`;
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const applyPriceRange = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    params.delete('page');
    router.push(`/products?${params.toString()}`);
    setMobileOpen(false);
  };

  const clearAll = () => {
    router.push('/products');
    setMobileOpen(false);
  };

  const content = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-ink-900 mb-3">{dict.filters.category}</h3>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <div key={cat.id}>
              <button
                onClick={() => updateParam('category', currentFilters.category === cat.slug ? null : cat.slug)}
                className={`block w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${
                  currentFilters.category === cat.slug
                    ? 'bg-brand-50 text-brand-600 font-medium'
                    : 'text-ink-700 hover:bg-surface'
                }`}
              >
                {pickLang(cat, 'name', locale)}
              </button>
              {cat.children?.length > 0 && (
                <div className="ml-3 border-l border-surface-border pl-2 mt-0.5 space-y-0.5">
                  {cat.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() =>
                        updateParam('category', currentFilters.category === child.slug ? null : child.slug)
                      }
                      className={`block w-full text-left text-xs px-2.5 py-1 rounded-lg transition-colors ${
                        currentFilters.category === child.slug
                          ? 'bg-brand-50 text-brand-600 font-medium'
                          : 'text-ink-500 hover:bg-surface hover:text-ink-800'
                      }`}
                    >
                      {pickLang(child, 'name', locale)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-ink-900 mb-3">{dict.filters.brand}</h3>
          <div className="space-y-1.5">
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => updateParam('brand', currentFilters.brand === brand.slug ? null : brand.slug)}
                className={`block w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${
                  currentFilters.brand === brand.slug
                    ? 'bg-brand-50 text-brand-600 font-medium'
                    : 'text-ink-700 hover:bg-surface'
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-ink-900 mb-3">{dict.filters.priceRange}</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={dict.filters.min}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-surface-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <span className="text-ink-400">—</span>
          <input
            type="number"
            placeholder={dict.filters.max}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-surface-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <button
          onClick={applyPriceRange}
          className="mt-2 w-full text-sm font-medium bg-navy-900 text-white rounded-lg py-1.5 hover:bg-navy-800 transition-colors"
        >
          {dict.filters.apply}
        </button>
      </div>

      {selectedCategory?.attributes?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-ink-900 mb-3">{dict.product.specifications}</h3>
          <div className="space-y-3">
            {selectedCategory.attributes.map((attr) => (
              <div key={attr.id}>
                <label className="text-xs text-ink-500 mb-1 block">
                  {pickLang(attr, 'name', locale)} {attr.unit ? `(${attr.unit})` : ''}
                </label>
                <input
                  type="text"
                  defaultValue={currentFilters.attrs?.[attr.id] || ''}
                  onBlur={(e) => updateAttr(attr.id, e.target.value)}
                  placeholder="—"
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-surface-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={clearAll}
        className="text-sm font-medium text-ink-500 hover:text-brand-600 transition-colors"
      >
        {dict.filters.clearAll}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-surface-border text-sm font-medium text-ink-700 mb-4"
      >
        <SlidersHorizontal size={15} /> {dict.filters.title}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 lg:sticky lg:top-28 lg:self-start bg-sidebar rounded-xl p-5">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-ink-900">{dict.filters.title}</h2>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-ink-500">
                <X size={20} />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
