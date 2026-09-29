import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Field, Input, Textarea, Select } from '../../components/ui/Field';
import * as bannersApi from '../../api/banners';
import { API_ORIGIN } from '../../api/client';
import { useToast } from '../../components/ui/Toast';

const emptyForm = {
  placement: 'HERO',
  titleEn: '',
  titleFr: '',
  subtitleEn: '',
  subtitleFr: '',
  ctaTextEn: '',
  ctaTextFr: '',
  ctaLink: '',
  sortOrder: '0',
};

export default function BannerFormModal({ open, onClose, banner, onSaved }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(
        banner
          ? {
              placement: banner.placement || 'HERO',
              titleEn: banner.titleEn || '',
              titleFr: banner.titleFr || '',
              subtitleEn: banner.subtitleEn || '',
              subtitleFr: banner.subtitleFr || '',
              ctaTextEn: banner.ctaTextEn || '',
              ctaTextFr: banner.ctaTextFr || '',
              ctaLink: banner.ctaLink || '',
              sortOrder: String(banner.sortOrder ?? 0),
            }
          : emptyForm
      );
      setImageFile(null);
      setPreview(banner?.image ? `${API_ORIGIN}${banner.image}` : null);
    }
  }, [open, banner]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!banner && !imageFile) {
      showToast(t('banners.imageRequired'), 'error');
      return;
    }
    setSaving(true);
    try {
      if (banner) {
        await bannersApi.updateBanner(banner.id, form);
        if (imageFile) await bannersApi.updateBannerImage(banner.id, imageFile);
      } else {
        await bannersApi.createBanner(form, imageFile);
      }
      showToast(t('common.saveChanges') + ' ✓');
      onSaved();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={banner ? t('common.edit') : t('banners.addBanner')} width="max-w-2xl">
      <form onSubmit={handleSubmit}>
        <Field label={t('banners.placement')} required hint={t('banners.placementHint')}>
          <Select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })}>
            <option value="HERO">{t('banners.placementHero')}</option>
            <option value="DEALS">{t('banners.placementDeals')}</option>
            <option value="PROMO">{t('banners.placementPromo')}</option>
          </Select>
        </Field>

        <Field label={t('banners.image')} required={!banner} hint={t('banners.imageHint')}>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative aspect-[21/9] rounded-lg border-2 border-dashed border-surface-border hover:border-accent-500 cursor-pointer overflow-hidden bg-surface flex items-center justify-center"
          >
            {preview ? (
              <img src={preview} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-ink-400 text-sm gap-1">
                <Upload size={20} />
                {t('products.dragImages')}
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </Field>

        <div className="grid grid-cols-2 gap-x-4">
          <Field label={t('common.nameEn')} hint="Banner headline (optional)">
            <Input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
          </Field>
          <Field label={t('common.nameFr')}>
            <Input value={form.titleFr} onChange={(e) => setForm({ ...form, titleFr: e.target.value })} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-x-4">
          <Field label={t('banners.subtitleEn')}>
            <Textarea value={form.subtitleEn} onChange={(e) => setForm({ ...form, subtitleEn: e.target.value })} />
          </Field>
          <Field label={t('banners.subtitleFr')}>
            <Textarea value={form.subtitleFr} onChange={(e) => setForm({ ...form, subtitleFr: e.target.value })} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-x-4">
          <Field label={t('banners.ctaTextEn')} hint="e.g. Shop now">
            <Input value={form.ctaTextEn} onChange={(e) => setForm({ ...form, ctaTextEn: e.target.value })} />
          </Field>
          <Field label={t('banners.ctaTextFr')} hint="e.g. Voir les produits">
            <Input value={form.ctaTextFr} onChange={(e) => setForm({ ...form, ctaTextFr: e.target.value })} />
          </Field>
        </div>

        <Field label={t('banners.ctaLink')} hint="e.g. /products?category=laptops (leave blank to link to all products)">
          <Input value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} placeholder="/products" />
        </Field>

        <Field label={t('banners.sortOrder')} hint="Lower numbers show first when there are multiple banners">
          <Input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
        </Field>

        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
