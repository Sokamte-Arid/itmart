import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Field, Input, Select } from '../../components/ui/Field';
import * as authApi from '../../api/auth';
import { useToast } from '../../components/ui/Toast';

const emptyForm = { name: '', email: '', password: '', role: 'ADMIN' };

export default function AdminFormModal({ open, onClose, onSaved }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.createAdmin(form);
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
    <Modal open={open} onClose={onClose} title={t('admins.addAdmin')}>
      <form onSubmit={handleSubmit}>
        <Field label={t('common.name')} required>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label={t('login.email')} required>
          <Input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label={t('login.password')} required hint={t('account.passwordHint')}>
          <Input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <Field label={t('admins.role')}>
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="ADMIN">{t('admins.roleAdmin')}</option>
            <option value="EDITOR">{t('admins.roleEditor')}</option>
            <option value="SUPER_ADMIN">{t('admins.roleSuperAdmin')}</option>
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
