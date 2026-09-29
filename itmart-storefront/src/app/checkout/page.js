'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { submitOrder, getDeliveryZones } from '@/lib/clientApi';
import { formatFCFA } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';

const emptyForm = { customerName: '', phone: '', email: '', address: '', deliveryZoneId: '', notes: '' };

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();
  const { locale, t } = useLocale();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [stockConflicts, setStockConflicts] = useState(null);
  const [generalError, setGeneralError] = useState('');
  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(true);

  useEffect(() => {
    getDeliveryZones()
      .then(setZones)
      .finally(() => setZonesLoading(false));
  }, []);

  useEffect(() => {
    if (cart?.hydrated && cart.items.length === 0 && !submitting) {
      router.replace('/cart');
    }
  }, [cart?.hydrated, cart?.items?.length, submitting, router]);

  if (!cart?.hydrated || cart.items.length === 0) {
    return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center text-ink-500">{t.common.loading}</div>;
  }

  const selectedZone = zones.find((z) => z.id === form.deliveryZoneId);
  const deliveryFee = selectedZone ? Number(selectedZone.fee) : 0;
  const orderTotal = cart.subtotal + deliveryFee;

  const validate = () => {
    const next = {};
    if (!form.customerName.trim()) next.customerName = t.checkout.required;
    if (!form.phone.trim()) next.phone = t.checkout.required;
    if (!form.address.trim()) next.address = t.checkout.required;
    if (!form.deliveryZoneId) next.deliveryZoneId = t.checkout.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setStockConflicts(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        lang: locale,
        items: cart.items.map((i) => ({ productId: i.id, quantity: i.quantity })),
      };
      const res = await submitOrder(payload);

      // Stash the result for the confirmation page (whatsappLink can be long,
      // so pass it via sessionStorage rather than a URL query string)
      sessionStorage.setItem(
        'itmart_last_order',
        JSON.stringify({ reference: res.data.order.reference, whatsappLink: res.data.whatsappLink })
      );
      cart.clearCart();
      router.push('/order-confirmation');
    } catch (err) {
      if (err.status === 409 && err.details) {
        setStockConflicts(err.details);
      } else {
        setGeneralError(err.message);
      }
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3.5 py-2.5 rounded-lg border text-sm focus:ring-1 transition-colors ${
      errors[field]
        ? 'border-danger-600 focus:border-danger-600 focus:ring-danger-600'
        : 'border-surface-border focus:border-brand-500 focus:ring-brand-500'
    }`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-navy-900 mb-1">{t.checkout.title}</h1>
      <p className="text-sm text-ink-500 mb-8">{t.checkout.subtitle}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          {generalError && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-danger-100 text-danger-600 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {generalError}
            </div>
          )}

          {stockConflicts && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-danger-100 text-danger-600 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">
                  {locale === 'en' ? 'Insufficient stock:' : 'Stock insuffisant :'}
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  {stockConflicts.map((c) => (
                    <li key={c.productId}>
                      {locale === 'en'
                        ? `${c.nameEn} — the quantity requested isn't available. Please lower the quantity and try again.`
                        : `${c.nameFr} — la quantité demandée n'est pas disponible. Veuillez réduire la quantité et réessayer.`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">
              {t.checkout.customerName} <span className="text-danger-600">*</span>
            </label>
            <input
              className={inputClass('customerName')}
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
            {errors.customerName && <p className="text-xs text-danger-600 mt-1">{errors.customerName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-800 mb-1.5">
                {t.checkout.phone} <span className="text-danger-600">*</span>
              </label>
              <input
                type="tel"
                className={inputClass('phone')}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="6XX XXX XXX"
              />
              {errors.phone && <p className="text-xs text-danger-600 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-800 mb-1.5">{t.checkout.email}</label>
              <input
                type="email"
                className={inputClass('email')}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">
              {t.checkout.address} <span className="text-danger-600">*</span>
            </label>
            <input
              className={inputClass('address')}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder={t.checkout.addressPlaceholder}
            />
            {errors.address && <p className="text-xs text-danger-600 mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">
              {t.checkout.deliveryZone} <span className="text-danger-600">*</span>
            </label>
            <select
              className={inputClass('deliveryZoneId')}
              value={form.deliveryZoneId}
              onChange={(e) => setForm({ ...form, deliveryZoneId: e.target.value })}
              disabled={zonesLoading}
            >
              <option value="">
                {zonesLoading ? t.common.loading : t.checkout.selectDeliveryZone}
              </option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.city} — {formatFCFA(zone.fee)}
                </option>
              ))}
            </select>
            {errors.deliveryZoneId && <p className="text-xs text-danger-600 mt-1">{errors.deliveryZoneId}</p>}
            {!zonesLoading && zones.length === 0 && (
              <p className="text-xs text-ink-500 mt-1">{t.checkout.noZonesYet}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">{t.checkout.notes}</label>
            <textarea
              className={`${inputClass('notes')} min-h-[80px] resize-y`}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-whatsapp hover:bg-whatsapp-dark text-white font-semibold rounded-full py-3.5 transition-colors disabled:opacity-60"
          >
            {submitting ? t.common.loading : t.checkout.confirmButton}
          </button>
          <p className="text-xs text-ink-500 text-center">{t.checkout.confirmHint}</p>
        </form>

        <div className="bg-white rounded-xl border border-surface-border p-5 h-fit">
          <h2 className="text-sm font-semibold text-ink-900 mb-4">{t.checkout.orderSummary}</h2>
          <div className="space-y-3 mb-4">
            {cart.items.map((item) => {
              const name = locale === 'en' ? item.nameEn : item.nameFr;
              const unitPrice = item.discountPrice ?? item.price;
              return (
                <div key={item.id} className="flex justify-between text-sm gap-2">
                  <span className="text-ink-700 flex items-center gap-1.5 min-w-0">
                    <ShoppingBag size={13} className="shrink-0 text-ink-400" />
                    <span className="truncate">
                      {name} × {item.quantity}
                    </span>
                  </span>
                  <span className="text-ink-900 font-medium shrink-0">{formatFCFA(unitPrice * item.quantity)}</span>
                </div>
              );
            })}
          </div>
          <div className="space-y-1.5 pt-3 border-t border-surface-border">
            <div className="flex justify-between text-sm text-ink-600">
              <span>{t.checkout.subtotal}</span>
              <span>{formatFCFA(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-ink-600">
              <span>{t.checkout.deliveryFee}</span>
              <span>{selectedZone ? formatFCFA(deliveryFee) : '—'}</span>
            </div>
            <div className="flex justify-between pt-1.5 mt-1.5 border-t border-surface-border">
              <span className="text-sm font-semibold text-ink-900">{t.checkout.total}</span>
              <span className="text-lg font-bold text-brand-600">{formatFCFA(orderTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
