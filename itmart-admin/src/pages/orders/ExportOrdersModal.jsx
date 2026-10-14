import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileSpreadsheet, FileText, Search, Check } from 'lucide-react';
import * as ordersApi from '../../api/orders';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Field';
import { useToast } from '../../components/ui/Toast';

// Export window: all orders, or the customers of one product; any status;
// Excel (CSV) or PDF.
export default function ExportOrdersModal({ open, onClose, statuses, statusLabel, initialProductId = '', initialStatus = '' }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [scope, setScope] = useState(initialProductId ? 'product' : 'all');
  const [productId, setProductId] = useState(initialProductId);
  const [status, setStatus] = useState(initialStatus);
  const [products, setProducts] = useState(null);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (!open) return;
    setScope(initialProductId ? 'product' : 'all');
    setProductId(initialProductId);
    setStatus(initialStatus);
    setSearch('');
    ordersApi
      .getOrderedProducts()
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]));
  }, [open, initialProductId, initialStatus]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!products) return [];
    if (!q) return products;
    return products.filter((p) => `${p.nameFr} ${p.nameEn} ${p.sku}`.toLowerCase().includes(q));
  }, [products, search]);

  const download = async (format) => {
    if (scope === 'product' && !productId) {
      showToast(t('exports.chooseProduct'), 'error');
      return;
    }
    setBusy(format);
    try {
      await ordersApi.exportOrders({ format, status, productId: scope === 'product' ? productId : undefined });
      onClose();
    } catch {
      showToast(t('orders.exportFailed'), 'error');
    } finally {
      setBusy('');
    }
  };

  const scopeButton = (key, label, hint) => (
    <button
      type="button"
      onClick={() => setScope(key)}
      className={`flex-1 text-left rounded-lg border p-3 transition-colors ${
        scope === key ? 'border-accent-500 bg-accent-100/60' : 'border-surface-border hover:bg-surface'
      }`}
      aria-pressed={scope === key}
    >
      <span className="block text-sm font-semibold text-ink-900">{label}</span>
      <span className="block text-xs text-ink-500 mt-0.5">{hint}</span>
    </button>
  );

  return (
    <Modal open={open} onClose={onClose} title={t('exports.title')}>
      <div className="p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row gap-2">
          {scopeButton('all', t('exports.allOrders'), t('exports.allOrdersHint'))}
          {scopeButton('product', t('exports.byProduct'), t('exports.byProductHint'))}
        </div>

        {scope === 'product' && (
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">{t('exports.product')}</label>
            <div className="relative mb-2">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('exports.searchProduct')}
                className="w-full rounded-lg border border-surface-border pl-9 pr-3 py-2 text-sm focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
              />
            </div>
            <div className="max-h-56 overflow-y-auto rounded-lg border border-surface-border divide-y divide-surface-border">
              {products === null && <p className="px-3 py-3 text-sm text-ink-500">{t('common.loading')}</p>}
              {products && filtered.length === 0 && (
                <p className="px-3 py-3 text-sm text-ink-500">{products.length ? t('common.noResults') : t('exports.noOrderedProducts')}</p>
              )}
              {filtered.map((p) => {
                const active = p.id === productId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProductId(p.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm ${active ? 'bg-accent-100/60' : 'hover:bg-surface'}`}
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block truncate text-ink-900">{p.nameFr || p.nameEn}</span>
                      <span className="block text-xs text-ink-500">
                        {p.sku} · {t('exports.orderCount', { count: p.orderCount })}
                        {!p.isActive ? ` · ${t('products.inactive')}` : ''}
                      </span>
                    </span>
                    {active && <Check size={16} className="text-accent-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ink-800 mb-1.5">{t('common.status')}</label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t('exports.allStatuses')}</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button type="button" icon={FileSpreadsheet} onClick={() => download('csv')} disabled={!!busy}>
            {busy === 'csv' ? t('common.loading') : t('exports.excel')}
          </Button>
          <Button type="button" variant="secondary" icon={FileText} onClick={() => download('pdf')} disabled={!!busy}>
            {busy === 'pdf' ? t('common.loading') : t('exports.pdf')}
          </Button>
        </div>
        <p className="text-xs text-ink-500 -mt-2">{t('exports.excelHint')}</p>
      </div>
    </Modal>
  );
}
