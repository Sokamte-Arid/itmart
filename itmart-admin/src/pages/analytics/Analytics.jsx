import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Package, Wallet, AlertCircle } from 'lucide-react';
import * as ordersApi from '../../api/orders';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import { Select } from '../../components/ui/Field';

const formatFCFA = (amount) => `${Number(amount).toLocaleString('fr-FR')} FCFA`;
const formatShortDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

export default function Analytics() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    ordersApi
      .getSalesAnalytics(days)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [days]);

  const chartData = data?.revenueByDay.map((d) => ({ ...d, label: formatShortDate(d.date) })) || [];
  const maxRevenue = data?.topProducts[0]?.revenue || 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div />
        <Select value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-44">
          <option value={7}>{t('analytics.last7Days')}</option>
          <option value={30}>{t('analytics.last30Days')}</option>
          <option value={90}>{t('analytics.last90Days')}</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
        <StatCard
          label={t('analytics.periodRevenue')}
          value={loading ? '—' : formatFCFA(data?.totalRevenue ?? 0)}
          icon={TrendingUp}
          accent
        />
        <StatCard
          label={t('analytics.periodProfit')}
          value={loading ? '—' : formatFCFA(data?.totalProfit ?? 0)}
          icon={Wallet}
        />
        <StatCard
          label={t('analytics.periodOrders')}
          value={loading ? '—' : data?.totalOrders ?? 0}
          icon={Package}
        />
      </div>

      {!loading && data?.hasIncompleteCostData && (
        <div className="flex items-center gap-2 text-xs text-warning-600 bg-warning-100 rounded-lg px-3 py-2 mb-6">
          <AlertCircle size={14} className="shrink-0" />
          {t('analytics.incompleteCostData')}
        </div>
      )}

      <Card className="mb-6">
        <h2 className="font-semibold text-ink-900 mb-4">{t('analytics.revenueTrend')}</h2>
        <div className="h-64">
          {!loading && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e8ee" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7394' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#6b7394' }} width={40} />
                <Tooltip
                  formatter={(value) => formatFCFA(value)}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e6e8ee' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-ink-500 text-sm">
              {loading ? t('common.loading') : t('common.noResults')}
            </div>
          )}
        </div>
      </Card>

      <Card padded={false}>
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="font-semibold text-ink-900">{t('analytics.topProducts')}</h2>
        </div>
        <div className="p-5 space-y-3">
          {!loading && data?.topProducts.length === 0 && (
            <p className="text-center text-ink-500 py-6">{t('common.noResults')}</p>
          )}
          {data?.topProducts.map((p) => (
            <div key={p.productId} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink-800 truncate">{p.nameEn}</span>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className="font-mono-data text-ink-900 font-medium">{formatFCFA(p.revenue)}</span>
                    {p.hasCostData ? (
                      <span className="font-mono-data text-success-600 text-xs">
                        +{formatFCFA(p.profit)} {t('analytics.profit')}
                      </span>
                    ) : (
                      <span className="text-ink-400 text-xs">{t('analytics.noCostSet')}</span>
                    )}
                  </div>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-500 rounded-full"
                    style={{ width: `${Math.max(4, (p.revenue / maxRevenue) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
