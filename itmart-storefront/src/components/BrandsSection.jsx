import Link from 'next/link';
import Image from 'next/image';
import { Tags } from 'lucide-react';
import { imageUrl } from '@/lib/api';

export default function BrandsSection({ brands, title }) {
  if (!brands || brands.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h2 className="text-xl font-bold text-navy-900 mb-6">{title}</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/products?brand=${brand.slug}`}
            className="group flex items-center justify-center h-20 rounded-xl border border-surface-border bg-white hover:border-brand-400 hover:shadow-md transition-all p-4"
          >
            {brand.logo ? (
              <div className="relative w-full h-full">
                <Image
                  src={imageUrl(brand.logo)}
                  alt={brand.name}
                  fill
                  sizes="120px"
                  className="object-contain grayscale group-hover:grayscale-0 transition-all"
                />
              </div>
            ) : (
              <span className="text-sm font-semibold text-ink-500 group-hover:text-brand-600">{brand.name}</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
