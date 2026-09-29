import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Field, Input } from '../../components/ui/Field';
import * as brandsApi from '../../api/brands';
import { API_ORIGIN } from '../../api/client';
import { useToast } from '../../components/ui/Toast';

export default function BrandFormModal({ open, onClose, brand, onSaved }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setName(brand?.name || '');
      setImageFile(null);
      setPreview(brand?.logo ? `${API_ORIGIN}${brand.logo}` : null);
    }
  }, [open, brand]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (brand) {
        await brandsApi.updateBrand(brand.id, name);
        if (imageFile) await brandsApi.updateBrandLogo(brand.id, imageFile);
      } else {
        await brandsApi.createBrand(name, imageFile);
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
    <Modal open={open} onClose={onClose} title={brand ? t('common.edit') : t('brands.addBrand')}>
      <form onSubmit={handleSubmit}>
        <Field label={t('brands.logo')} hint={t('brands.logoHint')}>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative h-24 w-24 mx-auto rounded-lg border-2 border-dashed border-surface-border hover:border-accent-500 cursor-pointer overflow-hidden bg-surface flex items-center justify-center"
          >
            {preview ? (
              <img src={preview} alt="" className="w-full h-full object-contain" />
            ) : (
              <Upload size={18} className="text-ink-400" />
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </Field>

        <Field label={t('common.name')} required>
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
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
