'use client';

import { useEffect, useRef } from 'react';
import { trackViewItem, trackSearch } from '@/lib/analytics';

// Tiny client components so server-rendered pages can report an event once.

export function TrackViewItem({ product }) {
  const done = useRef(null);
  useEffect(() => {
    if (done.current === product.id) return;
    done.current = product.id;
    // Wait a moment so the tracking scripts have loaded on a first visit
    const id = setTimeout(() => trackViewItem(product), 800);
    return () => clearTimeout(id);
  }, [product]);
  return null;
}

export function TrackSearch({ query }) {
  const done = useRef(null);
  useEffect(() => {
    if (!query || done.current === query) return;
    done.current = query;
    const id = setTimeout(() => trackSearch(query), 800);
    return () => clearTimeout(id);
  }, [query]);
  return null;
}
