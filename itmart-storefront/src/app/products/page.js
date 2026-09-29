import { getDictionary, pickLang, interpolate } from '@/lib/i18n';
import { getCategories, getBrands, getCategoryBySlug, getProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import ShopSidebarLayout from '@/components/ShopSidebarLayout';
import SortSelect from '@/components/SortSelect';
import Pagination from '@/components/Pagination';
import { PackageSearch } from 'lucide-react';

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  if (sp.q) {
    return { title: `"${sp.q}"`, description: `Search results for "${sp.q}" on IT Mart.` };
  }
  if (sp.category) {
    const category = await getCategoryBySlug(sp.category);
    if (category) {
      return {
        title: category.nameEn,
        description: `Shop ${category.nameEn} at IT Mart — genuine IT equipment delivered across Cameroon.`,
      };
    }
  }
  return { title: 'All Products', description: 'Browse the full IT Mart catalog.' };
}

function parseAttrFilters(sp) {
  const attrs = {};
  Object.entries(sp).forEach(([key, value]) => {
    const match = key.match(/^attr\[(.+)\]$/);
    if (match && value) attrs[match[1]] = value;
  });
  return attrs;
}

export default async function ProductsPage({ searchParams }) {
  const sp = await searchParams;
  const { locale, t } = await getDictionary();

  const page = Number(sp.page) || 1;
  const attrs = parseAttrFilters(sp);

  const [categories, brands, selectedCategory, productsRes] = await Promise.all([
    getCategories(),
    getBrands(),
    sp.category ? getCategoryBySlug(sp.category) : Promise.resolve(null),
    getProducts({
      category: sp.category,
      brand: sp.brand,
      q: sp.q,
      minPrice: sp.minPrice,
      maxPrice: sp.maxPrice,
      bestSeller: sp.bestSeller,
      discounted: sp.discounted,
      sort: sp.sort,
      page,
      limit: 24,
      attr: attrs,
    }),
  ]);

  const { data: products, meta } = productsRes;

  const buildHref = (targetPage) => {
    const params = new URLSearchParams(sp);
    params.set('page', String(targetPage));
    return `/products?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">
          {sp.q ? `"${sp.q}"` : selectedCategory ? pickLang(selectedCategory, 'name', locale) : t.nav.allProducts}
        </h1>
        <p className="text-sm text-ink-500 mt-1">{interpolate(t.filters.resultsCount, { count: meta.total })}</p>
      </div>

      <ShopSidebarLayout
        dict={t}
        locale={locale}
        categories={categories}
        brands={brands}
        selectedCategory={selectedCategory}
        currentFilters={{ category: sp.category, brand: sp.brand, minPrice: sp.minPrice, maxPrice: sp.maxPrice, attrs }}
      >
        <div className="flex justify-end mb-4">
          <SortSelect dict={t} current={sp.sort} />
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <PackageSearch size={40} className="text-ink-300 mb-3" />
            <p className="text-ink-500">{t.filters.noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} dict={t} locale={locale} />
            ))}
          </div>
        )}

        <Pagination page={meta.page} pages={meta.pages} buildHref={buildHref} />
      </ShopSidebarLayout>
    </div>
  );
}
