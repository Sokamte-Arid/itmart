'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

// One category's products in a single sliding row: swipe on phones, arrows
// on computers. Cards snap into place so they never stop half-visible.
//
// It also slides by itself: one product every AUTO_MS, back to the start at
// the end. It pauses while the visitor hovers, touches or swipes it, while
// it's off screen or the tab is hidden, and for visitors who asked their
// device to reduce motion. `index` staggers the rows so they don't all move
// at the same moment.
const AUTO_MS = 3500;
const PAUSE_AFTER_TOUCH_MS = 8000;

export default function CategoryCarousel({ title, href, products, dict, locale, index = 0 }) {
  const trackRef = useRef(null);
  const hovered = useRef(false);
  const visible = useRef(false);
  const lastTouch = useRef(0);
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

  // Auto-slide
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const io = new IntersectionObserver(([entry]) => (visible.current = entry.isIntersecting), { threshold: 0.4 });
    io.observe(el);

    const tick = () => {
      if (hovered.current || !visible.current || document.hidden) return;
      if (Date.now() - lastTouch.current < PAUSE_AFTER_TOUCH_MS) return;
      if (el.scrollWidth <= el.clientWidth + 4) return; // everything already fits
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const card = el.firstElementChild;
        const gap = parseFloat(getComputedStyle(el).columnGap) || 16;
        el.scrollBy({ left: (card?.getBoundingClientRect().width || el.clientWidth / 2) + gap, behavior: 'smooth' });
      }
    };

    let interval;
    const start = setTimeout(() => {
      interval = setInterval(tick, AUTO_MS);
    }, (index % 4) * 900);

    return () => {
      clearTimeout(start);
      clearInterval(interval);
      io.disconnect();
    };
  }, [index]);

  const noteTouch = () => {
    lastTouch.current = Date.now();
  };

  // Moves by almost a full "page" of cards
  const scrollByPage = (direction) => {
    noteTouch();
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
        onMouseEnter={() => (hovered.current = true)}
        onMouseLeave={() => (hovered.current = false)}
        onTouchStart={noteTouch}
        onWheel={noteTouch}
        onFocus={noteTouch}
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
