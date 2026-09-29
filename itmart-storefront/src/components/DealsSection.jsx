import Link from 'next/link';
import Image from 'next/image';
import { imageUrl } from '@/lib/api';
import { pickLang } from '@/lib/i18nHelpers';
import ProductCard from './ProductCard';

export default function DealsSection({ banner, products, dict, locale, title }) {
  if (products.length === 0) return null;

  const bannerTitle = banner ? pickLang(banner, 'title', locale) : null;
  const bannerSubtitle = banner ? pickLang(banner, 'subtitle', locale) : null;
  const ctaText = banner ? pickLang(banner, 'ctaText', locale) : null;

  return (
    <section>
      <h2 className="text-xl font-bold text-navy-900 mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-stretch">
        {banner && (
          <Link
            href={banner.ctaLink || '/products?discounted=true'}
            className="relative rounded-xl overflow-hidden group min-h-[220px] sm:min-h-0"
          >
            <Image
              src={imageUrl(banner.image)}
              alt={bannerTitle || ''}
              fill
              sizes="(max-width: 640px) 100vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {(bannerTitle || bannerSubtitle || ctaText) && (
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent flex flex-col justify-end p-5">
                {bannerTitle && <h3 className="text-white font-extrabold text-xl leading-tight mb-1">{bannerTitle}</h3>}
                {bannerSubtitle && <p className="text-white/80 text-sm mb-3">{bannerSubtitle}</p>}
                {ctaText && (
                  <span className="inline-flex w-fit bg-white text-navy-900 text-sm font-semibold rounded-full px-4 py-2">
                    {ctaText}
                  </span>
                )}
              </div>
            )}
          </Link>
        )}
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 gap-4 ${banner ? 'sm:col-span-3' : 'sm:col-span-4'}`}
        >
          {products.slice(0, 3).map((p) => (
            <ProductCard key={p.id} product={p} dict={dict} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
