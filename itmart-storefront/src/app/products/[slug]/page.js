import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, getLocale, pickLang } from '@/lib/i18n';
import { getProductBySlug, getProducts, getCategories, getBrands } from '@/lib/api';
import { productSeo, productJsonLd, breadcrumbJsonLd, jsonLd } from '@/lib/seo';
import ProductVariantSwitcher from '@/components/ProductVariantSwitcher';
import ProductCard from '@/components/ProductCard';
import ShopSidebarLayout from '@/components/ShopSidebarLayout';
import { TrackViewItem } from '@/components/TrackEvent';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [product, locale] = await Promise.all([getProductBySlug(slug), getLocale()]);
  if (!product) return { title: locale === 'en' ? 'Product not found' : 'Produit introuvable', robots: { index: false } };

  // Admin → product → Référencement (Google), else name / short description
  const { title, description, image } = productSeo(product, locale);
  const path = `/products/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: 'website',
      images: image ? [{ url: image }] : [],
    },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : [] },
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

  // Only what the tracking tools need — keeps the page payload small
  const trackedProduct = {
    id: product.id,
    sku: product.sku,
    nameFr: product.nameFr,
    nameEn: product.nameEn,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    category: product.category ? { nameFr: product.category.nameFr, nameEn: product.category.nameEn } : null,
    brand: product.brand ? { name: product.brand.name } : null,
  };

  // Structured data for Google: price, stock, photos, breadcrumb
  const breadcrumb = [
    { name: t.nav.home, path: '/' },
    ...(product.category
      ? [{ name: pickLang(product.category, 'name', locale), path: `/products?category=${product.category.slug}` }]
      : []),
    { name, path: `/products/${product.slug}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(productJsonLd(product, locale))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbJsonLd(breadcrumb))} />
      <TrackViewItem product={trackedProduct} />
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