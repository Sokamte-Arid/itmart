'use client';

import { useState } from 'react';
import { Search, Package, AlertCircle } from 'lucide-react';
import { trackOrder } from '@/lib/clientApi';
import { formatFCFA } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';

const statusLabels = {
  fr: {
    PENDING: 'En attente',
    CONTACTED: 'Contacté',
    CONFIRMED: 'Confirmé',
    SHIPPED: 'Expédié',
    DELIVERED: 'Livré',
    CANCELLED: 'Annulé',
  },
  en: {
    PENDING: 'Pending',
    CONTACTED: 'Contacted',
    CONFIRMED: 'Confirmed',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  },
};

export default function TrackOrderPage() {
  const { locale, t } = useLocale();
  const [reference, setReference] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reference.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const data = await trackOrder(reference.trim());
      setOrder(data);
    } catch (err) {
      setError(locale === 'en' ? 'No order found with that reference.' : 'Aucune commande trouvée avec cette référence.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-navy-900 mb-2">{t.nav.track}</h1>
      <p className="text-sm text-ink-500 mb-6">
        {locale === 'en' ? 'Enter your order reference (e.g. ORD-123456).' : 'Entrez la référence de votre commande (ex : ORD-123456).'}
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="ORD-123456"
          className="flex-1 px-4 py-2.5 rounded-lg border border-surface-border text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-mono"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          <Search size={16} />
          {locale === 'en' ? 'Track' : 'Suivre'}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-danger-100 text-danger-600 text-sm mb-6">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {order && (
        <div className="bg-white rounded-xl border border-surface-border p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-sm text-ink-700">{order.reference}</span>
            <span className="px-2.5 py-1 rounded-full bg-brand-100 text-brand-600 text-xs font-semibold">
              {statusLabels[locale][order.status]}
            </span>
          </div>
          <div className="space-y-2 mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5 text-ink-700">
                  <Package size={13} className="text-ink-400" />
                  {locale === 'en' ? item.product?.nameEn : item.product?.nameFr} × {item.quantity}
                </span>
                <span className="text-ink-900 font-medium">
                  {formatFCFA(Number(item.unitPrice) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-3 border-t border-surface-border">
            <span className="text-sm font-semibold text-ink-900">{t.checkout.total}</span>
            <span className="text-lg font-bold text-brand-600">{formatFCFA(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
