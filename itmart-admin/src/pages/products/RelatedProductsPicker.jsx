import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, GripVertical } from 'lucide-react';
import * as productsApi from '../../api/products';
import { API_ORIGIN } from '../../api/client';
import { Input } from '../../components/ui/Field';

export default function RelatedProductsPicker({ productId, selected, onChange }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      setSearching(true);
      productsApi
        .getProducts({ q: query, limit: 8 })
        .then((res) => {
          const selectedIds = new Set(selected.map((p) => p.id));
          setResults(res.data.filter((p) => p.id !== productId && !selectedIds.has(p.id)));
        })
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, selected, productId]);

  const addProduct = (product) => {
    onChange([...selected, product]);
    setQuery('');
    setResults([]);
  };

  const removeProduct = (id) => {
    onChange(selected.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('products.searchToAddRelated')}
          className="pl-9"
        />
        {results.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-surface-border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
            {results.map((p) => {
              const img = p.images?.find((i) => i.isPrimary) || p.images?.[0];
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addProduct(p)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-surface text-left"
                >
                  {img ? (
                    <img
                      src={`${API_ORIGIN}${img.url}`}
                      alt=""
                      className="h-8 w-8 rounded object-cover border border-surface-border"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded bg-surface border border-surface-border" />
                  )}
                  <span className="text-sm text-ink-800 truncate">{p.nameEn}</span>
                </button>
              );
            })}
          </div>
        )}
        {searching && <p className="text-xs text-ink-400 mt-1">{t('common.loading')}</p>}
      </div>

      {selected.length > 0 ? (
        <div className="space-y-1.5">
          {selected.map((p) => {
            const img = p.images?.find((i) => i.isPrimary) || p.images?.[0];
            return (
              <div
                key={p.id}
                className="flex items-center gap-2.5 px-2.5 py-1.5 bg-surface rounded-lg"
              >
                <GripVertical size={14} className="text-ink-300 shrink-0" />
                {img ? (
                  <img
                    src={`${API_ORIGIN}${img.url}`}
                    alt=""
                    className="h-8 w-8 rounded object-cover border border-surface-border shrink-0"
                  />
                ) : (
                  <div className="h-8 w-8 rounded bg-white border border-surface-border shrink-0" />
                )}
                <span className="text-sm text-ink-800 truncate flex-1">{p.nameEn}</span>
                <button
                  type="button"
                  onClick={() => removeProduct(p.id)}
                  className="text-ink-400 hover:text-danger-600 shrink-0"
                >
                  <X size={15} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-ink-400">{t('products.noRelatedYet')}</p>
      )}
    </div>
  );
}
