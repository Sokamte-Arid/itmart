import Link from 'next/link';
import Image from 'next/image';
import { Layers } from 'lucide-react';
import { imageUrl } from '@/lib/api';
import { pickLang } from '@/lib/i18nHelpers';

export default function CategoryCard({ category, locale }) {
  const name = pickLang(category, 'name', locale);
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group flex flex-col items-center text-center gap-2.5"
    >
      <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-surface border border-surface-border overflow-hidden flex items-center justify-center group-hover:border-brand-400 group-hover:shadow-md transition-all relative">
        {category.image ? (
          <Image src={imageUrl(category.image)} alt={name} fill sizes="96px" className="object-cover" />
        ) : (
          <Layers size={28} className="text-navy-500" />
        )}
      </div>
      <span className="text-sm font-medium text-ink-800 group-hover:text-brand-600 transition-colors">
        {name}
      </span>
    </Link>
  );
}
