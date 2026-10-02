import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as ordersApi from '../../api/orders';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Field';
import { useToast } from '../../components/ui/Toast';
import { Download, Phone, MessageCircle } from 'lucide-react';
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
const formatDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function OrderDetailModal({ order, onClose, onUpdated }) {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const [status, setStatus] = useState(order?.status || 'PENDING');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState(order?.invoiceNumber || null);

  useEffect(() => {
    setStatus(order?.status || 'PENDING');
    setInvoiceNumber(order?.invoiceNumber || null);
  }, [order]);

  if (!order) return null;

  const statusKey = (s) => `orders.status${s.charAt(0) + s.slice(1).toLowerCase()}`;

  // Not confirmed yet → proforma. Confirmed/shipped/delivered (or already
  // invoiced) → invoice. Cancelled and never invoiced → no document.
  const docType = invoiceNumber
    ? 'invoice'
    : ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(status)
      ? 'invoice'
      : ['PENDING', 'CONTACTED'].includes(status)
        ? 'proforma'
        : null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await ordersApi.downloadInvoice(order.id, i18n.language === 'en' ? 'en' : 'fr');
      if (res.type === 'invoice' && res.number && res.number !== invoiceNumber) {
        setInvoiceNumber(res.number);
        onUpdated?.();
      }
    } catch (err) {
      showToast(err.response?.data?.message || t('orders.invoiceFailed'), 'error');
    } finally {
      setDownloading(false);
    }
  };

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
          <div className="flex items-center gap-2 min-w-0">
            <Badge tone={statusTone[status]}>{t(statusKey(status))}</Badge>
            {invoiceNumber && (
              <span className="text-xs font-mono-data text-ink-600 truncate" title={t('orders.invoiceNumber')}>
                {invoiceNumber}
              </span>
            )}
          </div>
          <span className="text-xs text-ink-500 shrink-0">{formatDate(order.createdAt)}</span>
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
          <div className="grid grid-cols-2 gap-2 mt-2">
            <a
              href={telHref(order.phone)}
              className="flex items-center justify-center gap-2 rounded-lg border border-surface-border py-2.5 text-sm font-medium text-ink-800 hover:bg-surface"
            >
              <Phone size={16} /> {t('orders.call')}
            </a>
            <a
              href={whatsappHref(order.phone, `${order.reference} — `)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-success-100 text-success-600 py-2.5 text-sm font-medium hover:brightness-95"
            >
              <MessageCircle size={16} /> {t('orders.whatsapp')}
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">{t('orders.items')}</h4>
          <div className="border border-surface-border rounded-lg divide-y divide-surface-border">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
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
          {docType ? (
            <Button variant="secondary" icon={Download} onClick={handleDownload} disabled={downloading || saving}>
              {downloading
                ? t('common.loading')
                : docType === 'proforma'
                  ? t('orders.downloadProforma')
                  : t('orders.downloadInvoice')}
            </Button>
          ) : (
            <span />
          )}
          <Button variant="secondary" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
