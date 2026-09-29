import Link from 'next/link';
import Image from 'next/image';
import { imageUrl } from '@/lib/api';
import { pickLang } from '@/lib/i18nHelpers';

// Tailwind needs literal class strings (not interpolated) to generate the
// right CSS, so the column count is picked from a static lookup.
const gridCols = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' };

export default function PromoTilesSection({ banners, locale }) {
  if (!banners || banners.length === 0) return null;

  const cols = gridCols[Math.min(banners.length, 3)];

  return (
    <section>
      <div className={`grid grid-cols-1 ${cols} gap-4`}>
        {banners.slice(0, 3).map((banner) => {
          const title = pickLang(banner, 'title', locale);
          const subtitle = pickLang(banner, 'subtitle', locale);
          const ctaText = pickLang(banner, 'ctaText', locale);

          return (
            <Link
              key={banner.id}
              href={banner.ctaLink || '/products'}
              className="relative rounded-xl overflow-hidden group min-h-[180px]"
            >
              <Image
                src={imageUrl(banner.image)}
                alt={title || ''}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {(title || subtitle || ctaText) && (
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/20 to-transparent flex flex-col justify-end p-5">
                  {title && <h3 className="text-white font-extrabold text-lg leading-tight mb-1">{title}</h3>}
                  {subtitle && <p className="text-white/80 text-xs mb-3">{subtitle}</p>}
                  {ctaText && (
                    <span className="inline-flex w-fit bg-white text-navy-900 text-xs font-semibold rounded-full px-3.5 py-1.5">
                      {ctaText}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
