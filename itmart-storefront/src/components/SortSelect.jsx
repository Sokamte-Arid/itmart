'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SortSelect({ dict, current }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  return (
    <select
      value={current || 'newest'}
      onChange={handleChange}
      className="text-sm border border-surface-border rounded-lg px-3 py-2 text-ink-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
    >
      <option value="newest">{dict.filters.sortNewest}</option>
      <option value="price_asc">{dict.filters.sortPriceAsc}</option>
      <option value="price_desc">{dict.filters.sortPriceDesc}</option>
    </select>
  );
}
