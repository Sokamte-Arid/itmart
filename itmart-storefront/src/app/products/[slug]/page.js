import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, pickLang } from '@/lib/i18n';
import { getProductBySlug, getProducts, getCategories, getBrands, imageUrl } from '@/lib/api';
import { formatFCFA } from '@/lib/utils';
import ProductVariantSwitcher from '@/components/ProductVariantSwitcher';
import ProductCard from '@/components/ProductCard';
import ShopSidebarLayout from '@/components/ShopSidebarLayout';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product not found' };

  const price = product.discountPrice ?? product.price;
  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];

  return {
    title: product.nameEn,
    description:
      product.descriptionEn ||
      `${product.nameEn} — ${formatFCFA(price)}. Available at IT Mart, delivered across Cameroon.`,
    openGraph: {
      title: product.nameEn,
      description: `${formatFCFA(price)} — ${product.category?.nameEn || ''}`,
      images: primaryImage ? [{ url: imageUrl(primaryImage.url) }] : [],
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const { locale, t } = await getDictionary();
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [relatedRes, categories, brands] = await Promise.all([
    product.category ? getProducts({ category: product.category.slug, limit: 5 }) : Promise.resolve({ data: [] }),
    getCategories(),
    getBrands(),
  ]);
  const related = relatedRes.data.filter((p) => p.id !== product.id).slice(0, 4);

  const name = pickLang(product, 'name', locale);
  const description = pickLang(product, 'description', locale);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav className="text-xs text-ink-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-brand-600">
          {t.nav.home}
        </Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand-600">
              {pickLang(product.category, 'name', locale)}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-ink-800 truncate">{name}</span>
      </nav>

      <ShopSidebarLayout dict={t} locale={locale} categories={categories} brands={brands}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          <ProductVariantSwitcher
            product={product}
            colorVariants={product.colorVariants}
            description={description}
            dict={t}
            locale={locale}
          />
        </div>

        {product.curatedRelated?.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-navy-900 mb-6">{t.product.completeYourPurchase}</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {product.curatedRelated.map((p) => (
                <ProductCard key={p.id} product={p} dict={t} locale={locale} />
              ))}
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-navy-900 mb-6">{t.product.relatedProducts}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} dict={t} locale={locale} />
              ))}
            </div>
          </div>
        )}
      </ShopSidebarLayout>
    </div>
  );
}