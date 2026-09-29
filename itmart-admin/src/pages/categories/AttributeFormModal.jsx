import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Field, Input, Select } from '../../components/ui/Field';
import * as categoriesApi from '../../api/categories';
import { useToast } from '../../components/ui/Toast';

const emptyForm = { nameEn: '', nameFr: '', type: 'SELECT', unit: '' };

export default function AttributeFormModal({ open, onClose, categoryId, onSaved }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await categoriesApi.addAttribute(categoryId, form);
      showToast(t('common.saveChanges') + ' ✓');
      setForm(emptyForm);
      onSaved();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('categories.addAttribute')}>
      <form onSubmit={handleSubmit}>
        <Field label={t('categories.attributeName') + ' (EN)'} required>
          <Input
            required
            value={form.nameEn}
            onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
            placeholder="RAM"
          />
        </Field>
        <Field label={t('categories.attributeName') + ' (FR)'} required>
          <Input
            required
            value={form.nameFr}
            onChange={(e) => setForm({ ...form, nameFr: e.target.value })}
            placeholder="RAM"
          />
        </Field>
        <Field label={t('categories.attributeType')} hint={form.type === 'COLOR' ? t('categories.typeColorHint') : undefined}>
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="SELECT">{t('categories.typeSelect')}</option>
            <option value="TEXT">{t('categories.typeText')}</option>
            <option value="NUMBER">{t('categories.typeNumber')}</option>
            <option value="BOOLEAN">{t('categories.typeBoolean')}</option>
            <option value="COLOR">{t('categories.typeColor')}</option>
          </Select>
        </Field>
        {form.type !== 'COLOR' && (
          <Field label={t('categories.unit')} hint="e.g. GB, inch, mAh (optional)">
            <Input
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="GB"
            />
          </Field>
        )}
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