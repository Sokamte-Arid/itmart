import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Download } from 'lucide-react';
import * as ordersApi from '../../api/orders';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Field';
import OrderDetailModal from './OrderDetailModal';
import { useToast } from '../../components/ui/Toast';

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

  const load = () => {
    setLoading(true);
    ordersApi
      .getOrders({ status: statusFilter || undefined, limit: 50 })
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

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
      <div className="flex items-center justify-between mb-5">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-52">
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

      <Card padded={false}>
        <div className="overflow-x-auto">
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
                <td className="px-5 py-3 font-mono-data text-ink-800">{order.reference}</td>
                <td className="px-5 py-3 text-ink-800">{order.customerName}</td>
                <td className="px-5 py-3 text-ink-700 max-w-[220px] truncate" title={itemsSummary(order.items)}>
                  {itemsSummary(order.items)}
                </td>
                <td className="px-5 py-3 text-ink-700">{order.city}</td>
                <td className="px-5 py-3 font-mono-data text-ink-800">{formatFCFA(order.total)}</td>
                <td className="px-5 py-3 text-ink-500">{formatDate(order.createdAt)}</td>
                <td className="px-5 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                    disabled={updatingId === order.id}
                    className={`text-xs font-medium rounded-full pl-2.5 pr-6 py-1 border-0 cursor-pointer disabled:opacity-50 ${
                      {
                        PENDING: 'bg-warning-100 text-warning-600',
                        CONTACTED: 'bg-info-100 text-info-600',
                        CONFIRMED: 'bg-accent-100 text-accent-600',
                        SHIPPED: 'bg-info-100 text-info-600',
                        DELIVERED: 'bg-success-100 text-success-600',
                        CANCELLED: 'bg-danger-100 text-danger-600',
                      }[order.status]
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
        </div>
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
