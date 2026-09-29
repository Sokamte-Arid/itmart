'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { imageUrl } from '@/lib/api';

const AUTO_ADVANCE_MS = 4000;

export default function ProductGallery({ images, alt }) {
  const sorted = [...(images || [])].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-advance through the images, like the hero banner — pauses while
  // the customer's mouse is over the image so it doesn't shift under them
  // while they're looking closely.
  useEffect(() => {
    if (sorted.length < 2 || paused) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % sorted.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [sorted.length, paused]);

  if (!sorted.length) {
    return (
      <div className="aspect-square bg-surface rounded-xl border border-surface-border flex items-center justify-center text-ink-300">
        <Package size={48} />
      </div>
    );
  }

  const active = sorted[activeIndex];

  return (
    <div>
      <div
        className="aspect-square bg-surface rounded-xl border border-surface-border overflow-hidden relative mb-3"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <Image
          src={imageUrl(active.url)}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-opacity duration-500"
          priority
        />
        {sorted.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {sorted.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(i)}
                aria-label={`Image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex ? 'w-6 bg-brand-500' : 'w-1.5 bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 relative ${
                i === activeIndex ? 'border-brand-500' : 'border-surface-border'
              }`}
            >
              <Image src={imageUrl(img.url)} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
