import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Phone, Link2, EyeOff, Undo2, Trash2, ShoppingCart, Clock } from 'lucide-react';
import * as cartsApi from '../../api/abandonedCarts';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { telHref, whatsappHref } from '../../utils/contact';
import { shopHost } from '../../components/seo/seoUtils';

const FILTERS = ['OPEN', 'CONTACTED', 'RECOVERED', 'DISMISSED'];
const formatFCFA = (amount) => `${Number(amount).toLocaleString('fr-FR')} FCFA`;
// Still typing? A cart touched in the last hour may not be "abandoned" yet
const RECENT_MS = 60 * 60 * 1000;

function timeAgo(date, t) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 60) return t('abandoned.minutesAgo', { count: minutes });
  const hours = Math.round(minutes / 60);
  if (hours < 48) return t('abandoned.hoursAgo', { count: hours });
  return t('abandoned.daysAgo', { count: Math.round(hours / 24) });
}

const restoreLink = (cart) => `https://${shopHost()}/cart?restore=${cart.token}`;

// Ready-made WhatsApp message, in the customer's language
function followUpMessage(cart) {
  const items = (cart.items || [])
    .map((i) => `• ${cart.lang === 'en' ? i.nameEn : i.nameFr}${i.variantLabel ? ` (${i.variantLabel})` : ''} ×${i.quantity}`)
    .join('\n');
  const name = cart.customerName ? ` ${cart.customerName.split(' ')[0]}` : '';
  if (cart.lang === 'en') {
    return `Hello${name}, this is IT Mart 👋\nYou left these items in your cart:\n${items}\nTotal: ${formatFCFA(cart.total)}\n\nYou can complete your order here: ${restoreLink(cart)}\nAny question? We're happy to help.`;
  }
  return `Bonjour${name}, c'est IT Mart 👋\nVous avez laissé ces articles dans votre panier :\n${items}\nTotal : ${formatFCFA(cart.total)}\n\nVous pouvez finaliser votre commande ici : ${restoreLink(cart)}\nUne question ? Nous sommes là pour vous aider.`;
}

// Commandes → Paniers abandonnés
export default function AbandonedCarts() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [filter, setFilter] = useState('OPEN');
  const [carts, setCarts] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    cartsApi
      .getAbandonedCarts(filter)
      .then((res) => {
        setCarts(res.data);
        setCounts(res.counts || {});
      })
      .catch(() => showToast(t('abandoned.loadError'), 'error'))
      .finally(() => setLoading(false));
  }, [filter, showToast, t]);

  useEffect(load, [load]);

  const setStatus = async (cart, status, { quiet = false } = {}) => {
    try {
      await cartsApi.updateAbandonedCart(cart.id, status);
      if (!quiet) showToast(t(`abandoned.toast_${status}`));
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  const handleWhatsApp = (cart) => {
    window.open(whatsappHref(cart.phone, followUpMessage(cart)), '_blank', 'noopener,noreferrer');
    if (cart.status === 'OPEN') setStatus(cart, 'CONTACTED', { quiet: true });
  };

  const handleCopy = async (cart) => {
    try {
      await navigator.clipboard.writeText(restoreLink(cart));
      showToast(t('abandoned.linkCopied'));
    } catch {
      window.prompt(t('abandoned.copyLink'), restoreLink(cart));
    }
  };

  const handleDelete = async () => {
    const cart = toDelete;
    setToDelete(null);
    try {
      await cartsApi.deleteAbandonedCart(cart.id);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  return (
    <div>
      <p className="text-sm text-ink-500 mb-4">{t('abandoned.intro')}</p>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 [scrollbar-width:none]">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f
                ? 'bg-ink-900 text-white border-ink-900'
                : 'bg-white text-ink-700 border-surface-border hover:border-ink-300'
            }`}
          >
            {t(`abandoned.filter_${f}`)} <span className="opacity-70">({counts[f] ?? 0})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-ink-500 text-sm">{t('common.loading')}</p>
      ) : carts.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-border p-10 text-center">
          <ShoppingCart size={32} className="mx-auto text-ink-300 mb-2" />
          <p className="text-sm text-ink-500">{t(`abandoned.empty_${filter}`)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {carts.map((cart) => {
            const recent = Date.now() - new Date(cart.updatedAt).getTime() < RECENT_MS && cart.status === 'OPEN';
            return (
              <div key={cart.id} className="bg-white rounded-xl border border-surface-border flex flex-col">
                <div className="px-4 pt-3.5 pb-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-900 truncate">
                        {cart.customerName || t('abandoned.noName')}
                      </p>
                      <p className="text-sm text-ink-600 truncate">
                        {cart.phone}
                        {cart.city && <span className="text-ink-400"> · {cart.city}</span>}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-ink-500 flex items-center gap-1 justify-end">
                        <Clock size={12} /> {timeAgo(cart.updatedAt, t)}
                      </p>
                      {recent && (
                        <Badge tone="info" className="mt-1">
                          {t('abandoned.stillOnSite')}
                        </Badge>
                      )}
                      {cart.status === 'CONTACTED' && (
                        <Badge tone="warning" className="mt-1">
                          {t('abandoned.contacted')}
                        </Badge>
                      )}
                      {cart.status === 'RECOVERED' && (
                        <Badge tone="success" className="mt-1">
                          {t('abandoned.recovered')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <ul className="mt-3 space-y-1.5">
                    {(cart.items || []).map((item) => (
                      <li key={`${item.productId}:${item.variantId || ''}`} className="flex items-center gap-2.5 text-sm">
                        <span className="text-ink-800 min-w-0 flex-1 truncate">
                          {item.nameFr}
                          {item.variantLabel && <span className="text-ink-500"> · {item.variantLabel}</span>}
                        </span>
                        <span className="text-ink-500 shrink-0">×{item.quantity}</span>
                        <span className="font-mono-data text-ink-900 shrink-0 w-28 text-right">
                          {formatFCFA(item.unitPrice * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-surface-border">
                    <span className="text-sm text-ink-600">{t('abandoned.total')}</span>
                    <span className="font-mono-data font-semibold text-ink-900">{formatFCFA(cart.total)}</span>
                  </div>
                  {cart.status === 'RECOVERED' && cart.orderId && (
                    <Link to={`/orders?open=${cart.orderId}`} className="mt-2 inline-block text-sm text-accent-600 hover:underline">
                      {t('abandoned.seeOrder', { reference: cart.orderReference })}
                    </Link>
                  )}
                </div>

                {cart.status !== 'RECOVERED' && (
                  <div className="flex flex-wrap items-center gap-1.5 px-4 py-2.5 border-t border-surface-border">
                    <button
                      type="button"
                      onClick={() => handleWhatsApp(cart)}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-success-100 text-success-600 text-sm font-medium hover:bg-success-600 hover:text-white transition-colors"
                    >
                      <MessageCircle size={16} /> {t('abandoned.followUp')}
                    </button>
                    <a
                      href={telHref(cart.phone)}
                      className="h-9 w-9 rounded-full bg-surface text-ink-700 flex items-center justify-center"
                      aria-label={t('orders.call')}
                      title={t('orders.call')}
                    >
                      <Phone size={16} />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(cart)}
                      className="h-9 w-9 rounded-full bg-surface text-ink-700 flex items-center justify-center"
                      aria-label={t('abandoned.copyLink')}
                      title={t('abandoned.copyLink')}
                    >
                      <Link2 size={16} />
                    </button>
                    <div className="ml-auto flex gap-1.5">
                      {cart.status === 'DISMISSED' ? (
                        <button
                          type="button"
                          onClick={() => setStatus(cart, 'OPEN')}
                          className="h-9 w-9 rounded-full bg-surface text-ink-700 flex items-center justify-center"
                          aria-label={t('abandoned.restore')}
                          title={t('abandoned.restore')}
                        >
                          <Undo2 size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setStatus(cart, 'DISMISSED')}
                          className="h-9 w-9 rounded-full bg-surface text-ink-700 flex items-center justify-center"
                          aria-label={t('abandoned.dismiss')}
                          title={t('abandoned.dismiss')}
                        >
                          <EyeOff size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setToDelete(cart)}
                        className="h-9 w-9 rounded-full bg-surface text-danger-600 flex items-center justify-center"
                        aria-label={t('common.delete')}
                        title={t('common.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title={t('abandoned.deleteTitle')}
        body={t('abandoned.deleteMessage')}
      />
    </div>
  );
}
