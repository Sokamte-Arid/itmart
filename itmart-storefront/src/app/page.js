import Link from 'next/link';
import { Truck, ShieldCheck, MessageCircle } from 'lucide-react';
import { getDictionary } from '@/lib/i18n';
import { getCategories, getProducts, getBanners, getRandomProducts, getBrands } from '@/lib/api';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import Hero from '@/components/Hero';
import DealsSection from '@/components/DealsSection';
import PromoTilesSection from '@/components/PromoTilesSection';
import BrandsSection from '@/components/BrandsSection';
import ShopSidebarLayout from '@/components/ShopSidebarLayout';

export default async function HomePage() {
  const { locale, t } = await getDictionary();
  const [categories, bestSellers, discounts, heroBanners, dealsBanners, promoBanners, randomProducts, brands] =
    await Promise.all([
      getCategories(),
      getProducts({ bestSeller: 'true', limit: 8 }),
      getProducts({ discounted: 'true', limit: 8 }),
      getBanners('HERO'),
      getBanners('DEALS'),
      getBanners('PROMO'),
      getRandomProducts(8),
      getBrands(),
    ]);

  return (
    <div>
      <Hero
        banners={heroBanners}
        locale={locale}
        fallbackTitle={t.home.heroTitle}
        fallbackSubtitle={t.home.heroSubtitle}
        fallbackCta={t.home.heroCta}
      />

      {/* Trust strip — full-width, right under the hero */}
      <section className="border-b border-surface-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-center sm:justify-between gap-4 text-sm text-ink-700">
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-brand-500" /> Livraison partout au Cameroun
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand-500" /> Produits authentiques
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-brand-500" /> Commande simple via WhatsApp
          </div>
        </div>
      </section>

      {/* Everything below browses/discovers products, so it all shares the
          persistent filter sidebar as one continuous block. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <ShopSidebarLayout dict={t} locale={locale} categories={categories} brands={brands}>
          {/* Discover — a random selection, re-shuffled on every page load */}
          {randomProducts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-navy-900 mb-6">{t.home.discoverTitle}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {randomProducts.map((p) => (
                  <ProductCard key={p.id} product={p} dict={t} locale={locale} />
                ))}
              </div>
            </section>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-navy-900 mb-6">{t.home.shopByCategory}</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 sm:gap-6">
                {categories.slice(0, 12).map((cat) => (
                  <CategoryCard key={cat.id} category={cat} locale={locale} />
                ))}
              </div>
            </section>
          )}

          {/* Best sellers */}
          {bestSellers.data.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy-900">{t.home.bestSellers}</h2>
                <Link href="/products?bestSeller=true" className="text-sm font-medium text-brand-600 hover:underline">
                  {t.home.viewAll}
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {bestSellers.data.map((p) => (
                  <ProductCard key={p.id} product={p} dict={t} locale={locale} />
                ))}
              </div>
            </section>
          )}

          {/* Deals of the day — admin-managed promo tile beside discounted products */}
          <div className="mb-12">
            <DealsSection
              banner={dealsBanners[0] || null}
              products={discounts.data}
              dict={t}
              locale={locale}
              title={t.home.discounts}
            />
          </div>

          {/* Promo / event tiles — admin creates and removes these freely */}
          <div className="mb-12">
            <PromoTilesSection banners={promoBanners} locale={locale} />
          </div>

          {/* Brands showcase — right before the footer */}
          <BrandsSection brands={brands} title={t.home.ourBrands} />
        </ShopSidebarLayout>
      </div>
    </div>
  );
}
