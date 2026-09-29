import FilterSidebar from './FilterSidebar';

// Wraps a page's main content with the persistent category/brand/price
// filter sidebar. Used on pages where browsing/filtering makes sense (home,
// product listing, product detail) — not on transactional pages (cart,
// checkout, order confirmation) or informational ones (legal pages, order
// tracking), where there's nothing to filter.
//
// Only provides the sidebar + content flex row — the calling page owns its
// own max-width/padding wrapper, so headings etc. can sit above this row
// within the same container without a duplicate nested max-w div.
export default function ShopSidebarLayout({
  dict,
  locale,
  categories,
  brands,
  selectedCategory = null,
  currentFilters = {},
  children,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-8">
      <FilterSidebar
        dict={dict}
        locale={locale}
        categories={categories}
        brands={brands}
        selectedCategory={selectedCategory}
        currentFilters={currentFilters}
      />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
