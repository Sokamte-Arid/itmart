import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import * as bannersApi from '../../api/banners';
import { API_ORIGIN } from '../../api/client';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import BannerFormModal from './BannerFormModal';
import { useToast } from '../../components/ui/Toast';

const PLACEMENTS = ['HERO', 'DEALS', 'PROMO'];

export default function BannerList() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    bannersApi
      .getAllBanners()
      .then((res) => setBanners(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleActive = async (banner) => {
    try {
      await bannersApi.updateBanner(banner.id, { isActive: !banner.isActive });
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await bannersApi.deleteBanner(deleteTarget.id);
      showToast(t('common.delete') + ' ✓');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  const placementLabel = (p) =>
    ({ HERO: t('banners.placementHero'), DEALS: t('banners.placementDeals'), PROMO: t('banners.placementPromo') }[p]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-ink-500 max-w-lg">{t('banners.hint')}</p>
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          {t('banners.addBanner')}
        </Button>
      </div>

      {PLACEMENTS.map((placement) => {
        const group = banners.filter((b) => (b.placement || 'HERO') === placement);
        if (group.length === 0) return null;
        return (
          <div key={placement} className="mb-8">
            <h2 className="text-sm font-semibold text-ink-700 mb-3">{placementLabel(placement)}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {group.map((banner) => (
                <Card key={banner.id} padded={false} className="overflow-hidden">
                  <div className="relative aspect-[21/9] bg-surface">
                    {banner.image ? (
                      <img src={`${API_ORIGIN}${banner.image}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-300">
                        <ImageIcon size={24} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge tone={banner.isActive ? 'success' : 'neutral'}>
                        {banner.isActive ? t('products.active') : t('products.inactive')}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">
                        {banner.titleEn || <span className="text-ink-400 italic">{t('banners.noTitle')}</span>}
                      </p>
                      <p className="text-xs text-ink-500 truncate">{banner.titleFr}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={banner.isActive ? EyeOff : Eye}
                        onClick={() => toggleActive(banner)}
                        title={banner.isActive ? t('banners.deactivate') : t('banners.activate')}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Pencil}
                        onClick={() => {
                          setEditing(banner);
                          setFormOpen(true);
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Trash2}
                        className="text-danger-600 hover:bg-danger-100/50"
                        onClick={() => setDeleteTarget(banner)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {!loading && banners.length === 0 && <p className="text-center text-ink-500 py-10">{t('common.noResults')}</p>}

      <BannerFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        banner={editing}
        onSaved={() => {
          setFormOpen(false);
          load();
        }}
      />

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
