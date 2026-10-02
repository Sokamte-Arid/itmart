import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, Download, Phone, MessageCircle, ChevronRight } from 'lucide-react';
import * as ordersApi from '../../api/orders';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Field';
import OrderDetailModal from './OrderDetailModal';
import { useToast } from '../../components/ui/Toast';
import { usePushMessages } from '../../pwa/pwa';
import { telHref, whatsappHref } from '../../utils/contact';

const statusTone = {
  PENDING: 'warning',
  CONTACTED: 'info',
  CONFIRMED: 'accent',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

const STATUSES = ['PENDING', 'CONTACTED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const formatFCFA = (amount) => `${Number(amount).toLocaleString('fr-FR')} FCFA`;
const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const statusClasses = {
  PENDING: 'bg-warning-100 text-warning-600',
  CONTACTED: 'bg-info-100 text-info-600',
  CONFIRMED: 'bg-accent-100 text-accent-600',
  SHIPPED: 'bg-info-100 text-info-600',
  DELIVERED: 'bg-success-100 text-success-600',
  CANCELLED: 'bg-danger-100 text-danger-600',
};

// Compact summary of what was ordered, e.g. "HP EliteBook 840 ×1, USB Cable ×2"
// with a "+N more" tail if there are many line items — keeps the table scannable.
function itemsSummary(items) {
  if (!items || items.length === 0) return '—';
  const shown = items.slice(0, 2).map((i) => `${i.product?.nameEn || i.product?.nameFr || '—'} ×${i.quantity}`);
  const extra = items.length - shown.length;
  return extra > 0 ? `${shown.join(', ')} +${extra} more` : shown.join(', ');
}

export default function OrderList() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const openId = searchParams.get('open');

  const load = useCallback(() => {
    setLoading(true);
    ordersApi
      .getOrders({ status: statusFilter || undefined, limit: 50 })
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(load, [load]);

  // Opened from a notification (/orders?open=<id>): show that order directly
  useEffect(() => {
    if (!openId) return;
    ordersApi
      .getOrderById(openId)
      .then((res) => setSelected(res.data))
      .catch(() => {})
      .finally(() => setSearchParams({}, { replace: true }));
  }, [openId, setSearchParams]);

  // A new order notification arrived while this page is open: refresh the list
  usePushMessages(
    useCallback(
      (payload) => {
        if (payload.tag?.startsWith('order-')) {
          load();
          showToast(t('orders.newOrderToast'));
        }
      },
      [load, showToast, t]
    )
  );

  const statusKey = (status) => `orders.status${status.charAt(0) + status.slice(1).toLowerCase()}`;

  const handleStatusChange = async (order, newStatus) => {
    setUpdatingId(order.id);
    // Optimistic UI update so the row reflects the change instantly
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));
    try {
      await ordersApi.updateOrderStatus(order.id, newStatus);
      showToast(t('common.saveChanges') + ' ✓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
      load(); // revert to the real state on failure
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await ordersApi.exportOrdersCsv(statusFilter || undefined);
    } catch (err) {
      showToast(t('orders.exportFailed'), 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex-1 min-w-0 sm:flex-none sm:w-52"
        >
          <option value="">{t('common.status')}: All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(statusKey(s))}
            </option>
          ))}
        </Select>
        <Button icon={Download} variant="secondary" onClick={handleExport} disabled={exporting}>
          {exporting ? t('common.loading') : t('orders.exportCsv')}
        </Button>
      </div>

      {/* Phones: one card per order */}
      <div className="md:hidden space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl border border-surface-border">
            <button
              type="button"
              onClick={() => setSelected(order)}
              className="w-full text-left px-4 pt-3.5 pb-3 flex items-start gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-data text-sm font-semibold text-ink-900">{order.reference}</span>
                  <span className="text-xs text-ink-500 shrink-0">{formatDate(order.createdAt)}</span>
                </div>
                <p className="text-sm text-ink-800 mt-1 truncate">
                  {order.customerName} · <span className="text-ink-500">{order.city}</span>
                </p>
                <p className="text-xs text-ink-500 mt-0.5 truncate">{itemsSummary(order.items)}</p>
                <p className="font-mono-data text-sm font-semibold text-ink-900 mt-1.5">{formatFCFA(order.total)}</p>
              </div>
              <ChevronRight size={18} className="text-ink-300 mt-6 shrink-0" />
            </button>
            <div className="flex items-center gap-2 px-4 py-2.5 border-t border-surface-border">
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order, e.target.value)}
                disabled={updatingId === order.id}
                aria-label={t('common.status')}
                className={`text-xs font-medium rounded-full pl-2.5 pr-6 py-1.5 border-0 disabled:opacity-50 ${statusClasses[order.status]}`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(statusKey(s))}
                  </option>
                ))}
              </select>
              <div className="ml-auto flex gap-1.5">
                <a
                  href={telHref(order.phone)}
                  className="h-9 w-9 rounded-full bg-surface text-ink-700 flex items-center justify-center"
                  aria-label={t('orders.call')}
                  title={t('orders.call')}
                >
                  <Phone size={16} />
                </a>
                <a
                  href={whatsappHref(order.phone)}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 w-9 rounded-full bg-success-100 text-success-600 flex items-center justify-center"
                  aria-label={t('orders.whatsapp')}
                  title={t('orders.whatsapp')}
                >
                  <MessageCircle size={16} />
                </a>
              </div>
            </div>
          </div>
        ))}
        {loading && orders.length === 0 && <p className="py-10 text-center text-ink-500">{t('common.loading')}</p>}
        {!loading && orders.length === 0 && (
          <p className="py-10 text-center text-ink-500 bg-white rounded-xl border border-surface-border">
            {t('common.noResults')}
          </p>
        )}
      </div>

      {/* Tablets & desktop: table */}
      <Card padded={false} className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-500 border-b border-surface-border">
              <th className="px-5 py-2.5 font-medium">{t('orders.reference')}</th>
              <th className="px-5 py-2.5 font-medium">{t('orders.customer')}</th>
              <th className="px-5 py-2.5 font-medium">{t('orders.items')}</th>
              <th className="px-5 py-2.5 font-medium">{t('orders.city')}</th>
              <th className="px-5 py-2.5 font-medium">{t('orders.total')}</th>
              <th className="px-5 py-2.5 font-medium">{t('orders.date')}</th>
              <th className="px-5 py-2.5 font-medium">{t('common.status')}</th>
              <th className="px-5 py-2.5 font-medium text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-surface-border last:border-0 hover:bg-surface">
                <td className="px-5 py-3 whitespace-nowrap font-mono-data text-ink-800">{order.reference}</td>
                <td className="px-5 py-3 text-ink-800">{order.customerName}</td>
                <td className="px-5 py-3 text-ink-700 max-w-[220px] truncate" title={itemsSummary(order.items)}>
                  {itemsSummary(order.items)}
                </td>
                <td className="px-5 py-3 text-ink-700">{order.city}</td>
                <td className="px-5 py-3 whitespace-nowrap font-mono-data text-ink-800">{formatFCFA(order.total)}</td>
                <td className="px-5 py-3 whitespace-nowrap text-ink-500">{formatDate(order.createdAt)}</td>
                <td className="px-5 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                    disabled={updatingId === order.id}
                    className={`text-xs font-medium rounded-full pl-2.5 pr-6 py-1 border-0 cursor-pointer disabled:opacity-50 ${
                      statusClasses[order.status]
                    }`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t(statusKey(s))}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3 text-right">
                  <Button size="sm" variant="ghost" icon={Eye} onClick={() => setSelected(order)} />
                </td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-ink-500">
                  {t('common.noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <OrderDetailModal
        order={selected}
        onClose={() => setSelected(null)}
        onUpdated={() => {
          load();
        }}
      />
    </div>
  );
}
