import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Tags } from 'lucide-react';
import * as brandsApi from '../../api/brands';
import { API_ORIGIN } from '../../api/client';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import BrandFormModal from './BrandFormModal';
import { useToast } from '../../components/ui/Toast';

export default function BrandList() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    brandsApi
      .getBrands()
      .then((res) => setBrands(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    try {
      await brandsApi.deleteBrand(deleteTarget.id);
      showToast(t('common.delete') + ' ✓');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div />
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          {t('brands.addBrand')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <Card key={brand.id} className="flex items-center gap-3">
            {brand.logo ? (
              <img
                src={`${API_ORIGIN}${brand.logo}`}
                alt=""
                className="h-10 w-10 rounded-lg object-contain border border-surface-border"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-surface border border-surface-border flex items-center justify-center text-ink-300">
                <Tags size={16} />
              </div>
            )}
            <span className="flex-1 font-medium text-ink-900 truncate">{brand.name}</span>
            <Button
              size="sm"
              variant="ghost"
              icon={Pencil}
              onClick={() => {
                setEditing(brand);
                setFormOpen(true);
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              icon={Trash2}
              className="text-danger-600 hover:bg-danger-100/50"
              onClick={() => setDeleteTarget(brand)}
            />
          </Card>
        ))}
        {!loading && brands.length === 0 && (
          <p className="col-span-full text-center text-ink-500 py-10">{t('common.noResults')}</p>
        )}
      </div>

      <BrandFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        brand={editing}
        onSaved={() => {
          setFormOpen(false);
          load();
        }}
      />

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
