'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { imageUrl } from '@/lib/api';
import { pickLang } from '@/lib/i18nHelpers';

export default function HeroCarousel({ banners, locale, fallbackTitle, fallbackSubtitle, fallbackCta, hasSide = false }) {
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
       <div className="bg-navy-900 relative overflow-hidden rounded-2xl">
        <div className="px-5 sm:px-10 py-10 sm:py-14 relative z-10">
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
       </div>
    );
  }

  const banner = banners[active];
  const title = pickLang(banner, 'title', locale);
  const subtitle = pickLang(banner, 'subtitle', locale);
  const ctaText = pickLang(banner, 'ctaText', locale);

  return (
      // Wide frame (2.4:1 on phones, 3:1 on computers — or 5:2 when side tiles
      // take the right quarter), with height capped to ~45% of the screen so
      // products are visible below it without scrolling.
      <div
        className={`relative w-full aspect-[12/5] sm:aspect-[3/1] ${
          hasSide ? 'lg:aspect-[5/2]' : ''
        } max-h-[45vh] min-h-[150px] overflow-hidden rounded-2xl bg-navy-900`}
      >
        {banners.map((b, i) => {
          const isActive = i === active;
          return (
            <div
              key={b.id}
              className={`absolute inset-0 transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}
              aria-hidden={!isActive}
            >
              {/* Blurred copy fills any empty space when the image's shape
                  doesn't match the frame — the real image is never cropped. */}
              <Image
                src={imageUrl(b.image)}
                alt=""
                fill
                sizes={hasSide ? '(max-width: 1024px) 100vw, 960px' : '(max-width: 1280px) 100vw, 1280px'}
                className="object-cover scale-110 blur-2xl opacity-60"
                aria-hidden="true"
                priority={i === 0}
              />
              <Image
                src={imageUrl(b.image)}
                alt={pickLang(b, 'title', locale) || 'IT Mart'}
                fill
                priority={i === 0}
                sizes={hasSide ? '(max-width: 1024px) 100vw, 960px' : '(max-width: 1280px) 100vw, 1280px'}
                className="object-contain"
              />
            </div>
          );
        })}

        {(title || subtitle || ctaText) && (
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/80 via-navy-950/40 to-transparent flex items-center">
            <div className="px-5 sm:px-10 w-full">
              <div className="max-w-md">
                {title && (
                  <h1 className="text-lg sm:text-3xl font-extrabold text-white leading-tight mb-1.5 sm:mb-3">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="hidden sm:block text-navy-100 text-sm sm:text-base mb-4 sm:mb-6">{subtitle}</p>
                )}
                {ctaText && (
                  <Link
                    href={banner.ctaLink || '/products'}
                    className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2 sm:px-6 sm:py-3 rounded-full transition-colors text-sm sm:text-base"
                  >
                    {ctaText} <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? 'w-6 bg-brand-500' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
  );
}
