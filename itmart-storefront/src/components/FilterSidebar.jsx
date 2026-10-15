'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { pickLang } from '@/lib/i18nHelpers';

// Ids from the main category down to the category with this slug
function pathTo(tree, slug, trail = []) {
  if (!slug) return new Set();
  for (const cat of tree || []) {
    const next = [...trail, cat.id];
    if (cat.slug === slug) return new Set(next);
    const found = pathTo(cat.children, slug, next);
    if (found.size) return found;
  }
  return new Set();
}

function CategoryNode({ cat, depth, openIds, selected, onSelect, locale }) {
  const isSelected = selected === cat.slug;
  const children = cat.children || [];
  // Level 1 shows its subcategories; deeper ones only when on the chosen path
  const showChildren = children.length > 0 && (depth === 0 || openIds.has(cat.id));
  return (
    <div>
      <button
        onClick={() => onSelect(cat.slug)}
        className={`flex items-center gap-1 w-full text-left rounded-lg transition-colors ${
          depth === 0 ? 'text-sm px-2.5 py-1.5' : 'text-xs px-2.5 py-1'
        } ${
          isSelected
            ? 'bg-brand-50 text-brand-600 font-medium'
            : depth === 0
            ? 'text-ink-700 hover:bg-surface'
            : 'text-ink-500 hover:bg-surface hover:text-ink-800'
        }`}
      >
        <span className="flex-1 min-w-0">{pickLang(cat, 'name', locale)}</span>
        {depth > 0 && children.length > 0 && !showChildren && <span className="text-ink-300">›</span>}
      </button>
      {showChildren && (
        <div className="ml-3 border-l border-surface-border pl-2 mt-0.5 space-y-0.5">
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              cat={child}
              depth={depth + 1}
              openIds={openIds}
              selected={selected}
              onSelect={onSelect}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// (brands is still passed by the pages but no longer shown: the filter list
// only offers categories, price and characteristics)
export default function FilterSidebar({ dict, locale, categories, selectedCategory, currentFilters }) {
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

  // Categories can be nested at any depth: main categories always show their
  // direct subcategories; deeper levels open along the path of the chosen one
  const openIds = pathTo(categories, currentFilters.category);

  const content = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-ink-900 mb-3">{dict.filters.category}</h3>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <CategoryNode
              key={cat.id}
              cat={cat}
              depth={0}
              openIds={openIds}
              selected={currentFilters.category}
              onSelect={(slug) => updateParam('category', currentFilters.category === slug ? null : slug)}
              locale={locale}
            />
          ))}
        </div>
      </div>


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
