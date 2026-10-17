import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Field, Input, Select, Textarea } from '../../components/ui/Field';
import GooglePreview from '../../components/seo/GooglePreview';
import { SEO_TITLE, SEO_DESC, lengthTone } from '../../components/seo/seoUtils';
import * as categoriesApi from '../../api/categories';
import { API_ORIGIN } from '../../api/client';
import { useToast } from '../../components/ui/Toast';
import { flattenTree, subtreeIds, findInTree, indentedLabel, MAX_DEPTH } from '../../utils/categoryTree';

const emptyForm = { nameEn: '', nameFr: '', parentId: '', seoTitle: '', seoDescription: '' };

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
          ? {
              nameEn: category.nameEn,
              nameFr: category.nameFr,
              parentId: category.parentId || '',
              seoTitle: category.seoTitle || '',
              seoDescription: category.seoDescription || '',
            }
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
        <Field label={t('categories.parent')} hint={t('categories.parentHint', { max: MAX_DEPTH })}>
          <Select
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
          >
            <option value="">{t('categories.noParent')}</option>
            {(() => {
              // Any category at any level can be the parent, except this
              // category itself and its own subcategories (that would be a loop)
              const editingNode = category ? findInTree(categories, category.id) : null;
              const excluded = subtreeIds(editingNode);
              return flattenTree(categories)
                .filter((c) => !excluded.has(c.id) && c.depth < MAX_DEPTH - 1)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {indentedLabel(c)}
                  </option>
                ));
            })()}
          </Select>
        </Field>
        {/* Référencement (Google) — optional, folded away */}
        <details className="mt-2 rounded-lg border border-surface-border px-3 py-2 group">
          <summary className="cursor-pointer text-sm font-medium text-ink-800 select-none">
            {t('seo.categoryTitle')}
          </summary>
          <div className="pt-3">
            <p className="text-xs text-ink-500 mb-3">{t('seo.categoryIntro')}</p>
            <Field
              label={t('seo.title')}
              hint={`${t('seo.titleHint')} ${(form.seoTitle || form.nameFr).length}/${SEO_TITLE.max}`}
            >
              <Input
                value={form.seoTitle}
                maxLength={SEO_TITLE.hard}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                placeholder={form.nameFr}
              />
            </Field>
            <Field
              label={t('seo.description')}
              hint={`${t('seo.descriptionHint')} ${form.seoDescription.length}/${SEO_DESC.max}`}
              error={
                form.seoDescription && lengthTone(form.seoDescription.length, SEO_DESC) === 'danger'
                  ? t('seo.descriptionTooShortOrLong', { min: SEO_DESC.min, max: SEO_DESC.max })
                  : undefined
              }
            >
              <Textarea
                rows={3}
                value={form.seoDescription}
                maxLength={SEO_DESC.hard}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                placeholder={t('seo.categoryDescriptionPlaceholder', { name: form.nameFr || '…' })}
              />
            </Field>
            <GooglePreview
              title={(form.seoTitle || form.nameFr) && `${form.seoTitle || form.nameFr} — IT Mart`}
              description={form.seoDescription}
              path={category?.slug ? `products?category=${category.slug}` : 'products'}
            />
          </div>
        </details>

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
