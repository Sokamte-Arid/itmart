'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

// One category's products in a single sliding row: swipe on phones, arrows
// on computers. Cards snap into place so they never stop half-visible.
export default function CategoryCarousel({ title, href, products, dict, locale }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    el?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  // Moves by almost a full "page" of cards
  const scrollByPage = (direction) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  const arrow =
    'hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-surface-border bg-white text-navy-900 shadow-sm transition-opacity hover:border-brand-400 disabled:opacity-30 disabled:cursor-default';

  return (
    <section className="mb-12" aria-label={title}>
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-xl font-bold text-navy-900 truncate">{title}</h2>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={href} className="text-sm font-medium text-brand-600 hover:underline mr-1">
            {dict.home.viewAll}
          </Link>
          <button type="button" onClick={() => scrollByPage(-1)} disabled={!canPrev} className={arrow} aria-label="Précédent / Previous">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => scrollByPage(1)} disabled={!canNext} className={arrow} aria-label="Suivant / Next">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          // 2 cards (+ a peek of the next) on phones, 3 on tablets, 4 on computers
          <div key={p.id} className="shrink-0 snap-start w-[46%] sm:w-[31.5%] xl:w-[23.5%] flex">
            <div className="w-full [&>*]:h-full">
              <ProductCard product={p} dict={dict} locale={locale} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
