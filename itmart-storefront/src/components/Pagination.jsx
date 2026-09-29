import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, buildHref }) {
  if (pages <= 1) return null;

  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`h-9 w-9 flex items-center justify-center rounded-lg border border-surface-border ${
          page === 1 ? 'pointer-events-none opacity-40' : 'hover:border-brand-400'
        }`}
      >
        <ChevronLeft size={16} />
      </Link>

      {pageNumbers.map((p, idx) => (
        <span key={p} className="flex items-center gap-1.5">
          {idx > 0 && pageNumbers[idx - 1] !== p - 1 && <span className="text-ink-300 px-1">…</span>}
          <Link
            href={buildHref(p)}
            className={`h-9 w-9 flex items-center justify-center rounded-lg text-sm font-medium ${
              p === page ? 'bg-navy-900 text-white' : 'border border-surface-border hover:border-brand-400'
            }`}
          >
            {p}
          </Link>
        </span>
      ))}

      <Link
        href={buildHref(Math.min(pages, page + 1))}
        aria-disabled={page === pages}
        className={`h-9 w-9 flex items-center justify-center rounded-lg border border-surface-border ${
          page === pages ? 'pointer-events-none opacity-40' : 'hover:border-brand-400'
        }`}
      >
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}
