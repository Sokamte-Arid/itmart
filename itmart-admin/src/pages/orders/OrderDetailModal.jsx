import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import * as ordersApi from '../../api/orders';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Field';
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
const formatDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function OrderDetailModal({ order, onClose, onUpdated }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [status, setStatus] = useState(order?.status || 'PENDING');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus(order?.status || 'PENDING');
  }, [order]);

  if (!order) return null;

  const statusKey = (s) => `orders.status${s.charAt(0) + s.slice(1).toLowerCase()}`;

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    setSaving(true);
    try {
      await ordersApi.updateOrderStatus(order.id, newStatus);
      showToast(t('common.saveChanges') + ' ✓');
      onUpdated();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
      setStatus(order.status);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={!!order} onClose={onClose} title={`${t('orders.orderDetails')} — ${order.reference}`} width="max-w-xl">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Badge tone={statusTone[status]}>{t(statusKey(status))}</Badge>
          <span className="text-xs text-ink-500">{formatDate(order.createdAt)}</span>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">
            {t('orders.customerInfo')}
          </h4>
          <div className="bg-surface rounded-lg p-3 text-sm space-y-1">
            <p className="text-ink-900 font-medium">{order.customerName}</p>
            <p className="text-ink-700 font-mono-data">{order.phone}</p>
            {order.email && <p className="text-ink-700">{order.email}</p>}
            <p className="text-ink-700">
              {order.address}, {order.city}
            </p>
            {order.notes && <p className="text-ink-500 italic mt-1">{t('orders.notes')}: {order.notes}</p>}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">{t('orders.items')}</h4>
          <div className="border border-surface-border rounded-lg divide-y divide-surface-border">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="text-ink-900 truncate">{item.product?.nameEn || item.product?.nameFr}</p>
                  <p className="text-ink-500 text-xs">
                    {item.quantity} × {formatFCFA(item.unitPrice)}
                  </p>
                </div>
                <p className="font-mono-data text-ink-800 shrink-0">
                  {formatFCFA(Number(item.unitPrice) * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center px-1 pt-3 text-sm font-semibold text-ink-900">
            <span>{t('orders.total')}</span>
            <span className="font-mono-data">{formatFCFA(order.total)}</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">
            {t('orders.updateStatus')}
          </h4>
          <Select value={status} onChange={(e) => handleStatusChange(e.target.value)} disabled={saving}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(statusKey(s))}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex justify-between items-center gap-2">
          <Button variant="secondary" icon={Download} onClick={() => ordersApi.downloadInvoice(order.id, order.reference)}>
            {t('orders.downloadInvoice')}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
