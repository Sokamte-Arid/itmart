import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Field, Input, Select } from '../../components/ui/Field';
import * as categoriesApi from '../../api/categories';
import { API_ORIGIN } from '../../api/client';
import { useToast } from '../../components/ui/Toast';

const emptyForm = { nameEn: '', nameFr: '', parentId: '' };

export default function CategoryFormModal({ open, onClose, category, categories, onSaved }) {
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
        category
          ? { nameEn: category.nameEn, nameFr: category.nameFr, parentId: category.parentId || '' }
          : emptyForm
      );
      setImageFile(null);
      setPreview(category?.image ? `${API_ORIGIN}${category.image}` : null);
    }
  }, [open, category]);

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
      const payload = { ...form, parentId: form.parentId || null };
      if (category) {
        await categoriesApi.updateCategory(category.id, payload);
        if (imageFile) await categoriesApi.updateCategoryImage(category.id, imageFile);
      } else {
        await categoriesApi.createCategory(payload, imageFile);
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
    <Modal
      open={open}
      onClose={onClose}
      title={category ? t('categories.editCategory') : t('categories.addCategory')}
    >
      <form onSubmit={handleSubmit}>
        <Field label={t('common.image')} hint={t('categories.imageHint')}>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative aspect-video rounded-lg border-2 border-dashed border-surface-border hover:border-accent-500 cursor-pointer overflow-hidden bg-surface flex items-center justify-center"
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

        <Field label={t('common.nameEn')} required>
          <Input
            required
            value={form.nameEn}
            onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
          />
        </Field>
        <Field label={t('common.nameFr')} required>
          <Input
            required
            value={form.nameFr}
            onChange={(e) => setForm({ ...form, nameFr: e.target.value })}
          />
        </Field>
        <Field label="Parent category">
          <Select
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
          >
            <option value="">— None (top-level) —</option>
            {categories
              ?.filter((c) => c.id !== category?.id)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameEn}
                </option>
              ))}
          </Select>
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
