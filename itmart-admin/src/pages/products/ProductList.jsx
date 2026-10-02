import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, ImageOff, Copy } from 'lucide-react';
import * as productsApi from '../../api/products';
import * as categoriesApi from '../../api/categories';
import { API_ORIGIN } from '../../api/client';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Input, Select } from '../../components/ui/Field';
import { useToast } from '../../components/ui/Toast';

const formatFCFA = (amount) => `${Number(amount).toLocaleString('fr-FR')} FCFA`;

export default function ProductList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    productsApi
      .getProducts({ q: q || undefined, category: categoryFilter || undefined, limit: 50 })
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    categoriesApi.getCategories().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categoryFilter]);

  const handleDelete = async () => {
    try {
      await productsApi.deleteProduct(deleteTarget.id);
      showToast(t('common.delete') + ' ✓');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  const handleDuplicate = async (product) => {
    try {
      const res = await productsApi.duplicateProduct(product.id);
      showToast(t('products.duplicated'));
      navigate(`/products/${res.data.id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 min-w-0 sm:flex-none sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('common.search')}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-32 shrink-0 sm:w-44">
            <option value="">{t('common.category')}: All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.nameEn}
              </option>
            ))}
          </Select>
        </div>
        <Button icon={Plus} onClick={() => navigate('/products/new')} className="w-full sm:w-auto">
          {t('products.addProduct')}
        </Button>
      </div>

      {/* Phones: one card per product — tap to edit */}
      <div className="md:hidden bg-white rounded-xl border border-surface-border divide-y divide-surface-border">
        {products.map((p) => {
          const primaryImage = p.images?.find((i) => i.isPrimary) || p.images?.[0];
          return (
            <div key={p.id} className="flex items-center gap-3 px-3 py-3">
              <button
                type="button"
                onClick={() => navigate(`/products/${p.id}`)}
                className="flex items-center gap-3 min-w-0 flex-1 text-left"
              >
                {primaryImage ? (
                  <img
                    src={`${API_ORIGIN}${primaryImage.url}`}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover border border-surface-border"
                  />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-lg bg-surface border border-surface-border flex items-center justify-center text-ink-300">
                    <ImageOff size={18} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{p.nameEn}</p>
                  <p className="text-sm font-mono-data mt-0.5">
                    {p.discountPrice ? (
                      <>
                        <span className="text-danger-600 font-semibold">{formatFCFA(p.discountPrice)}</span>{' '}
                        <span className="text-ink-400 line-through text-xs">{formatFCFA(p.price)}</span>
                      </>
                    ) : (
                      <span className="text-ink-800">{formatFCFA(p.price)}</span>
                    )}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs">
                    <span className={p.stock === 0 ? 'text-danger-600 font-medium' : 'text-ink-500'}>
                      {t('common.stock')}: {p.stock}
                    </span>
                    {!p.isActive && <Badge tone="neutral">{t('products.inactive')}</Badge>}
                    {p.isBestSeller && <Badge tone="accent">{t('products.bestSeller')}</Badge>}
                  </div>
                </div>
              </button>
              <div className="flex flex-col gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Copy}
                  title={t('products.duplicate')}
                  aria-label={t('products.duplicate')}
                  onClick={() => handleDuplicate(p)}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Trash2}
                  className="text-danger-600 hover:bg-danger-100/50"
                  aria-label={t('common.delete')}
                  onClick={() => setDeleteTarget(p)}
                />
              </div>
            </div>
          );
        })}
        {loading && products.length === 0 && <p className="py-10 text-center text-ink-500">{t('common.loading')}</p>}
        {!loading && products.length === 0 && <p className="py-10 text-center text-ink-500">{t('common.noResults')}</p>}
      </div>

      {/* Tablets & desktop: table */}
      <Card padded={false} className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-500 border-b border-surface-border">
              <th className="px-5 py-2.5 font-medium">{t('products.title')}</th>
              <th className="px-5 py-2.5 font-medium">{t('common.sku')}</th>
              <th className="px-5 py-2.5 font-medium">{t('common.category')}</th>
              <th className="px-5 py-2.5 font-medium">{t('common.price')}</th>
              <th className="px-5 py-2.5 font-medium">{t('common.stock')}</th>
              <th className="px-5 py-2.5 font-medium">{t('common.status')}</th>
              <th className="px-5 py-2.5 font-medium text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const primaryImage = p.images?.find((i) => i.isPrimary) || p.images?.[0];
              return (
                <tr key={p.id} className="border-b border-surface-border last:border-0 hover:bg-surface">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {primaryImage ? (
                        <img
                          src={`${API_ORIGIN}${primaryImage.url}`}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover border border-surface-border"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-surface border border-surface-border flex items-center justify-center text-ink-300">
                          <ImageOff size={16} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-ink-900 truncate max-w-[220px]">{p.nameEn}</p>
                        {p.isBestSeller && (
                          <Badge tone="accent" className="mt-0.5">
                            {t('products.bestSeller')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono-data text-ink-600">{p.sku}</td>
                  <td className="px-5 py-3 text-ink-700">{p.category?.nameEn}</td>
                  <td className="px-5 py-3 font-mono-data">
                    {p.discountPrice ? (
                      <div>
                        <span className="text-ink-400 line-through mr-1.5">{formatFCFA(p.price)}</span>
                        <span className="text-danger-600 font-semibold">{formatFCFA(p.discountPrice)}</span>
                      </div>
                    ) : (
                      <span className="text-ink-800">{formatFCFA(p.price)}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={p.stock === 0 ? 'text-danger-600 font-medium' : 'text-ink-800'}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={p.isActive ? 'success' : 'neutral'}>
                      {p.isActive ? t('products.active') : t('products.inactive')}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" icon={Pencil} onClick={() => navigate(`/products/${p.id}`)} />
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Copy}
                        title={t('products.duplicate')}
                        onClick={() => handleDuplicate(p)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Trash2}
                        className="text-danger-600 hover:bg-danger-100/50"
                        onClick={() => setDeleteTarget(p)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-ink-500">
                  {t('common.noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
