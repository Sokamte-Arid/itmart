'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Makes page sections and product cards fade in and rise slightly as they
// scroll into view. Works on every page automatically (mounted once in the
// root layout):
//   • sections inside <main>, and
//   • items of product/category grids, one after the other (small stagger).
// Only things BELOW the screen at load are animated — what's visible
// immediately is never hidden, so nothing flashes. Without JavaScript, or
// with "reduce motion" turned on in the phone/computer settings, everything
// simply shows normally.
const SELECTOR = 'main section, main .grid > *, main [data-reveal]';

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('reveal-in');
          pending.delete(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    // Elements handled by THIS run. (Not stored on the elements themselves:
    // in development React runs this setup twice, and a mark left by the
    // first run made the second one skip them — they then stayed hidden.)
    const seen = new WeakSet();
    const pending = new Set();

    const prepare = (root) => {
      root.querySelectorAll(SELECTOR).forEach((el) => {
        if (seen.has(el) || el.classList.contains('reveal-in')) return;
        seen.add(el);
        // A section that contains a grid: let its cards animate instead of
        // the whole block, so there's no double animation.
        if (el.tagName === 'SECTION' && el.querySelector('.grid')) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92) return; // already on screen
        // Cards in the same row appear one after the other
        if (el.parentElement?.classList.contains('grid')) {
          const index = Array.prototype.indexOf.call(el.parentElement.children, el);
          el.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
        }
        el.classList.add('reveal');
        pending.add(el);
        observer.observe(el);
      });
    };

    const main = document.querySelector('main');
    if (!main) return undefined;
    prepare(main);

    // New content (filters, "load more", client navigation) gets the same treatment
    const mutations = new MutationObserver(() => prepare(main));
    mutations.observe(main, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
      // Never leave anything hidden behind: un-hide what wasn't revealed yet
      // (the next run, if any, will prepare it again).
      pending.forEach((el) => el.classList.remove('reveal'));
    };
  }, [pathname]);

  return null;
}
