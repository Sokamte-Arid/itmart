'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { imageUrl } from '@/lib/api';
import { pickLang } from '@/lib/i18nHelpers';

export default function Hero({ banners, locale, fallbackTitle, fallbackSubtitle, fallbackCta }) {
  const [active, setActive] = useState(0);
  const hasBanners = banners && banners.length > 0;

  useEffect(() => {
    if (!hasBanners || banners.length < 2) return;
    const interval = setInterval(() => {
      setActive((i) => (i + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [hasBanners, banners?.length]);

  // No banners configured yet in the admin — fall back to the default text hero
  if (!hasBanners) {
    return (
      <section className="bg-navy-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
              {fallbackTitle}
            </h1>
            <p className="text-navy-300 text-base sm:text-lg mb-8">{fallbackSubtitle}</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              {fallbackCta} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        <div className="absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-brand-500/10" aria-hidden="true" />
        <div className="absolute right-32 top-8 h-40 w-40 rounded-full bg-white/5" aria-hidden="true" />
      </section>
    );
  }

  const banner = banners[active];
  const title = pickLang(banner, 'title', locale);
  const subtitle = pickLang(banner, 'subtitle', locale);
  const ctaText = pickLang(banner, 'ctaText', locale);

  return (
    <section className="relative bg-navy-900">
      {/* Fixed aspect ratio at every breakpoint so the same image is shown
          identically-cropped on phone and desktop, not art-directed differently. */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
        <Image
          src={imageUrl(banner.image)}
          alt={title || 'IT Mart'}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {(title || subtitle || ctaText) && (
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/80 via-navy-950/40 to-transparent flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
              <div className="max-w-md">
                {title && (
                  <h1 className="text-xl sm:text-3xl font-extrabold text-white leading-tight mb-2 sm:mb-3">
                    {title}
                  </h1>
                )}
                {subtitle && <p className="text-navy-100 text-sm sm:text-base mb-4 sm:mb-6">{subtitle}</p>}
                {ctaText && (
                  <Link
                    href={banner.ctaLink || '/products'}
                    className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-full transition-colors text-sm sm:text-base"
                  >
                    {ctaText} <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setActive(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? 'w-6 bg-brand-500' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
