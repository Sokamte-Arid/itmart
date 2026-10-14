import { getProducts } from '@/lib/api';
import { pickLang } from '@/lib/i18nHelpers';
import CategoryCarousel from './CategoryCarousel';

// End of the home page: one sliding row of products per MAIN category.
// Fully automatic — a new main category gets its row as soon as it (or one
// of its subcategories) has at least one product; empty ones stay hidden.
export default async function CategoryCarousels({ categories = [], dict, locale }) {
  const mains = categories.filter((c) => !c.parentId);

  // The products API already includes subcategories when given a main category
  const rows = await Promise.all(
    mains.map(async (cat) => {
      const res = await getProducts({ category: cat.slug, limit: 12 });
      return { cat, products: res?.data || [] };
    })
  );

  const visible = rows.filter((r) => r.products.length > 0);
  if (visible.length === 0) return null;

  return (
    <div className="mt-12">
      {visible.map(({ cat, products }) => (
        <CategoryCarousel
          key={cat.id}
          title={pickLang(cat, 'name', locale)}
          href={`/products?category=${cat.slug}`}
          products={products}
          dict={dict}
          locale={locale}
        />
      ))}
    </div>
  );
}
