import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Clock, Wallet, Package, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppSetupBanner from '../components/pwa/AppSetupBanner';
import { getOrderStats, getOrders } from '../api/orders';
import { getLowStockProducts } from '../api/products';
import { API_ORIGIN } from '../api/client';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const statusTone = {
  PENDING: 'warning',
  CONTACTED: 'info',
  CONFIRMED: 'accent',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

const formatFCFA = (amount) => `${Number(amount).toLocaleString('fr-FR')} FCFA`;

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrderStats(), getOrders({ limit: 5 }), getLowStockProducts()])
      .then(([statsRes, ordersRes, lowStockRes]) => {
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data);
        setLowStock(lowStockRes.data);
        setLowStockThreshold(lowStockRes.meta?.threshold ?? 5);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <AppSetupBanner />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          label={t('dashboard.totalOrders')}
          value={loading ? '—' : stats?.totalOrders ?? 0}
          icon={ShoppingBag}
        />
        <StatCard
          label={t('dashboard.pendingOrders')}
          value={loading ? '—' : stats?.pendingOrders ?? 0}
          icon={Clock}
          accent
        />
        <StatCard
          label={t('dashboard.totalRevenue')}
          value={loading ? '—' : formatFCFA(stats?.totalRevenue ?? 0)}
          icon={Wallet}
        />
        <StatCard
          label={t('dashboard.totalProducts')}
          value={loading ? '—' : stats?.totalProducts ?? 0}
          icon={Package}
        />
      </div>

      {!loading && lowStock.length > 0 && (
        <Card padded={false} className="mb-6 border-warning-600/30">
          <div className="px-5 py-4 border-b border-surface-border flex items-center gap-2">
            <AlertTriangle size={17} className="text-warning-600" />
            <h2 className="font-semibold text-ink-900">
              {t('dashboard.lowStock')} ({t('dashboard.lowStockThreshold', { count: lowStockThreshold })})
            </h2>
          </div>
          <div className="divide-y divide-surface-border">
            {lowStock.map((p) => {
              const img = p.images?.[0]?.url;
              return (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-surface transition-colors"
                >
                  {img ? (
                    <img
                      src={`${API_ORIGIN}${img}`}
                      alt=""
                      className="h-9 w-9 rounded-lg object-cover border border-surface-border"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-lg bg-surface border border-surface-border flex items-center justify-center text-ink-300">
                      <Package size={14} />
                    </div>
                  )}
                  <span className="flex-1 text-sm text-ink-800 truncate">{p.nameEn}</span>
                  <Badge tone={p.stock === 0 ? 'danger' : 'warning'}>
                    {p.stock === 0 ? t('dashboard.outOfStock') : `${p.stock} ${t('dashboard.left')}`}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </Card>
      )}

      <Card padded={false}>
        <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">{t('dashboard.recentOrders')}</h2>
          <Link to="/orders" className="text-sm text-accent-600 hover:underline font-medium">
            {t('orders.title')} →
          </Link>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-ink-500 border-b border-surface-border">
              <th className="px-5 py-2.5 font-medium">{t('orders.reference')}</th>
              <th className="px-5 py-2.5 font-medium">{t('orders.customer')}</th>
              <th className="px-5 py-2.5 font-medium">{t('orders.items')}</th>
              <th className="px-5 py-2.5 font-medium">{t('orders.total')}</th>
              <th className="px-5 py-2.5 font-medium">{t('common.status')}</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-surface-border last:border-0 hover:bg-surface">
                <td className="px-5 py-3 font-mono-data text-ink-800">{order.reference}</td>
                <td className="px-5 py-3 text-ink-800">{order.customerName}</td>
                <td className="px-5 py-3 text-ink-700 max-w-[200px] truncate">
                  {order.items?.length
                    ? order.items
                        .slice(0, 2)
                        .map((i) => `${i.product?.nameEn || i.product?.nameFr || '—'} ×${i.quantity}`)
                        .join(', ') + (order.items.length > 2 ? ` +${order.items.length - 2} more` : '')
                    : '—'}
                </td>
                <td className="px-5 py-3 font-mono-data text-ink-800">{formatFCFA(order.total)}</td>
                <td className="px-5 py-3">
                  <Badge tone={statusTone[order.status]}>
                    {t(`orders.status${order.status.charAt(0) + order.status.slice(1).toLowerCase()}`)}
                  </Badge>
                </td>
              </tr>
            ))}
            {!loading && recentOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink-500">
                  {t('common.noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}
